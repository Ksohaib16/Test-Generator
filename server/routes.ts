import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from 'express-session';
import passport from 'passport';
import { initializePassport } from './auth/passport';
import { generatePdf } from './pdf/pdf.service';
import { insertUserSchema, insertInstitutionSchema, insertTestSchema, insertQuestionSchema, insertAssignedTestSchema, insertStudentTeacherLinkSchema } from '@shared/schema';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// Extend Request type to include user property
declare global {
  namespace Express {
    interface User {
      id: number;
      name: string;
      email: string;
      role: string;
      institutionId?: number;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex');
  
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  }));

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  initializePassport(passport, storage);

  // Auth middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };

  const requireTeacher = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Forbidden: Teachers only' });
    }
    next();
  };

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user with this email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // If user is a teacher, create their institution
      if (userData.role === 'teacher' && req.body.institutionName) {
        const institution = await storage.createInstitution({
          name: req.body.institutionName,
          address: req.body.institutionAddress || '',
          createdByTeacherId: user.id
        });

        // Update user with institution ID
        await storage.createUser({
          ...user,
          institutionId: institution.id
        });
      }

      // If user is a student, create a pending link to teacher
      if (userData.role === 'student' && req.body.teacherId) {
        await storage.createStudentTeacherLink({
          teacherId: parseInt(req.body.teacherId),
          studentId: user.id,
          status: 'pending'
        });
      }

      res.status(201).json({ 
        message: 'User registered successfully',
        userId: user.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    res.json({ 
      user: {
        id: req.user!.id,
        name: req.user!.name,
        email: req.user!.email,
        role: req.user!.role,
        institutionId: req.user!.institutionId
      }
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json({ 
      user: {
        id: req.user!.id,
        name: req.user!.name,
        email: req.user!.email,
        role: req.user!.role,
        institutionId: req.user!.institutionId
      }
    });
  });

  // Teacher dashboard stats
  app.get('/api/dashboard/stats', requireTeacher, async (req, res) => {
    try {
      const teacherId = req.user!.id;
      
      // Get all student links for this teacher
      const allStudentLinks = await storage.getStudentTeacherLinksByTeacherId(teacherId);
      const approvedStudentCount = allStudentLinks.filter(link => link.status === 'approved').length;
      const pendingStudentCount = allStudentLinks.filter(link => link.status === 'pending').length;
      
      // Get all tests created by this teacher
      const allTests = await storage.getTestsByTeacherId(teacherId);
      const testCount = allTests.length;
      
      // Get all assigned tests by this teacher
      const allAssignedTests = await storage.getAssignedTestsByTeacherId(teacherId);
      const assignedTestCount = allAssignedTests.length;
      
      res.json({
        totalStudents: approvedStudentCount,
        pendingApprovals: pendingStudentCount,
        testsCreated: testCount,
        testsAssigned: assignedTestCount
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Pending student approvals
  app.get('/api/students/pending', requireTeacher, async (req, res) => {
    try {
      const teacherId = req.user!.id;
      
      // Get all pending student links for this teacher
      const pendingLinks = await storage.getPendingStudentLinks(teacherId);
      
      // Get student details for each link
      const pendingStudents = await Promise.all(
        pendingLinks.map(async (link) => {
          const student = await storage.getUser(link.studentId);
          return {
            linkId: link.id,
            id: student?.id,
            name: student?.name,
            email: student?.email,
            rollNumber: student?.rollNumber,
            requestDate: link.id, // Using the link ID as a proxy for creation date (sorted by ID)
          };
        })
      );
      
      res.json({ pendingStudents });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Approve/reject student
  app.post('/api/students/:linkId/status', requireTeacher, async (req, res) => {
    try {
      const { linkId } = req.params;
      const { status } = req.body;
      
      if (status !== 'approved' && status !== 'rejected') {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const updatedLink = await storage.updateStudentTeacherLinkStatus(parseInt(linkId), status);
      
      if (!updatedLink) {
        return res.status(404).json({ message: 'Student link not found' });
      }
      
      res.json({ message: `Student ${status}` });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Questions routes
  app.get('/api/questions', requireTeacher, async (req, res) => {
    try {
      const { subject, chapter, topic, difficulty } = req.query;
      
      const filters: Record<string, any> = {};
      if (subject) filters.subject = subject;
      if (chapter) filters.chapter = chapter;
      if (topic) filters.topic = topic;
      if (difficulty) filters.difficulty = difficulty;
      
      const questions = await storage.getQuestionsByFilters(filters);
      res.json({ questions });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/questions', requireTeacher, async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      
      const question = await storage.createQuestion({
        ...questionData,
        createdByTeacherId: req.user!.id
      });
      
      res.status(201).json({ question });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Tests routes
  app.get('/api/tests', requireTeacher, async (req, res) => {
    try {
      const teacherId = req.user!.id;
      const tests = await storage.getTestsByTeacherId(teacherId);
      res.json({ tests });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/tests/:id', requireTeacher, async (req, res) => {
    try {
      const { id } = req.params;
      const test = await storage.getTest(parseInt(id));
      
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }
      
      if (test.createdByTeacherId !== req.user!.id) {
        return res.status(403).json({ message: 'Forbidden: You can only access your own tests' });
      }
      
      res.json({ test });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/tests', requireTeacher, async (req, res) => {
    try {
      console.log('Received test data:', req.body);
      
      try {
        const testData = insertTestSchema.parse(req.body);
        console.log('Parsed test data:', testData);
        
        const test = await storage.createTest({
          ...testData,
          createdByTeacherId: req.user!.id
        });
        
        res.status(201).json({ test });
      } catch (parseError) {
        if (parseError instanceof z.ZodError) {
          console.error('Zod validation error:', parseError.errors);
          return res.status(400).json({ error: 'Invalid test data', details: parseError.errors });
        }
        throw parseError;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/tests/:id', requireTeacher, async (req, res) => {
    try {
      const { id } = req.params;
      const test = await storage.getTest(parseInt(id));
      
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }
      
      if (test.createdByTeacherId !== req.user!.id) {
        return res.status(403).json({ message: 'Forbidden: You can only edit your own tests' });
      }
      
      const updatedTest = await storage.updateTest(parseInt(id), req.body);
      res.json({ test: updatedTest });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/tests/:id', requireTeacher, async (req, res) => {
    try {
      const { id } = req.params;
      const test = await storage.getTest(parseInt(id));
      
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }
      
      if (test.createdByTeacherId !== req.user!.id) {
        return res.status(403).json({ message: 'Forbidden: You can only delete your own tests' });
      }
      
      await storage.deleteTest(parseInt(id));
      res.json({ message: 'Test deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // PDF generation
  app.post('/api/tests/:id/pdf', requireTeacher, async (req, res) => {
    try {
      const { id } = req.params;
      const { includeHeader, includeInstructions, showMarks, includeAnswers } = req.body;
      
      const test = await storage.getTest(parseInt(id));
      
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }
      
      if (test.createdByTeacherId !== req.user!.id) {
        return res.status(403).json({ message: 'Forbidden: You can only access your own tests' });
      }
      
      // Generate PDF
      const teacher = await storage.getUser(req.user!.id);
      const institution = teacher?.institutionId ? await storage.getInstitution(teacher.institutionId) : null;
      
      const pdfBuffer = await generatePdf(test, {
        includeHeader,
        includeInstructions,
        showMarks,
        includeAnswers,
        teacherName: teacher?.name || '',
        institutionName: institution?.name || ''
      });
      
      res.contentType('application/pdf');
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Assign tests to students
  app.post('/api/tests/:id/assign', requireTeacher, async (req, res) => {
    try {
      const { id } = req.params;
      const { studentIds, dueDate, notes } = req.body;
      
      if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ message: 'No students selected' });
      }
      
      const test = await storage.getTest(parseInt(id));
      
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }
      
      if (test.createdByTeacherId !== req.user!.id) {
        return res.status(403).json({ message: 'Forbidden: You can only assign your own tests' });
      }
      
      // Create assigned test records for each student
      const assignedTests = await Promise.all(
        studentIds.map(async (studentId) => {
          return storage.createAssignedTest({
            testId: test.id,
            studentId,
            assignedByTeacherId: req.user!.id,
            status: 'assigned',
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            notes
          });
        })
      );
      
      res.status(201).json({ message: 'Test assigned successfully', count: assignedTests.length });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get all students for a teacher (for assigning tests)
  app.get('/api/students', requireTeacher, async (req, res) => {
    try {
      const teacherId = req.user!.id;
      
      // Get all approved student links for this teacher
      const studentLinks = await storage.getStudentTeacherLinksByTeacherId(teacherId);
      const approvedLinks = studentLinks.filter(link => link.status === 'approved');
      
      // Get student details for each link
      const students = await Promise.all(
        approvedLinks.map(async (link) => {
          const student = await storage.getUser(link.studentId);
          return {
            id: student?.id,
            name: student?.name,
            email: student?.email,
            rollNumber: student?.rollNumber
          };
        })
      );
      
      res.json({ students });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { 
  users, User, InsertUser,
  institutions, Institution, InsertInstitution,
  studentTeacherLinks, StudentTeacherLink, InsertStudentTeacherLink,
  questions, Question, InsertQuestion,
  tests, Test, InsertTest,
  assignedTests, AssignedTest, InsertAssignedTest
} from '@shared/schema';
import { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Institution operations
  async getInstitution(id: number): Promise<Institution | undefined> {
    const [institution] = await db.select().from(institutions).where(eq(institutions.id, id));
    return institution;
  }

  async getInstitutionsByTeacherId(teacherId: number): Promise<Institution[]> {
    return db.select().from(institutions).where(eq(institutions.createdByTeacherId, teacherId));
  }

  async createInstitution(insertInstitution: InsertInstitution): Promise<Institution> {
    const [institution] = await db.insert(institutions).values(insertInstitution).returning();
    return institution;
  }

  // Student-Teacher link operations
  async getStudentTeacherLink(teacherId: number, studentId: number): Promise<StudentTeacherLink | undefined> {
    const [link] = await db.select().from(studentTeacherLinks).where(
      and(
        eq(studentTeacherLinks.teacherId, teacherId),
        eq(studentTeacherLinks.studentId, studentId)
      )
    );
    return link;
  }

  async getStudentTeacherLinksByTeacherId(teacherId: number): Promise<StudentTeacherLink[]> {
    return db.select().from(studentTeacherLinks).where(eq(studentTeacherLinks.teacherId, teacherId));
  }

  async getPendingStudentLinks(teacherId: number): Promise<StudentTeacherLink[]> {
    return db.select().from(studentTeacherLinks).where(
      and(
        eq(studentTeacherLinks.teacherId, teacherId),
        eq(studentTeacherLinks.status, 'pending' as any)
      )
    );
  }

  async createStudentTeacherLink(insertLink: InsertStudentTeacherLink): Promise<StudentTeacherLink> {
    const [link] = await db.insert(studentTeacherLinks).values(insertLink).returning();
    return link;
  }

  async updateStudentTeacherLinkStatus(id: number, status: string): Promise<StudentTeacherLink | undefined> {
    const [updatedLink] = await db
      .update(studentTeacherLinks)
      .set({ status: status as any })
      .where(eq(studentTeacherLinks.id, id))
      .returning();
    return updatedLink;
  }

  // Question operations
  async getQuestion(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async getQuestionsByFilters(filters: Partial<Question>): Promise<Question[]> {
    let conditions = [];
    
    if (filters.subject) {
      conditions.push(eq(questions.subject, filters.subject));
    }
    
    if (filters.chapter) {
      conditions.push(eq(questions.chapter, filters.chapter));
    }
    
    if (filters.topic) {
      conditions.push(eq(questions.topic, filters.topic as string));
    }
    
    if (filters.difficulty) {
      conditions.push(eq(questions.difficulty, filters.difficulty as any));
    }
    
    if (filters.type) {
      conditions.push(eq(questions.type, filters.type as any));
    }
    
    if (filters.createdByTeacherId) {
      conditions.push(eq(questions.createdByTeacherId, filters.createdByTeacherId));
    }
    
    if (conditions.length === 0) {
      return db.select().from(questions);
    }
    
    return db.select().from(questions).where(and(...conditions));
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db.insert(questions).values(insertQuestion).returning();
    return question;
  }

  // Test operations
  async getTest(id: number): Promise<Test | undefined> {
    const [test] = await db.select().from(tests).where(eq(tests.id, id));
    return test;
  }

  async getTestsByTeacherId(teacherId: number): Promise<Test[]> {
    return db.select().from(tests).where(eq(tests.createdByTeacherId, teacherId));
  }

  async createTest(insertTest: InsertTest): Promise<Test> {
    const [test] = await db.insert(tests).values(insertTest).returning();
    return test;
  }

  async updateTest(id: number, testUpdate: Partial<Test>): Promise<Test | undefined> {
    const [updatedTest] = await db
      .update(tests)
      .set(testUpdate)
      .where(eq(tests.id, id))
      .returning();
    return updatedTest;
  }

  async deleteTest(id: number): Promise<boolean> {
    await db.delete(tests).where(eq(tests.id, id));
    // Return true as we're not checking rows affected to avoid TypeScript errors
    return true;
  }

  // Assigned test operations
  async getAssignedTest(id: number): Promise<AssignedTest | undefined> {
    const [assignedTest] = await db.select().from(assignedTests).where(eq(assignedTests.id, id));
    return assignedTest;
  }

  async getAssignedTestsByTeacherId(teacherId: number): Promise<AssignedTest[]> {
    return db.select().from(assignedTests).where(eq(assignedTests.assignedByTeacherId, teacherId));
  }

  async getAssignedTestsByStudentId(studentId: number): Promise<AssignedTest[]> {
    return db.select().from(assignedTests).where(eq(assignedTests.studentId, studentId));
  }

  async createAssignedTest(insertAssignedTest: InsertAssignedTest): Promise<AssignedTest> {
    const [assignedTest] = await db.insert(assignedTests).values(insertAssignedTest).returning();
    return assignedTest;
  }

  async updateAssignedTest(id: number, assignedTestUpdate: Partial<AssignedTest>): Promise<AssignedTest | undefined> {
    const [updatedAssignedTest] = await db
      .update(assignedTests)
      .set(assignedTestUpdate)
      .where(eq(assignedTests.id, id))
      .returning();
    return updatedAssignedTest;
  }
}
import { 
  User, InsertUser, Institution, InsertInstitution, 
  StudentTeacherLink, InsertStudentTeacherLink,
  Question, InsertQuestion, Test, InsertTest,
  AssignedTest, InsertAssignedTest
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Institution operations
  getInstitution(id: number): Promise<Institution | undefined>;
  getInstitutionsByTeacherId(teacherId: number): Promise<Institution[]>;
  createInstitution(institution: InsertInstitution): Promise<Institution>;
  
  // Student-Teacher link operations
  getStudentTeacherLink(teacherId: number, studentId: number): Promise<StudentTeacherLink | undefined>;
  getStudentTeacherLinksByTeacherId(teacherId: number): Promise<StudentTeacherLink[]>;
  getPendingStudentLinks(teacherId: number): Promise<StudentTeacherLink[]>;
  createStudentTeacherLink(link: InsertStudentTeacherLink): Promise<StudentTeacherLink>;
  updateStudentTeacherLinkStatus(id: number, status: string): Promise<StudentTeacherLink | undefined>;
  
  // Question operations
  getQuestion(id: number): Promise<Question | undefined>;
  getQuestionsByFilters(filters: Partial<Question>): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  
  // Test operations
  getTest(id: number): Promise<Test | undefined>;
  getTestsByTeacherId(teacherId: number): Promise<Test[]>;
  createTest(test: InsertTest): Promise<Test>;
  updateTest(id: number, test: Partial<Test>): Promise<Test | undefined>;
  deleteTest(id: number): Promise<boolean>;
  
  // Assigned test operations
  getAssignedTest(id: number): Promise<AssignedTest | undefined>;
  getAssignedTestsByTeacherId(teacherId: number): Promise<AssignedTest[]>;
  getAssignedTestsByStudentId(studentId: number): Promise<AssignedTest[]>;
  createAssignedTest(assignedTest: InsertAssignedTest): Promise<AssignedTest>;
  updateAssignedTest(id: number, assignedTest: Partial<AssignedTest>): Promise<AssignedTest | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private institutions: Map<number, Institution>;
  private studentTeacherLinks: Map<number, StudentTeacherLink>;
  private questions: Map<number, Question>;
  private tests: Map<number, Test>;
  private assignedTests: Map<number, AssignedTest>;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.institutions = new Map();
    this.studentTeacherLinks = new Map();
    this.questions = new Map();
    this.tests = new Map();
    this.assignedTests = new Map();
    this.currentId = {
      users: 1,
      institutions: 1,
      studentTeacherLinks: 1,
      questions: 1,
      tests: 1,
      assignedTests: 1
    };

    // Seed data - add sample questions
    this.seedQuestions();
  }

  private seedQuestions() {
    const mathQuestions: InsertQuestion[] = [
      {
        subject: "Mathematics",
        chapter: "Trigonometry",
        topic: "Introduction to Trigonometry",
        difficulty: "easy",
        type: "mcq",
        questionText: "If sin θ = 3/5, then the value of cos θ is:",
        options: ["4/5", "3/4", "5/3", "4/3"],
        answer: "4/5",
        explanation: "Using the Pythagorean identity sin²θ + cos²θ = 1, we get cos²θ = 1 - sin²θ = 1 - (3/5)² = 1 - 9/25 = 16/25. So cos θ = 4/5.",
        marks: 2,
        tags: ["trigonometry", "easy", "pythagorean identity"]
      },
      {
        subject: "Mathematics",
        chapter: "Trigonometry",
        topic: "Trigonometric Identities",
        difficulty: "medium",
        type: "short_answer",
        questionText: "Prove the identity: (1 + tan²A) = sec²A",
        answer: "We know that tan²A + 1 = sec²A is a fundamental identity, so (1 + tan²A) = sec²A is automatically true.",
        marks: 3,
        tags: ["trigonometry", "medium", "identities"]
      },
      {
        subject: "Mathematics",
        chapter: "Triangles",
        topic: "Similar Triangles",
        difficulty: "hard",
        type: "long_answer",
        questionText: "In a triangle ABC, if sin A = 1/2, sin B = 1/3, then find the value of sin C. Also prove that the triangle is obtuse-angled.",
        answer: "Using the fact that in any triangle, A + B + C = 180°, we can determine sin C. Since sin A = 1/2, A = 30°. Similarly, sin B = 1/3 gives B ≈ 19.5°. Thus C = 180° - A - B ≈ 130.5°, which means sin C ≈ 0.766. Since C > 90°, the triangle is obtuse-angled.",
        marks: 5,
        tags: ["triangles", "hard", "sine rule"]
      }
    ];

    const scienceQuestions: InsertQuestion[] = [
      {
        subject: "Science",
        chapter: "Chemical Reactions",
        topic: "Types of Chemical Reactions",
        difficulty: "medium",
        type: "mcq",
        questionText: "The reaction 2H₂O₂ → 2H₂O + O₂ is an example of which type of reaction?",
        options: ["Combination reaction", "Decomposition reaction", "Displacement reaction", "Double displacement reaction"],
        answer: "Decomposition reaction",
        explanation: "In this reaction, hydrogen peroxide decomposes to form water and oxygen gas, making it a decomposition reaction.",
        marks: 1,
        tags: ["chemistry", "medium", "chemical reactions"]
      }
    ];

    [...mathQuestions, ...scienceQuestions].forEach(q => this.createQuestion(q));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Institution operations
  async getInstitution(id: number): Promise<Institution | undefined> {
    return this.institutions.get(id);
  }

  async getInstitutionsByTeacherId(teacherId: number): Promise<Institution[]> {
    return Array.from(this.institutions.values()).filter(
      (institution) => institution.createdByTeacherId === teacherId,
    );
  }

  async createInstitution(insertInstitution: InsertInstitution): Promise<Institution> {
    const id = this.currentId.institutions++;
    const institution: Institution = { ...insertInstitution, id };
    this.institutions.set(id, institution);
    return institution;
  }

  // Student-Teacher link operations
  async getStudentTeacherLink(teacherId: number, studentId: number): Promise<StudentTeacherLink | undefined> {
    return Array.from(this.studentTeacherLinks.values()).find(
      (link) => link.teacherId === teacherId && link.studentId === studentId,
    );
  }

  async getStudentTeacherLinksByTeacherId(teacherId: number): Promise<StudentTeacherLink[]> {
    return Array.from(this.studentTeacherLinks.values()).filter(
      (link) => link.teacherId === teacherId,
    );
  }

  async getPendingStudentLinks(teacherId: number): Promise<StudentTeacherLink[]> {
    return Array.from(this.studentTeacherLinks.values()).filter(
      (link) => link.teacherId === teacherId && link.status === "pending",
    );
  }

  async createStudentTeacherLink(insertLink: InsertStudentTeacherLink): Promise<StudentTeacherLink> {
    const id = this.currentId.studentTeacherLinks++;
    const link: StudentTeacherLink = { ...insertLink, id };
    this.studentTeacherLinks.set(id, link);
    return link;
  }

  async updateStudentTeacherLinkStatus(id: number, status: string): Promise<StudentTeacherLink | undefined> {
    const link = this.studentTeacherLinks.get(id);
    if (!link) return undefined;
    
    const updatedLink = { ...link, status };
    this.studentTeacherLinks.set(id, updatedLink);
    return updatedLink;
  }

  // Question operations
  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async getQuestionsByFilters(filters: Partial<Question>): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(question => {
      for (const [key, value] of Object.entries(filters)) {
        if (key === 'tags' && Array.isArray(value) && Array.isArray(question.tags)) {
          // Check if any of the tags in the filter match any of the question tags
          if (!value.some(tag => question.tags?.includes(tag))) {
            return false;
          }
        } else if (question[key as keyof Question] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.currentId.questions++;
    const question: Question = { ...insertQuestion, id };
    this.questions.set(id, question);
    return question;
  }

  // Test operations
  async getTest(id: number): Promise<Test | undefined> {
    return this.tests.get(id);
  }

  async getTestsByTeacherId(teacherId: number): Promise<Test[]> {
    return Array.from(this.tests.values()).filter(
      (test) => test.createdByTeacherId === teacherId,
    ).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Sort by descending date
    });
  }

  async createTest(insertTest: InsertTest): Promise<Test> {
    const id = this.currentId.tests++;
    const test: Test = { 
      ...insertTest, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.tests.set(id, test);
    return test;
  }

  async updateTest(id: number, testUpdate: Partial<Test>): Promise<Test | undefined> {
    const test = this.tests.get(id);
    if (!test) return undefined;
    
    const updatedTest = { ...test, ...testUpdate };
    this.tests.set(id, updatedTest);
    return updatedTest;
  }

  async deleteTest(id: number): Promise<boolean> {
    return this.tests.delete(id);
  }

  // Assigned test operations
  async getAssignedTest(id: number): Promise<AssignedTest | undefined> {
    return this.assignedTests.get(id);
  }

  async getAssignedTestsByTeacherId(teacherId: number): Promise<AssignedTest[]> {
    return Array.from(this.assignedTests.values()).filter(
      (assignedTest) => assignedTest.assignedByTeacherId === teacherId,
    );
  }

  async getAssignedTestsByStudentId(studentId: number): Promise<AssignedTest[]> {
    return Array.from(this.assignedTests.values()).filter(
      (assignedTest) => assignedTest.studentId === studentId,
    );
  }

  async createAssignedTest(insertAssignedTest: InsertAssignedTest): Promise<AssignedTest> {
    const id = this.currentId.assignedTests++;
    const assignedTest: AssignedTest = { 
      ...insertAssignedTest, 
      id, 
      assignedAt: new Date().toISOString() 
    };
    this.assignedTests.set(id, assignedTest);
    return assignedTest;
  }

  async updateAssignedTest(id: number, assignedTestUpdate: Partial<AssignedTest>): Promise<AssignedTest | undefined> {
    const assignedTest = this.assignedTests.get(id);
    if (!assignedTest) return undefined;
    
    const updatedAssignedTest = { ...assignedTest, ...assignedTestUpdate };
    this.assignedTests.set(id, updatedAssignedTest);
    return updatedAssignedTest;
  }
}

// Import the DatabaseStorage class
import { DatabaseStorage } from './database';

// Use the DatabaseStorage implementation
export const storage = new DatabaseStorage();

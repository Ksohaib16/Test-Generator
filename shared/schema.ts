import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["teacher", "student"] }).notNull(),
  institutionId: integer("institution_id"),
  rollNumber: text("roll_number"),
  defaultLanguage: text("default_language").default("english"),
  theme: text("theme").default("light"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true
});

// Institution model
export const institutions = pgTable("institutions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  createdByTeacherId: integer("created_by_teacher_id").notNull(),
});

export const insertInstitutionSchema = createInsertSchema(institutions).omit({
  id: true
});

// Student-Teacher links
export const studentTeacherLinks = pgTable("student_teacher_links", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  studentId: integer("student_id").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull(),
});

export const insertStudentTeacherLinkSchema = createInsertSchema(studentTeacherLinks).omit({
  id: true
});

// Question bank
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  chapter: text("chapter").notNull(),
  topic: text("topic"),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).notNull(),
  type: text("type", { enum: ["mcq", "short_answer", "long_answer"] }).notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options"),
  answer: text("answer"),
  explanation: text("explanation"),
  marks: integer("marks").notNull(),
  createdByTeacherId: integer("created_by_teacher_id"),
  tags: text("tags").array(),
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true
});

// Tests
export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  chapter: text("chapter"),
  type: text("type", { enum: ["chapter_test", "mock_test", "board_pattern"] }).notNull(),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard", "mixed"] }).notNull(),
  duration: integer("duration"), // minutes
  totalMarks: integer("total_marks"),
  createdByTeacherId: integer("created_by_teacher_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  questionsList: jsonb("questions_list"), // Will contain array of question objects
});

export const insertTestSchema = createInsertSchema(tests).omit({
  id: true,
  createdAt: true
});

// Assigned Tests
export const assignedTests = pgTable("assigned_tests", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull(),
  studentId: integer("student_id").notNull(),
  assignedByTeacherId: integer("assigned_by_teacher_id").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  dueDate: timestamp("due_date"),
  status: text("status", { enum: ["assigned", "completed", "graded"] }).notNull(),
  score: integer("score"),
  notes: text("notes"),
});

export const insertAssignedTestSchema = createInsertSchema(assignedTests).omit({
  id: true,
  assignedAt: true
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type Institution = typeof institutions.$inferSelect;

export type InsertStudentTeacherLink = z.infer<typeof insertStudentTeacherLinkSchema>;
export type StudentTeacherLink = typeof studentTeacherLinks.$inferSelect;

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export type InsertTest = z.infer<typeof insertTestSchema>;
export type Test = typeof tests.$inferSelect;

export type InsertAssignedTest = z.infer<typeof insertAssignedTestSchema>;
export type AssignedTest = typeof assignedTests.$inferSelect;

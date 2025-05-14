// Dashboard stats
export interface DashboardStats {
  totalStudents: number;
  pendingApprovals: number;
  testsCreated: number;
  testsAssigned: number;
}

// Student
export interface Student {
  id: number;
  name: string;
  email: string;
  rollNumber?: string;
}

// Pending Student
export interface PendingStudent extends Student {
  linkId: number;
  requestDate: number;
}

// Question types
export type QuestionType = 'mcq' | 'short_answer' | 'long_answer';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

// Question
export interface Question {
  id: number;
  subject: string;
  chapter: string;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: QuestionType;
  questionText: string;
  options?: string[];
  answer?: string;
  explanation?: string;
  marks: number;
  createdByTeacherId?: number;
  tags?: string[];
}

// Test
export interface Test {
  id: number;
  title: string;
  subject: string;
  chapter?: string;
  topic?: string;
  type: 'topic_test' | 'chapter_test' | 'mock_test' | 'board_pattern';
  difficulty: Difficulty;
  duration?: number;
  totalMarks?: number;
  createdByTeacherId: number;
  createdAt?: string;
  questionsList?: Question[];
}

// PDF Generation Options
export interface PDFOptions {
  includeHeader: boolean;
  includeInstructions: boolean;
  showMarks: boolean;
  includeAnswers: boolean;
}

// Assigned Test
export interface AssignedTest {
  id: number;
  testId: number;
  studentId: number;
  assignedByTeacherId: number;
  assignedAt?: string;
  dueDate?: string;
  status: 'assigned' | 'completed' | 'graded';
  score?: number;
  notes?: string;
}

// Test Assignment Data
export interface TestAssignmentData {
  studentIds: number[];
  dueDate?: string;
  notes?: string;
}

// Subjects and Chapters for dropdown options
export interface SubjectChapters {
  [subject: string]: {
    name: string;
    chapters: { id: string; name: string; topics?: { id: string; name: string }[] }[]
  }
}

export const SUBJECTS_CHAPTERS: SubjectChapters = {
  mathematics: {
    name: "Mathematics",
    chapters: [
      { id: "real_numbers", name: "Chapter 1: Real Numbers" },
      { id: "polynomials", name: "Chapter 2: Polynomials" },
      { id: "linear_equations", name: "Chapter 3: Pair of Linear Equations in Two Variables" },
      { id: "quadratic_equations", name: "Chapter 4: Quadratic Equations" },
      { id: "arithmetic_progressions", name: "Chapter 5: Arithmetic Progressions" },
      { id: "triangles", name: "Chapter 6: Triangles", topics: [
        { id: "similar_triangles", name: "Similar Triangles" },
        { id: "congruence", name: "Congruence of Triangles" },
        { id: "properties", name: "Properties of Triangles" },
        { id: "pythagoras", name: "Pythagoras Theorem" }
      ]},
      { id: "coordinate_geometry", name: "Chapter 7: Coordinate Geometry" },
      { id: "trigonometry", name: "Chapter 8: Introduction to Trigonometry", topics: [
        { id: "intro_trig", name: "Introduction to Trigonometry" },
        { id: "trig_identities", name: "Trigonometric Identities" },
        { id: "heights_distances", name: "Heights and Distances" }
      ]},
      { id: "circles", name: "Chapter 9: Circles" },
      { id: "constructions", name: "Chapter 10: Constructions" },
      { id: "areas", name: "Chapter 11: Areas Related to Circles" },
      { id: "surface_areas_volumes", name: "Chapter 12: Surface Areas and Volumes" },
      { id: "statistics", name: "Chapter 13: Statistics" },
      { id: "probability", name: "Chapter 14: Probability" }
    ]
  },
  science: {
    name: "Science",
    chapters: [
      { id: "chemical_reactions", name: "Chapter 1: Chemical Reactions and Equations", topics: [
        { id: "types_chemical_reactions", name: "Types of Chemical Reactions" },
        { id: "oxidation_reduction", name: "Oxidation and Reduction" }
      ]},
      { id: "acids_bases_salts", name: "Chapter 2: Acids, Bases and Salts" },
      { id: "metals_nonmetals", name: "Chapter 3: Metals and Non-metals" },
      { id: "carbon_compounds", name: "Chapter 4: Carbon and its Compounds" },
      { id: "periodic_classification", name: "Chapter 5: Periodic Classification of Elements" },
      { id: "life_processes", name: "Chapter 6: Life Processes" },
      { id: "control_coordination", name: "Chapter 7: Control and Coordination" },
      { id: "reproduction", name: "Chapter 8: How do Organisms Reproduce?" },
      { id: "heredity_evolution", name: "Chapter 9: Heredity and Evolution" },
      { id: "light", name: "Chapter 10: Light - Reflection and Refraction" },
      { id: "human_eye", name: "Chapter 11: The Human Eye and Colourful World" },
      { id: "electricity", name: "Chapter 12: Electricity" },
      { id: "magnetic_effects", name: "Chapter 13: Magnetic Effects of Electric Current" },
      { id: "energy", name: "Chapter 14: Sources of Energy" },
      { id: "environment", name: "Chapter 15: Our Environment" },
      { id: "natural_resources", name: "Chapter 16: Management of Natural Resources" }
    ]
  },
  social_science: {
    name: "Social Science",
    chapters: [
      { id: "development", name: "Chapter 1: Development" },
      { id: "sectors_economy", name: "Chapter 2: Sectors of the Indian Economy" },
      { id: "money_credit", name: "Chapter 3: Money and Credit" },
      { id: "globalisation", name: "Chapter 4: Globalisation and the Indian Economy" },
      { id: "consumer_rights", name: "Chapter 5: Consumer Rights" }
    ]
  },
  english: {
    name: "English",
    chapters: [
      { id: "first_flight", name: "First Flight (Prose)" },
      { id: "first_flight_poems", name: "First Flight (Poems)" },
      { id: "footprints", name: "Footprints without Feet (Supplementary Reader)" },
      { id: "grammar", name: "Grammar" },
      { id: "writing", name: "Writing Skills" }
    ]
  },
  hindi: {
    name: "Hindi",
    chapters: [
      { id: "kshitiz", name: "क्षितिज (गद्य)" },
      { id: "kshitiz_poems", name: "क्षितिज (पद्य)" },
      { id: "kritika", name: "कृतिका" },
      { id: "grammar", name: "व्याकरण" },
      { id: "writing", name: "रचना" }
    ]
  }
};

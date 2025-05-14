import { create } from 'zustand';
import { Question } from '@/lib/types';

interface TestCreationState {
  testType: 'chapter_test' | 'mock_test' | 'board_pattern';
  subject: string;
  chapter: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  topics: string[];
  duration: number;
  title: string;
  questions: Question[];
  totalMarks: number;
  
  setTestType: (type: 'chapter_test' | 'mock_test' | 'board_pattern') => void;
  setSubject: (subject: string) => void;
  setChapter: (chapter: string) => void;
  setDifficulty: (difficulty: 'easy' | 'medium' | 'hard' | 'mixed') => void;
  setTopics: (topics: string[]) => void;
  setDuration: (duration: number) => void;
  setTitle: (title: string) => void;
  setQuestions: (questions: Question[]) => void;
  addQuestion: (question: Question) => void;
  updateQuestion: (index: number, question: Question) => void;
  removeQuestion: (index: number) => void;
  reorderQuestions: (fromIndex: number, toIndex: number) => void;
  calculateTotalMarks: () => void;
  resetState: () => void;
}

export const useTestCreationStore = create<TestCreationState>((set, get) => ({
  testType: 'chapter_test',
  subject: '',
  chapter: '',
  difficulty: 'medium',
  topics: [],
  duration: 45,
  title: '',
  questions: [],
  totalMarks: 0,
  
  setTestType: (type) => set({ testType: type }),
  setSubject: (subject) => set({ subject }),
  setChapter: (chapter) => set({ chapter }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setTopics: (topics) => set({ topics }),
  setDuration: (duration) => set({ duration }),
  setTitle: (title) => set({ title }),
  setQuestions: (questions) => {
    set({ questions });
    get().calculateTotalMarks();
  },
  addQuestion: (question) => {
    set((state) => ({ 
      questions: [...state.questions, question]
    }));
    get().calculateTotalMarks();
  },
  updateQuestion: (index, question) => {
    set((state) => {
      const newQuestions = [...state.questions];
      newQuestions[index] = question;
      return { questions: newQuestions };
    });
    get().calculateTotalMarks();
  },
  removeQuestion: (index) => {
    set((state) => {
      const newQuestions = [...state.questions];
      newQuestions.splice(index, 1);
      return { questions: newQuestions };
    });
    get().calculateTotalMarks();
  },
  reorderQuestions: (fromIndex, toIndex) => {
    set((state) => {
      const newQuestions = [...state.questions];
      const [removed] = newQuestions.splice(fromIndex, 1);
      newQuestions.splice(toIndex, 0, removed);
      return { questions: newQuestions };
    });
  },
  calculateTotalMarks: () => {
    set((state) => {
      const totalMarks = state.questions.reduce((sum, q) => sum + q.marks, 0);
      return { totalMarks };
    });
  },
  resetState: () => set({
    testType: 'chapter_test',
    subject: '',
    chapter: '',
    difficulty: 'medium',
    topics: [],
    duration: 45,
    title: '',
    questions: [],
    totalMarks: 0,
  }),
}));

interface UIState {
  isExportModalOpen: boolean;
  isAssignModalOpen: boolean;
  currentTestId: number | null;
  
  openExportModal: (testId: number) => void;
  closeExportModal: () => void;
  openAssignModal: (testId: number) => void;
  closeAssignModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isExportModalOpen: false,
  isAssignModalOpen: false,
  currentTestId: null,
  
  openExportModal: (testId) => set({ isExportModalOpen: true, currentTestId: testId }),
  closeExportModal: () => set({ isExportModalOpen: false, currentTestId: null }),
  openAssignModal: (testId) => set({ isAssignModalOpen: true, currentTestId: testId }),
  closeAssignModal: () => set({ isAssignModalOpen: false, currentTestId: null }),
}));

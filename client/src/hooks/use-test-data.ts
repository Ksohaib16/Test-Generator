import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { DashboardStats, PendingStudent, Student, Test, Question, TestAssignmentData, PDFOptions } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Dashboard stats
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });
}

// Pending student approvals
export function usePendingStudents() {
  return useQuery<{ pendingStudents: PendingStudent[] }>({
    queryKey: ['/api/students/pending'],
  });
}

// Student approval mutation
export function useStudentApproval() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ linkId, status }: { linkId: number, status: 'approved' | 'rejected' }) => {
      await apiRequest('POST', `/api/students/${linkId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: 'Success',
        description: 'Student status updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update student status',
        variant: 'destructive',
      });
    },
  });
}

// Get all tests
export function useTests() {
  return useQuery<{ tests: Test[] }>({
    queryKey: ['/api/tests'],
  });
}

// Get single test
export function useTest(id: string) {
  return useQuery<{ test: Test }>({
    queryKey: ['/api/tests', id],
    enabled: !!id,
  });
}

// Create test
export function useCreateTest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (test: Omit<Test, 'id' | 'createdByTeacherId'>) => {
      const res = await apiRequest('POST', '/api/tests', test);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: 'Success',
        description: 'Test created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create test',
        variant: 'destructive',
      });
    },
  });
}

// Update test
export function useUpdateTest(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (test: Partial<Test>) => {
      const res = await apiRequest('PUT', `/api/tests/${id}`, test);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tests', id] });
      toast({
        title: 'Success',
        description: 'Test updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update test',
        variant: 'destructive',
      });
    },
  });
}

// Delete test
export function useDeleteTest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/tests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: 'Success',
        description: 'Test deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete test',
        variant: 'destructive',
      });
    },
  });
}

// Get questions by filters
export function useQuestions(filters: { subject?: string; chapter?: string; topic?: string; difficulty?: string }) {
  const queryKey = ['/api/questions', filters];
  
  return useQuery<{ questions: Question[] }>({
    queryKey,
    enabled: !!filters.subject, // Only fetch if at least subject is provided
  });
}

// Export test as PDF
export function useExportTestPDF(id: string) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (options: PDFOptions) => {
      const res = await apiRequest('POST', `/api/tests/${id}/pdf`, options);
      return res.blob();
    },
    onSuccess: (blob) => {
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test.pdf';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'PDF downloaded successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    },
  });
}

// Get all students for a teacher
export function useStudents() {
  return useQuery<{ students: Student[] }>({
    queryKey: ['/api/students'],
  });
}

// Assign test to students
export function useAssignTest(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: TestAssignmentData) => {
      const res = await apiRequest('POST', `/api/tests/${id}/assign`, data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: 'Success',
        description: `Test assigned to ${data.count} students`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to assign test',
        variant: 'destructive',
      });
    },
  });
}

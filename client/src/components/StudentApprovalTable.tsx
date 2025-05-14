import { useState } from 'react';
import { PendingStudent } from '@/lib/types';
import { usePendingStudents, useStudentApproval } from '@/hooks/use-test-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle, XCircle, Users } from 'lucide-react';

export default function StudentApprovalTable() {
  const { toast } = useToast();
  const { data, isLoading } = usePendingStudents();
  const approvalMutation = useStudentApproval();
  
  const pendingStudents = data?.pendingStudents || [];
  
  const handleApproval = async (student: PendingStudent, status: 'approved' | 'rejected') => {
    try {
      await approvalMutation.mutateAsync({
        linkId: student.linkId,
        status
      });
      
      toast({
        title: `Student ${status}`,
        description: `${student.name} has been ${status} successfully.`,
      });
    } catch (error) {
      console.error(`Error ${status} student:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${status} student. Please try again.`,
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  if (pendingStudents.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-500 mb-1">No pending student approval requests</p>
        <p className="text-xs text-gray-400">Students will appear here when they request to join your class</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border border-gray-200 overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow className="hover:bg-gray-50/80">
            <TableHead className="font-medium text-gray-700">Name</TableHead>
            <TableHead className="font-medium text-gray-700">Email</TableHead>
            <TableHead className="font-medium text-gray-700">Roll Number</TableHead>
            <TableHead className="font-medium text-gray-700">Request Date</TableHead>
            <TableHead className="text-right font-medium text-gray-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingStudents.map((student) => (
            <TableRow key={student.linkId} className="hover:bg-gray-50 transition-colors">
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.rollNumber || '—'}</TableCell>
              <TableCell>
                {new Date(student.requestDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApproval(student, 'approved')}
                    disabled={approvalMutation.isPending}
                    className="border-green-200 text-green-600 hover:text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors shadow-sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApproval(student, 'rejected')}
                    disabled={approvalMutation.isPending}
                    className="border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
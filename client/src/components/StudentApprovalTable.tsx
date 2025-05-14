import { useState } from 'react';
import { PendingStudent } from '@/lib/types';
import { usePendingStudents, useStudentApproval } from '@/hooks/use-test-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

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
      <div className="text-center p-6 text-muted-foreground">
        No pending student approval requests
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roll Number</TableHead>
            <TableHead>Request Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingStudents.map((student) => (
            <TableRow key={student.linkId}>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.rollNumber || '-'}</TableCell>
              <TableCell>
                {new Date(student.requestDate).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApproval(student, 'approved')}
                    disabled={approvalMutation.isPending}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApproval(student, 'rejected')}
                    disabled={approvalMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Test } from '@/lib/types';
import { useDeleteTest, useExportTestPDF } from '@/hooks/use-test-data';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatRelative } from 'date-fns';
import { 
  MoreHorizontal, 
  PencilIcon, 
  Trash, 
  Download, 
  Users,
  Loader2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from '@/components/ui/checkbox';
import PDFPreview from './PDFPreview';
import ExportTestModal from './ExportTestModal';
import AssignTestModal from './AssignTestModal';

interface TestTableProps {
  tests: Test[];
  isLoading: boolean;
}

export default function TestTable({ tests, isLoading }: TestTableProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const deleteTestMutation = useDeleteTest();
  
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);
  const [testToExport, setTestToExport] = useState<Test | null>(null);
  const [testToAssign, setTestToAssign] = useState<Test | null>(null);
  
  const handleEdit = (test: Test) => {
    navigate(`/edit-test/${test.id}`);
  };
  
  const handleDelete = (test: Test) => {
    setTestToDelete(test);
  };
  
  const confirmDelete = async () => {
    if (!testToDelete) return;
    
    try {
      await deleteTestMutation.mutateAsync(testToDelete.id);
      
      toast({
        title: 'Test deleted',
        description: 'The test has been deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting test:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete test. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setTestToDelete(null);
    }
  };
  
  const handleExport = (test: Test) => {
    setTestToExport(test);
  };
  
  const handleAssign = (test: Test) => {
    setTestToAssign(test);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return formatRelative(date, new Date());
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.length > 0 ? (
              tests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">{test.title}</TableCell>
                  <TableCell>{test.subject}</TableCell>
                  <TableCell>
                    <span className="capitalize">
                      {test.type.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        test.difficulty === 'easy' 
                          ? 'bg-green-100 text-green-800'
                          : test.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : test.difficulty === 'hard'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {test.difficulty}
                    </span>
                  </TableCell>
                  <TableCell>{test.questionsList?.length || 0}</TableCell>
                  <TableCell>{formatDate(test.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(test)}>
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport(test)}>
                          <Download className="mr-2 h-4 w-4" />
                          Export PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssign(test)}>
                          <Users className="mr-2 h-4 w-4" />
                          Assign to Students
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(test)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No tests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!testToDelete} onOpenChange={(open) => !open && setTestToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the test
              "{testToDelete?.title}" and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 focus:ring-red-600"
            >
              {deleteTestMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Export Test Modal */}
      {testToExport && (
        <ExportTestModal
          test={testToExport}
          open={!!testToExport}
          onClose={() => setTestToExport(null)}
        />
      )}
      
      {/* Assign Test Modal */}
      {testToAssign && (
        <AssignTestModal
          test={testToAssign}
          open={!!testToAssign}
          onClose={() => setTestToAssign(null)}
        />
      )}
    </>
  );
}
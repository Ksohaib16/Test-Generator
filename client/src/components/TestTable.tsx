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
      {isLoading ? (
        <div className="flex justify-center items-center h-24 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading tests...</span>
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-12 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <Download className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500 mb-1">No tests found</p>
          <p className="text-xs text-gray-400 mb-4">Create a new test to get started</p>
          <Button
            onClick={() => navigate('/create-test')}
            className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 shadow-md"
          >
            <PencilIcon className="mr-2 h-4 w-4" />
            Create New Test
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-gray-200 overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="hover:bg-gray-50/80">
                <TableHead className="font-medium text-gray-700">Title</TableHead>
                <TableHead className="font-medium text-gray-700">Subject</TableHead>
                <TableHead className="font-medium text-gray-700">Type</TableHead>
                <TableHead className="font-medium text-gray-700">Difficulty</TableHead>
                <TableHead className="font-medium text-gray-700">Questions</TableHead>
                <TableHead className="font-medium text-gray-700">Created</TableHead>
                <TableHead className="text-right font-medium text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map((test) => (
                <TableRow key={test.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-primary">{test.title}</TableCell>
                  <TableCell>{test.subject}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {test.type === 'topic_test' ? 'Topic Test' :
                       test.type === 'chapter_test' ? 'Chapter Test' : 
                       test.type === 'mock_test' ? 'Mock Test' : 'Board Pattern'}
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
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {test.questionsList?.length || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(test.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px] border border-gray-200 shadow-md">
                        <DropdownMenuItem onClick={() => handleEdit(test)} className="cursor-pointer focus:bg-gray-50">
                          <PencilIcon className="mr-2 h-4 w-4 text-blue-600" />
                          <span>Edit Test</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport(test)} className="cursor-pointer focus:bg-gray-50">
                          <Download className="mr-2 h-4 w-4 text-green-600" />
                          <span>Export PDF</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssign(test)} className="cursor-pointer focus:bg-gray-50">
                          <Users className="mr-2 h-4 w-4 text-purple-600" />
                          <span>Assign to Students</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(test)} 
                          className="text-red-600 hover:text-red-700 focus:bg-red-50 cursor-pointer"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete Test</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!testToDelete} onOpenChange={(open) => !open && setTestToDelete(null)}>
        <AlertDialogContent className="border border-gray-200 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-red-600">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This will permanently delete the test <span className="font-semibold">"{testToDelete?.title}"</span>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-gray-200 shadow-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 shadow-sm"
            >
              {deleteTestMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete Test</>
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
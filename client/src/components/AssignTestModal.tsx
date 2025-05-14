import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Test, Student, TestAssignmentData } from '@/lib/types';
import { useAssignTest, useStudents } from '@/hooks/use-test-data';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Loader2, Search, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AssignTestModalProps {
  test: Test;
  open: boolean;
  onClose: () => void;
}

const assignTestSchema = z.object({
  studentIds: z.array(z.number()).min(1, 'Select at least one student'),
  dueDate: z.date().optional(),
  notes: z.string().optional(),
});

type AssignTestFormValues = z.infer<typeof assignTestSchema>;

export default function AssignTestModal({ test, open, onClose }: AssignTestModalProps) {
  const { toast } = useToast();
  const { data, isLoading } = useStudents();
  const assignTestMutation = useAssignTest(test.id.toString());
  const [searchTerm, setSearchTerm] = useState('');
  
  const form = useForm<AssignTestFormValues>({
    resolver: zodResolver(assignTestSchema),
    defaultValues: {
      studentIds: [],
      notes: '',
    },
  });
  
  const students = data?.students || [];
  
  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    searchTerm === '' || 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.rollNumber && student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const onSubmit = async (data: AssignTestFormValues) => {
    try {
      const assignmentData: TestAssignmentData = {
        studentIds: data.studentIds,
        dueDate: data.dueDate ? format(data.dueDate, 'yyyy-MM-dd') : undefined,
        notes: data.notes,
      };
      
      await assignTestMutation.mutateAsync(assignmentData);
      
      toast({
        title: 'Test assigned',
        description: 'The test has been assigned to the selected students',
      });
      
      onClose();
    } catch (error) {
      console.error('Error assigning test:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign test. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Test</DialogTitle>
          <DialogDescription>
            Assign "{test.title}" to students
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <FormField
                control={form.control}
                name="studentIds"
                render={() => (
                  <FormItem className="border rounded-md max-h-64 overflow-y-auto space-y-0">
                    {isLoading ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <FormField
                          key={student.id}
                          control={form.control}
                          name="studentIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={student.id}
                                className="flex flex-row items-center space-x-3 space-y-0 p-4 border-b last:border-b-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(student.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, student.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== student.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="cursor-pointer">
                                    {student.name}
                                  </FormLabel>
                                  <FormDescription className="text-xs">
                                    {student.email} {student.rollNumber ? `• ${student.rollNumber}` : ''}
                                  </FormDescription>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No students found
                      </div>
                    )}
                    <FormMessage className="p-4 pt-2" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The date by which the test should be completed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional instructions for the students..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={assignTestMutation.isPending || form.getValues().studentIds.length === 0}
              >
                {assignTestMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign Test'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useCreateTest, useQuestions } from '@/hooks/use-test-data';
import { useAuth } from '@/hooks/use-auth';
import { Question, Test, SUBJECTS_CHAPTERS } from '@/lib/types';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const testFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  subject: z.string().min(1, 'Subject is required'),
  chapter: z.string().optional(),
  type: z.enum(['chapter_test', 'mock_test', 'board_pattern']),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']),
  duration: z.number().optional(),
  totalMarks: z.number().optional(),
});

type TestFormValues = z.infer<typeof testFormSchema>;

export default function CreateTest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const createTestMutation = useCreateTest();
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [filters, setFilters] = useState({
    subject: '',
    chapter: '',
    topic: '',
    difficulty: '',
  });
  
  const { data: questionData, isLoading: isLoadingQuestions } = useQuestions(filters);
  const availableQuestions = questionData?.questions || [];
  
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      title: '',
      subject: '',
      chapter: '',
      type: 'chapter_test',
      difficulty: 'medium',
      duration: 60,
      totalMarks: 25,
    },
  });
  
  const watchSubject = form.watch('subject');
  
  const onSubmit = async (data: TestFormValues) => {
    if (selectedQuestions.length === 0) {
      toast({
        title: 'No questions selected',
        description: 'Please select at least one question for the test',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const testData: Partial<Test> = {
        ...data,
        createdByTeacherId: user?.id as number,
        questionsList: selectedQuestions,
      };
      
      await createTestMutation.mutateAsync(testData);
      
      toast({
        title: 'Test created',
        description: 'Your test has been created successfully',
      });
      
      navigate('/test-library');
    } catch (error) {
      console.error('Error creating test:', error);
      toast({
        title: 'Error',
        description: 'Failed to create test. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleQuestionSelect = (question: Question) => {
    if (selectedQuestions.find(q => q.id === question.id)) {
      setSelectedQuestions(selectedQuestions.filter(q => q.id !== question.id));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };
  
  const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };
  
  // Calculate total marks
  const totalMarks = selectedQuestions.reduce((sum, q) => sum + q.marks, 0);
  
  const subjectOptions = Object.keys(SUBJECTS_CHAPTERS).map(subject => (
    <SelectItem key={subject} value={subject}>{SUBJECTS_CHAPTERS[subject].name}</SelectItem>
  ));
  
  const chapterOptions = watchSubject && SUBJECTS_CHAPTERS[watchSubject]?.chapters.map(chapter => (
    <SelectItem key={chapter.id} value={chapter.id}>{chapter.name}</SelectItem>
  ));
  
  const topicOptions = watchSubject && filters.chapter && 
    SUBJECTS_CHAPTERS[watchSubject]?.chapters
      .find(c => c.id === filters.chapter)?.topics?.map(topic => (
        <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
      ));

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Create New Test</h1>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="order-2 lg:order-1">
            <CardHeader>
              <CardTitle>Test Questions</CardTitle>
              <CardDescription>
                Select questions to include in your test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <div className="w-full sm:w-[calc(50%-0.375rem)]">
                    <Label htmlFor="filter-subject">Subject</Label>
                    <Select
                      value={filters.subject}
                      onValueChange={(value) => handleFilterChange('subject', value)}
                    >
                      <SelectTrigger id="filter-subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full sm:w-[calc(50%-0.375rem)]">
                    <Label htmlFor="filter-chapter">Chapter</Label>
                    <Select
                      value={filters.chapter}
                      onValueChange={(value) => handleFilterChange('chapter', value)}
                      disabled={!filters.subject}
                    >
                      <SelectTrigger id="filter-chapter">
                        <SelectValue placeholder="Select chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapterOptions}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full sm:w-[calc(50%-0.375rem)]">
                    <Label htmlFor="filter-topic">Topic</Label>
                    <Select
                      value={filters.topic}
                      onValueChange={(value) => handleFilterChange('topic', value)}
                      disabled={!filters.chapter}
                    >
                      <SelectTrigger id="filter-topic">
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topicOptions}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full sm:w-[calc(50%-0.375rem)]">
                    <Label htmlFor="filter-difficulty">Difficulty</Label>
                    <Select
                      value={filters.difficulty}
                      onValueChange={(value) => handleFilterChange('difficulty', value)}
                    >
                      <SelectTrigger id="filter-difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-muted p-3 border-b flex justify-between items-center">
                    <h3 className="text-sm font-medium">Available Questions</h3>
                    <span className="text-xs text-muted-foreground">
                      {availableQuestions.length} questions
                    </span>
                  </div>
                  
                  <div className="divide-y max-h-96 overflow-y-auto">
                    {isLoadingQuestions ? (
                      <div className="flex justify-center p-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : availableQuestions.length > 0 ? (
                      availableQuestions.map((question) => (
                        <div key={question.id} className="p-4 hover:bg-accent/30 transition-colors">
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              id={`question-${question.id}`}
                              checked={selectedQuestions.some(q => q.id === question.id)}
                              onCheckedChange={() => handleQuestionSelect(question)}
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <label 
                                  htmlFor={`question-${question.id}`}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {question.questionText}
                                </label>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                    question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {question.difficulty}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                    {question.marks} marks
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {question.type === 'mcq' ? 'Multiple choice' : 
                                 question.type === 'short_answer' ? 'Short answer' : 'Long answer'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        No questions found matching the selected filters
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-muted p-3 border-b flex justify-between items-center">
                    <h3 className="text-sm font-medium">Selected Questions</h3>
                    <span className="text-xs text-muted-foreground">
                      {selectedQuestions.length} questions | {totalMarks} total marks
                    </span>
                  </div>
                  
                  <div className="divide-y max-h-96 overflow-y-auto">
                    {selectedQuestions.length > 0 ? (
                      selectedQuestions.map((question, index) => (
                        <div key={question.id} className="p-4 hover:bg-accent/30 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="h-6 w-6 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-xs font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <div className="text-sm font-medium">{question.questionText}</div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                    {question.marks} marks
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleQuestionSelect(question)}
                                    className="h-6 px-2"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        No questions selected yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6 order-1 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle>Test Details</CardTitle>
                <CardDescription>
                  Enter the basic details for your test
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="test-form">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Test Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Class 10 Science Test: Force and Laws of Motion" {...field} />
                          </FormControl>
                          <FormDescription>
                            Give your test a descriptive title
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subjectOptions}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="chapter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chapter</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={!watchSubject}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a chapter" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {chapterOptions}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Test Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="chapter_test" id="chapter_test" />
                                <Label htmlFor="chapter_test">Chapter Test</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="mock_test" id="mock_test" />
                                <Label htmlFor="mock_test">Mock Test</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="board_pattern" id="board_pattern" />
                                <Label htmlFor="board_pattern">Board Pattern</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                              <SelectItem value="mixed">Mixed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="60" 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="totalMarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Marks</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="25" 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  form="test-form" 
                  disabled={selectedQuestions.length === 0 || createTestMutation.isPending}
                >
                  {createTestMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Test
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Test Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Questions:</span>
                  <span className="text-sm">{selectedQuestions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Marks:</span>
                  <span className="text-sm">{totalMarks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">MCQ Questions:</span>
                  <span className="text-sm">{selectedQuestions.filter(q => q.type === 'mcq').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Short Answer Questions:</span>
                  <span className="text-sm">{selectedQuestions.filter(q => q.type === 'short_answer').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Long Answer Questions:</span>
                  <span className="text-sm">{selectedQuestions.filter(q => q.type === 'long_answer').length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
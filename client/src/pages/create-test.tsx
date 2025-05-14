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
import { Loader2, Plus, Save, ArrowRight, BookOpen, Filter } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const testFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  subject: z.string().min(1, 'Subject is required'),
  chapter: z.string().optional(),
  topic: z.string().optional(),
  type: z.enum(['topic_test', 'chapter_test', 'mock_test', 'board_pattern']),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']),
  totalQuestions: z.number().min(1, 'At least 1 question is required'),
  duration: z.number().optional(),
});

type TestFormValues = z.infer<typeof testFormSchema>;

export default function CreateTest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const createTestMutation = useCreateTest();
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
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
      topic: '',
      type: 'chapter_test',
      difficulty: 'medium',
      totalQuestions: 10,
      duration: 60,
    },
  });
  
  const watchSubject = form.watch('subject');
  const watchChapter = form.watch('chapter');
  const watchType = form.watch('type');
  
  const moveToNextStep = async () => {
    if (currentStep === 1) {
      const result = await form.trigger(['subject', 'chapter', 'type']);
      if (!result) return;
      
      // When moving to step 2, set filters based on current form values
      setFilters({
        ...filters,
        subject: form.getValues('subject'),
        chapter: form.getValues('chapter'),
        topic: form.getValues('topic') || '',
      });
      
      setCurrentStep(2);
    }
  };
  
  const moveToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
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
      const totalMarks = selectedQuestions.reduce((sum, q) => sum + q.marks, 0);
      
      const testData = {
        title: data.title,
        subject: data.subject,
        chapter: data.chapter,
        topic: data.topic,
        type: data.type,
        difficulty: data.difficulty,
        duration: data.duration,
        totalMarks: totalMarks,
        createdByTeacherId: user?.id as number,
        questionsList: selectedQuestions,
      };
      
      await createTestMutation.mutateAsync(testData as any);
      
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
  
  const topicOptions = watchSubject && watchChapter && 
    SUBJECTS_CHAPTERS[watchSubject]?.chapters
      .find(c => c.id === watchChapter)?.topics?.map(topic => (
        <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
      ));

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Create New Test</h1>
            <p className="text-gray-600 mt-1">Create customized tests for your students</p>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-2">
          <div className="flex justify-between">
            <div className="flex items-center">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center font-medium text-sm", 
                currentStep >= 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
              )}>
                1
              </div>
              <div className="ml-2">
                <p className={cn("font-medium", currentStep >= 1 ? "text-gray-900" : "text-gray-500")}>Test Details</p>
                <p className="text-xs text-gray-500">Basic information</p>
              </div>
            </div>
            <div className="flex-1 flex items-center mx-4">
              <div className={cn("h-1 w-full", currentStep >= 2 ? "bg-primary" : "bg-gray-200")}></div>
            </div>
            <div className="flex items-center">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center font-medium text-sm", 
                currentStep >= 2 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
              )}>
                2
              </div>
              <div className="ml-2">
                <p className={cn("font-medium", currentStep >= 2 ? "text-gray-900" : "text-gray-500")}>Select Questions</p>
                <p className="text-xs text-gray-500">Add questions to test</p>
              </div>
            </div>
          </div>
        </div>
        
        {currentStep === 1 && (
          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-semibold text-gray-800">Test Details</CardTitle>
              <CardDescription className="text-gray-600">
                Enter the basic information for your test
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-white pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(moveToNextStep)} className="space-y-6" id="test-details-form">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Class 10 Science Test: Force and Laws of Motion" 
                            {...field} 
                            className="border-gray-300 focus:border-primary/50"
                          />
                        </FormControl>
                        <FormDescription>
                          Give your test a descriptive title
                        </FormDescription>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-6 sm:grid-cols-2">
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
                              <SelectTrigger className="border-gray-300 focus:border-primary/50">
                                <SelectValue placeholder="Select a subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjectOptions}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
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
                              <SelectTrigger className="border-gray-300 focus:border-primary/50">
                                <SelectValue placeholder="Select a chapter" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {chapterOptions}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic (Optional)</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={!watchChapter}
                          >
                            <FormControl>
                              <SelectTrigger className="border-gray-300 focus:border-primary/50">
                                <SelectValue placeholder="Select a topic" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {topicOptions}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
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
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
                          >
                            <div className={cn(
                              "flex flex-col border rounded-lg p-4 cursor-pointer",
                              field.value === "topic_test" ? "border-primary bg-primary/5" : "border-gray-200"
                            )}>
                              <RadioGroupItem value="topic_test" id="topic_test" className="sr-only" />
                              <Label htmlFor="topic_test" className="flex flex-col h-full cursor-pointer">
                                <span className="font-medium mb-1">Topic Test</span>
                                <span className="text-xs text-gray-500">Test focused on a specific topic within a chapter</span>
                              </Label>
                            </div>
                            <div className={cn(
                              "flex flex-col border rounded-lg p-4 cursor-pointer",
                              field.value === "chapter_test" ? "border-primary bg-primary/5" : "border-gray-200"
                            )}>
                              <RadioGroupItem value="chapter_test" id="chapter_test" className="sr-only" />
                              <Label htmlFor="chapter_test" className="flex flex-col h-full cursor-pointer">
                                <span className="font-medium mb-1">Chapter Test</span>
                                <span className="text-xs text-gray-500">Complete chapter coverage with mixed questions</span>
                              </Label>
                            </div>
                            <div className={cn(
                              "flex flex-col border rounded-lg p-4 cursor-pointer",
                              field.value === "mock_test" ? "border-primary bg-primary/5" : "border-gray-200"
                            )}>
                              <RadioGroupItem value="mock_test" id="mock_test" className="sr-only" />
                              <Label htmlFor="mock_test" className="flex flex-col h-full cursor-pointer">
                                <span className="font-medium mb-1">Mock Test</span>
                                <span className="text-xs text-gray-500">Full subject coverage simulating exam conditions</span>
                              </Label>
                            </div>
                            <div className={cn(
                              "flex flex-col border rounded-lg p-4 cursor-pointer",
                              field.value === "board_pattern" ? "border-primary bg-primary/5" : "border-gray-200"
                            )}>
                              <RadioGroupItem value="board_pattern" id="board_pattern" className="sr-only" />
                              <Label htmlFor="board_pattern" className="flex flex-col h-full cursor-pointer">
                                <span className="font-medium mb-1">Board Pattern</span>
                                <span className="text-xs text-gray-500">Follows CBSE board exam pattern and distribution</span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-6 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="totalQuestions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Questions</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="10" 
                              {...field}
                              className="border-gray-300 focus:border-primary/50"
                              onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                              min={1}
                            />
                          </FormControl>
                          <FormDescription>
                            Total questions to include
                          </FormDescription>
                          <FormMessage className="text-red-500" />
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
                              <SelectTrigger className="border-gray-300 focus:border-primary/50">
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
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
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
                              className="border-gray-300 focus:border-primary/50"
                              onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                              min={5}
                            />
                          </FormControl>
                          <FormDescription>
                            Time allowed for the test
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 bg-gray-50 p-4 border-t border-gray-100">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="border border-gray-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="test-details-form"
                className="bg-primary hover:bg-primary/90"
              >
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {currentStep === 2 && (
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Card className="border border-gray-200 shadow-sm overflow-hidden sticky top-6">
                <CardHeader className="bg-white border-b border-gray-100 pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-800">Filter Questions</CardTitle>
                  <CardDescription className="text-gray-600">
                    Narrow down questions based on criteria
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-white space-y-4 pt-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="filter-subject" className="text-gray-700">Subject</Label>
                      <Select
                        value={filters.subject}
                        onValueChange={(value) => handleFilterChange('subject', value)}
                      >
                        <SelectTrigger id="filter-subject" className="border-gray-300 mt-1">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjectOptions}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="filter-chapter" className="text-gray-700">Chapter</Label>
                      <Select
                        value={filters.chapter}
                        onValueChange={(value) => handleFilterChange('chapter', value)}
                        disabled={!filters.subject}
                      >
                        <SelectTrigger id="filter-chapter" className="border-gray-300 mt-1">
                          <SelectValue placeholder="Select chapter" />
                        </SelectTrigger>
                        <SelectContent>
                          {chapterOptions}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="filter-topic" className="text-gray-700">Topic</Label>
                      <Select
                        value={filters.topic}
                        onValueChange={(value) => handleFilterChange('topic', value)}
                        disabled={!filters.chapter}
                      >
                        <SelectTrigger id="filter-topic" className="border-gray-300 mt-1">
                          <SelectValue placeholder="Select topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {topicOptions}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="filter-difficulty" className="text-gray-700">Difficulty</Label>
                      <Select
                        value={filters.difficulty}
                        onValueChange={(value) => handleFilterChange('difficulty', value)}
                      >
                        <SelectTrigger id="filter-difficulty" className="border-gray-300 mt-1">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Difficulty</SelectItem>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => {
                        // Reset filters to match form data
                        setFilters({
                          subject: form.getValues('subject'),
                          chapter: form.getValues('chapter') || '',
                          topic: form.getValues('topic') || '',
                          difficulty: '',
                        });
                      }}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Reset Filters
                    </Button>
                  </div>
                </CardContent>
                
                <div className="bg-gray-50 border-t border-gray-100 p-4">
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-gray-700">Test Summary</h3>
                    <div className="bg-white p-3 rounded-md border border-gray-200 text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Selected Questions:</span>
                        <span className="font-semibold">{selectedQuestions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Marks:</span>
                        <span className="font-semibold">{totalMarks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">MCQ Questions:</span>
                        <span>{selectedQuestions.filter(q => q.type === 'mcq').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Short Answer:</span>
                        <span>{selectedQuestions.filter(q => q.type === 'short_answer').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Long Answer:</span>
                        <span>{selectedQuestions.filter(q => q.type === 'long_answer').length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            <Card className="lg:col-span-3 border border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-100 pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800">Test Questions</CardTitle>
                <CardDescription className="text-gray-600">
                  Select questions to include in your test
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-white p-0">
                <div className="border-b">
                  <div className="bg-gray-50 p-3 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">Available Questions</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      {availableQuestions.length} questions
                    </span>
                  </div>
                  
                  <div className="divide-y max-h-[300px] overflow-y-auto">
                    {isLoadingQuestions ? (
                      <div className="flex justify-center p-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : availableQuestions.length > 0 ? (
                      availableQuestions.map((question) => (
                        <div key={question.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              id={`question-${question.id}`}
                              checked={selectedQuestions.some(q => q.id === question.id)}
                              onCheckedChange={() => handleQuestionSelect(question)}
                              className="mt-0.5 border-gray-300"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <label 
                                  htmlFor={`question-${question.id}`}
                                  className="text-sm font-medium text-gray-800 cursor-pointer"
                                >
                                  {question.questionText}
                                </label>
                                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                  <span className={`text-xs px-2 py-1 rounded-full flex items-center justify-center ${
                                    question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                    question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {question.difficulty}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                    {question.marks} marks
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="inline-flex items-center bg-gray-100 px-2 py-0.5 rounded text-gray-700 mr-2">
                                  {question.type === 'mcq' ? 'Multiple choice' : 
                                   question.type === 'short_answer' ? 'Short answer' : 'Long answer'}
                                </span>
                                <span className="text-gray-500">
                                  {question.chapter && `Chapter: ${question.chapter}`}
                                  {question.topic && ` • Topic: ${question.topic}`}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <BookOpen className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                        <p className="text-gray-500 mb-1">No questions found matching the selected filters</p>
                        <p className="text-xs text-gray-400">Try changing your filter criteria</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="bg-gray-50 p-3 flex justify-between items-center border-t border-b">
                    <h3 className="text-sm font-medium text-gray-700">Selected Questions</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      {selectedQuestions.length} questions
                    </span>
                  </div>
                  
                  <div className="divide-y max-h-[300px] overflow-y-auto">
                    {selectedQuestions.length > 0 ? (
                      selectedQuestions.map((question, index) => (
                        <div key={question.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="h-6 w-6 flex items-center justify-center bg-primary text-white rounded-full text-xs font-medium shadow-sm flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <div className="text-sm font-medium text-gray-800">{question.questionText}</div>
                                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                    {question.marks} marks
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleQuestionSelect(question)}
                                    className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="inline-flex items-center bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                  {question.type === 'mcq' ? 'Multiple choice' : 
                                   question.type === 'short_answer' ? 'Short answer' : 'Long answer'}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <p>No questions selected yet</p>
                        <p className="text-xs text-gray-400 mt-1">Select questions from the list above</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-between space-x-2 bg-gray-50 p-4 border-t border-gray-100">
                <Button 
                  variant="outline"
                  onClick={moveToPreviousStep}
                  className="border-gray-200"
                >
                  Back to Details
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/dashboard')}
                    className="border border-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={selectedQuestions.length === 0 || createTestMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
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
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
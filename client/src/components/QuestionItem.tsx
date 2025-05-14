import { useState } from 'react';
import { Question } from '@/lib/types';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Edit, Trash, GripVertical } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';

interface QuestionItemProps {
  question: Question;
  index: number;
  onEdit: (index: number, question: Question) => void;
  onDelete: (index: number) => void;
  isDragging?: boolean;
}

const questionFormSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  type: z.enum(['mcq', 'short_answer', 'long_answer']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.coerce.number().min(1, 'Marks must be at least 1'),
  options: z.array(z.string()).optional(),
  answer: z.string().optional(),
  explanation: z.string().optional(),
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

export default function QuestionItem({ question, index, onEdit, onDelete, isDragging }: QuestionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionText: question.questionText,
      type: question.type,
      difficulty: question.difficulty,
      marks: question.marks,
      options: question.options || [],
      answer: question.answer || '',
      explanation: question.explanation || '',
    }
  });
  
  const questionType = form.watch('type');
  
  const handleSubmit = (values: QuestionFormValues) => {
    onEdit(index, {
      ...question,
      ...values,
    });
    setIsEditing(false);
  };
  
  return (
    <>
      <Card className={cn(
        "bg-gray-50 border border-gray-200",
        isDragging && "opacity-50",
      )}>
        <CardContent className="p-4">
          <div className="flex justify-between mb-3">
            <div className="flex items-center">
              <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <span className="ml-2 text-sm text-muted-foreground">({question.marks} marks)</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button 
                className="text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(index)}
              >
                <Trash className="h-4 w-4" />
              </button>
              <div className="text-muted-foreground hover:text-foreground cursor-move">
                <GripVertical className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          <div className="mb-3">
            <p className="text-foreground mb-2">{question.questionText}</p>
            
            {question.type === 'mcq' && question.options && (
              <div className="ml-6 space-y-2">
                {question.options.map((option, i) => (
                  <div className="flex items-center" key={i}>
                    <RadioGroup
                      value={selectedAnswer || ''}
                      onValueChange={setSelectedAnswer}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={option} 
                          id={`q${index}_${i}`} 
                          checked={option === question.answer}
                          className="h-4 w-4"
                        />
                        <label 
                          htmlFor={`q${index}_${i}`} 
                          className={cn(
                            "ml-2 block text-sm",
                            option === question.answer && "font-medium"
                          )}
                        >
                          {String.fromCharCode(65 + i)}) {option}
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            )}
            
            {question.type !== 'mcq' && (
              <div className="mt-2 border border-dashed border-gray-300 p-3 bg-white rounded">
                <p className="text-sm text-muted-foreground italic">
                  {question.type === 'short_answer' ? 'Short answer space' : 'Long answer space'}
                </p>
              </div>
            )}
          </div>
          
          {question.answer && (
            <div className="text-sm">
              <div className="flex text-muted-foreground">
                <span className="font-medium mr-2">Correct Answer:</span>
                <span>
                  {question.type === 'mcq' && question.options 
                    ? `${String.fromCharCode(65 + question.options.indexOf(question.answer))}`
                    : question.answer}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mcq">Multiple Choice</SelectItem>
                          <SelectItem value="short_answer">Short Answer</SelectItem>
                          <SelectItem value="long_answer">Long Answer</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
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
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marks</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {questionType === 'mcq' && (
                <div className="space-y-2">
                  <FormLabel>Options</FormLabel>
                  {[0, 1, 2, 3].map((i) => (
                    <div className="flex gap-2" key={i}>
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        value={form.watch('options')?.[i] || ''}
                        onChange={(e) => {
                          const options = [...(form.watch('options') || [])];
                          options[i] = e.target.value;
                          form.setValue('options', options);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer</FormLabel>
                    <FormControl>
                      {questionType === 'mcq' ? (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select correct answer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {form.watch('options')?.map((option, i) => (
                              <SelectItem key={i} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Textarea {...field} placeholder="Answer/Solution" />
                      )}
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Explanation or solution hint" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UploadCloud, FileText, Trash2, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_FILE_TYPES = ['application/pdf'];

const formSchema = z.object({
  question: z.string().min(10, {
    message: 'Please enter a research question of at least 10 characters.',
  }),
  files: z
    .array(z.instanceof(File))
    .optional() // Files are optional
    .refine(
      (files) => !files || files.every((file) => file.size <= MAX_FILE_SIZE),
      `Each file must be 20MB or less.`
    )
    .refine(
      (files) => !files || files.every((file) => ALLOWED_FILE_TYPES.includes(file.type)),
      'Only .pdf files are allowed.'
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface ResearchFormProps {
  onSubmit: (data: { question: string; files: File[] }) => void;
  isLoading: boolean;
}

export default function ResearchForm({ onSubmit, isLoading }: ResearchFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
      files: [],
    },
  });

  const { control, watch, setValue } = form;
  const files = watch('files');

  // Wrapper to handle optional files for the final submission
  const handleFormSubmit = (data: FormValues) => {
    onSubmit({
      question: data.question,
      files: data.files || [],
    });
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-primary">Start Your Research</CardTitle>
        <CardDescription className="text-lg">
          Submit your question and optionally upload documents to generate your report.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
            <FormField
              control={control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl font-headline">Research Question</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., What are the latest advancements in quantum computing for drug discovery?"
                      className="text-base"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="files"
              render={() => (
                <FormItem>
                  <FormLabel className="text-xl font-headline">Upload Documents (Optional)</FormLabel>
                  <FormControl>
                    <Controller
                      control={control}
                      name="files"
                      render={({ field: { onChange }, fieldState: { error } }) => (
                        <div>
                          <label
                            htmlFor="file-upload"
                            className={cn(
                              'relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors',
                              error ? 'border-destructive' : 'border-border'
                            )}
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                              <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold text-accent">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">PDF only (max 20MB per file)</p>
                            </div>
                            <Input
                              id="file-upload"
                              type="file"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              multiple
                              accept="application/pdf"
                              onChange={(e) => {
                                const newFiles = Array.from(e.target.files || []);
                                const currentFiles = watch('files') || [];
                                onChange([...currentFiles, ...newFiles]);
                              }}
                            />
                          </label>
                          <FormMessage className="mt-2" />
                        </div>
                      )}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {files && files.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Uploaded Files:</h3>
                <ul className="divide-y rounded-md border">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          const newFiles = [...files];
                          newFiles.splice(index, 1);
                          setValue('files', newFiles, { shouldValidate: true });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className={cn(
                "w-full text-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 ease-in-out",
                "hover:shadow-lg hover:shadow-accent/50 hover:scale-105",
                isLoading && "animate-[pulse-glow_2s_ease-in-out_infinite]"
              )}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                  Generating Report...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

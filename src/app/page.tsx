'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleResearchRequest, handleRefresh } from '@/app/actions';
import type { GenerateKeyTakeawaysOutput } from '@/ai/flows/generate-key-takeaways';
import type { AutoRefreshAnswersOutput } from '@/ai/flows/auto-refresh-answers';

import Header from '@/components/header';
import ResearchForm from '@/components/research-form';
import ReportDisplay from '@/components/report-display';

export type Report = GenerateKeyTakeawaysOutput;

export default function Home() {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState(0);
  const { toast } = useToast();

  const handleSubmit = async (data: { question: string; files: File[] }) => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    const formData = new FormData();
    formData.append('question', data.question);
    data.files.forEach(file => {
      formData.append('files', file);
    });

    const result = await handleResearchRequest(formData);

    if (result.error) {
      setError(result.error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: result.error,
      });
    } else if (result.data) {
      setReport(result.data);
      setCredits(prev => prev + 10);
      setError(null);
    }

    setIsLoading(false);
  };

  const onRefresh = async () => {
    if (!report || !report.summary) return;
    setIsRefreshing(true);
    
    const result = await handleRefresh(
      report.keyTakeaways.join(' '), // Using key takeaways for the question context
      report.summary,
      report.sources
    );
    
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Refresh Failed',
        description: result.error,
      });
    } else if (result.data && result.data.isUpdated) {
      setReport(prev => ({ ...prev!, summary: result.data!.updatedAnswer }));
      toast({
        title: 'Report Updated',
        description: 'New information has been incorporated into your report.',
      });
    } else {
       toast({
        title: 'No Updates Found',
        description: 'Your report is already up-to-date.',
      });
    }

    setIsRefreshing(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground dark">
      <Header credits={credits} />
      <main className="flex-grow w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-12">
          <section id="submission" className="animate-fade-in-up">
            <ResearchForm onSubmit={handleSubmit} isLoading={isLoading} />
          </section>

          <section id="report" className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <ReportDisplay
              report={report}
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              error={error}
              onRefresh={onRefresh}
            />
          </section>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ResearchPilot. All rights reserved.</p>
      </footer>
    </div>
  );
}

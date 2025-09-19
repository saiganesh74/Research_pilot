'use client';

import type { Report } from '@/app/page';
import { Key, BookText, Link as LinkIcon, RefreshCw, LoaderCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ReportDisplayProps {
  report: Report | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function ReportDisplay({ report, isLoading, isRefreshing, error, onRefresh }: ReportDisplayProps) {
  if (isLoading) {
    return <ReportSkeleton />;
  }

  if (error && !report) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="font-headline text-destructive">Generation Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium font-headline text-muted-foreground">Your report will appear here</h3>
        <p className="mt-1 text-sm text-muted-foreground">Submit a question and documents to get started.</p>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="font-headline text-3xl">Research Report</CardTitle>
          <CardDescription>Generated based on your question and documents.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Section */}
        <div className="space-y-2">
          <h3 className="flex items-center text-xl font-headline">
            <BookText className="mr-3 h-5 w-5 text-accent" />
            Executive Summary
          </h3>
          <p className="text-base leading-relaxed text-foreground/80">{report.summary}</p>
        </div>

        <Separator />

        {/* Key Takeaways Section */}
        <div className="space-y-2">
          <h3 className="flex items-center text-xl font-headline">
            <Key className="mr-3 h-5 w-5 text-accent" />
            Key Takeaways
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {report.keyTakeaways.map((takeaway, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-base text-left hover:no-underline">
                  <span className="font-medium">Takeaway #{index + 1}</span>
                </AccordionTrigger>
                <AccordionContent className="text-base text-foreground/80">
                  {takeaway}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <Separator />

        {/* Sources Section */}
        <div className="space-y-2">
          <h3 className="flex items-center text-xl font-headline">
            <LinkIcon className="mr-3 h-5 w-5 text-accent" />
            Sources
          </h3>
          {report.sources && report.sources.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {report.sources.map((source, index) => (
                <li key={index} className="text-base">
                  <a
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline underline-offset-4"
                  >
                    {source}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No external sources were cited.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ReportSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Separator />
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

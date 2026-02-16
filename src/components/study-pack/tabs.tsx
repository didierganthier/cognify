'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SummaryTab } from './summary-tab';
import { QuizTab } from './quiz-tab';
import { AudioTab } from './audio-tab';
import { ResultsTab } from './results-tab';
import { FileText, ClipboardCheck, Headphones, BarChart3 } from 'lucide-react';

interface StudyPackTabsProps {
  document: {
    id: string;
    title: string;
    status: string;
  };
  summary: {
    id: string;
    tldr: string;
    key_concepts: string[];
    definitions: { term: string; definition: string }[];
    bullet_summary: string[];
    audio_url: string | null;
  } | null;
  quiz: {
    id: string;
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correct_answer: number;
    }>;
  } | null;
  attempts: Array<{
    id: string;
    score: number;
    total_questions: number;
    taken_at: string;
  }>;
}

export function StudyPackTabs({ document, summary, quiz, attempts }: StudyPackTabsProps) {
  if (document.status === 'processing') {
    return (
      <div className="text-center py-20">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Processing your document...</h3>
        <p className="text-muted-foreground">This usually takes 30-60 seconds</p>
      </div>
    );
  }

  if (document.status === 'failed') {
    return (
      <div className="text-center py-20">
        <p className="text-destructive">Failed to process document. Please try uploading again.</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="summary" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Summary</span>
        </TabsTrigger>
        <TabsTrigger value="quiz" className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Quiz</span>
        </TabsTrigger>
        <TabsTrigger value="audio" className="flex items-center gap-2">
          <Headphones className="h-4 w-4" />
          <span className="hidden sm:inline">Listen</span>
        </TabsTrigger>
        <TabsTrigger value="results" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Results</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="mt-6">
        <SummaryTab summary={summary} />
      </TabsContent>

      <TabsContent value="quiz" className="mt-6">
        <QuizTab quiz={quiz} />
      </TabsContent>

      <TabsContent value="audio" className="mt-6">
        <AudioTab audioUrl={summary?.audio_url || null} summary={summary?.tldr || ''} />
      </TabsContent>

      <TabsContent value="results" className="mt-6">
        <ResultsTab attempts={attempts} />
      </TabsContent>
    </Tabs>
  );
}

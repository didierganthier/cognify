import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StudyPackTabs } from '@/components/study-pack/tabs';

interface DocumentPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: document } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (!document) {
    notFound();
  }

  const { data: summary } = await supabase
    .from('summaries')
    .select('*')
    .eq('document_id', id)
    .single();

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('document_id', id)
    .single();

  const { data: flashcards } = await supabase
    .from('flashcards')
    .select('id, front, back, mastery_level')
    .eq('document_id', id)
    .order('created_at', { ascending: true });

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quiz?.id)
    .order('taken_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold break-words">{document.title}</h1>
        <p className="text-muted-foreground mt-1">
          Uploaded on {new Date(document.created_at).toLocaleDateString()}
        </p>
      </div>

      <StudyPackTabs 
        document={document}
        summary={summary}
        quiz={quiz}
        flashcards={flashcards}
        attempts={attempts || []}
      />
    </div>
  );
}

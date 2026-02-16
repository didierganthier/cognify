import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Clock, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default async function DocumentsPage() {
  const supabase = await createClient();
  
  // TODO: Fetch documents from Supabase
  const documents: Array<{
    id: string;
    title: string;
    status: 'processing' | 'completed' | 'failed';
    created_at: string;
    page_count: number;
  }> = [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Ready</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Documents</h1>
          <p className="text-muted-foreground mt-1">
            All your uploaded study materials
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/upload">
            <Plus className="mr-2 h-4 w-4" />
            Upload PDF
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search documents..." className="pl-10" />
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Upload your first PDF to generate summaries, quizzes, and audio.
            </p>
            <Button asChild>
              <Link href="/dashboard/upload">
                <Plus className="mr-2 h-4 w-4" />
                Upload Your First PDF
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-10 w-10 text-primary" />
                  {getStatusBadge(doc.status)}
                </div>
                <CardTitle className="mt-4 line-clamp-2">{doc.title}</CardTitle>
                <CardDescription>
                  {doc.page_count} pages • {new Date(doc.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild disabled={doc.status !== 'completed'}>
                  <Link href={`/dashboard/documents/${doc.id}`}>
                    {doc.status === 'completed' ? 'View Study Pack' : 'Processing...'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

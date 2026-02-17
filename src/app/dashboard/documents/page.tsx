import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Clock, CheckCircle2, AlertCircle, Search, Folder } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CreateFolderDialog } from '@/components/folders/create-folder-dialog';
import { MoveToFolderDropdown } from '@/components/folders/move-to-folder-dropdown';

export default async function DocumentsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: documents } = await supabase
    .from('documents')
    .select('id, title, status, created_at, page_count, folder_id')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  const { data: folders } = await supabase
    .from('folders')
    .select('id, name, color')
    .eq('user_id', user?.id)
    .order('name', { ascending: true });

  const documentsList = documents || [];
  const foldersList = folders || [];

  // Group documents by folder
  const documentsByFolder = documentsList.reduce((acc, doc) => {
    const folderId = doc.folder_id || 'unfiled';
    if (!acc[folderId]) acc[folderId] = [];
    acc[folderId].push(doc);
    return acc;
  }, {} as Record<string, typeof documentsList>);

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

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return null;
    const folder = foldersList.find(f => f.id === folderId);
    return folder ? folder : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Documents</h1>
          <p className="text-muted-foreground mt-1">
            All your uploaded study materials
          </p>
        </div>
        <div className="flex gap-2">
          <CreateFolderDialog />
          <Button asChild>
            <Link href="/dashboard/upload">
              <Plus className="mr-2 h-4 w-4" />
              Upload PDF
            </Link>
          </Button>
        </div>
      </div>

      {/* Folder Pills */}
      {foldersList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            All Documents ({documentsList.length})
          </Badge>
          {foldersList.map((folder) => (
            <Badge 
              key={folder.id} 
              variant="outline" 
              className="cursor-pointer hover:bg-muted gap-1"
            >
              <Folder className="h-3 w-3" style={{ color: folder.color }} />
              {folder.name} ({documentsByFolder[folder.id]?.length || 0})
            </Badge>
          ))}
          {documentsByFolder['unfiled']?.length > 0 && (
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Unfiled ({documentsByFolder['unfiled'].length})
            </Badge>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search documents..." className="pl-10" />
      </div>

      {/* Documents Grid */}
      {documentsList.length === 0 ? (
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
          {documentsList.map((doc) => {
            const folder = getFolderName(doc.folder_id);
            return (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <FileText className="h-10 w-10 text-primary" />
                    <div className="flex items-center gap-1">
                      {getStatusBadge(doc.status)}
                      <MoveToFolderDropdown 
                        documentId={doc.id} 
                        currentFolderId={doc.folder_id}
                        folders={foldersList}
                      />
                    </div>
                  </div>
                  <CardTitle className="mt-4 line-clamp-2">{doc.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {folder && (
                      <span className="flex items-center gap-1 text-xs">
                        <Folder className="h-3 w-3" style={{ color: folder.color }} />
                        {folder.name}
                        <span className="text-muted-foreground">•</span>
                      </span>
                    )}
                    {doc.page_count || 0} pages • {new Date(doc.created_at).toLocaleDateString()}
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
            );
          })}
        </div>
      )}
    </div>
  );
}

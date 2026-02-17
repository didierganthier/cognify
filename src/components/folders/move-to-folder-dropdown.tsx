'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Folder, FolderOpen, ChevronDown, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface FolderOption {
  id: string;
  name: string;
  color: string;
}

interface MoveToFolderDropdownProps {
  documentId: string;
  currentFolderId?: string | null;
  folders: FolderOption[];
}

export function MoveToFolderDropdown({ 
  documentId, 
  currentFolderId, 
  folders 
}: MoveToFolderDropdownProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleMove = async (folderId: string | null) => {
    setLoading(true);
    try {
      await supabase
        .from('documents')
        .update({ folder_id: folderId })
        .eq('id', documentId);
      
      router.refresh();
    } catch (error) {
      console.error('Failed to move document:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Folder className="h-4 w-4 mr-1" />
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleMove(null)}
          disabled={!currentFolderId}
        >
          <FolderOpen className="h-4 w-4 mr-2 text-muted-foreground" />
          No Folder
        </DropdownMenuItem>
        {folders.length > 0 && <DropdownMenuSeparator />}
        {folders.map((folder) => (
          <DropdownMenuItem
            key={folder.id}
            onClick={() => handleMove(folder.id)}
            disabled={currentFolderId === folder.id}
          >
            <Folder 
              className="h-4 w-4 mr-2" 
              style={{ color: folder.color }}
              fill={currentFolderId === folder.id ? folder.color : 'transparent'}
            />
            {folder.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractTextFromPDF, formatTextForSummary } from '@/lib/pdf';
import { generateSummary, generateQuiz, generateAudio, generateFlashcards } from '@/lib/openai';
import { extractWebPageContent, isPdfUrl, getPageNameFromUrl } from '@/lib/scraper';

// Fetch PDF from URL
async function fetchPdfFromUrl(url: string): Promise<{ buffer: Buffer; fileName: string; fileSize: number }> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Cognify/1.0 (PDF Study Tool)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/pdf') && !url.toLowerCase().endsWith('.pdf')) {
    throw new Error('URL does not point to a PDF file');
  }

  const contentLength = response.headers.get('content-length');
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (contentLength && parseInt(contentLength) > maxSize) {
    throw new Error('PDF file is too large. Maximum size is 10MB.');
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length > maxSize) {
    throw new Error('PDF file is too large. Maximum size is 10MB.');
  }

  // Extract filename from URL or Content-Disposition header
  let fileName = 'Document.pdf';
  const contentDisposition = response.headers.get('content-disposition');
  if (contentDisposition) {
    const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match) {
      fileName = match[1].replace(/['"]/g, '');
    }
  } else {
    const urlPath = new URL(url).pathname;
    const urlFileName = urlPath.split('/').pop();
    if (urlFileName && urlFileName.endsWith('.pdf')) {
      fileName = urlFileName;
    }
  }

  return { buffer, fileName, fileSize: buffer.length };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let buffer: Buffer | null = null;
    let text: string = '';
    let originalFileName: string = 'Document';
    let fileSize: number = 0;
    let sourceType: 'pdf' | 'webpage' = 'pdf';
    let sourceUrl: string = '';

    // Check if this is a URL submission or file upload
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // URL submission
      const body = await request.json();
      const { url } = body;

      if (!url || typeof url !== 'string') {
        return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
      }

      try {
        new URL(url);
      } catch {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
      }

      sourceUrl = url;

      // Check if URL is a PDF or a web page
      if (isPdfUrl(url)) {
        // Handle PDF URL
        sourceType = 'pdf';
        try {
          const result = await fetchPdfFromUrl(url);
          buffer = result.buffer;
          originalFileName = result.fileName;
          fileSize = result.fileSize;
        } catch (err) {
          return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Failed to fetch PDF from URL' },
            { status: 400 }
          );
        }
      } else {
        // Handle web page URL
        sourceType = 'webpage';
        try {
          const webContent = await extractWebPageContent(url);
          text = webContent.content;
          originalFileName = webContent.title || getPageNameFromUrl(url);
          fileSize = text.length;
        } catch (err) {
          return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Failed to extract content from URL' },
            { status: 400 }
          );
        }
      }
    } else {
      // File upload
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      originalFileName = file.name;
      fileSize = file.size;
      sourceType = 'pdf';
    }

    let publicUrl = '';

    // Only upload to storage for PDFs (web pages don't need storage)
    if (sourceType === 'pdf' && buffer) {
      const fileName = `${user.id}/${Date.now()}-${originalFileName}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, buffer, {
          contentType: 'application/pdf',
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
      }

      // Get public URL
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
      publicUrl = data.publicUrl;
    }

    // Create document record
    // For web pages, store the original URL; for PDFs, store the storage URL
    const documentUrl = sourceType === 'webpage' ? sourceUrl : publicUrl;
    
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: originalFileName.replace('.pdf', ''),
        file_url: documentUrl,
        file_size: fileSize,
        status: 'processing',
      })
      .select()
      .single();

    if (docError) {
      console.error('Document insert error:', docError);
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 });
    }

    // Process in background (for MVP, we'll do it synchronously)
    // In production, you'd use a queue like Vercel Functions or a job processor
    
    try {
      // Extract text based on source type
      if (sourceType === 'pdf' && buffer) {
        const rawText = await extractTextFromPDF(buffer);
        text = formatTextForSummary(rawText);
      }
      // For web pages, text is already extracted above
      
      console.log(`[Document ${document.id}] Text extracted, length: ${text.length} chars`);

      // Generate summary
      const summaryData = await generateSummary(text);
      console.log(`[Document ${document.id}] Summary generated:`, {
        hasTldr: !!summaryData.tldr,
        keyConceptsCount: summaryData.key_concepts?.length || 0,
        definitionsCount: summaryData.definitions?.length || 0,
      });

      // Generate quiz
      const quizData = await generateQuiz(text, summaryData.tldr || '');
      console.log(`[Document ${document.id}] Quiz generated: ${quizData.length} questions`);

      // Generate audio from summary
      const audioText = `Here's your summary. ${summaryData.tldr || 'No summary available'}. Key concepts include: ${summaryData.key_concepts?.join(', ') || 'various topics'}.`;
      const audioBuffer = await generateAudio(audioText);
      console.log(`[Document ${document.id}] Audio generated: ${audioBuffer.length} bytes`);

      // Upload audio to storage
      const audioFileName = `${user.id}/${document.id}-audio.mp3`;
      await supabase.storage
        .from('audio')
        .upload(audioFileName, audioBuffer, {
          contentType: 'audio/mpeg',
        });

      const { data: { publicUrl: audioUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(audioFileName);

      // Save summary
      await supabase
        .from('summaries')
        .insert({
          document_id: document.id,
          tldr: summaryData.tldr,
          key_concepts: summaryData.key_concepts,
          definitions: summaryData.definitions,
          bullet_summary: summaryData.bullet_summary,
          audio_url: audioUrl,
        });

      // Save quiz (quizData is already the questions array from generateQuiz)
      const { error: quizError } = await supabase
        .from('quizzes')
        .insert({
          document_id: document.id,
          questions: quizData,
        });
      
      if (quizError) {
        console.error(`[Document ${document.id}] Quiz insert error:`, quizError);
      } else {
        console.log(`[Document ${document.id}] Quiz saved successfully`);
      }

      // Generate and save flashcards
      const flashcardsData = await generateFlashcards(
        text, 
        summaryData.definitions || [], 
        summaryData.key_concepts || []
      );
      console.log(`[Document ${document.id}] Flashcards generated: ${flashcardsData.length} cards`);

      // Insert flashcards
      if (flashcardsData.length > 0) {
        const { error: flashcardsError } = await supabase
          .from('flashcards')
          .insert(
            flashcardsData.map((card: { front: string; back: string }) => ({
              document_id: document.id,
              user_id: user.id,
              front: card.front,
              back: card.back,
              mastery_level: 0,
            }))
          );
        
        if (flashcardsError) {
          console.error(`[Document ${document.id}] Flashcards insert error:`, flashcardsError);
        } else {
          console.log(`[Document ${document.id}] Flashcards saved successfully`);
        }
      }

      // Update document status
      await supabase
        .from('documents')
        .update({ status: 'completed' })
        .eq('id', document.id);

      return NextResponse.json({
        success: true,
        documentId: document.id,
        message: 'Document processed successfully',
      });

    } catch (processingError) {
      console.error('Processing error:', processingError);
      
      // Update document status to failed
      await supabase
        .from('documents')
        .update({ status: 'failed' })
        .eq('id', document.id);

      return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

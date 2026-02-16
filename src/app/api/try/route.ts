import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF, formatTextForSummary } from '@/lib/pdf';
import { generateSummary, generateQuiz } from '@/lib/openai';
import { extractWebPageContent, isPdfUrl, getPageNameFromUrl } from '@/lib/scraper';

// Rate limiting: track IPs in memory (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3; // 3 attempts per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Fetch PDF from URL
async function fetchPdfFromUrl(url: string): Promise<{ buffer: Buffer; fileName: string }> {
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
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (contentLength && parseInt(contentLength) > maxSize) {
    throw new Error('PDF file is too large. Maximum size is 5MB for free trial.');
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length > maxSize) {
    throw new Error('PDF file is too large. Maximum size is 5MB for free trial.');
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

  return { buffer, fileName };
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please create an account for more uploads.' },
        { status: 429 }
      );
    }

    let buffer: Buffer | null = null;
    let text: string = '';
    let fileName: string = 'Document';
    let sourceType: 'pdf' | 'webpage' = 'pdf';

    // Check if this is a URL submission or file upload
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // URL submission (PDF or web page)
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

      // Check if it's a PDF or a web page
      if (isPdfUrl(url)) {
        // Handle PDF URL
        try {
          const result = await fetchPdfFromUrl(url);
          buffer = result.buffer;
          fileName = result.fileName;
          sourceType = 'pdf';
        } catch (err) {
          return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Failed to fetch PDF from URL' },
            { status: 400 }
          );
        }
      } else {
        // Handle web page URL
        try {
          const pageContent = await extractWebPageContent(url);
          text = pageContent.content;
          fileName = pageContent.title || getPageNameFromUrl(url);
          sourceType = 'webpage';
          
          if (!text || text.length < 100) {
            return NextResponse.json(
              { error: 'Could not extract enough content from this page. Try a different URL.' },
              { status: 400 }
            );
          }
        } catch (err) {
          return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Failed to fetch content from URL' },
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

      // Smaller limit for guests (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File size must be less than 5MB. Create an account for 10MB uploads.' },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      fileName = file.name.replace('.pdf', '');
      sourceType = 'pdf';
    }

    // Extract text from PDF if we have a buffer (PDF source)
    if (buffer && sourceType === 'pdf') {
      const rawText = await extractTextFromPDF(buffer);
      text = formatTextForSummary(rawText);

      if (!text || text.length < 100) {
        return NextResponse.json(
          { error: 'Could not extract enough text from the PDF. Please try a different file.' },
          { status: 400 }
        );
      }
    }

    // At this point, text should be populated from either PDF or web page
    if (!text || text.length < 100) {
      return NextResponse.json(
        { error: 'Could not extract enough content. Please try a different source.' },
        { status: 400 }
      );
    }

    // Generate summary
    const summaryData = await generateSummary(text);

    // Generate quiz
    const quizData = await generateQuiz(text, summaryData.tldr);

    // Return the study pack data (no database storage for guests)
    return NextResponse.json({
      success: true,
      fileName,
      sourceType,
      summary: summaryData,
      quiz: quizData,
      // Note: Audio is not generated for guests to save costs
      message: 'Create an account to save this study pack and unlock audio playback!',
    });

  } catch (error) {
    console.error('Guest trial error:', error);
    return NextResponse.json(
      { error: 'Failed to process content. Please try again.' },
      { status: 500 }
    );
  }
}

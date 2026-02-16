import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export interface WebPageContent {
  title: string;
  content: string;
  url: string;
  siteName?: string;
}

/**
 * Fetches and extracts the main content from a web page
 */
export async function extractWebPageContent(url: string): Promise<WebPageContent> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Cognify/1.0; +https://cognify.app)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
    throw new Error('URL does not point to a web page');
  }

  const html = await response.text();
  
  // Parse HTML with JSDOM
  const dom = new JSDOM(html, { url });
  const document = dom.window.document;

  // Use Readability to extract main content
  const reader = new Readability(document);
  const article = reader.parse();

  if (!article || !article.textContent) {
    // Fallback: try to get content manually
    const fallbackContent = extractFallbackContent(document);
    if (!fallbackContent) {
      throw new Error('Could not extract content from this page');
    }
    return {
      title: document.title || 'Untitled',
      content: fallbackContent,
      url,
    };
  }

  return {
    title: article.title || document.title || 'Untitled',
    content: cleanText(article.textContent),
    url,
    siteName: article.siteName || undefined,
  };
}

/**
 * Fallback content extraction when Readability fails
 */
function extractFallbackContent(document: Document): string | null {
  // Try common content containers
  const selectors = [
    'article',
    'main',
    '[role="main"]',
    '.post-content',
    '.article-content',
    '.entry-content',
    '.content',
    '#content',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent) {
      const text = cleanText(element.textContent);
      if (text.length > 200) {
        return text;
      }
    }
  }

  // Last resort: get body text
  const body = document.body;
  if (body) {
    // Remove script, style, nav, footer, header elements
    const clone = body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('script, style, nav, footer, header, aside, .sidebar, .nav, .menu').forEach(el => el.remove());
    const text = cleanText(clone.textContent || '');
    if (text.length > 200) {
      return text;
    }
  }

  return null;
}

/**
 * Clean extracted text
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')           // Collapse whitespace
    .replace(/\n{3,}/g, '\n\n')     // Max 2 newlines
    .trim();
}

/**
 * Check if a URL is likely a PDF
 */
export function isPdfUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.pdf') || lowerUrl.includes('.pdf?');
}

/**
 * Get a friendly name from a URL
 */
export function getPageNameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace('www.', '');
    const pathname = parsed.pathname;
    
    // Get last path segment
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1]
        .replace(/[-_]/g, ' ')
        .replace(/\.\w+$/, '') // Remove extension
        .trim();
      
      if (lastSegment.length > 3) {
        return `${lastSegment} - ${hostname}`;
      }
    }
    
    return hostname;
  } catch {
    return 'Web Page';
  }
}

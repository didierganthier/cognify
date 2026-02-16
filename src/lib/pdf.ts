// PDF text extraction utility
// Note: pdf-parse works on the server side only

type PdfParseResult = {
  text: string;
  numpages: number;
};

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid issues with pdf-parse trying to load test files at module level
  const pdf = await import('pdf-parse/lib/pdf-parse.js');
  const pdfParse = pdf.default || pdf;
  
  const data: PdfParseResult = await pdfParse(buffer);
  
  // Limit text to ~20,000 words for MVP (cost control)
  const words = data.text.split(/\s+/);
  const limitedText = words.slice(0, 20000).join(' ');
  
  return limitedText;
}

export function formatTextForSummary(text: string): string {
  // Clean up extracted text
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}

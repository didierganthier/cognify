'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, X, Loader2, CheckCircle2, Brain, Sparkles, Link as LinkIcon } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for guests (smaller limit)

export default function TryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  }, []);

  const validateAndSetFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB for free trial. Create an account for 10MB uploads.');
      return;
    }

    setFile(file);
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleUpload = async () => {
    // Check if user already used their free trial
    const hasUsedTrial = localStorage.getItem('cognify_trial_used');
    if (hasUsedTrial) {
      setError('You\'ve already used your free trial. Create an account to continue!');
      return;
    }

    // Validate input based on mode
    if (inputMode === 'upload' && !file) {
      setError('Please select a PDF file');
      return;
    }
    if (inputMode === 'url') {
      if (!pdfUrl.trim()) {
        setError('Please enter a PDF URL');
        return;
      }
      if (!validateUrl(pdfUrl)) {
        setError('Please enter a valid URL');
        return;
      }
    }

    setIsUploading(true);
    setError(null);

    try {
      let body: FormData | string;
      let headers: HeadersInit = {};

      if (inputMode === 'upload' && file) {
        const formData = new FormData();
        formData.append('file', file);
        body = formData;
      } else {
        body = JSON.stringify({ url: pdfUrl });
        headers = { 'Content-Type': 'application/json' };
      }

      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      setProcessingStatus(inputMode === 'url' ? 'Fetching PDF from URL...' : 'Uploading file...');

      const response = await fetch('/api/try', {
        method: 'POST',
        headers,
        body,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress(100);
      setProcessingStatus('Processing complete!');

      const data = await response.json();

      // Store study pack in localStorage
      const fileName = inputMode === 'upload' && file ? file.name : data.fileName || 'PDF Document';
      localStorage.setItem('cognify_trial_data', JSON.stringify({
        fileName,
        summary: data.summary,
        quiz: data.quiz,
        createdAt: new Date().toISOString(),
      }));
      localStorage.setItem('cognify_trial_used', 'true');

      // Redirect to preview page
      setTimeout(() => {
        router.push('/try/preview');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Cognify</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Create account</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Free Trial - No account needed</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Try Cognify Free</h1>
            <p className="text-muted-foreground">
              Upload a PDF or paste any web page URL. No signup required.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isUploading ? (
            <>
              {/* Upload Zone with Tabs */}
              <Card>
                <CardContent className="p-6">
                  <Tabs defaultValue="upload" onValueChange={(v) => setInputMode(v as 'upload' | 'url')}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload File
                      </TabsTrigger>
                      <TabsTrigger value="url" className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        Paste URL
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload">
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                          border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer
                          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                          ${file ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}
                        `}
                      >
                        {file ? (
                          <div className="flex items-center justify-center space-x-4">
                            <FileText className="h-12 w-12 text-green-600" />
                            <div className="text-left">
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile();
                              }}
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-lg font-medium mb-2">
                              Drag and drop your PDF here
                            </p>
                            <p className="text-muted-foreground mb-4">
                              or click to browse
                            </p>
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={handleFileSelect}
                              className="hidden"
                              id="file-upload"
                            />
                            <Button variant="outline" asChild>
                              <label htmlFor="file-upload" className="cursor-pointer">
                                Browse Files
                              </label>
                            </Button>
                            <p className="text-xs text-muted-foreground mt-4">
                              PDF files only, max 5MB
                            </p>
                          </>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="url">
                      <div className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-lg font-medium mb-4">
                            Paste any URL
                          </p>
                          <Input
                            type="url"
                            placeholder="https://example.com/article or .pdf"
                            value={pdfUrl}
                            onChange={(e) => setPdfUrl(e.target.value)}
                            className="max-w-md mx-auto"
                          />
                          <p className="text-xs text-muted-foreground mt-4">
                            Works with articles, blog posts, docs, and PDF links
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Upload Button */}
              {(file || (inputMode === 'url' && pdfUrl.trim())) && (
                <Button onClick={handleUpload} className="w-full" size="lg">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Free Study Pack
                </Button>
              )}
            </>
          ) : (
            /* Processing State */
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  {uploadProgress < 100 ? (
                    <Loader2 className="h-16 w-16 text-primary animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                  )}
                </div>
                <CardTitle>
                  {uploadProgress < 100 ? 'Creating Your Study Pack' : 'All Done!'}
                </CardTitle>
                <CardDescription>{processingStatus}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={uploadProgress} className="h-2" />
                <div className="text-center text-sm text-muted-foreground">
                  {uploadProgress}% complete
                </div>
              </CardContent>
            </Card>
          )}

          {/* What You'll Get */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What you&apos;ll get</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Smart Summary:</strong> TL;DR, key concepts, definitions, and bullet points
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Quiz:</strong> 5 multiple choice questions to test your understanding
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Audio:</strong> Create an account to unlock audio playback
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Account Benefits */}
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Want more?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create a free account to get 3 PDFs/month, audio playback, and save your progress forever.
                  </p>
                  <Link href="/signup">
                    <Button size="sm">Create free account</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

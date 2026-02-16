'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Brain, FileText, BookOpen, HelpCircle, Lock, Check, Sparkles, ArrowRight } from 'lucide-react';

interface SummaryData {
  tldr: string;
  key_concepts: string[];
  definitions: { term: string; definition: string }[];
  bullet_points: string[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface TrialData {
  fileName: string;
  summary: SummaryData;
  quiz: QuizQuestion[];
  createdAt: string;
}

export default function PreviewPage() {
  const [trialData, setTrialData] = useState<TrialData | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem('cognify_trial_data');
    if (!data) {
      router.push('/try');
      return;
    }
    setTrialData(JSON.parse(data));
    
    // Show signup modal after 10 seconds
    const timer = setTimeout(() => {
      setShowSignupModal(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < (trialData?.quiz.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const getScore = () => {
    if (!trialData) return 0;
    return trialData.quiz.reduce((score, question, index) => {
      return score + (selectedAnswers[index] === question.correct_answer ? 1 : 0);
    }, 0);
  };

  if (!trialData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

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
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              <Sparkles className="h-3 w-3 mr-1" />
              Free Preview
            </Badge>
            <Link href="/signup">
              <Button>Save & Create Account</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Document Title */}
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{trialData.fileName}</h1>
              <p className="text-sm text-muted-foreground">
                Preview your study pack • Create an account to save
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="summary" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2 relative">
                <Lock className="h-4 w-4" />
                Audio
                <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground px-1 rounded">PRO</span>
              </TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-6">
              {/* TL;DR */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">TL;DR</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{trialData.summary.tldr}</p>
                </CardContent>
              </Card>

              {/* Key Concepts */}
              {trialData.summary.key_concepts?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Concepts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {trialData.summary.key_concepts.map((concept, index) => (
                        <Badge key={index} variant="secondary">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Definitions */}
              {trialData.summary.definitions?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Definitions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {trialData.summary.definitions.map((def, index) => (
                      <div key={index} className="border-b last:border-0 pb-3 last:pb-0">
                        <dt className="font-medium">{def.term}</dt>
                        <dd className="text-muted-foreground text-sm mt-1">{def.definition}</dd>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Bullet Points */}
              {trialData.summary.bullet_points?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {trialData.summary.bullet_points.map((point, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Quiz Tab */}
            <TabsContent value="quiz">
              {(!trialData.quiz || trialData.quiz.length === 0) ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No quiz available</h3>
                    <p className="text-muted-foreground">
                      We couldn&apos;t generate quiz questions for this document. Try uploading a different PDF.
                    </p>
                  </CardContent>
                </Card>
              ) : !showResults ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Question {currentQuestion + 1} of {trialData.quiz.length}
                      </CardTitle>
                      <Badge variant="outline">
                        {selectedAnswers.filter(a => a !== null).length} / {trialData.quiz.length} answered
                      </Badge>
                    </div>
                    <CardDescription className="text-base mt-2">
                      {trialData.quiz[currentQuestion]?.question}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {trialData.quiz[currentQuestion]?.options?.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          className={`w-full text-left p-4 rounded-lg border transition-colors ${
                            selectedAnswers[currentQuestion] === index
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          {option}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                        disabled={currentQuestion === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={handleNextQuestion}
                        disabled={selectedAnswers[currentQuestion] === null || selectedAnswers[currentQuestion] === undefined}
                      >
                        {currentQuestion === trialData.quiz.length - 1 ? 'See Results' : 'Next'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
                    <CardDescription>
                      You scored {getScore()} out of {trialData.quiz.length}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-center">
                      <div className="text-6xl font-bold text-primary">
                        {Math.round((getScore() / trialData.quiz.length) * 100)}%
                      </div>
                    </div>
                    
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                      <p className="font-medium mb-2">Want to track your progress?</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create a free account to save your quiz results and retake quizzes anytime.
                      </p>
                      <Link href="/signup">
                        <Button>
                          Save Results & Create Account
                        </Button>
                      </Link>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setShowResults(false);
                        setCurrentQuestion(0);
                        setSelectedAnswers([]);
                      }}
                    >
                      Retake Quiz
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Audio Tab (Locked) */}
            <TabsContent value="audio">
              <Card className="border-primary/20">
                <CardContent className="py-12 text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <Badge className="mb-4 bg-primary/10 text-primary border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Signup Feature
                  </Badge>
                  <h3 className="text-xl font-semibold mb-2">Unlock Audio Playback</h3>
                  <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                    Listen to your summaries on the go! Audio playback is available when you create a free account.
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    🎧 Perfect for commutes, workouts, or study sessions
                  </p>
                  <Link href="/signup">
                    <Button size="lg">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Free Account to Unlock
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Signup Modal */}
      <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Save Your Study Pack
            </DialogTitle>
            <DialogDescription>
              Don&apos;t lose your work! Create a free account to:
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-3 py-4">
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>Save this study pack forever</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>Get 2 more free PDFs this month</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>Unlock audio playback</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>Track your quiz progress</span>
            </li>
          </ul>
          <div className="flex flex-col gap-3">
            <Link href="/signup" className="w-full">
              <Button className="w-full">Create Free Account</Button>
            </Link>
            <Button variant="ghost" onClick={() => setShowSignupModal(false)}>
              Continue without saving
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

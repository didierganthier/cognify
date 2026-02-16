'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizTabProps {
  quiz: {
    id: string;
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correct_answer: number;
    }>;
  } | null;
}

export function QuizTab({ quiz }: QuizTabProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Quiz not available yet.
      </div>
    );
  }

  const questions = quiz.questions;
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleSelectAnswer = (answerIndex: number) => {
    if (isAnswered) return;

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setIsAnswered(selectedAnswers[currentQuestion + 1] !== undefined);
    } else {
      setShowResults(true);
      // TODO: Save attempt to database
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setIsAnswered(false);
  };

  const calculateScore = () => {
    return questions.reduce((score, q, index) => {
      return score + (selectedAnswers[index] === q.correct_answer ? 1 : 0);
    }, 0);
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {percentage >= 70 ? (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-yellow-500" />
            )}
          </div>
          <CardTitle className="text-3xl">
            {score} / {questions.length}
          </CardTitle>
          <CardDescription className="text-lg">
            {percentage >= 80 ? 'Excellent work!' : 
             percentage >= 60 ? 'Good job!' : 
             'Keep practicing!'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">{percentage}%</p>
          </div>

          {/* Review answers */}
          <div className="space-y-4 pt-4">
            <h4 className="font-semibold">Review Answers</h4>
            {questions.map((q, index) => (
              <div key={q.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <p className="font-medium">{index + 1}. {q.question}</p>
                  {selectedAnswers[index] === q.correct_answer ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
                <div className="mt-2 text-sm">
                  <p className="text-muted-foreground">
                    Your answer: <span className={selectedAnswers[index] === q.correct_answer ? 'text-green-600' : 'text-red-600'}>
                      {q.options[selectedAnswers[index]]}
                    </span>
                  </p>
                  {selectedAnswers[index] !== q.correct_answer && (
                    <p className="text-green-600">
                      Correct: {q.options[q.correct_answer]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleRestart} className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            Take Quiz Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion] === index;
            const isCorrect = question.correct_answer === index;
            const showCorrect = isAnswered && isCorrect;
            const showIncorrect = isAnswered && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={isAnswered}
                className={cn(
                  'w-full p-4 text-left border rounded-lg transition-all',
                  'hover:border-primary hover:bg-primary/5',
                  isSelected && !isAnswered && 'border-primary bg-primary/10',
                  showCorrect && 'border-green-500 bg-green-50 dark:bg-green-950',
                  showIncorrect && 'border-red-500 bg-red-50 dark:bg-red-950',
                  isAnswered && !isSelected && !isCorrect && 'opacity-50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {showIncorrect && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button 
          onClick={handleNext} 
          disabled={!isAnswered}
        >
          {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
        </Button>
      </div>
    </div>
  );
}

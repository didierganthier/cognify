'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Shuffle,
  Brain,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastery_level: number;
}

interface FlashcardsTabProps {
  documentId: string;
  flashcards: Flashcard[] | null;
}

export function FlashcardsTab({ documentId, flashcards: initialFlashcards }: FlashcardsTabProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<string>>(new Set());
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const supabase = createClient();

  const currentCard = flashcards[currentIndex];
  const progress = flashcards.length > 0 ? (studiedCards.size / flashcards.length) * 100 : 0;
  const masteredCount = knownCards.size;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!studiedCards.has(currentCard?.id)) {
      setStudiedCards(new Set([...studiedCards, currentCard?.id]));
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
    setKnownCards(new Set());
  };

  const handleMarkKnown = async () => {
    if (currentCard) {
      setKnownCards(new Set([...knownCards, currentCard.id]));
      
      // Update mastery in database
      await supabase
        .from('flashcards')
        .update({ 
          mastery_level: Math.min((currentCard.mastery_level || 0) + 1, 5),
          last_reviewed: new Date().toISOString(),
          review_count: (currentCard.mastery_level || 0) + 1
        })
        .eq('id', currentCard.id);
      
      handleNext();
    }
  };

  const handleMarkLearning = async () => {
    if (currentCard) {
      // Reset mastery for cards marked as still learning
      await supabase
        .from('flashcards')
        .update({ 
          mastery_level: 0,
          last_reviewed: new Date().toISOString()
        })
        .eq('id', currentCard.id);
      
      handleNext();
    }
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Brain className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No flashcards yet</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Flashcards will be generated automatically from key concepts and definitions in your document.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold">Flashcard Review</h3>
          <p className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {flashcards.length}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium">{studiedCards.size} studied</div>
            <div className="text-xs text-muted-foreground">{masteredCount} mastered</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleShuffle} title="Shuffle">
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleReset} title="Reset">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-2" />

      {/* Flashcard */}
      <div 
        className="perspective-1000 cursor-pointer"
        onClick={handleFlip}
      >
        <div 
          className={cn(
            "relative w-full min-h-[300px] transition-transform duration-500 transform-style-preserve-3d",
            isFlipped && "rotate-y-180"
          )}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <Card 
            className={cn(
              "absolute inset-0 backface-hidden",
              "flex items-center justify-center p-8"
            )}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <CardContent className="text-center">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                Question
              </Badge>
              <p className="text-xl font-medium">{currentCard?.front}</p>
              <p className="text-sm text-muted-foreground mt-4">Click to reveal answer</p>
            </CardContent>
          </Card>

          {/* Back */}
          <Card 
            className={cn(
              "absolute inset-0",
              "flex items-center justify-center p-8 bg-primary/5 border-primary/20"
            )}
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <CardContent className="text-center">
              <Badge className="mb-4 bg-primary">
                <Check className="h-3 w-3 mr-1" />
                Answer
              </Badge>
              <p className="text-xl font-medium">{currentCard?.back}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {isFlipped && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleMarkLearning}
              className="border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              <X className="h-4 w-4 mr-2" />
              Still Learning
            </Button>
            <Button 
              onClick={handleMarkKnown}
              className="bg-green-500 hover:bg-green-600"
            >
              <Check className="h-4 w-4 mr-2" />
              Got It!
            </Button>
          </div>
        )}

        <Button 
          variant="outline" 
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Completion Message */}
      {studiedCards.size === flashcards.length && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-6 text-center">
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              🎉 Great job! You've reviewed all cards!
            </h3>
            <p className="text-green-600 mb-4">
              You mastered {masteredCount} out of {flashcards.length} cards.
            </p>
            <Button onClick={handleReset} variant="outline">
              Review Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

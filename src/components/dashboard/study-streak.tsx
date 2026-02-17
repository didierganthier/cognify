'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Calendar, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface StudyStreakProps {
  initialStreak?: number;
  longestStreak?: number;
  lastStudyDate?: string | null;
}

export function StudyStreak({ 
  initialStreak = 0, 
  longestStreak = 0,
  lastStudyDate 
}: StudyStreakProps) {
  const [currentStreak, setCurrentStreak] = useState(initialStreak);
  const [showCelebration, setShowCelebration] = useState(false);
  const supabase = createClient();

  // Check if streak is active (studied today or yesterday)
  const isStreakActive = () => {
    if (!lastStudyDate) return false;
    const last = new Date(lastStudyDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  };

  const streakActive = isStreakActive();

  // Update streak when user studies
  const updateStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_study_date, current_streak, longest_streak, total_study_sessions')
      .eq('id', user.id)
      .single();

    if (!profile) return;

    const lastDate = profile.last_study_date;
    let newStreak = profile.current_streak || 0;

    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        // Continuing streak
        newStreak += 1;
        if (newStreak > 1) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 2000);
        }
      } else if (lastDate !== today) {
        // Streak broken, start fresh
        newStreak = 1;
      }

      const newLongest = Math.max(newStreak, profile.longest_streak || 0);

      await supabase
        .from('profiles')
        .update({
          last_study_date: today,
          current_streak: newStreak,
          longest_streak: newLongest,
          total_study_sessions: ((profile.total_study_sessions as number) || 0) + 1
        })
        .eq('id', user.id);

      setCurrentStreak(newStreak);
    }
  };

  // Expose updateStreak globally for other components
  useEffect(() => {
    (window as any).updateStudyStreak = updateStreak;
    return () => {
      delete (window as any).updateStudyStreak;
    };
  }, []);

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all",
      showCelebration && "ring-2 ring-orange-400 ring-offset-2"
    )}>
      {/* Celebration animation */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-red-500/20 animate-pulse" />
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              className="absolute text-2xl animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`
              }}
            >
              🔥
            </span>
          ))}
        </div>
      )}

      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Streak Fire Icon */}
            <div className={cn(
              "relative h-14 w-14 rounded-full flex items-center justify-center",
              streakActive 
                ? "bg-gradient-to-br from-orange-400 to-red-500" 
                : "bg-muted"
            )}>
              <Flame className={cn(
                "h-7 w-7",
                streakActive ? "text-white" : "text-muted-foreground"
              )} />
              {streakActive && currentStreak > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center bg-yellow-400 text-yellow-900"
                >
                  {currentStreak}
                </Badge>
              )}
            </div>

            {/* Streak Info */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {currentStreak > 0 ? (
                  <>
                    {currentStreak} Day Streak!
                    {currentStreak >= 7 && <span className="text-xl">🔥</span>}
                    {currentStreak >= 30 && <span className="text-xl">⭐</span>}
                  </>
                ) : (
                  "Start Your Streak"
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {streakActive 
                  ? "Keep it going! Study today to maintain your streak."
                  : "Complete a quiz or review flashcards to start."}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Trophy className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">{longestStreak}</div>
              <div className="text-xs text-muted-foreground">Best</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Zap className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold">{currentStreak}</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
          </div>
        </div>

        {/* Milestone Progress */}
        {currentStreak > 0 && currentStreak < 7 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Next milestone: 7 day streak</span>
              <span className="font-medium">{currentStreak}/7</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all"
                style={{ width: `${(currentStreak / 7) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

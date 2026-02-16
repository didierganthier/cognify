import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Trophy, Clock, TrendingUp } from 'lucide-react';

interface ResultsTabProps {
  attempts: Array<{
    id: string;
    score: number;
    total_questions: number;
    taken_at: string;
  }>;
}

export function ResultsTab({ attempts }: ResultsTabProps) {
  if (!attempts || attempts.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No quiz attempts yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Take the quiz to see your results here!
          </p>
        </CardContent>
      </Card>
    );
  }

  const bestScore = Math.max(...attempts.map(a => (a.score / a.total_questions) * 100));
  const averageScore = attempts.reduce((sum, a) => sum + (a.score / a.total_questions) * 100, 0) / attempts.length;
  const totalAttempts = attempts.length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(bestScore)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageScore)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttempts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Attempt History */}
      <Card>
        <CardHeader>
          <CardTitle>Attempt History</CardTitle>
          <CardDescription>Your quiz performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attempts.map((attempt, index) => {
              const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
              const isRecent = index === 0;

              return (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      h-12 w-12 rounded-full flex items-center justify-center font-bold
                      ${percentage >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        percentage >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}
                    `}>
                      {percentage}%
                    </div>
                    <div>
                      <p className="font-medium">
                        {attempt.score} / {attempt.total_questions} correct
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(attempt.taken_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isRecent && <Badge>Latest</Badge>}
                    {percentage === bestScore && (
                      <Badge variant="secondary">
                        <Trophy className="h-3 w-3 mr-1" />
                        Best
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

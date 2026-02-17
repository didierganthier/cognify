import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Sparkles,
  ArrowRight,
  Brain,
  Headphones,
  ClipboardCheck
} from 'lucide-react';
import { StudyStreak } from '@/components/dashboard/study-streak';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch profile for streak data
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_streak, longest_streak, last_study_date, subscription_status')
    .eq('id', user?.id)
    .single();

  // Fetch documents count
  const { count: documentsCount } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id);

  // Fetch quiz attempts
  const { data: quizAttempts } = await supabase
    .from('quiz_attempts')
    .select('score, total_questions')
    .eq('user_id', user?.id);

  // Calculate stats
  const completedQuizzes = quizAttempts?.length || 0;
  const averageScore = completedQuizzes > 0 
    ? Math.round(quizAttempts!.reduce((acc, a) => acc + (a.score / a.total_questions) * 100, 0) / completedQuizzes)
    : 0;

  const isPro = profile?.subscription_status === 'active' || profile?.subscription_status === 'lifetime';

  const stats = {
    totalDocuments: documentsCount || 0,
    completedQuizzes,
    averageScore,
    remainingUploads: isPro ? '∞' : Math.max(0, 3 - (documentsCount || 0)),
  };

  // Fetch recent documents
  const { data: recentDocs } = await supabase
    .from('documents')
    .select('id, title, status, created_at')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const recentDocuments = recentDocs || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 
                    user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome back, <span className="text-primary">{firstName}</span>! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your study materials.
          </p>
        </div>
        <Button asChild className="shadow-md w-full sm:w-auto">
          <Link href="/dashboard/upload">
            <Plus className="mr-2 h-4 w-4" />
            Upload PDF
          </Link>
        </Button>
      </div>

      {/* Study Streak */}
      <StudyStreak 
        initialStreak={profile?.current_streak || 0}
        longestStreak={profile?.longest_streak || 0}
        lastStudyDate={profile?.last_study_date}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground mt-1">Study packs created</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <ClipboardCheck className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completedQuizzes}</div>
            <p className="text-xs text-muted-foreground mt-1">Tests taken</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">Overall performance</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isPro ? 'Plan' : 'Free Uploads'}</CardTitle>
            <Badge variant="secondary">{isPro ? 'Pro' : `${stats.remainingUploads}/3`}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{isPro ? '∞' : stats.remainingUploads}</div>
            {!isPro && <Progress value={(Number(stats.remainingUploads) / 3) * 100} className="mt-2 h-1.5" />}
            <p className="text-xs text-muted-foreground mt-2">{isPro ? 'Unlimited uploads' : 'Remaining this month'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions or Empty State */}
      {stats.totalDocuments === 0 ? (
        <Card className="border-dashed border-2 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-16 relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />
            
            <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-primary to-primary/60 flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Create your first study pack</h3>
            <p className="text-muted-foreground text-center mb-8 max-w-md">
              Upload a PDF and our AI will generate summaries, quizzes, and audio — 
              everything you need to master the material.
            </p>
            <Button size="lg" className="shadow-md" asChild>
              <Link href="/dashboard/upload">
                <Plus className="mr-2 h-5 w-5" />
                Upload Your First PDF
              </Link>
            </Button>
            
            {/* Features preview */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span>AI Summaries</span>
              </div>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                <span>Auto Quizzes</span>
              </div>
              <div className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-primary" />
                <span>Audio Mode</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/dashboard/upload" className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                  <Plus className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">Upload PDF</h3>
                  <p className="text-sm text-muted-foreground">Create a new study pack</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/dashboard/documents" className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">My Documents</h3>
                  <p className="text-sm text-muted-foreground">{stats.totalDocuments} study packs</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/dashboard/billing" className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="h-12 w-12 rounded-xl bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">Upgrade to Pro</h3>
                  <p className="text-sm text-muted-foreground">Unlimited uploads</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* Recent Documents */}
      {recentDocuments.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Your recently uploaded study materials</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/documents">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <span className="text-sm capitalize text-muted-foreground">{doc.status}</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/documents/${doc.id}`}>
                        Open
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

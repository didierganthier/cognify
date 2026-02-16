import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { 
  Brain, 
  FileText, 
  Headphones, 
  ClipboardCheck, 
  BarChart3, 
  Upload, 
  Sparkles,
  Zap,
  Check,
  ArrowRight,
  Star,
  BookOpen
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 -z-10" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            AI-Powered Learning Platform
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
            Turn PDFs &amp; web pages into
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 block mt-2">
              interactive study experiences
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload any PDF or paste a web page URL and get instant AI summaries, quizzes, and audio — 
            everything you need to master any material, fast.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button size="lg" className="text-lg px-8 h-14 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all" asChild>
              <Link href="/signup">
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 h-14 hover:bg-primary/5 transition-all" asChild>
              <Link href="/try">
                <Zap className="mr-2 h-5 w-5 text-primary" />
                Try Without Signup
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            No credit card required • PDFs &amp; web pages supported
          </p>
          
          {/* Social proof */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span>1,000+ students</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-1">4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>50,000+ documents processed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to study smarter
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI analyzes your documents and creates comprehensive study materials automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: 'Smart Summaries',
                description: 'Get TL;DR, key concepts, definitions, and bullet summaries instantly.',
                gradient: 'from-violet-500 to-purple-500'
              },
              {
                icon: ClipboardCheck,
                title: 'Auto Quizzes',
                description: 'Test your knowledge with AI-generated multiple choice questions.',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Headphones,
                title: 'Audio Mode',
                description: 'Listen to your summaries on the go with natural text-to-speech.',
                gradient: 'from-orange-500 to-amber-500'
              },
              {
                icon: BarChart3,
                title: 'Progress Tracking',
                description: 'Track quiz scores and study progress to see your improvement.',
                gradient: 'from-green-500 to-emerald-500'
              }
            ].map((feature) => (
              <Card key={feature.title} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <CardHeader>
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Three steps to smarter studying
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform any PDF into a complete study pack in seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line - spans between all step circles */}
            <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-primary via-primary to-primary" />
            
            {[
              {
                step: 1,
                icon: Upload,
                title: 'Add your content',
                description: 'Upload a PDF or paste any web page URL. Articles, docs, textbooks, research papers — anything.'
              },
              {
                step: 2,
                icon: Zap,
                title: 'AI processes it',
                description: 'Our AI extracts key information, creates summaries, generates quizzes, and produces audio.'
              },
              {
                step: 3,
                icon: FileText,
                title: 'Start learning',
                description: 'Read summaries, take quizzes, listen to audio — all in one place. Track your progress.'
              }
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-primary/25 relative z-10">
                  {item.step}
                </div>
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free. Upgrade when you need more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-8">
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for trying out Cognify</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {[
                    '3 PDFs per month',
                    '5 quiz questions per document',
                    'Basic summaries',
                    'Audio playback',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-8" variant="outline" size="lg" asChild>
                  <Link href="/signup">Get Started Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-primary relative shadow-xl shadow-primary/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary px-4 py-1 text-sm shadow-lg">Most Popular</Badge>
              </div>
              <CardHeader className="pb-8">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>For serious learners</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold">$9</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {[
                    'Unlimited PDFs',
                    '20 quiz questions per document',
                    'Advanced summaries',
                    'Audio export',
                    'Flashcards (coming soon)',
                    'Priority support',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center mr-3">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-8 shadow-lg shadow-primary/25" size="lg" asChild>
                  <Link href="/signup?plan=pro">Upgrade to Pro</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by students everywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Cognify saved me hours of study time. The AI summaries are incredibly accurate and the quizzes helped me ace my exams.",
                author: "Sarah M.",
                role: "Medical Student",
                avatar: "S"
              },
              {
                quote: "I use this for every lecture. Upload the PDF, get a summary, take the quiz - it's become essential to my workflow.",
                author: "James K.",
                role: "Law Student",
                avatar: "J"
              },
              {
                quote: "The audio feature is a game-changer. I listen to my study materials during my commute and it's boosted my retention.",
                author: "Emily R.",
                role: "MBA Student",
                avatar: "E"
              }
            ].map((testimonial, i) => (
              <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-medium">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5 -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to study smarter?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of students who are already learning faster with Cognify.
          </p>
          <Button size="lg" className="text-lg px-10 h-14 shadow-lg shadow-primary/25" asChild>
            <Link href="/signup">
              Start Learning Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Free forever • No credit card required
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

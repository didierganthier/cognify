export const siteConfig = {
  name: 'Cognify',
  description: 'Turn your PDFs into interactive study experiences.',
  tagline: 'Study smarter, not harder.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  features: [
    {
      title: 'Smart Summaries',
      description: 'AI-powered summaries with key concepts, definitions, and bullet points.',
      icon: 'brain',
    },
    {
      title: 'Interactive Quizzes',
      description: 'Auto-generated quizzes to test your understanding and track progress.',
      icon: 'clipboard-check',
    },
    {
      title: 'Audio Mode',
      description: 'Listen to your summaries on the go with text-to-speech.',
      icon: 'headphones',
    },
    {
      title: 'Progress Tracking',
      description: 'Track your quiz scores and study progress over time.',
      icon: 'chart-bar',
    },
  ],

  pricing: {
    free: {
      name: 'Free',
      price: 0,
      features: [
        '3 PDFs per month',
        '5 quiz questions per document',
        'Basic summaries',
        'Audio playback',
      ],
    },
    pro: {
      name: 'Pro',
      price: 9,
      features: [
        'Unlimited PDFs',
        '20 quiz questions per document',
        'Advanced summaries',
        'Audio export',
        'Flashcards (coming soon)',
        'Priority support',
      ],
    },
  },

  limits: {
    free: {
      pdfsPerMonth: 3,
      quizQuestions: 5,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    },
    pro: {
      pdfsPerMonth: Infinity,
      quizQuestions: 20,
      maxFileSize: 25 * 1024 * 1024, // 25MB
    },
  },
};

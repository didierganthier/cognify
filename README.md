# Cognify 🧠

> Turn your PDFs into interactive study experiences.

Cognify is a web platform that transforms any PDF document into a comprehensive study pack with AI-powered summaries, quizzes, and audio narration.

## Features

- 📄 **PDF Upload** - Upload any document up to 10MB
- 🧠 **Smart Summaries** - AI-generated TL;DR, key concepts, definitions, and bullet points
- ❓ **Auto Quizzes** - Multiple choice questions to test your understanding
- 🎧 **Audio Mode** - Listen to summaries with adjustable playback speed
- 📊 **Progress Tracking** - Track quiz scores and study progress

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini, TTS
- **Auth**: Supabase Auth
- **Payments**: Stripe (coming soon)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cognify.git
cd cognify
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

5. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL in `supabase/schema.sql` in the SQL editor
   - Create storage buckets: `documents` and `audio`
   - Enable the buckets for public access (or configure signed URLs)

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── page.tsx           # Landing page
├── components/
│   ├── layout/            # Layout components (navbar, sidebar, etc.)
│   ├── study-pack/        # Study pack components (tabs, quiz, audio)
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase/          # Supabase client utilities
│   ├── openai.ts          # OpenAI integration
│   ├── pdf.ts             # PDF processing utilities
│   └── config.ts          # App configuration
└── types/                 # TypeScript types
```

## Pricing

- **Free**: 3 PDFs/month, 5 quiz questions
- **Pro ($9/month)**: Unlimited PDFs, 20 quiz questions, audio export

## Roadmap

- [ ] Flashcards
- [ ] True/False questions
- [ ] Short answer questions
- [ ] PDF annotation
- [ ] Study groups
- [ ] Mobile app

## License

MIT

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

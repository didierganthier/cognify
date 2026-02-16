import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cognify-swart.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cognify - Turn PDFs into Interactive Study Experiences",
    template: "%s | Cognify",
  },
  description: "Upload any PDF or web page and get instant AI summaries, quizzes, and audio — everything you need to master any material, fast.",
  keywords: [
    "study",
    "learning",
    "AI",
    "PDF",
    "quiz",
    "summary",
    "education",
    "flashcards",
    "audio learning",
    "AI tutor",
    "document analysis",
    "study guide",
    "exam prep",
  ],
  authors: [{ name: "Cognify" }],
  creator: "Cognify",
  publisher: "Cognify",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Cognify",
    title: "Cognify - Turn PDFs into Interactive Study Experiences",
    description: "Upload any PDF or web page and get instant AI summaries, quizzes, and audio — everything you need to master any material, fast.",
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Cognify - AI-Powered Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cognify - Turn PDFs into Interactive Study Experiences",
    description: "Upload any PDF or web page and get instant AI summaries, quizzes, and audio — master any material, fast.",
    images: [`${siteUrl}/twitter-image`],
    creator: "@cognifyapp",
  },
  category: "Education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

import './globals.css';
import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { AmbientStars } from '@/components/ambient-stars';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://subrat-kumar-sahoo.vercel.app'),
  title: 'Subrat Kumar Sahoo | AI & ML Engineer | Full-Stack Developer',
  description:
    'Personal portfolio of Subrat Kumar Sahoo — AI & Machine Learning Engineer and Full-Stack Developer specializing in autonomous AI agents, computer vision, data science, and high-performance web systems.',
  keywords: [
    'Subrat Kumar Sahoo',
    'AI Engineer',
    'Machine Learning',
    'Full-Stack Developer',
    'LearnVaultX',
    'ExamSentinelX AI',
    'Computer Vision',
    'Python',
    'Next.js',
    'Data Science',
  ],
  authors: [{ name: 'Subrat Kumar Sahoo' }],
  creator: 'Subrat Kumar Sahoo',
  openGraph: {
    title: 'Subrat Kumar Sahoo | AI & ML Engineer | Full-Stack Developer',
    description:
      'Personal portfolio of Subrat Kumar Sahoo — AI & Machine Learning Engineer and Full-Stack Developer specializing in autonomous agents, computer vision, and modern web applications.',
    images: [
      {
        url: '/images/profile.jpg',
        width: 800,
        height: 800,
        alt: 'Subrat Kumar Sahoo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Subrat Kumar Sahoo | AI & ML Engineer | Full-Stack Developer',
    description:
      'Explore projects, skills, and research in AI, Computer Vision, and Full-Stack development by Subrat Kumar Sahoo.',
    images: ['/images/profile.jpg'],
  },
  icons: {
    icon: '/images/profile.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${sansFont.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/images/profile.jpg" />
      </head>
      <body className="bg-charcoal text-foreground min-h-screen relative overflow-x-hidden selection:bg-crimson/30 selection:text-cream">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {/* Site-wide persistent background star particles and ambient glow */}
          <AmbientStars />

          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

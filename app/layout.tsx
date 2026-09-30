import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Folio Motion - Interactive Developer Portfolio',
  description: 'Folio Motion is a dynamic and visually engaging developer portfolio designed to showcase the skills, projects, and experiences of a modern developer. With a focus on cutting-edge web technologies such as Next.js, React, and Tailwind CSS, this portfolio highlights a deep understanding of both front-end and back-end development. It incorporates interactive animations, smooth transitions, and responsive design, offering visitors an immersive experience. Explore a collection of projects demonstrating expertise in UI/UX design, full-stack development, and more, alongside professional roles, certifications, and contributions to open-source communities.',
  icons: {
    icon: 'https://tinyurl.com/2xhrkaao', // Link to your favicon
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://tinyurl.com/2xhrkaao" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen">
            <Navbar />
            <main>{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

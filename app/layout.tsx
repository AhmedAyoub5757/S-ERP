import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { WebsitePreloader } from "@/components/website-preloader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Greenwood School — Management ERP",
  description:
    "A modern editorial School Management System supporting multiple user roles with calm, purposeful administrative, academic, and financial workflows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased font-sans"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-primary/15 selection:text-primary">
        <ThemeProvider>
          <WebsitePreloader />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { validateAlgoliaEnv, logEnvStatus } from "@/lib/utils/env-validation";

// Validate environment variables on startup
if (process.env.NODE_ENV === 'development') {
  const algoliaValidation = validateAlgoliaEnv();
  if (!algoliaValidation.isValid) {
    logEnvStatus('⚠️  Environment Validation Warning');
    console.warn('Algolia environment variables are missing. Search functionality will be limited.');
    console.warn('Missing variables:', algoliaValidation.missingVars.join(', '));
  } else {
    console.log('✅ Algolia environment variables validated successfully');
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LegalHub - Find the Right Lawyer Near You",
  description: "Connect with qualified attorneys in your area. Search by practice area, location, and get matched with the right legal professional for your needs.",
  keywords: "attorney, lawyer, legal, directory, find lawyer, legal services",
  authors: [{ name: "LegalHub" }],
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "LegalHub - Find the Right Lawyer Near You",
    description: "Connect with qualified attorneys in your area. Search by practice area, location, and get matched with the right legal professional for your needs.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}

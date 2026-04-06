import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { CookieBanner } from '@/components/cookie-banner';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediHost™ AI — Your Clinic's Digital Identity",
  description: "AI-powered website, custom domain, appointments, billing, EMR, and marketing — all in one platform for clinics, labs, pharmacies, and every medical practice.",
  icons: {
    icon: "/medihost-favicon.svg",
  },
  metadataBase: new URL('https://medihost.in'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://medihost.in',
    siteName: 'MediHost AI',
    title: "MediHost™ AI — Your Clinic's Digital Identity",
    description: "Get your clinic online in 60 seconds. AI-powered website, custom domain, appointments, billing, EMR & marketing — all in one platform.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MediHost AI — Clinic Software Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "MediHost™ AI — Your Clinic's Digital Identity",
    description: "Get your clinic online in 60 seconds. AI website, domain, appointments, billing & more.",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

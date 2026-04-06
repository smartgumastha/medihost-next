import { LandingPage } from '@/components/landing/landing-page';

export const metadata = {
  title: 'MediHost — Your Clinic\'s Digital Identity | AI-Powered Website, Domain & Clinic Software',
  description: 'Get your clinic online in 60 seconds. AI-powered website, custom domain, appointments, billing, EMR, Google Business — all in one platform. Start free.',
  openGraph: {
    title: 'MediHost AI™ — Get Your Clinic Online in 60 Seconds',
    description: 'AI-powered website, custom domain, appointments, billing, EMR, Google Business — all in one platform. Start free.',
    url: 'https://medihost.in',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function Home() {
  return <LandingPage />;
}

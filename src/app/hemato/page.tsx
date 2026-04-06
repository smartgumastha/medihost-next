import { HematoLanding } from '@/components/hemato/landing';

export const metadata = {
  title: 'Hemato — Book Lab Tests at Home | Compare Labs Near You',
  description: 'Book lab tests from NABL-certified labs near you. Compare prices. Home sample collection. Reports on WhatsApp.',
  openGraph: {
    title: 'Hemato — Book Lab Tests at Home | Compare Labs Near You',
    description: 'NABL-certified labs near you. Compare prices. Home sample collection. Reports on WhatsApp.',
    url: 'https://hemato.in',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function HematoPage() {
  return <HematoLanding />;
}

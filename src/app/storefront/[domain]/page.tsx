import { Metadata } from 'next';
import { StorefrontPage } from '@/components/storefront/storefront-page';
import { getClinicData } from '@/lib/storefront';
import { buildMedicalBusinessSchema } from '@/lib/schema-org';

function buildOrigin(domain: string): string {
  return domain.includes('.') ? `https://${domain}` : `https://${domain}.medihost.in`;
}

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
  const { domain } = await params;
  const clinic = await getClinicData(domain);
  const origin = buildOrigin(domain);

  if (!clinic) {
    return {
      title: 'Clinic',
      description: '',
      robots: { index: false, follow: false },
    };
  }

  const name = clinic.business_name || 'Clinic';
  const title = clinic.website_meta_title || `${name} | MHAI`;
  const description =
    clinic.website_meta_description ||
    clinic.website_content?.about ||
    `${name} — book appointments, view services, contact info.`;
  const logo = clinic.website_logo_url;

  return {
    title,
    description,
    metadataBase: new URL(origin),
    alternates: { canonical: origin },
    openGraph: {
      title,
      description,
      url: origin,
      siteName: name,
      images: logo ? [{ url: logo }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: logo ? [logo] : [],
    },
    robots: { index: true, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const clinic = await getClinicData(domain);

  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <p className="text-gray-500 mb-4">This clinic website is not available yet.</p>
          <a href="https://medihost.in" className="text-emerald-600 font-semibold hover:underline">
            Visit MediHost
          </a>
        </div>
      </div>
    );
  }

  const origin = buildOrigin(domain);
  const schema = buildMedicalBusinessSchema(clinic, domain, origin);

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <StorefrontPage clinic={clinic} domain={domain} />
    </>
  );
}

import { Metadata } from 'next';
import { StorefrontPage } from '@/components/storefront/storefront-page';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

async function getClinicData(domain: string) {
  try {
    const res = await fetch(`${API_BASE}/api/storefront/site?domain=${domain}.medihost.in`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.site || data.data?.site || data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
  const { domain } = await params;
  const clinic = await getClinicData(domain);
  return {
    title: clinic?.website_meta_title || clinic?.business_name || 'Clinic',
    description: clinic?.website_meta_description || clinic?.website_content?.about || '',
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

  return <StorefrontPage clinic={clinic} domain={domain} />;
}

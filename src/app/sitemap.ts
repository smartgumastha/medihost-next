import type { MetadataRoute } from 'next';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export const revalidate = 3600;

interface PublishedClinic {
  domain: string;
  updated_at: string | number;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: 'https://medihost.in', changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://medihost.in/pricing', changeFrequency: 'monthly', priority: 0.7 },
  ];

  try {
    const res = await fetch(`${API_BASE}/api/storefront/published-clinics`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error('[sitemap] published-clinics returned', res.status);
      return staticEntries;
    }
    const data = await res.json();
    const clinics: PublishedClinic[] = data.clinics || data.data?.clinics || (Array.isArray(data) ? data : []);
    const clinicEntries: MetadataRoute.Sitemap = clinics.map((c) => ({
      url: `https://${c.domain}.medihost.in`,
      lastModified: new Date(c.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
    return [...staticEntries, ...clinicEntries];
  } catch (err) {
    console.error('[sitemap] failed to fetch published-clinics:', err);
    return staticEntries;
  }
}

import { cache } from 'react';

const API_BASE = process.env.API_URL || 'https://smartgumastha-backend-production.up.railway.app';

export interface ClinicData {
  id: number;
  business_name: string;
  owner_name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  latitude: string;
  longitude: string;
  website_theme: string;
  website_logo_url: string;
  website_meta_title?: string;
  website_meta_description?: string;
  website_content: {
    tagline: string;
    about: string;
    features: string[];
    stats: Record<string, string>;
    contact: { address: string };
  };
}

export const getClinicData = cache(async (domain: string): Promise<ClinicData | null> => {
  try {
    const res = await fetch(`${API_BASE}/api/storefront/site?domain=${domain}.medihost.in`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.site || data.data?.site || data) as ClinicData;
  } catch {
    return null;
  }
});

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/reseller', '/api', '/_next'],
      },
    ],
    sitemap: 'https://medihost.in/sitemap.xml',
    host: 'https://medihost.in',
  };
}

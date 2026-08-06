import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/profile/',
          '/api/',
          '/coming-soon',
          '/_next/',
        ],
      },
      {
        // Googlebot gets full access to public pages
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/profile/',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://campusiyo.in/sitemap.xml',
    host: 'https://campusiyo.in',
  };
}

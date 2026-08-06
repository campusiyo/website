import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Campusiyo',
    short_name: 'Campusiyo',
    description:
      'One place for high-quality handwritten notes, previous year papers, study resources and academic materials for college students.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#13151C',
    theme_color: '#00A16C',
    lang: 'en',
    scope: '/',
    categories: ['education', 'productivity'],
    icons: [
      {
        src: '/favicon-16x16.ico',
        sizes: '16x16',
        type: 'image/x-icon',
      },
      {
        src: '/favicon-32x32.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}

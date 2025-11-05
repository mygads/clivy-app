import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Genfity - Digital Solutions & Software House',
    short_name: 'Genfity',
    description: 'Leading software house and digital marketing agency providing website development, mobile apps, WhatsApp API, SEO, and digital transformation services.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4F46E5',
    icons: [
      {
        src: '/web-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      }
    ],
    categories: ['business', 'productivity', 'technology'],
    lang: 'en',
    dir: 'ltr',
    orientation: 'portrait-primary',
    scope: '/',
  }
}
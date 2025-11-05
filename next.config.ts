import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// Explicitly point to the next-intl request config so it's traced into standalone builds
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Hybrid SSG + SSR - Static pages where possible, dynamic where needed
  // Static pages: homepage, about, services, blog
  // Dynamic pages: dashboard, payment, auth
  
  // Do not fail builds on ESLint or TypeScript errors in prod servers that omit devDeps
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  
  // Experimental features for optimization
  experimental: {
    optimizePackageImports: ['@/lib/fonts'],
    webVitalsAttribution: ['CLS', 'LCP'],
    optimizeServerReact: true,
    optimizeCss: true,
    cssChunking: 'strict',
  },
  
  // Performance optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Compression
  compress: true,
  
  // Allow cross-origin requests from production domain to dev server
  allowedDevOrigins: [
    'genfity.ozwaretech.com',
    'https://genfity.ozwaretech.com',
    'www.genfity.ozwaretech.com',
    'https://www.genfity.ozwaretech.com',
    'genfity.com',
    'https://genfity.com',
    'www.genfity.com',
    'https://www.genfity.com'
  ],
  
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "aceternity.com",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
      {
        protocol: "https",
        hostname: "miro.medium.com",
      },
      {
        protocol: "https",
        hostname: "karthikeyanj.netlify.app",
      },
      {
        protocol: 'https',
        hostname: 'backend.vlinkinfo.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.duitku.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sandbox.duitku.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/product-images/**',
      },
    ],
  },
  
  // External packages for server components
  serverExternalPackages: ['@prisma/client'],
  
  // Security headers for SEO and security
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          // Disable caching in development for better HMR
          ...(isDev ? [{
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }] : [])
        ]
      },
      // Cache static assets for performance
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000'
          }
        ]
      },
      // Cache fonts and assets
      {
        source: '/(.*\\.(?:woff|woff2|eot|ttf|otf)$)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Cache JavaScript and CSS
      {
        source: '/(.*\\.(?:js|css)$)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // No cache for ALL API endpoints (APIs need fresh data)
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ]
      }
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      // Ensure robots.txt is accessible at root
      {
        source: '/robots.txt',
        destination: '/robots.txt',
        permanent: true,
      },
    ];
  },
  
  /* other config options here */
};

export default withNextIntl(nextConfig);

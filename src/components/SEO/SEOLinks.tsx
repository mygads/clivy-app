'use client'

interface SEOLinksProps {
  locale: string
}

export default function SEOLinks({ locale }: SEOLinksProps) {
  return (
    <>
      {/* DNS Prefetch untuk external domains */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      
      {/* Font preloading is handled by Next.js Google Fonts optimization */}
      
      {/* Preload critical images */}
      <link rel="preload" href="/logo.png" as="image" />
      <link rel="preload" href="/web-icon.svg" as="image" />
      
      {/* Alternate language pages */}
      <link rel="alternate" hrefLang="en" href="/en" />
      <link rel="alternate" hrefLang="id" href="/id" />
      <link rel="alternate" hrefLang="x-default" href="/en" />
      
      {/* Apple touch icons */}
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      
      {/* Web app manifest */}
      <link rel="manifest" href={`/${locale}/manifest.webmanifest`} />
    </>
  )
}
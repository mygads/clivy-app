import { Metadata } from 'next';

const baseUrl = 'https://www.clivy.com';

interface GenerateMetadataParams {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  locale?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
  canonicalUrl?: string;
  noindex?: boolean;
}

/**
 * Generate comprehensive metadata for pages
 * Usage: export const metadata = generatePageMetadata({ ... })
 */
export function generatePageMetadata({
  title,
  description,
  keywords = [],
  ogImage = '/og-image.png',
  ogType = 'website',
  locale = 'id',
  publishedTime,
  modifiedTime,
  authors = [],
  section,
  tags = [],
  canonicalUrl,
  noindex = false,
}: GenerateMetadataParams): Metadata {
  const fullTitle = title ? `${title} | CLIVY WhatsApp API Services` : 'CLIVY WhatsApp API Services';
  const localeCode = locale === 'id' ? 'id_ID' : 'en_US';
  const canonical = canonicalUrl || `${baseUrl}/${locale}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: authors.map(name => ({ name })),
    creator: 'Muhammad Yoga Adi Saputra',
    publisher: 'Clivy App',
    robots: {
      index: !noindex,
      follow: !noindex,
      nocache: false,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical,
      languages: {
        'id-ID': `${baseUrl}/id`,
        'en-US': `${baseUrl}/en`,
      },
    },
    openGraph: {
      type: ogType,
      locale: localeCode,
      url: canonical,
      title: fullTitle,
      description,
      siteName: 'CLIVY WhatsApp API Services',
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title || 'CLIVY WhatsApp API Services',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`],
      creator: '@clivy',
      site: '@clivy',
    },
  };

  // Add article-specific metadata
  if (ogType === 'article' && (publishedTime || modifiedTime || section || tags.length > 0)) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      section,
      tags,
      authors: authors,
    };
  }

  return metadata;
}

/**
 * Generate metadata for blog posts
 */
export function generateBlogMetadata({
  title,
  description,
  author,
  publishedTime,
  modifiedTime,
  tags = [],
  category,
  locale = 'id',
  slug,
}: {
  title: string;
  description: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  tags?: string[];
  category: string;
  locale?: string;
  slug: string;
}): Metadata {
  return generatePageMetadata({
    title,
    description,
    keywords: tags,
    ogType: 'article',
    locale,
    publishedTime,
    modifiedTime,
    authors: [author],
    section: category,
    tags,
    canonicalUrl: `${baseUrl}/${locale}/blog/${slug}`,
    ogImage: `/api/og?title=${encodeURIComponent(title)}&type=blog`,
  });
}

/**
 * Generate metadata for product/service pages
 */
export function generateProductMetadata({
  title,
  description,
  price,
  currency = 'IDR',
  availability = 'in stock',
  locale = 'id',
  slug,
  images = [],
}: {
  title: string;
  description: string;
  price?: number;
  currency?: string;
  availability?: string;
  locale?: string;
  slug: string;
  images?: string[];
}): Metadata {
  const metadata = generatePageMetadata({
    title,
    description,
    ogType: 'website',
    locale,
    canonicalUrl: `${baseUrl}/${locale}/products/${slug}`,
    ogImage: images[0] || '/og-image.png',
  });

  // Add product-specific meta tags
  if (price) {
    metadata.other = {
      'product:price:amount': price.toString(),
      'product:price:currency': currency,
      'product:availability': availability,
    };
  }

  return metadata;
}

/**
 * Common keywords for different page types
 */
export const commonKeywords = {
  id: {
    base: [
      'clivy',
      'software house',
      'digital agency',
      'indonesia',
      'bandung',
      'jakarta',
    ],
    web: [
      'website development',
      'pembuatan website',
      'web design',
      'responsive website',
      'website profesional',
    ],
    mobile: [
      'aplikasi mobile',
      'mobile app development',
      'ios app',
      'android app',
      'aplikasi android',
      'aplikasi ios',
    ],
    whatsapp: [
      'whatsapp api',
      'whatsapp business',
      'whatsapp bot',
      'whatsapp automation',
      'customer service whatsapp',
    ],
    marketing: [
      'digital marketing',
      'seo',
      'social media marketing',
      'content marketing',
      'google ads',
      'facebook ads',
    ],
  },
  en: {
    base: [
      'clivy',
      'software house',
      'digital agency',
      'australia',
      'indonesia',
    ],
    web: [
      'website development',
      'web design',
      'responsive website',
      'professional website',
      'custom website',
    ],
    mobile: [
      'mobile app development',
      'ios app development',
      'android app development',
      'cross-platform app',
      'native app',
    ],
    whatsapp: [
      'whatsapp api',
      'whatsapp business api',
      'whatsapp bot',
      'whatsapp automation',
      'whatsapp customer service',
    ],
    marketing: [
      'digital marketing',
      'seo services',
      'social media marketing',
      'content marketing',
      'online advertising',
    ],
  },
};

/**
 * Get keywords for a specific page type
 */
export function getKeywords(
  type: keyof typeof commonKeywords.id,
  locale: 'id' | 'en' = 'id',
  additional: string[] = []
): string[] {
  const base = commonKeywords[locale].base;
  const specific = commonKeywords[locale][type];
  return [...base, ...specific, ...additional];
}

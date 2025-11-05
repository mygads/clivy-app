# SEO Metadata Implementation Guide

This guide explains how to use the enhanced SEO metadata features in the GENFITY application using Next.js 15's `generateMetadata` API.

## Table of Contents

1. [Overview](#overview)
2. [Root Layout Metadata](#root-layout-metadata)
3. [Locale Layout Metadata](#locale-layout-metadata)
4. [Structured Data (JSON-LD)](#structured-data-json-ld)
5. [Metadata Utilities](#metadata-utilities)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)

## Overview

The application uses Next.js 15's metadata API with:
- ✅ **Dynamic generateMetadata** for locale-specific content
- ✅ **Structured Data (JSON-LD)** for rich search results
- ✅ **OpenGraph** tags for social media sharing
- ✅ **Twitter Cards** for Twitter sharing
- ✅ **Robots** directives for SEO control
- ✅ **PWA Manifest** for Progressive Web App support
- ✅ **Reusable utilities** for consistent metadata

## Root Layout Metadata

Located in `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://www.genfity.com'),
  title: {
    template: '%s | GENFITY Digital Solutions',
    default: "GENFITY - Digital Solutions & Software House",
  },
  description: "...",
  applicationName: "GENFITY",
  keywords: ["software house", "digital agency", "whatsapp api", ...],
  robots: {
    index: true,
    follow: true,
    googleBot: { ... },
  },
  verification: {
    google: "google-site-verification-code",
  },
  // ... more configurations
};
```

### Key Features:
- **metadataBase**: Base URL for all relative URLs
- **title.template**: Automatic title suffix for all pages
- **robots**: Comprehensive indexing directives
- **verification**: Search engine verification codes
- **manifest**: PWA manifest reference

## Locale Layout Metadata

Located in `src/app/[locale]/layout.tsx`:

```typescript
export const generateMetadata = async ({params}: {params: Promise<{locale: string}>}): Promise<Metadata> => {
  const {locale} = await params;
  // Dynamic metadata based on locale
  return {
    title: { template: `%s | ${baseTitle}` },
    openGraph: {
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      alternateLocale: ['en_US', 'id_ID'],
      images: [{ url: `/api/og?title=...&locale=${locale}` }],
    },
    alternates: {
      languages: { "id": "/id", "en": "/en" },
    },
  };
};
```

### Key Features:
- **Dynamic locale**: Metadata changes based on language
- **Alternate languages**: Proper hreflang tags
- **Dynamic OG images**: Generated via API route
- **i18n support**: Translations from next-intl

## Structured Data (JSON-LD)

Located in `src/components/SEO/StructuredData.tsx`:

The component generates multiple JSON-LD schemas:

1. **Organization Schema** - Company information
2. **Website Schema** - Website metadata with search action
3. **LocalBusiness Schema** - Business location and hours
4. **Service Schema** - Offered services catalog
5. **Breadcrumb Schema** - Navigation breadcrumbs

### Features:
- ✅ Locale-aware (Indonesian/English)
- ✅ Multiple schema types
- ✅ Google-recommended format
- ✅ Rich snippet support

## Metadata Utilities

Located in `src/lib/metadata.ts`:

### 1. Generate Page Metadata

```typescript
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: "About Us",
  description: "Learn more about GENFITY Digital Solutions",
  keywords: ["about", "company", "team"],
  locale: "id",
  ogImage: "/images/about-og.png",
});
```

### 2. Generate Blog Metadata

```typescript
import { generateBlogMetadata } from '@/lib/metadata';

export const metadata = generateBlogMetadata({
  title: "10 Tips for Better SEO",
  description: "Learn how to improve your website's SEO",
  author: "John Doe",
  publishedTime: "2024-01-15T10:00:00Z",
  tags: ["seo", "marketing", "tips"],
  category: "Digital Marketing",
  locale: "id",
  slug: "10-tips-seo",
});
```

### 3. Generate Product Metadata

```typescript
import { generateProductMetadata } from '@/lib/metadata';

export const metadata = generateProductMetadata({
  title: "WhatsApp Business API",
  description: "Professional WhatsApp API integration",
  price: 500000,
  currency: "IDR",
  availability: "in stock",
  locale: "id",
  slug: "whatsapp-api",
  images: ["/products/whatsapp-api.png"],
});
```

### 4. Use Common Keywords

```typescript
import { getKeywords } from '@/lib/metadata';

const keywords = getKeywords('whatsapp', 'id', ['custom', 'keyword']);
// Returns: ['genfity', 'software house', ..., 'whatsapp api', ..., 'custom', 'keyword']
```

## Usage Examples

### Example 1: Static Page with Metadata

```typescript
// src/app/[locale]/about/page.tsx
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: "About Us",
  description: "Learn more about our company and team",
  keywords: ["about", "company", "team"],
  locale: "id",
});

export default function AboutPage() {
  return <div>About content</div>;
}
```

### Example 2: Dynamic Blog Post

```typescript
// src/app/[locale]/blog/[slug]/page.tsx
import { generateBlogMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const post = await fetchBlogPost(slug);
  
  return generateBlogMetadata({
    title: post.title,
    description: post.excerpt,
    author: post.author,
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    tags: post.tags,
    category: post.category,
    locale,
    slug,
  });
}

export default function BlogPost() {
  return <article>...</article>;
}
```

### Example 3: Service/Product Page

```typescript
// src/app/[locale]/services/whatsapp-api/page.tsx
import { generateProductMetadata, getKeywords } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return generateProductMetadata({
    title: "WhatsApp Business API",
    description: "Professional WhatsApp API integration for your business",
    price: 500000,
    locale,
    slug: "whatsapp-api",
  });
}
```

### Example 4: Custom Dynamic OG Image

```typescript
// Use dynamic OG image generation
export const metadata = {
  openGraph: {
    images: [
      {
        url: `/api/og?title=${encodeURIComponent('My Title')}&subtitle=${encodeURIComponent('Subtitle')}`,
        width: 1200,
        height: 630,
      }
    ],
  },
};
```

## Best Practices

### 1. Title Optimization
- ✅ Keep titles under 60 characters
- ✅ Include primary keyword near the beginning
- ✅ Make titles unique for each page
- ✅ Use template for consistent branding

### 2. Description Optimization
- ✅ Keep descriptions between 150-160 characters
- ✅ Include call-to-action
- ✅ Make descriptions unique and compelling
- ✅ Include target keywords naturally

### 3. Keywords
- ✅ Use 5-10 relevant keywords per page
- ✅ Avoid keyword stuffing
- ✅ Focus on long-tail keywords
- ✅ Use locale-specific keywords

### 4. OpenGraph Images
- ✅ Use 1200x630px dimensions
- ✅ Include text overlay for clarity
- ✅ Test on social media platforms
- ✅ Use dynamic generation for scalability

### 5. Structured Data
- ✅ Use appropriate schema types
- ✅ Keep data accurate and up-to-date
- ✅ Test with Google Rich Results Test
- ✅ Include all required properties

### 6. Robots Directives
- ✅ Use `noindex` for duplicate content
- ✅ Use `nofollow` for untrusted links
- ✅ Allow `max-snippet` for better snippets
- ✅ Enable `max-image-preview: large`

### 7. International SEO
- ✅ Use proper hreflang tags
- ✅ Set correct locale codes
- ✅ Translate metadata content
- ✅ Use canonical URLs properly

## Testing Your Metadata

### 1. Google Rich Results Test
Visit: https://search.google.com/test/rich-results
- Test structured data
- Check for errors
- Preview how it appears in search

### 2. Facebook Sharing Debugger
Visit: https://developers.facebook.com/tools/debug/
- Test OpenGraph tags
- Clear cache if needed
- Preview on Facebook

### 3. Twitter Card Validator
Visit: https://cards-dev.twitter.com/validator
- Test Twitter cards
- Check image rendering
- Preview on Twitter

### 4. LinkedIn Post Inspector
Visit: https://www.linkedin.com/post-inspector/
- Test LinkedIn sharing
- Check image and title
- Preview on LinkedIn

### 5. Schema Markup Validator
Visit: https://validator.schema.org/
- Validate JSON-LD syntax
- Check schema types
- Identify errors

## Common Issues and Solutions

### Issue 1: OG Image Not Updating
**Solution**: Clear cache on social media platforms using their debug tools.

### Issue 2: Title Too Long
**Solution**: Use shorter titles or adjust the template in root layout.

### Issue 3: Duplicate Meta Tags
**Solution**: Check that you're not defining metadata in both layout and page.

### Issue 4: Wrong Locale in OG Tags
**Solution**: Ensure `locale` parameter is correctly passed to metadata functions.

### Issue 5: Structured Data Errors
**Solution**: Validate with Google Rich Results Test and fix required fields.

## Performance Considerations

1. **Static Generation**: Use static metadata when possible
2. **Dynamic Generation**: Only use async `generateMetadata` when necessary
3. **Image Optimization**: Optimize OG images for faster loading
4. **Minimal Scripts**: Keep structured data lightweight
5. **Caching**: Enable proper caching for metadata assets

## Additional Resources

- [Next.js Metadata API Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Central](https://developers.google.com/search/docs)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Author**: GENFITY Development Team

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.genfity.com";
  const lastModified = new Date();
  
  // Define supported locales
  const locales = ['en', 'id'];
  
  // Define page routes with their properties (excluding admin and dashboard)
  const routes = [
    // Main pages - highest priority
    { path: '', changeFrequency: 'weekly' as const, priority: 1.0 },
    { path: '/about', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.9 },
    { path: '/products', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/portofolio', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/how-to-order', changeFrequency: 'monthly' as const, priority: 0.8 },
    
    // Services pages - high priority for business
    { path: '/layanan/custom-website', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/layanan/web-app', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/layanan/mobile-development', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/layanan/corporate-system', changeFrequency: 'monthly' as const, priority: 0.8 },
    { path: '/layanan/ui-ux-design', changeFrequency: 'monthly' as const, priority: 0.8 },
        // Documentation pages - high priority for technical users
    { path: '/documentation/whatsapp-api', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/layanan/whatsapp-broadcast', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/layanan/seo-specialist', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/layanan/corporate-branding', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/layanan/tech-support', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/layanan/it-consulting', changeFrequency: 'monthly' as const, priority: 0.7 },
    
    // Information pages
    { path: '/faq', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/customer-service', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/appointment', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/sustainability', changeFrequency: 'monthly' as const, priority: 0.5 },
    
    // Blog and content pages
    { path: '/blog', changeFrequency: 'weekly' as const, priority: 0.7 },
    { path: '/blog-sidebar', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/blog-details', changeFrequency: 'monthly' as const, priority: 0.5 },
    
    // Authentication pages - lower priority
    { path: '/signin', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/signup', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/signin/forgot-password', changeFrequency: 'yearly' as const, priority: 0.2 },
    
    // Transaction pages - for users but lower SEO priority
    { path: '/checkout', changeFrequency: 'monthly' as const, priority: 0.4 },
    
    // Legal pages - important but low change frequency
    { path: '/privacy-policy', changeFrequency: 'yearly' as const, priority: 0.4 },
    { path: '/terms-conditions', changeFrequency: 'yearly' as const, priority: 0.4 },
    { path: '/refund-policy', changeFrequency: 'yearly' as const, priority: 0.4 },
  ];
  
  // Generate sitemap entries for all locales
  const sitemapEntries: MetadataRoute.Sitemap = [];
  
  // Add entries for each route and locale
  routes.forEach(route => {
    locales.forEach(locale => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route.path}`,
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        // Add alternate language versions for better SEO
        alternates: {
          languages: {
            'en': `${baseUrl}/en${route.path}`,
            'id': `${baseUrl}/id${route.path}`,
          }
        }
      });
    });
  });
  
  // Sort by priority (highest first) for better indexing
  return sitemapEntries.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

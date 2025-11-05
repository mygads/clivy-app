'use client';

import { useParams } from 'next/navigation';

export default function StructuredData() {
  const params = useParams();
  const locale = params?.locale as string || 'id';
  const isIndonesian = locale === 'id';
  const baseUrl = "https://www.genfity.com";

  // Organization Schema with enhanced data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    "name": "Genfity Digital Solutions",
    "legalName": "PT. Generation Infinity Indonesia",
    "alternateName": "Genfity",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/logo.png`,
      "width": 512,
      "height": 512,
      "caption": "Genfity Digital Solutions Logo"
    },
    "image": `${baseUrl}/logo.png`,
    "description": isIndonesian
      ? "Software house dan digital agency terpercaya yang menyediakan layanan pengembangan website, aplikasi mobile, WhatsApp API, SEO, dan digital marketing untuk transformasi digital bisnis Anda."
      : "Leading software house and digital marketing agency providing website development, mobile apps, WhatsApp API, SEO, and comprehensive digital solutions for your business transformation.",
    "foundingDate": "2020",
    "founder": {
      "@type": "Person",
      "name": "Genfity Team"
    },
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "value": "10-50"
    },
    "slogan": isIndonesian ? "Solusi Digital untuk Bisnis Anda" : "Digital Solutions for Your Business",
    "sameAs": [
      "https://www.linkedin.com/company/genfity",
      "https://www.instagram.com/genfity.id",
      "https://twitter.com/genfity",
      "https://api.whatsapp.com/send/?phone=6285174314023"
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+62-851-7431-4023",
        "contactType": "customer service",
        "availableLanguage": ["Indonesian", "English"],
        "areaServed": ["ID", "AU"],
        "contactOption": "TollFree"
      },
      {
        "@type": "ContactPoint",
        "telephone": "+62-851-7431-4023",
        "contactType": "sales",
        "availableLanguage": ["Indonesian", "English"],
        "areaServed": ["ID", "AU"]
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ID",
      "addressLocality": "Bandung",
      "addressRegion": "West Java",
      "postalCode": "40229",
      "streetAddress": "Jalan Harvard No. 9, Sulaiman"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -6.992707410919854,
      "longitude": 107.57752436776371
    },
    "areaServed": [
      {
        "@type": "Country",
        "name": "Indonesia"
      },
      {
        "@type": "Country",
        "name": "Australia"
      }
    ]
  };

  // Website Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    "name": "Genfity Digital Solutions",
    "url": baseUrl,
    "description": isIndonesian
      ? "Platform digital terpercaya untuk solusi software house dan digital marketing"
      : "Trusted digital platform for software house and digital marketing solutions",
    "publisher": {
      "@id": `${baseUrl}/#organization`
    },
    "inLanguage": locale === 'id' ? 'id-ID' : 'en-US',
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // LocalBusiness / ProfessionalService Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${baseUrl}/#localbusiness`,
    "name": "Genfity Digital Solutions",
    "image": `${baseUrl}/logo.png`,
    "url": baseUrl,
    "telephone": "+62-851-7431-4023",
    "priceRange": "$",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ID",
      "addressLocality": "Bandung",
      "addressRegion": "West Java",
      "postalCode": "40229",
      "streetAddress": "Jalan Harvard No. 9, Sulaiman"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -6.992707410919854,
      "longitude": 107.57752436776371
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "18:00"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "50"
    }
  };

  // Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": isIndonesian ? "Layanan Digital Genfity" : "Genfity Digital Services",
    "serviceType": isIndonesian
      ? "Pengembangan Software & Digital Marketing"
      : "Software Development & Digital Marketing",
    "provider": {
      "@id": `${baseUrl}/#organization`
    },
    "areaServed": [
      {
        "@type": "Country",
        "name": "Indonesia"
      },
      {
        "@type": "Country",
        "name": "Australia"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": isIndonesian ? "Katalog Layanan Digital" : "Digital Services Catalog",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": isIndonesian ? "Pengembangan Website" : "Website Development",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": isIndonesian
                  ? "Website Profesional & Responsive"
                  : "Professional & Responsive Website",
                "description": isIndonesian
                  ? "Pembuatan website profesional dengan desain modern dan responsive"
                  : "Professional website development with modern and responsive design"
              }
            }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": isIndonesian ? "Aplikasi Mobile" : "Mobile Application",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": isIndonesian
                  ? "Aplikasi iOS & Android"
                  : "iOS & Android Application",
                "description": isIndonesian
                  ? "Pengembangan aplikasi mobile untuk iOS dan Android"
                  : "Mobile app development for iOS and Android"
              }
            }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": "WhatsApp API",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "WhatsApp Business API Integration",
                "description": isIndonesian
                  ? "Integrasi WhatsApp Business API untuk komunikasi bisnis"
                  : "WhatsApp Business API integration for business communication"
              }
            }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": isIndonesian ? "Digital Marketing & SEO" : "Digital Marketing & SEO",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": isIndonesian
                  ? "SEO & Social Media Marketing"
                  : "SEO & Social Media Marketing",
                "description": isIndonesian
                  ? "Layanan SEO dan social media marketing untuk meningkatkan visibilitas online"
                  : "SEO and social media marketing services to boost online visibility"
              }
            }
          ]
        }
      ]
    }
  };

  // Breadcrumb Schema (for home page)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": isIndonesian ? "Beranda" : "Home",
        "item": `${baseUrl}/${locale}`
      }
    ]
  };

  // Combine all schemas
  const allSchemas = [
    organizationSchema,
    websiteSchema,
    localBusinessSchema,
    serviceSchema,
    breadcrumbSchema
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(allSchemas, null, 2)
      }}
    />
  );
}
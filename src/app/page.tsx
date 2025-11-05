import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Genfity - Leading Software House & Digital Marketing Agency",
  description: "Genfity provides professional website development, mobile applications, WhatsApp API, SEO, and digital marketing services at affordable prices. Your trusted partner for business digital transformation in Indonesia and Australia.",
  keywords: "genfity, software house, digital marketing agency, website development, mobile app development, whatsapp api, seo services, web development australia indonesia",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large', 
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://www.genfity.com/",
    languages: {
      "en": "https://www.genfity.com/en",
      "id": "https://www.genfity.com/id",
    },
  },
  openGraph: {
    title: "Genfity - Leading Software House & Digital Marketing Agency",
    description: "Genfity provides professional website development, mobile applications, WhatsApp API, SEO, and digital marketing services at affordable prices.",
    type: 'website',
    url: "https://www.genfity.com/",
    siteName: 'Genfity Digital Solutions',
    locale: 'en_US',
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("Genfity - Leading Software House & Digital Marketing Agency")}&subtitle=${encodeURIComponent("Genfity provides professional website development, mobile applications, WhatsApp API, SEO, and digital marketing services at affordable prices.".slice(0, 100))}&locale=en`,
        width: 1200,
        height: 630,
        alt: "Genfity - Leading Software House & Digital Marketing Agency",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Genfity - Leading Software House & Digital Marketing Agency",
    description: "Genfity provides professional website development, mobile applications, WhatsApp API, SEO, and digital marketing services at affordable prices.",
    images: [`/api/og?title=${encodeURIComponent("Genfity - Leading Software House & Digital Marketing Agency")}&subtitle=${encodeURIComponent("Genfity provides professional website development, mobile applications, WhatsApp API, SEO, and digital marketing services at affordable prices.".slice(0, 100))}&locale=en`],
  },
};

export default function RootPage() {
  // Redirect ke locale default (id)
  redirect('/id');
}
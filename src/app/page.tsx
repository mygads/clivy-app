import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Clivy - Leading Software House & Digital Marketing Agency",
  description: "Clivy provides professional website development, mobile applications, WhatsApp API, SEO, and digital marketing services at affordable prices. Your trusted partner for business digital transformation in Indonesia and Australia.",
  keywords: "clivy, software house, digital marketing agency, website development, mobile app development, whatsapp api, seo services, web development australia indonesia",
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
    canonical: "https://www.clivy.vercel.app/",
    languages: {
      "en": "https://www.clivy.vercel.app/en",
      "id": "https://www.clivy.vercel.app/id",
    },
  },
  openGraph: {
    title: "Clivy - Leading Software House & Digital Marketing Agency",
    description: "Clivy provides professional website development, mobile applications, WhatsApp API, SEO, and digital marketing services at affordable prices.",
    type: 'website',
    url: "https://www.clivy.vercel.app/",
    siteName: 'Clivy WhatsApp API Services',
    locale: 'en_US',
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("Clivy - Leading Software House & Digital Marketing Agency")}&subtitle=${encodeURIComponent("Clivy provides professional website development, mobile applications, WhatsApp API, SEO, and digital marketing services at affordable prices.".slice(0, 100))}&locale=en`,
        width: 1200,
        height: 630,
        alt: "Clivy - Leading Software House & Digital Marketing Agency",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Clivy - Leading Software House & Digital Marketing Agency",
    description: "Clivy provides professional website development, mobile applications, WhatsApp API, SEO, and digital marketing services at affordable prices.",
    images: [`/api/og?title=${encodeURIComponent("Clivy - Leading Software House & Digital Marketing Agency")}&subtitle=${encodeURIComponent("Clivy provides professional website development, mobile applications, WhatsApp API, SEO, and digital marketing services at affordable prices.".slice(0, 100))}&locale=en`],
  },
};

export default function RootPage() {
  // Redirect ke locale default (id)
  redirect('/id');
}
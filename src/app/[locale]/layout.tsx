import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import "../../styles/index.css";
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { Providers } from "./providers";
import { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CartProvider } from "@/components/Cart/CartContext";
import { AuthProvider } from "@/components/Auth/AuthContext";
import ConditionalLayoutWrapper from "@/components/Layout/ConditionalLayoutWrapper";
import { ToastProvider } from "@/components/ui/toast";
import LocaleInitializer from "@/components/Layout/LocaleInitializer";
import StructuredData from "@/components/SEO/StructuredData";
import React from "react";

export async function generateMetadata({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Metadata'});

  const isIndonesian = locale === 'id';
  
  const baseTitle = isIndonesian 
    ? "Clivy - Software House & Digital Marketing Agency Terpercaya"
    : "Clivy - Leading Software House & Digital Marketing Agency";
    
  const baseDescription = isIndonesian
    ? "Clivy menyediakan layanan pengembangan website profesional, aplikasi mobile, WhatsApp API, SEO, dan digital marketing. Partner terpercaya untuk transformasi digital bisnis Anda di Indonesia dan Australia dengan harga terjangkau."
    : "Clivy provides professional website development, mobile applications, WhatsApp API, SEO, and digital marketing services. Your trusted partner for business digital transformation in Indonesia and Australia with affordable pricing.";

  return {
    title: {
      template: "%s | Clivy WhatsApp API Services",
      default: baseTitle,
    },
    description: baseDescription,
    keywords: isIndonesian 
      ? "software house indonesia, digital marketing agency, pengembangan website, aplikasi mobile, whatsapp api, seo indonesia, clivy, web development jakarta"
      : "software house, digital marketing agency, web development, mobile app development, whatsapp api, seo services, clivy, australia indonesia",
    authors: [{name: "Clivy WhatsApp API Services"}],
    creator: "Clivy WhatsApp API Services",
    publisher: "Clivy WhatsApp API Services",
    metadataBase: new URL("https://www.clivy.vercel.app"),
    alternates: {
      canonical: `https://www.clivy.vercel.app/${locale}`,
      languages: {
        "en": "https://www.clivy.vercel.app/en",
        "id": "https://www.clivy.vercel.app/id",
        "x-default": "https://www.clivy.vercel.app/id", // Default fallback for unknown locales
      },
    },
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
    icons: {
      icon: "/web-icon.svg",
      shortcut: "/web-icon.svg",
      apple: "/web-icon.svg",
    },
    other: {
      // Preconnect to critical domains for performance
      'preconnect': [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://static.cloudflareinsights.com'
      ],
      'dns-prefetch': [
        'https://vercel-storage.com',
        'https://blob.vercel-storage.com'
      ]
    },
    openGraph: {
      type: "website",
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      url: `https://www.clivy.vercel.app/${locale}`,
      title: baseTitle,
      description: baseDescription,
      siteName: "Clivy WhatsApp API Services",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(baseTitle)}&subtitle=${encodeURIComponent(baseDescription.slice(0, 100))}&locale=${locale}`,
          width: 1200,
          height: 630,
          alt: isIndonesian ? "Clivy - Software House & Digital Marketing" : "Clivy - Software House & Digital Marketing",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: baseTitle,
      description: baseDescription,
      images: [`/api/og?title=${encodeURIComponent(baseTitle)}&subtitle=${encodeURIComponent(baseDescription.slice(0, 100))}&locale=${locale}`],
    },
  }
};

export default async function LocaleLayout({children, params}: {children: React.ReactNode, params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  return (
    <Providers>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <NextIntlClientProvider locale={locale}>
              <StructuredData />
              <LocaleInitializer />
              <ConditionalLayoutWrapper>
                {children}
              </ConditionalLayoutWrapper>
            </NextIntlClientProvider>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </Providers>
  );
}




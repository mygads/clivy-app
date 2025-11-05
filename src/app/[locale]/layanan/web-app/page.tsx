import { Metadata } from "next";
import ContactSection from "@/components/Sections/ContactSection"
import HeroWebApp from "@/components/Sections/layanan/web-app/HeroWebApp"
import WebAppBenefits from "@/components/Sections/layanan/web-app/WebAppBenefits"
import WebAppOverview from "@/components/Sections/layanan/web-app/WebAppOverview"
import WebAppPricing from "@/components/Sections/layanan/web-app/WebAppPricing"
import WebAppProcess from "@/components/Sections/layanan/web-app/WebAppProcess"
import WebAppWhyChoose from "@/components/Sections/layanan/web-app/WebAppWhyChoose"
import { generateProductMetadata } from '@/lib/metadata';

// Generate static params for SSG
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'id' }
  ]
}

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const isIndonesian = locale === 'id';
  
  const title = isIndonesian
    ? "Jasa Pembuatan Web App - Aplikasi Web Profesional & Scalable"
    : "Web Application Development - Professional & Scalable Web Apps";
    
  const description = isIndonesian
    ? "Layanan pengembangan aplikasi web modern dan scalable oleh Genfity. Menggunakan teknologi terdepan untuk transformasi digital bisnis dengan performa optimal."
    : "Modern and scalable web application development services by Genfity. Using cutting-edge technologies for digital business transformation with optimal performance.";

  return generateProductMetadata({
    title,
    description,
    locale,
    slug: 'web-app',
    images: [`/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isIndonesian ? 'Teknologi Modern & Scalable' : 'Modern & Scalable Technology')}&locale=${locale}`],
  });
}

export default function WebAppPage() {
    return (
        <div className="min-h-screen">
            <HeroWebApp />
            <WebAppOverview />
            <WebAppBenefits />
            <WebAppProcess />
            <WebAppWhyChoose />
            <WebAppPricing />
            <ContactSection />
        </div>
    )
}
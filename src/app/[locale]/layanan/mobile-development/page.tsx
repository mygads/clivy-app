import { Metadata } from 'next'
import HeroMobileDevelopment from "@/components/Sections/layanan/mobile-development/HeroMobileDevelopment"
import MobileOverview from "@/components/Sections/layanan/mobile-development/MobileOverview"
import MobileBenefits from "@/components/Sections/layanan/mobile-development/MobileBenefits"
import MobileProcess from "@/components/Sections/layanan/mobile-development/MobileProcess"
import MobileWhyChoose from "@/components/Sections/layanan/mobile-development/MobileWhyChoose"
import MobilePricing from "@/components/Sections/layanan/mobile-development/MobilePricing"
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
    ? "Aplikasi Mobile iOS & Android - Profesional"
    : "Mobile App Development - iOS & Android";
    
  const description = isIndonesian
    ? "Layanan pengembangan aplikasi mobile profesional untuk iOS dan Android. Solusi native dan cross-platform dengan user experience luar biasa menggunakan teknologi terdepan. Konsultasi gratis tersedia!"
    : "Professional mobile app development services for iOS and Android. Native and cross-platform solutions with exceptional user experience and cutting-edge technology. Free consultation available!";

  return generateProductMetadata({
    title,
    description,
    locale,
    slug: 'mobile-development',
    images: [`/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isIndonesian ? 'Aplikasi iOS & Android Native' : 'Native iOS & Android Apps')}&locale=${locale}`],
  });
}

export default function MobileDevelopmentPage() {
    return (
        <>
            <HeroMobileDevelopment />
            <MobileOverview />
            <MobileBenefits />
            <MobileProcess />
            <MobileWhyChoose />
            <MobilePricing />
        </>
    )
}
import type { Metadata } from "next";
import HeroDesignUIUX from "@/components/Sections/layanan/ui-ux-design/HeroDesignUIUX"
import UIUXOverview from "@/components/Sections/layanan/ui-ux-design/UIUXOverview"
import UIUXBenefits from "@/components/Sections/layanan/ui-ux-design/UIUXBenefits"
import UIUXWhyChoose from "@/components/Sections/layanan/ui-ux-design/UIUXWhyChoose"
import UIUXProcess from "@/components/Sections/layanan/ui-ux-design/UIUXProcess"
import UIUXPricing from "@/components/Sections/layanan/ui-ux-design/UIUXPricing"
import BusinessServices from "@/components/Sections/BusinessServices"
import BriefReviews from "@/components/Sections/BriefReviews"
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
    ? "Desain UI/UX - Antarmuka & Pengalaman Pengguna"
    : "UI/UX Design - Interface & User Experience";
    
  const description = isIndonesian
    ? "Jasa desain UI/UX profesional oleh Genfity. Menciptakan antarmuka yang indah, fungsional, dan intuitif untuk meningkatkan pengalaman pengguna dan konversi bisnis Anda. Konsultasi gratis!"
    : "Professional UI/UX design services by Genfity. Creating beautiful, functional, and intuitive interfaces to enhance user experience and boost your business conversions. Free consultation!";

  return generateProductMetadata({
    title,
    description,
    locale,
    slug: 'ui-ux-design',
    images: [`/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isIndonesian ? 'Desain yang Indah & Fungsional' : 'Beautiful & Functional Design')}&locale=${locale}`],
  });
}

export default function DesignUIUXPage() {
  return (
    <>
      <HeroDesignUIUX />
      <UIUXOverview />
      <UIUXWhyChoose />
      <UIUXBenefits />
      <UIUXProcess />
      <UIUXPricing />
      <BusinessServices />
      <BriefReviews />
    </>
  )
}

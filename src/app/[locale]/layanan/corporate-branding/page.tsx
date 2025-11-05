import type { Metadata } from "next"
import HeroBrandingPage from "@/components/Sections/layanan/corporate-branding/HeroBrandingPage"
import BrandingOverview from "@/components/Sections/layanan/corporate-branding/BrandingOverview"
import BrandingWhyChoose from "@/components/Sections/layanan/corporate-branding/BrandingWhyChoose"
import BrandingBenefits from "@/components/Sections/layanan/corporate-branding/BrandingBenefits"
import BrandingPricing from "@/components/Sections/layanan/corporate-branding/BrandingPricing"
import BrandingProcess from "@/components/Sections/layanan/corporate-branding/BrandingProcess"
import TrustedSection from "@/components/Sections/TrustedSection"
import BusinessServices from "@/components/Sections/BusinessServices"
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
    ? "Corporate Branding - Jasa Branding Perusahaan Profesional"
    : "Corporate Branding - Professional Corporate Branding Services";
    
  const description = isIndonesian
    ? "Layanan corporate branding profesional oleh Genfity. Rancang identitas korporat yang kuat, memorable, dan membedakan bisnis Anda dari kompetitor. Konsultasi gratis!"
    : "Professional corporate branding services by Genfity. Design strong, memorable corporate identity that differentiates your business from competitors. Free consultation!";

  return generateProductMetadata({
    title,
    description,
    locale,
    slug: 'corporate-branding',
    images: [`/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isIndonesian ? 'Identitas Brand yang Kuat' : 'Strong Brand Identity')}&locale=${locale}`],
  });
}

export default function CorporateBrandingPage() {
  return (
    <>
      <HeroBrandingPage />
      <BrandingOverview />
      <BrandingWhyChoose />
      <BrandingBenefits />
      <BrandingProcess />
      <BrandingPricing />
      <BusinessServices />
      <TrustedSection />
    </>
  )
}

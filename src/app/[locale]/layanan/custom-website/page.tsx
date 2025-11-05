import type { Metadata } from "next"
import HeroCustomWebsite from "@/components/Sections/layanan/custom-website/HeroCustomWebsite"
import WhyWebsiteImportant from "@/components/Sections/WhyWebsiteImportant"
import CustomBuilt from "@/components/Sections/CustomBuilt"
import HowWeWork from "@/components/Sections/HowWeWork"
import ComparisonSection from "@/components/Sections/ComparisonSection"
import BusinessServices from "@/components/Sections/BusinessServices"
import WebsiteFeatures from "@/components/Sections/layanan/custom-website/WebsiteFeatures"
import WebsitePricing from "@/components/Sections/layanan/custom-website/WebsitePricing"
import TrustedSection from "@/components/Sections/TrustedSection"
import BriefReviews from "@/components/Sections/BriefReviews"
import { generateProductMetadata, getKeywords } from '@/lib/metadata';

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
    ? "Jasa Pembuatan Website Custom - Profesional & Responsif"
    : "Custom Website Development - Professional & Responsive";
    
  const description = isIndonesian
    ? "Jasa pembuatan website custom profesional oleh Genfity. Website responsif, SEO-friendly, loading cepat, dan disesuaikan dengan kebutuhan bisnis Anda. Konsultasi gratis tersedia dengan tim berpengalaman!"
    : "Professional custom website development services by Genfity. Responsive, SEO-friendly, fast-loading websites tailored to your business needs. Free consultation available with experienced team!";

  return generateProductMetadata({
    title,
    description,
    locale,
    slug: 'custom-website',
    images: [`/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isIndonesian ? 'Website Responsif & SEO Friendly' : 'Responsive & SEO Friendly Website')}&locale=${locale}`],
  });
}

export default function CustomWebsitePage() {
  return (
    <>
      <HeroCustomWebsite />
      <WhyWebsiteImportant />
      <CustomBuilt />
      <WebsiteFeatures />
      <HowWeWork />
      <ComparisonSection />
      <WebsitePricing />
      <BusinessServices />
      <TrustedSection />
      <BriefReviews />
    </>
  )
}

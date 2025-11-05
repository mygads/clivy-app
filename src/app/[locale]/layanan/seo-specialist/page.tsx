import type { Metadata } from "next";
import HeroSpecialistSEO from "@/components/Sections/layanan/seo-specialist/HeroSpecialistSEO"
import SEOOverview from "@/components/Sections/layanan/seo-specialist/SEOOverview"
import SEOBenefits from "@/components/Sections/layanan/seo-specialist/SEOBenefits"
import SEOWhyChoose from "@/components/Sections/layanan/seo-specialist/SEOWhyChoose"
import SEOPricing from "@/components/Sections/layanan/seo-specialist/SEOPricing"
import SEOProcess from "@/components/Sections/layanan/seo-specialist/SEOProcess"
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
    ? "SEO Specialist - Optimasi Ranking #1 Google"
    : "SEO Specialist - #1 Google Ranking Optimization";
    
  const description = isIndonesian
    ? "Jasa SEO specialist profesional oleh Genfity. Tingkatkan ranking website di Google dengan strategi SEO yang terbukti efektif. Konsultasi gratis dan hasil terukur untuk bisnis Anda!"
    : "Professional SEO specialist services by Genfity. Improve your website ranking on Google with proven effective SEO strategies. Free consultation and measurable results for your business!";

  return generateProductMetadata({
    title,
    description,
    locale,
    slug: 'seo-specialist',
    images: [`/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isIndonesian ? 'Strategi SEO Terbukti Efektif' : 'Proven Effective SEO Strategy')}&locale=${locale}`],
  });
}

export default function SEOSpecialistPage() {
  return (
    <>
      <HeroSpecialistSEO />
      <SEOOverview />
      <SEOWhyChoose />
      <SEOBenefits />
      <SEOPricing />
      <SEOProcess />
      <BusinessServices />
      <BriefReviews />
    </>
  )
}

import type { Metadata } from "next";
import ContactSection from "@/components/Sections/ContactSection"
import CorporateSystemBenefits from "@/components/Sections/layanan/corporate-system/CorporateSystemBenefits"
import CorporateSystemOverview from "@/components/Sections/layanan/corporate-system/CorporateSystemOverview"
import CorporateSystemPricing from "@/components/Sections/layanan/corporate-system/CorporateSystemPricing"
import CorporateSystemProcess from "@/components/Sections/layanan/corporate-system/CorporateSystemProcess"
import CorporateSystemWhyChoose from "@/components/Sections/layanan/corporate-system/CorporateSystemWhyChoose"
import HeroCorporateSystem from "@/components/Sections/layanan/corporate-system/HeroCorporateSystem"
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
    ? "Sistem Korporat - Solusi Sistem Terintegrasi untuk Perusahaan"
    : "Corporate System - Integrated System Solutions for Enterprises";
    
  const description = isIndonesian
    ? "Solusi sistem korporat terintegrasi oleh Genfity. ERP, CRM, dan sistem manajemen yang disesuaikan dengan kebutuhan bisnis Anda. Konsultasi gratis!"
    : "Integrated corporate system solutions by Genfity. ERP, CRM, and management systems tailored to your business needs. Free consultation!";

  return generateProductMetadata({
    title,
    description,
    locale,
    slug: 'corporate-system',
    images: [`/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isIndonesian ? 'ERP & CRM Solutions' : 'ERP & CRM Solutions')}&locale=${locale}`],
  });
}

export default function CorporateSystemPage() {
    return (
        <div className="min-h-screen">
            <HeroCorporateSystem />
            <CorporateSystemOverview />
            <CorporateSystemBenefits />
            <CorporateSystemProcess />
            <CorporateSystemWhyChoose />
            <CorporateSystemPricing />
            <ContactSection />
        </div>
    )
}
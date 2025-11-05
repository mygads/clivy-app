import type { Metadata } from 'next'
import HeroTechSupport from '@/components/Sections/layanan/tech-support/HeroTechSupport'
import TechSupportOverview from '@/components/Sections/layanan/tech-support/TechSupportOverview'
import TechSupportBenefits from '@/components/Sections/layanan/tech-support/TechSupportBenefits'
import TechSupportProcess from '@/components/Sections/layanan/tech-support/TechSupportProcess'
import TechSupportWhyChoose from '@/components/Sections/layanan/tech-support/TechSupportWhyChoose'
import TechSupportPricing from '@/components/Sections/layanan/tech-support/TechSupportPricing'
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
    ? 'Layanan Tech Support - Dukungan Teknis Profesional 24/7'
    : 'Tech Support Services - Professional Technical Support';
    
  const description = isIndonesian
    ? 'Layanan dukungan teknis profesional dengan ketersediaan 24/7, waktu respons cepat, dan solusi ahli. Dukungan hardware, software, jaringan, dan keamanan untuk bisnis.'
    : 'Professional technical support services with 24/7 availability, rapid response times, and expert solutions. Hardware, software, network, and security support for businesses.';

  return generateProductMetadata({
    title,
    description,
    locale,
    slug: 'tech-support',
    images: [`/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isIndonesian ? 'Dukungan 24/7' : '24/7 Support')}&locale=${locale}`],
  });
}

export default function TechSupportPage() {
    return (
        <div className="min-h-screen">
            <HeroTechSupport />
            <TechSupportOverview />
            <TechSupportBenefits />
            <TechSupportProcess />
            <TechSupportWhyChoose />
            <TechSupportPricing />
        </div>
    )
}
import type { Metadata } from "next"
import HeroITConsulting from "@/components/Sections/layanan/it-consulting/HeroITConsulting"
import ITConsultingOverview from "@/components/Sections/layanan/it-consulting/ITConsultingOverview"
import ITConsultingBenefits from "@/components/Sections/layanan/it-consulting/ITConsultingBenefits"
import ITConsultingProcess from "@/components/Sections/layanan/it-consulting/ITConsultingProcess"
import ITConsultingWhyChoose from "@/components/Sections/layanan/it-consulting/ITConsultingWhyChoose"
import ITConsultingPricing from "@/components/Sections/layanan/it-consulting/ITConsultingPricing"
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
    ? "Konsultan IT - Layanan Konsultasi Teknologi Strategis"
    : "IT Consulting Services - Strategic Technology Solutions";
    
  const description = isIndonesian
    ? "Transformasi bisnis dengan layanan konsultan IT ahli. Strategi transformasi digital, optimasi teknologi, cybersecurity, dan perencanaan infrastruktur oleh profesional bersertifikat."
    : "Transform your business with expert IT consulting services. Digital transformation strategy, technology optimization, cybersecurity, and infrastructure planning by certified professionals.";

  return generateProductMetadata({
    title,
    description,
    locale,
    slug: 'it-consulting',
    images: [`/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isIndonesian ? 'Strategi Teknologi untuk Bisnis' : 'Technology Strategy for Business')}&locale=${locale}`],
  });
}

export default function ITConsultingPage() {
    return (
        <main className="overflow-hidden">
            <HeroITConsulting />
            <ITConsultingOverview />
            <ITConsultingBenefits />
            <ITConsultingProcess />
            <ITConsultingWhyChoose />
            <ITConsultingPricing />
        </main>
    )
}
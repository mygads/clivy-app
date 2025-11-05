import type { Metadata } from 'next';

import HeroWhatsAppAPI from '@/components/Sections/layanan/whatsapp-api/HeroWhatsAppAPI';
import WhatsAppAPIOverview from '@/components/Sections/layanan/whatsapp-api/WhatsAppAPIOverview';
import WhatsAppAPIBenefits from '@/components/Sections/layanan/whatsapp-api/WhatsAppAPIBenefits';
import WhatsAppAPIProcess from '@/components/Sections/layanan/whatsapp-api/WhatsAppAPIProcess';
import WhatsAppAPIWhyChoose from '@/components/Sections/layanan/whatsapp-api/WhatsAppAPIWhyChoose';
import WhatsAppAPIPricing from '@/components/Sections/layanan/whatsapp-api/WhatsAppAPIPricing';
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
    ? "WhatsApp Business API - Integrasi Profesional"
    : "WhatsApp Business API - Professional Integration";
    
  const description = isIndonesian
    ? "Integrasi WhatsApp Business API dengan sistem Anda. Kirim pesan otomatis, terima respon pelanggan, dan tingkatkan komunikasi dengan solusi messaging yang andal dan aman dari Genfity. Fitur lengkap dengan harga terjangkau."
    : "Integrate WhatsApp Business API with your system. Send automated messages, receive customer responses, and enhance communication with reliable, secure messaging solutions from Genfity. Complete features at affordable prices.";

  return generateProductMetadata({
    title,
    description,
    locale,
    slug: 'whatsapp-api',
    images: [`/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isIndonesian ? 'Solusi Messaging Bisnis Terpercaya' : 'Trusted Business Messaging Solution')}&locale=${locale}`],
  });
}

export default function WhatsAppAPIPage() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <HeroWhatsAppAPI />

            {/* API Overview */}
            <WhatsAppAPIOverview />

            {/* Benefits */}
            <WhatsAppAPIBenefits />

            {/* Integration Process */}
            <WhatsAppAPIProcess />

            {/* Why Choose Genfity */}
            <WhatsAppAPIWhyChoose />

            {/* Pricing */}
            <WhatsAppAPIPricing />
        </main>
    );
}
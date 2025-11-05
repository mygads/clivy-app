import type { Metadata } from 'next';

import HeroWhatsAppBroadcast from '@/components/Sections/layanan/whatsapp-broadcast/HeroWhatsAppBroadcast';
import WhatsAppBroadcastOverview from '@/components/Sections/layanan/whatsapp-broadcast/WhatsAppBroadcastOverview';
import WhatsAppBroadcastBenefits from '@/components/Sections/layanan/whatsapp-broadcast/WhatsAppBroadcastBenefits';
import WhatsAppBroadcastProcess from '@/components/Sections/layanan/whatsapp-broadcast/WhatsAppBroadcastProcess';
import WhatsAppBroadcastWhyChoose from '@/components/Sections/layanan/whatsapp-broadcast/WhatsAppBroadcastWhyChoose';
import WhatsAppBroadcastPricing from '@/components/Sections/layanan/whatsapp-broadcast/WhatsAppBroadcastPricing';
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
    ? 'Kampanye WhatsApp Broadcast - Solusi Marketing Mass Messaging'
    : 'WhatsApp Broadcast Campaigns - Mass Messaging Marketing Solutions';
    
  const description = isIndonesian
    ? 'Luncurkan kampanye WhatsApp broadcast yang powerful untuk menjangkau ribuan pelanggan secara instan. Mass messaging profesional dengan targeting canggih, analytics, dan tingkat delivery tinggi.'
    : 'Launch powerful WhatsApp broadcast campaigns to reach thousands of customers instantly. Professional mass messaging with advanced targeting, analytics, and high delivery rates.';

  return generateProductMetadata({
    title,
    description,
    locale,
    slug: 'whatsapp-broadcast',
    images: [`/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isIndonesian ? 'Mass Messaging Profesional' : 'Professional Mass Messaging')}&locale=${locale}`],
  });
}

export default function WhatsAppBroadcastPage() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <HeroWhatsAppBroadcast />

            {/* Broadcast Overview */}
            <WhatsAppBroadcastOverview />

            {/* Benefits */}
            <WhatsAppBroadcastBenefits />

            {/* Campaign Process */}
            <WhatsAppBroadcastProcess />

            {/* Why Choose Genfity */}
            <WhatsAppBroadcastWhyChoose />

            {/* Pricing */}
            <WhatsAppBroadcastPricing />
        </main>
    );
}
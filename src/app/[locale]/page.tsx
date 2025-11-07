import { Metadata } from "next";
import ScrollUp from "@/components/Common/ScrollUp";
import HeroWhatsAppAPI from '@/components/Sections/layanan/whatsapp-api/HeroWhatsAppAPI';
import WhatsAppAPIOverview from '@/components/Sections/layanan/whatsapp-api/WhatsAppAPIOverview';
import WhatsAppAPIBenefits from '@/components/Sections/layanan/whatsapp-api/WhatsAppAPIBenefits';
import WhatsAppAPIWhyChoose from '@/components/Sections/layanan/whatsapp-api/WhatsAppAPIWhyChoose';
import PricingSection from '@/components/Sections/PricingSection';
import ContactSection from "@/components/Sections/ContactSection"
import FaqSection from "@/components/Sections/FaqSection";
import { generateProductMetadata } from "@/lib/metadata";

// Generate static params for SSG (Static Site Generation)
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'id' }
  ]
}

// Generate metadata for homepage (now WhatsApp API focused)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isIndonesian = locale === 'id';

  const title = isIndonesian
    ? "WhatsApp Business API - Integrasi Profesional"
    : "WhatsApp Business API - Professional Integration";
    
  const description = isIndonesian
    ? "Integrasi WhatsApp Business API dengan sistem Anda. Kirim pesan otomatis, terima respon pelanggan, dan tingkatkan komunikasi dengan solusi messaging yang andal dan aman dari Clivy. Fitur lengkap dengan harga terjangkau."
    : "Integrate WhatsApp Business API with your system. Send automated messages, receive customer responses, and enhance communication with reliable, secure messaging solutions from Clivy. Complete features at affordable prices.";

  return generateProductMetadata({
    title,
    description,
    locale,
    slug: 'whatsapp-api',
    images: [`/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isIndonesian ? 'Solusi Messaging Bisnis Terpercaya' : 'Trusted Business Messaging Solution')}&locale=${locale}`],
  });
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return (
    <>
      <ScrollUp />
      
      {/* Hero Section */}
      <HeroWhatsAppAPI />

      {/* API Overview */}
      <WhatsAppAPIOverview />

      {/* Pricing Section - Dynamic from Database */}
      <PricingSection />
      {/* Benefits */}
      {/* <WhatsAppAPIBenefits /> */}

      {/* Why Choose Clivy */}
      <WhatsAppAPIWhyChoose />


      {/* Contact & FAQ */}
      <ContactSection />
      <FaqSection />
    </>
  );
}

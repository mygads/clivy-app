import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Breadcrumb from "@/components/Common/Breadcrumb";
import HeroSection from "@/components/HowToOrder/HeroSection";
import OrderingProcess from "@/components/HowToOrder/OrderingProcess";
import MainWorkflow from "@/components/HowToOrder/MainWorkflow";
import RevisionProcess from "@/components/HowToOrder/RevisionProcess";
import WhatsAppApiWorkflow from "@/components/HowToOrder/WhatsAppApiWorkflow";
import ContactSection from "@/components/Sections/ContactSection";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

// Generate static params for SSG
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'id' }
  ]
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isIndonesian = locale === 'id';
  
  const title = isIndonesian
    ? "Cara Pemesanan - Clivy | Panduan Lengkap Order Layanan Digital"
    : "How to Order - Clivy | Complete Guide to Digital Service Ordering";
    
  const description = isIndonesian
    ? "Panduan lengkap cara memesan layanan Clivy: website, aplikasi mobile, WhatsApp API. Proses mudah 8 langkah dari keranjang hingga delivery. Konsultasi gratis tersedia!"
    : "Complete guide on how to order Clivy services: websites, mobile apps, WhatsApp API. Easy 8-step process from cart to delivery. Free consultation available!";

  return {
    title,
    description,
    keywords: isIndonesian
      ? "cara pesan website, cara order aplikasi, proses pemesanan clivy, panduan order digital, langkah pemesanan"
      : "how to order website, how to order app, clivy ordering process, digital service guide, ordering steps",
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === 'id' ? 'id_ID' : 'en_US',
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function HowToOrderPage({ params }: Props) {
  const { locale } = await params;
  // Enable static rendering
  setRequestLocale(locale);
  
  const t = await getTranslations("HowToOrder");

  return (
    <>
      
      <HeroSection />
      <OrderingProcess />
      <MainWorkflow />
      <RevisionProcess />
      <WhatsAppApiWorkflow />
      <ContactSection />
    </>
  );
}

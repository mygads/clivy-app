import { Metadata } from "next";
import ScrollUp from "@/components/Common/ScrollUp";
import HeroSection from "@/components/Sections/HeroSection"
import VideoSection from "@/components/Sections/VideoSection"
import OurServices from "@/components/Sections/OurServices"
import ContactSection from "@/components/Sections/ContactSection"
import FaqSection from "@/components/Sections/FaqSection";
import ServiceCategoryHero from "@/components/Sections/ServiceCategory";
import { getTranslations } from "next-intl/server";
import ClientLogos from "@/components/Sections/about/ClientLogos";
import { prisma } from "@/lib/prisma";
import { generatePageMetadata, getKeywords } from "@/lib/metadata";

// Client logo interface
interface ClientLogoData {
  name: string;
  logo: string;
}

// Generate static params for SSG with ISR
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'id' }
  ]
}

// Generate metadata for homepage
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isIndonesian = locale === 'id';

  return generatePageMetadata({
    title: isIndonesian 
      ? "Software House & Digital Agency Terpercaya" 
      : "Leading Software House & Digital Agency",
    description: isIndonesian
      ? "Genfity adalah software house dan digital agency terpercaya di Indonesia dan Australia. Kami menyediakan layanan pengembangan website profesional, aplikasi mobile, WhatsApp Business API, SEO, dan digital marketing untuk transformasi digital bisnis Anda dengan harga terjangkau."
      : "Genfity is a trusted software house and digital agency in Indonesia and Australia. We provide professional website development, mobile applications, WhatsApp Business API, SEO, and digital marketing services for your business digital transformation at affordable prices.",
    keywords: getKeywords('base', locale as 'id' | 'en', [
      ...(isIndonesian 
        ? ['jasa pembuatan website', 'software house terbaik', 'digital agency indonesia', 'transformasi digital']
        : ['website development services', 'best software house', 'digital agency', 'digital transformation']
      )
    ]),
    locale,
    ogImage: `/api/og?title=${encodeURIComponent(isIndonesian ? 'Genfity Digital Solutions' : 'Genfity Digital Solutions')}&subtitle=${encodeURIComponent(isIndonesian ? 'Software House & Digital Agency Terpercaya' : 'Trusted Software House & Digital Agency')}&locale=${locale}`,
  });
}

// ISR Configuration - Revalidate every 10 minutes
// Homepage includes pricing packages that may change
export const revalidate = 6000;

// Server-side data fetching function for client logos
async function getClientLogosData(): Promise<ClientLogoData[]> {
  try {
    // Check if we're in build environment (no database connection needed)
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return [];
    }
    
    // Try to fetch from database
    const clientLogos = await prisma.clientLogo.findMany({
      where: {
        isActive: true
      },
      select: {
        logoUrl: true,
        sortOrder: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Convert result to match component interface
    return clientLogos.map((logo, index) => ({
      name: `Client ${index + 1}`,
      logo: logo.logoUrl
    }));
    
  } catch (error) {
    console.error('Error fetching client logos data:', error);
    // Return empty array for build time - no sample data needed
    return [];
  }
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Fetch client logos data
  const clientLogosData = await getClientLogosData();
  
  // Generate structured data for homepage
  return (
    <>
      <ScrollUp />
      <HeroSection />
      <ClientLogos data={clientLogosData} desc={false} />
      <ServiceCategoryHero />
      <OurServices />
      <ContactSection />
      <FaqSection />
    </>
  );
}

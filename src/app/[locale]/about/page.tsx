import AboutHero from "@/components/Sections/about/AboutHero"
import WhoWeAre from "@/components/Sections/about/WhoWeAre"
import OurGoals from "@/components/Sections/about/OurGoals"
import WhyChooseUs from "@/components/Sections/about/WhyChooseUs"
import ClientLogos from "@/components/Sections/about/ClientLogos"
import ClientReviews from "@/components/Sections/about/ClientReviews"
import CompanyLegality from "@/components/Sections/about/CompanyLegality"
import FreeConsultation from "@/components/Sections/about/FreeConsultation"
import LocationMap from "@/components/Sections/about/LocationMap"
import Breadcrumb from "@/components/Common/Breadcrumb"
import { Metadata } from "next"
import AboutSectionOne from "@/components/About/AboutSectionOne"
import AboutSectionTwo from "@/components/About/AboutSectionTwo"
import HeroAbout from "@/components/Hero/HeroAbout"
import OurValues from "@/components/About/OurValues"
import { prisma } from "@/lib/prisma"
import { generatePageMetadata, getKeywords } from "@/lib/metadata"

// Generate metadata for About page
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isIndonesian = locale === 'id';

  return generatePageMetadata({
    title: isIndonesian ? "Tentang Kami" : "About Us",
    description: isIndonesian
      ? "Pelajari lebih lanjut tentang Genfity Digital Solutions - software house dan digital agency terpercaya di Indonesia dan Australia. Tim profesional kami siap membantu transformasi digital bisnis Anda dengan layanan website development, aplikasi mobile, WhatsApp API, dan digital marketing."
      : "Learn more about Genfity Digital Solutions - trusted software house and digital agency in Indonesia and Australia. Our professional team is ready to help your business digital transformation with website development, mobile apps, WhatsApp API, and digital marketing services.",
    keywords: getKeywords('base', locale as 'id' | 'en', [
      isIndonesian ? 'tentang kami' : 'about us',
      isIndonesian ? 'profil perusahaan' : 'company profile',
      isIndonesian ? 'tim genfity' : 'genfity team',
      isIndonesian ? 'visi misi' : 'vision mission',
    ]),
    locale,
    ogImage: `/api/og?title=${encodeURIComponent(isIndonesian ? 'Tentang Kami' : 'About Us')}&subtitle=${encodeURIComponent(isIndonesian ? 'Software House & Digital Agency Terpercaya' : 'Trusted Software House & Digital Agency')}&locale=${locale}`,
  });
}

// Client logo interface
interface ClientLogoData {
  name: string;
  logo: string;
}

// Server-side data fetching function for client logos
async function getClientLogosData(): Promise<ClientLogoData[]> {
  try {
    // Try to fetch from database (will work after Prisma generation)
    if (prisma.clientLogo) {
      const clientLogos = await (prisma as any).clientLogo.findMany({
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
      return clientLogos.map((logo: any, index: number) => ({
        name: `Client ${index + 1}`,
        logo: logo.logoUrl
      }));
    }
    
    // Fallback to empty array if model not available
    return [];
  } catch (error) {
    console.error('Error fetching client logos data:', error);
    // Return sample data for development
    return [];
  }
}

// Generate static params for SSG
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'id' }
  ]
}

export default async function AboutPage() {
  // Fetch client logos data server-side
  const clientLogosData = await getClientLogosData();

  return (
    <>
      {/* <Breadcrumb
        pageName="About Us"
        description="Tentang Genfity - Partner digital terpercaya untuk transformasi bisnis Anda di era digital."
      /> */}

      <HeroAbout />
      <OurValues />

      
      {/* Hero Section */}
      {/* <AboutSectionOne />
      <AboutSectionTwo /> */}
      
      {/* Siapa Kita */}
      {/* <WhoWeAre /> */}
      
      {/* Tujuan */}
      {/* <OurGoals /> */}
      
      {/* Kenapa Harus Kita */}
      <WhyChooseUs />
      
      {/* Slider Logo Client */}
      <ClientLogos data={clientLogosData} desc={true} />
      
      {/* Review */}
      {/* <ClientReviews /> */}
      
      {/* Legalitas Perusahaan */}
      {/* <CompanyLegality /> */}
      
      {/* Lokasi */}
      <LocationMap />
    </>
  )
}

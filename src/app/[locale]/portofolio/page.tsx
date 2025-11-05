import { HeroParallax } from "@/components/ui/hero-parallax";
import Portfolio from "@/components/About/Portofolio";
import React from "react";
import { portofolioData } from "./components/portofolioData";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ClientLogos from "@/components/Sections/about/ClientLogos";
import { generatePageMetadata, getKeywords } from '@/lib/metadata';

// ISR Configuration - Revalidate every 10 minutes (600 seconds)
export const revalidate = 6000;

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
    ? "Portfolio - Showcase Proyek Kami"
    : "Portfolio - Our Project Showcase";
    
  const description = isIndonesian
    ? "Lihat portfolio proyek terbaru Genfity: website profesional, aplikasi mobile, dan solusi digital yang telah kami kerjakan untuk berbagai klien di Indonesia dan Australia. Hasil kerja berkualitas tinggi dengan teknologi modern."
    : "View Genfity's latest project portfolio: professional websites, mobile applications, and digital solutions we've created for various clients in Indonesia and Australia. High-quality work with modern technology.";

  return generatePageMetadata({
    title,
    description,
    keywords: getKeywords('base', locale as 'id' | 'en', [
      ...(isIndonesian
        ? ['portfolio', 'proyek', 'showcase', 'hasil kerja', 'galeri project']
        : ['portfolio', 'projects', 'showcase', 'our work', 'project gallery']
      )
    ]),
    locale,
    ogImage: `/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isIndonesian ? 'Proyek Website & Aplikasi Mobile' : 'Website & Mobile App Projects')}&locale=${locale}`,
  });

  return {
    title,
    description,
    keywords: isIndonesian
      ? "portfolio genfity, showcase website, galeri proyek, contoh website, portfolio aplikasi mobile, karya digital"
      : "genfity portfolio, website showcase, project gallery, website examples, mobile app portfolio, digital works",
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale === 'id' ? 'id_ID' : 'en_US',
    },
  };
}

// Portfolio data interface
interface PortfolioItem {
  id: string;
  title: string;
  image: string;
  gallery: string[];
  tech: string[];
  category?: string;
  description?: string;
  link?: string;
}

// Client logo interface
interface ClientLogoData {
  name: string;
  logo: string;
}

// Server-side data fetching function with caching tags
async function getPortfolioData(): Promise<PortfolioItem[]> {
  try {
    const portfolios = await prisma.portfolio.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        title: true,
        image: true,
        gallery: true,
        tech: true,
        category: true,
        description: true,
        link: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Convert Prisma result to match component interface
    return portfolios.map(portfolio => ({
      id: portfolio.id,
      title: portfolio.title,
      image: portfolio.image,
      gallery: portfolio.gallery,
      tech: portfolio.tech,
      category: portfolio.category || undefined,
      description: portfolio.description || undefined,
      link: portfolio.link || undefined
    }));
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    // Return fallback data if database fails
    return [
    ];
  }
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



async function PortofolioPage() {
  // Fetch portfolio data server-side for ISR
  const portfolioCarouselData = await getPortfolioData();
  const clientLogosData = await getClientLogosData();

  return (
    <>
      <HeroParallax products={portofolioData} />
      <Portfolio data={portfolioCarouselData} desc={false}/>
      <ClientLogos data={clientLogosData} desc={false}/>
    </>
  );
}

export default PortofolioPage;
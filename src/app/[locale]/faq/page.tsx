import { Metadata } from "next";
import FaqPageContent from "./components/faqPageContent"
import { generatePageMetadata, getKeywords } from '@/lib/metadata';

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
    ? "FAQ - Pertanyaan Umum"
    : "FAQ - Frequently Asked Questions";
    
  const description = isIndonesian
    ? "Temukan jawaban untuk pertanyaan umum tentang layanan Clivy: website development, aplikasi mobile, WhatsApp API, SEO, digital marketing, dan proses kerja kami. Dapatkan informasi lengkap sebelum memulai project Anda."
    : "Find answers to frequently asked questions about Clivy services: website development, mobile apps, WhatsApp API, SEO, digital marketing, and our work processes. Get complete information before starting your project.";

  return generatePageMetadata({
    title,
    description,
    keywords: getKeywords('base', locale as 'id' | 'en', [
      ...(isIndonesian
        ? ['faq', 'pertanyaan umum', 'bantuan', 'tanya jawab', 'informasi']
        : ['faq', 'frequently asked', 'help', 'questions', 'information']
      )
    ]),
    locale,
    ogImage: `/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isIndonesian ? 'Jawaban untuk Pertanyaan Anda' : 'Answers to Your Questions')}&locale=${locale}`,
  });
}

export default function FaqPage() {
  return <FaqPageContent />
}



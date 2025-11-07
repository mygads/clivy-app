import { Metadata } from "next";
import ContactSection from '@/components/Sections/ContactSection'
import { generatePageMetadata, getKeywords } from '@/lib/metadata';

// Generate static params for SSG
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'id' }
  ]
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const {locale} = await params;
  const isIndonesian = locale === 'id';
  
  const title = isIndonesian
    ? "Hubungi Kami - Konsultasi Gratis"
    : "Contact Us - Free Consultation";
    
  const description = isIndonesian
    ? "Hubungi tim Clivy untuk konsultasi gratis mengenai kebutuhan website, aplikasi mobile, WhatsApp API, SEO, dan digital marketing. Kami siap membantu transformasi digital bisnis Anda dengan solusi terpercaya dan profesional."
    : "Contact Clivy team for free consultation about your website, mobile app, WhatsApp API, SEO, and digital marketing needs. We're ready to help your business digital transformation with trusted and professional solutions.";

  return generatePageMetadata({
    title,
    description,
    keywords: getKeywords('base', locale as 'id' | 'en', [
      ...(isIndonesian
        ? ['kontak', 'hubungi kami', 'konsultasi gratis', 'customer service', 'alamat kantor']
        : ['contact', 'reach us', 'free consultation', 'customer service', 'office address']
      )
    ]),
    locale,
    ogImage: `/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isIndonesian ? 'Konsultasi Gratis dengan Tim Profesional' : 'Free Consultation with Professional Team')}&locale=${locale}`,
  });
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      <ContactSection />
    </div>
  )
}

import ContactSection from '@/components/Sections/ContactSection'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generatePageMetadata, getKeywords } from '@/lib/metadata'

// Generate static params for SSG
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'id' }
  ]
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isIndonesian = locale === 'id';
  
  const title = isIndonesian
    ? "Kebijakan Privasi - Perlindungan Data Pelanggan"
    : "Privacy Policy - Customer Data Protection";
    
  const description = isIndonesian
    ? "Kebijakan privasi Genfity tentang cara kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda. Komitmen kami terhadap keamanan data pelanggan."
    : "Genfity's privacy policy on how we collect, use, and protect your personal information. Our commitment to customer data security.";

  return generatePageMetadata({
    title,
    description,
    keywords: getKeywords('base'),
    locale,
  });
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacy' })

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 mt-20">
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 sm:mb-12 text-center">
            <h1 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              {t('title')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('lastUpdated')}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('introduction.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  At <strong>Genfity</strong>, we are committed 
                  to protecting your privacy and personal information. This Privacy Policy explains how we collect, 
                  use, disclose, and safeguard your information when you visit our website (genfity.com) and use our services.
                </p>
                {/* <p>
                  We operate from Indonesia at Jl. Harvard No. 9 Sulaiman, Margahayu, Kabupaten Bandung, Jawa Barat 40229, 
                  and also operate as <strong>Genfity Digital Solutions</strong> in Australia (ABN: 13 426 412 034) 
                  at 157 Braidwood Dr, Australind WA 6233.
                </p> */}
              </div>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('informationCollection.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                <p>We may collect personal information that you provide to us, including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name and contact information (email address, phone number, mailing address)</li>
                  <li>Account credentials and authentication information</li>
                  <li>Payment and billing information</li>
                  <li>Communications with us (customer service inquiries, feedback)</li>
                  <li>Professional information relevant to our services</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Usage Information</h3>
                <p>We automatically collect certain information when you use our services:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage patterns and preferences</li>
                  <li>Log data and analytics information</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('informationUse.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>We use the collected information for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Providing and maintaining our services</li>
                  <li>Processing transactions and payments</li>
                  <li>Communicating with you about services, updates, and support</li>
                  <li>Improving our services and user experience</li>
                  <li>Ensuring security and preventing fraud</li>
                  <li>Complying with legal obligations</li>
                  <li>Marketing and promotional communications (with your consent)</li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('informationSharing.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>We may share your information in the following circumstances:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> Third-party vendors who assist in providing our services</li>
                  <li><strong>Payment Processors:</strong> For processing transactions and payments</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset transfers</li>
                  <li><strong>With Your Consent:</strong> When you explicitly agree to the sharing</li>
                </ul>
                <p>
                  We do not sell, trade, or rent your personal information to third parties for marketing purposes.
                </p>
              </div>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('dataSecurity.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication measures</li>
                  <li>Employee training on data protection practices</li>
                  <li>Secure data storage and backup procedures</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('userRights.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> Request access to your personal data</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                  <li><strong>Objection:</strong> Object to certain processing of your information</li>
                  <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at <strong>genfity@gmail.com</strong> or 
                  <strong>+62 85174314023</strong>.
                </p>
              </div>
            </section>

            {/* Cookies Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('cookies.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  We use cookies and similar tracking technologies to enhance your experience on our website. 
                  These technologies help us:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze website traffic and usage patterns</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
                <p>
                  You can control cookies through your browser settings. However, disabling cookies may 
                  affect the functionality of our services.
                </p>
              </div>
            </section>

            <ContactSection />
          </div>
        </div>
      </div>
    </div>
  )
}
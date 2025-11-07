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
    ? "Syarat dan Ketentuan - Terms of Service Layanan Digital"
    : "Terms and Conditions - Digital Service Terms of Service";
    
  const description = isIndonesian
    ? "Syarat dan ketentuan penggunaan layanan Clivy. Ketentuan hukum, hak dan kewajiban pengguna, serta aturan penggunaan platform digital kami."
    : "Terms and conditions for using Clivy services. Legal terms, user rights and obligations, and rules for using our digital platform.";

  return generatePageMetadata({
    title,
    description,
    keywords: getKeywords('base'),
    locale,
  });
}

export default async function TermsConditionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'terms' })

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
            
            {/* Agreement to Legal Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('agreement.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  We operate the website clivy.com (the &ldquo;Site&rdquo;), as well as any other related products 
                  and services that refer or link to these legal terms (the &ldquo;Legal Terms&rdquo;) (collectively, the &ldquo;Services&rdquo;).
                </p>
                <p>
                  You can contact us by phone at <strong>+62 81233784490</strong>, email at <strong>clivy@gmail.com</strong>.
                </p>
                <p>
                  These Legal Terms constitute a legally binding agreement made between you, whether personally 
                  or on behalf of an entity (&ldquo;you&rdquo;), and Clivy, concerning your access 
                  to and use of the Services. You agree that by accessing the Services, you have read, understood, 
                  and agreed to be bound by all of these Legal Terms. <strong>IF YOU DO NOT AGREE WITH ALL OF THESE 
                  LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</strong>
                </p>
                <p>
                  The Services are intended for users who are at least 13 years of age. All users who are minors 
                  in the jurisdiction in which they reside (generally under the age of 18) must have the permission 
                  of, and be directly supervised by, their parent or guardian to use the Services.
                </p>
              </div>
            </section>

            {/* Table of Contents */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('tableOfContents')}
              </h2>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li><a href="#services" className="text-blue-600 dark:text-blue-400 hover:underline">{t('sections.services.title')}</a></li>
                  <li><a href="#intellectual-property" className="text-blue-600 dark:text-blue-400 hover:underline">{t('sections.intellectualProperty.title')}</a></li>
                  <li><a href="#user-representations" className="text-blue-600 dark:text-blue-400 hover:underline">{t('sections.userRepresentations.title')}</a></li>
                  <li><a href="#purchases-payment" className="text-blue-600 dark:text-blue-400 hover:underline">{t('sections.purchasesPayment.title')}</a></li>
                  <li><a href="#subscriptions" className="text-blue-600 dark:text-blue-400 hover:underline">{t('sections.subscriptions.title')}</a></li>
                  <li><a href="#prohibited-activities" className="text-blue-600 dark:text-blue-400 hover:underline">{t('sections.prohibitedActivities.title')}</a></li>
                  <li><a href="#privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">{t('sections.privacyPolicy.title')}</a></li>
                  <li><a href="#governing-law" className="text-blue-600 dark:text-blue-400 hover:underline">{t('sections.governingLaw.title')}</a></li>
                  <li><a href="#contact-us" className="text-blue-600 dark:text-blue-400 hover:underline">{t('sections.contactUs.title')}</a></li>
                </ol>
              </div>
            </section>

            {/* 1. Our Services */}
            <section id="services" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                1. {t('sections.services.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  The information provided when using the Services is not intended for distribution to or use by 
                  any person or entity in any jurisdiction or country where such distribution or use would be 
                  contrary to law or regulation or which would subject us to any registration requirement within 
                  such jurisdiction or country. Accordingly, those persons who choose to access the Services from 
                  other locations do so on their own initiative and are solely responsible for compliance with 
                  local laws, if and to the extent local laws are applicable.
                </p>
                <p>
                  Our services include but are not limited to: WhatsApp API integration services, website development 
                  packages, digital marketing solutions, and other technology services as described on our platform.
                </p>
              </div>
            </section>

            {/* 2. Intellectual Property Rights */}
            <section id="intellectual-property" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                2. {t('sections.intellectualProperty.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Our intellectual property</h3>
                <p>
                  We are the owner or the licensee of all intellectual property rights in our Services, including 
                  all source code, databases, functionality, software, website designs, audio, video, text, 
                  photographs, and graphics in the Services (collectively, the &ldquo;Content&rdquo;), as well as the trademarks, 
                  service marks, and logos contained therein (the &ldquo;Marks&rdquo;).
                </p>
                <p>
                  Our Content and Marks are protected by copyright and trademark laws and treaties in Indonesia, 
                  Australia, and around the world. The Content and Marks are provided in or through the Services 
                  &ldquo;AS IS&rdquo; for your personal, non-commercial use or internal business purpose only.
                </p>
              </div>
            </section>

            {/* 3. User Representations */}
            <section id="user-representations" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                3. {t('sections.userRepresentations.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  By using the Services, you represent and warrant that: (1) you have the legal capacity and you 
                  agree to comply with these Legal Terms; (2) you are not under the age of 13; (3) you are not a 
                  minor in the jurisdiction in which you reside, or if a minor, you have received parental permission 
                  to use the Services; (4) you will not access the Services through automated or non-human means; 
                  (5) you will not use the Services for any illegal or unauthorized purpose; and (6) your use of 
                  the Services will not violate any applicable law or regulation.
                </p>
              </div>
            </section>

            {/* 4. Purchases and Payment */}
            <section id="purchases-payment" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                4. {t('sections.purchasesPayment.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>We accept the following forms of payment:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Bank Transfer (Virtual Account)</li>
                  <li>Credit/Debit Cards (Visa, Mastercard)</li>
                  <li>E-Wallets (OVO, DANA, ShopeePay, LinkAja)</li>
                  <li>Retail Outlets (Indomaret, Alfamart)</li>
                  <li>QRIS Payment</li>
                </ul>
                <p>
                  You agree to provide current, complete, and accurate purchase and account information for all 
                  purchases made via the Services. All payments shall be in Indonesian Rupiah (IDR) unless otherwise specified.
                </p>
                <p>
                  We reserve the right to refuse any order placed through the Services. We may, in our sole discretion, 
                  limit or cancel quantities purchased per person, per household, or per order.
                </p>
              </div>
            </section>

            {/* 5. Subscriptions */}
            <section id="subscriptions" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                5. {t('sections.subscriptions.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Billing and Renewal</h3>
                <p>
                  Your subscription will continue and automatically renew unless canceled. You consent to our charging 
                  your payment method on a recurring basis without requiring your prior approval for each recurring charge, 
                  until such time as you cancel the applicable order.
                </p>
              </div>
            </section>

            {/* 6. Prohibited Activities */}
            <section id="prohibited-activities" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                6. {t('sections.prohibitedActivities.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  You may not access or use the Services for any purpose other than that for which we make the 
                  Services available. As a user of the Services, you agree not to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Systematically retrieve data or other content from the Services without written permission</li>
                  <li>Trick, defraud, or mislead us and other users</li>
                  <li>Circumvent, disable, or interfere with security-related features</li>
                  <li>Use the Services in a manner inconsistent with any applicable laws or regulations</li>
                  <li>Engage in unauthorized framing of or linking to the Services</li>
                  <li>Upload or transmit viruses, Trojan horses, or other harmful material</li>
                  <li>Engage in any automated use of the system</li>
                  <li>Attempt to impersonate another user or person</li>
                </ul>
              </div>
            </section>

            {/* 7. Privacy Policy */}
            <section id="privacy-policy" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                7. {t('sections.privacyPolicy.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  We care about data privacy and security. By using the Services, you agree to be bound by our 
                  Privacy Policy posted on the Services, which is incorporated into these Legal Terms. Please be 
                  advised the Services are hosted in Indonesia. If you access the Services from any other region 
                  of the world, you expressly consent to have your data transferred to and processed in Indonesia.
                </p>
              </div>
            </section>

            {/* 8. Governing Law */}
            <section id="governing-law" className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                8. {t('sections.governingLaw.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
              </div>
            </section>

            {/* 9. Contact Us */}
            <ContactSection />

          </div>
        </div>
      </div>
    </div>
  )
}
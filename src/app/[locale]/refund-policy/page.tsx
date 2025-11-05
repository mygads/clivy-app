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
    ? "Kebijakan Pengembalian Dana - Syarat dan Ketentuan Refund"
    : "Refund Policy - Terms and Conditions for Returns";
    
  const description = isIndonesian
    ? "Kebijakan pengembalian dana Genfity. Ketentuan refund untuk layanan digital, proses klaim, dan syarat pengembalian. Informasi lengkap tentang kebijakan pembayaran."
    : "Genfity's refund policy. Return terms for digital services, claim process, and refund conditions. Complete information about payment policies.";

  return generatePageMetadata({
    title,
    description,
    keywords: getKeywords('base'),
    locale,
  });
}

export default async function RefundPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'refund' })

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
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-3">
                    REFUNDS - All Sales Are Final
                  </h3>
                  <p className="text-red-700 dark:text-red-300 font-semibold">
                    All sales are final and no refund will be issued.
                  </p>
                </div>
                <p>
                  At <strong>Genfity</strong>, we do not provide refunds
                  for any of our digital services. This policy applies to all our services including 
                  website development, WhatsApp API services, subscriptions, and all other digital solutions.
                </p>
                <p>
                  <strong>Important:</strong> We do not provide refunds because every domain and website ordered 
                  will be automatically registered with our domain and server system. Additionally, digital 
                  services such as WhatsApp API subscriptions, custom development work, and consulting services 
                  are immediately provisioned upon payment.
                </p>
                <p>
                  <strong>Please ensure</strong> that the domain name, website design, and service specifications 
                  you order are correct before completing your purchase, as no changes or refunds will be possible 
                  after payment is processed.
                </p>
              </div>
            </section>

            {/* Service Categories */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('serviceCategories.title')}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-6">
                
                {/* Website Development Services */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Website Development & Domain Services
                  </h3>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                      ⚠️ No Refunds Available
                    </p>
                  </div>
                  <p className="mb-3">
                    For custom website development, web applications, and domain registration:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Domain names are automatically registered upon payment and cannot be refunded</li>
                    <li>Website development work begins immediately after payment confirmation</li>
                    <li>Custom development services are non-refundable once work has commenced</li>
                    <li>Please verify all domain names and specifications before completing purchase</li>
                  </ul>
                </div>

                {/* WhatsApp Services */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    WhatsApp API Services & Subscriptions
                  </h3>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                      ⚠️ No Refunds for Subscriptions
                    </p>
                  </div>
                  <p className="mb-3">
                    For WhatsApp API subscriptions, broadcast services, and chatbot solutions:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Monthly/yearly subscriptions are non-refundable</li>
                    <li>API access is activated immediately upon payment</li>
                    <li>No cancellations or refunds for unused subscription periods</li>
                    <li>Service suspension due to policy violations will not result in refunds</li>
                  </ul>
                </div>

                {/* Design Services */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Design Services (UI/UX, Branding)
                  </h3>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                      ⚠️ No Refunds Available
                    </p>
                  </div>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Design work begins immediately after payment and brief confirmation</li>
                    <li>No refunds for completed design concepts or revisions</li>
                    <li>All design files and assets are non-refundable once delivered</li>
                    <li>Please provide detailed requirements to avoid dissatisfaction</li>
                  </ul>
                </div>

                {/* Consulting Services */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    IT Consulting & SEO Services
                  </h3>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                      ⚠️ No Refunds Available
                    </p>
                  </div>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Consultation sessions are non-refundable once completed</li>
                    <li>SEO and marketing services are ongoing and non-refundable</li>
                    <li>Technical support services cannot be refunded</li>
                    <li>All consulting fees are final upon service delivery</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* No Refund Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Why We Don&apos;t Offer Refunds
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-3">
                    Digital Service Nature
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    Our digital services are immediately provisioned and activated upon payment. 
                    Domain registrations, server setups, and API access cannot be &ldquo;returned&rdquo; like physical products.
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Reasons for No Refund Policy:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Automatic Domain Registration:</strong> Domains are registered immediately and incur real costs</li>
                  <li><strong>Server Resource Allocation:</strong> Server space and resources are allocated upon purchase</li>
                  <li><strong>Immediate Service Activation:</strong> WhatsApp API and other services are activated instantly</li>
                  <li><strong>Custom Development Work:</strong> Development time and resources are committed immediately</li>
                  <li><strong>Third-party Costs:</strong> Many services involve third-party fees that cannot be recovered</li>
                </ul>

                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mt-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Before You Purchase
                  </h3>
                  <p className="mb-3">To ensure satisfaction, please:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Carefully review all service specifications and requirements</li>
                    <li>Double-check domain names and spelling before ordering</li>
                    <li>Contact us with any questions before making a purchase</li>
                    <li>Ensure you understand the scope and limitations of each service</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Customer Support */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Customer Support & Service Issues
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>
                  While we do not offer refunds, we are committed to providing excellent customer service 
                  and resolving any issues you may encounter with our services.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">If You Experience Issues</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Contact our customer service team immediately at <strong>genfity@gmail.com</strong></li>
                  <li>Provide detailed description of the issue you&apos;re experiencing</li>
                  <li>Include your order/transaction details for faster assistance</li>
                  <li>Our technical team will work to resolve the issue promptly</li>
                  <li>We will provide alternative solutions or service corrections when possible</li>
                </ol>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">What We Can Help With</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Technical issues with website functionality</li>
                  <li>WhatsApp API connection or configuration problems</li>
                  <li>Design revisions within agreed scope</li>
                  <li>Server or hosting-related issues</li>
                  <li>Service setup and configuration support</li>
                </ul>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mt-6">
                  <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-3">
                    Our Commitment
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    We stand behind the quality of our work and will make every effort to ensure 
                    your satisfaction within the agreed service scope, even though refunds are not available.
                  </p>
                </div>
              </div>
            </section>

            {/* Payment Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Payment Terms
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <p>All payments are processed securely through our payment gateway partners:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Bank Transfer:</strong> Virtual Account - Instant confirmation</li>
                  <li><strong>Credit/Debit Cards:</strong> Visa, Mastercard - Real-time processing</li>
                  <li><strong>E-Wallets:</strong> OVO, DANA, ShopeePay, LinkAja - Instant payment</li>
                  <li><strong>Retail Outlets:</strong> Indomaret, Alfamart - Cash payment available</li>
                  <li><strong>QRIS:</strong> Scan and pay with any compatible app</li>
                </ul>
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 mt-4">
                  <h3 className="text-xl font-semibold text-orange-800 dark:text-orange-200 mb-3">
                    Important Payment Notice
                  </h3>
                  <p className="text-orange-700 dark:text-orange-300">
                    Once payment is confirmed, services are immediately activated and domain registrations 
                    begin processing. <strong>All payments are final and non-refundable.</strong>
                  </p>
                </div>
              </div>
            </section>

            {/* Legal Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Legal Disclaimers
              </h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Service Limitations</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Force Majeure:</strong> We are not liable for service interruptions due to natural disasters, government regulations, or other uncontrollable events</li>
                  <li><strong>Third-Party Dependencies:</strong> Services dependent on external platforms (WhatsApp, domain registrars, etc.) may experience limitations beyond our control</li>
                  <li><strong>Technology Changes:</strong> Platform updates or API changes may affect service functionality</li>
                  <li><strong>Internet Connectivity:</strong> Client internet issues are not grounds for service complaints</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Responsibility Disclaimer</h3>
                <p>
                  By purchasing our services, you acknowledge that you understand the digital nature of our offerings 
                  and accept full responsibility for verifying all details before payment. We recommend consulting 
                  with our team if you have any questions about service specifications.
                </p>

                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Legal Note:</strong> This no-refund policy is legally binding and applies to all customers. 
                    By completing a purchase, you agree to these terms. This policy is governed by Indonesian law 
                    and any disputes will be resolved under Indonesian jurisdiction.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <ContactSection />

          </div>
        </div>
      </div>
    </div>
  )
}
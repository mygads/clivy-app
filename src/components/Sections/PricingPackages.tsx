"use client"

import { motion } from "framer-motion"
import { Check, HelpCircle, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

const packages = [
  {
    id: "basic-landing-page",
    name_en: "Basic Landing Page",
    name_id: "Landing Page Basic",
    description_en: "Simple and effective landing page with responsive design, contact form, and basic SEO optimization",
    description_id: "Landing page sederhana dan efektif dengan desain responsif, form kontak, dan optimasi SEO dasar",
    price_idr: 2500000,
    popular: false,
    features: [
      {
        included: true,
        text_en: "Responsive Design",
        text_id: "Desain Responsif"
      },
      {
        included: true,
        text_en: "Contact Form",
        text_id: "Form Kontak"
      },
      {
        included: true,
        text_en: "Basic SEO",
        text_id: "SEO Dasar"
      },
      {
        included: true,
        text_en: "3 Sections",
        text_id: "3 Bagian"
      },
      {
        included: false,
        text_en: "Premium Support",
        text_id: "Dukungan Premium"
      },
      {
        included: false,
        text_en: "Animations & Effects",
        text_id: "Animasi & Efek"
      },
      {
        included: false,
        text_en: "Analytics Integration",
        text_id: "Integrasi Analytics"
      },
    ],
  },
  {
    id: "premium-landing-page",
    name_en: "Premium Landing Page",
    name_id: "Landing Page Premium",
    description_en: "Advanced landing page with animations, advanced SEO, analytics integration, and premium support",
    description_id: "Landing page lanjutan dengan animasi, SEO lanjutan, integrasi analytics, dan dukungan premium",
    price_idr: 5000000,
    popular: true,
    features: [
      {
        included: true,
        text_en: "Premium Design",
        text_id: "Desain Premium"
      },
      {
        included: true,
        text_en: "Animations & Effects",
        text_id: "Animasi & Efek"
      },
      {
        included: true,
        text_en: "Advanced SEO",
        text_id: "SEO Lanjutan"
      },
      {
        included: true,
        text_en: "Analytics Integration",
        text_id: "Integrasi Analytics"
      },
      {
        included: true,
        text_en: "Unlimited Revisions",
        text_id: "Revisi Unlimited"
      },
      {
        included: true,
        text_en: "Premium Support",
        text_id: "Dukungan Premium"
      },
      {
        included: true,
        text_en: "Contact Form",
        text_id: "Form Kontak"
      },
    ],
  },
  {
    id: "enterprise-solution",
    name_en: "Enterprise Solution",
    name_id: "Solusi Enterprise",
    description_en: "Custom solutions for complex business needs with dedicated project management and ongoing support",
    description_id: "Solusi kustom untuk kebutuhan bisnis yang kompleks dengan manajemen proyek khusus dan dukungan berkelanjutan",
    price_idr: null,
    popular: false,
    features: [
      {
        included: true,
        text_en: "Custom Development",
        text_id: "Pengembangan Kustom"
      },
      {
        included: true,
        text_en: "Dedicated Project Manager",
        text_id: "Project Manager Khusus"
      },
      {
        included: true,
        text_en: "Advanced Integrations",
        text_id: "Integrasi Lanjutan"
      },
      {
        included: true,
        text_en: "24/7 Priority Support",
        text_id: "Dukungan Prioritas 24/7"
      },
      {
        included: true,
        text_en: "Scalable Architecture",
        text_id: "Arsitektur Scalable"
      },
      {
        included: true,
        text_en: "Ongoing Maintenance",
        text_id: "Maintenance Berkelanjutan"
      },
      {
        included: true,
        text_en: "Performance Optimization",
        text_id: "Optimasi Performa"
      },
    ],
  },
]

export default function PricingPackages() {
  const [mounted, setMounted] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Prevent hydration mismatch and detect mobile
  useEffect(() => {
    setMounted(true)
    // Check if screen is mobile size (< 768px)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])


  // Consistent price formatting - IDR currency only
  const formatPrice = (priceIdr: number | null) => {
    if (!priceIdr) return "Custom"

    // Format IDR with proper thousand separators (Indonesian format)
    const formattedIDR = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(priceIdr)

    return formattedIDR
  }

  // Get localized text - default English as per Clivy standards
  const getLocalizedText = (textEn: string, textId: string) => {
    return textEn // Default to English as per instructions
  }

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % packages.length)
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + packages.length) % packages.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Package Card Component - conditional motion based on device
  const PackageCard = ({ pkg, index, isCarousel = false }: {
    pkg: typeof packages[0],
    index: number,
    isCarousel?: boolean
  }) => {
    const cardContent = (
      <div className={`relative ${isCarousel ? "w-full max-w-sm mx-auto" : ""}`}>
        {/* Most Popular Badge - positioned at very top, outside card */}
        {pkg.popular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
            <div className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
              Most Popular
            </div>
          </div>
        )}

        <div
          className={`relative rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-900 ${pkg.popular ? "border-2 border-primary mt-4" : ""
            }`}
        >
          <div className="mb-6 text-center">
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
              {getLocalizedText(pkg.name_en, pkg.name_id)}
            </h3>
            <div className="mb-2 flex items-end justify-center">
              <span className="text-2xl font-bold text-primary md:text-3xl">
                {formatPrice(pkg.price_idr)}
              </span>
              {pkg.price_idr && (
                <span className="text-gray-500 dark:text-gray-400">/project</span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {getLocalizedText(pkg.description_en, pkg.description_id)}
            </p>
          </div>

          <div className="mb-6 space-y-3 md:space-y-4">
            {pkg.features.map((feature, i) => (
              <div key={i} className="flex items-center">
                {feature.included ? (
                  <Check className="mr-3 h-4 w-4 flex-shrink-0 text-green-500 md:h-5 md:w-5" />
                ) : (
                  <X className="mr-3 h-4 w-4 flex-shrink-0 text-gray-400 md:h-5 md:w-5" />
                )}
                <span
                  className={`text-sm ${feature.included
                      ? "text-gray-700 dark:text-gray-300"
                      : "text-gray-400 dark:text-gray-500"
                    }`}
                >
                  {getLocalizedText(feature.text_en, feature.text_id)}
                </span>
              </div>
            ))}
          </div>

          <button
            className={`w-full rounded-lg px-4 py-2 text-center font-medium transition-colors md:py-3 ${pkg.popular
                ? "bg-primary text-white hover:bg-primary-dark"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
          >
            {!pkg.price_idr ? "Contact Us" : "Choose Package"}
          </button>
        </div>
      </div>
    )

    // Use motion.div only on desktop (non-mobile devices)
    if (isMobile || isCarousel) {
      return <div key={pkg.id}>{cardContent}</div>
    }

    // Desktop: Use motion.div for animations
    return (
      <motion.div
        key={pkg.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
      >
        {cardContent}
      </motion.div>
    )
  }

  if (!mounted) {
    // Return a loading state or skeleton to prevent hydration mismatch
    return (
      <section className="bg-gray-50 py-20 dark:bg-dark" id="pricing">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 h-10 w-3/4 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="mb-12 h-6 w-1/2 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
                <div className="mb-6 text-center">
                  <div className="mb-2 h-8 w-3/4 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="mb-2 h-10 w-1/2 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gray-50 py-20 dark:bg-dark" id="pricing">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              How Much Does a <span className="text-primary">Website</span> Cost?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-12">
              We offer flexible packages to meet your business needs and budget
            </p>
          </motion.div>
        </div>

        {/* Mobile Carousel - visible only on mobile */}
        <div className="relative md:hidden">
          {/* Increased top padding to accommodate the badge positioned outside card */}
          <div className="pt-8 pb-2">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {packages.map((pkg, index) => (
                  <div key={pkg.id} className="w-full flex-shrink-0 px-4">
                    <PackageCard pkg={pkg} index={index} isCarousel={true} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:shadow-xl dark:bg-gray-800"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:shadow-xl dark:bg-gray-800"
            disabled={currentSlide === packages.length - 1}
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Dot Indicators */}
          <div className="mt-6 flex justify-center space-x-2">
            {packages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${index === currentSlide
                    ? "bg-primary w-6"
                    : "bg-gray-300 dark:bg-gray-600"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid - hidden on mobile, visible from MD up */}
        <div className="hidden gap-8 md:grid md:grid-cols-3">
          {packages.map((pkg, index) => (
            <PackageCard key={pkg.id} pkg={pkg} index={index} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <div className="max-w-2xl rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
            <div className="flex items-start">
              <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Can&apos;t find the right package?
                </h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  Every business has unique needs. Contact us for a free consultation and a customized quote
                  tailored to your specific requirements.
                </p>
                <a href="#contact" className="inline-flex items-center text-primary hover:underline">
                  Free Consultation
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

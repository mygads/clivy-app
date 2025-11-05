"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"
import {
  Monitor,
  Globe,
  Smartphone,
  Database,
  PenTool,
  MessageSquare,
  Send,
  MessageCircle,
  Inbox,
  TrendingUp,
  Briefcase,
  Headphones,
  Users,
  ChevronRight
} from 'lucide-react'
import { Button } from "../ui/button"

const services = [
  {
    icon: Monitor,
    titleKey: "customWebsite",
    descKey: "customWebsiteDesc",
  },
  {
    icon: Globe,
    titleKey: "webApp",
    descKey: "webAppDesc",
  },
  {
    icon: Smartphone,
    titleKey: "mobileDevelopment",
    descKey: "mobileDevelopmentDesc",
  },
  {
    icon: Database,
    titleKey: "corporateSystem",
    descKey: "corporateSystemDesc",
  },
  {
    icon: PenTool,
    titleKey: "uiUxDesign",
    descKey: "uiUxDesignDesc",
  },
  {
    icon: MessageSquare,
    titleKey: "whatsappAPI",
    descKey: "whatsappAPIDesc",
  },
  {
    icon: Send,
    titleKey: "whatsappBroadcast",
    descKey: "whatsappBroadcastDesc",
  },
  {
    icon: MessageCircle,
    titleKey: "whatsappChatbot",
    descKey: "whatsappChatbotDesc",
  },
  {
    icon: Inbox,
    titleKey: "whatsappTeamInbox",
    descKey: "whatsappTeamInboxDesc",
  },
  {
    icon: TrendingUp,
    titleKey: "seoSpecialist",
    descKey: "seoSpecialistDesc",
  },
  {
    icon: Briefcase,
    titleKey: "corporateBranding",
    descKey: "corporateBrandingDesc",
  },
  {
    icon: Users,
    titleKey: "itConsulting",
    descKey: "itConsultingDesc",
  },
]

export default function OurServices() {
  const t = useTranslations('Header')
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Prevent hydration mismatch and detect mobile
  useEffect(() => {
    setMounted(true)

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Service Card Component - unified for both mobile and desktop
  const ServiceCard = ({ service, index, isMoving = false }: {
    service: typeof services[0],
    index: number,
    isMoving?: boolean
  }) => {
    const cardContent = (
      <div className={`group rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-900 ${
        // Fixed dimensions for desktop, flexible for mobile moving cards
        isMoving ? "" : "h-64 flex flex-col"
        }`}>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white flex-shrink-0">
          <service.icon className="h-7 w-7" />
        </div>
        <div className={isMoving ? "" : "flex-1 flex flex-col"}>
          <h3 className={`mb-3 text-xl font-bold text-gray-900 dark:text-white ${isMoving ? "" : "min-h-[3.5rem] flex items-start"
            }`}>
            {t(service.titleKey)}
          </h3>
          <p className={`text-gray-600 dark:text-gray-300 ${isMoving ? "" : "flex-1 text-sm leading-relaxed"
            }`}>
            {t(service.descKey)}
          </p>
        </div>
      </div>
    )

    // For moving cards, return just the content without motion wrapper
    if (isMoving) {
      return cardContent
    }

    // For desktop grid, wrap with motion and apply fixed dimensions
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="h-64" // Fixed height container for consistent grid
      >
        {cardContent}
      </motion.div>
    )
  }

  // Transform services data for InfiniteMovingCards format using the same ServiceCard component
  const movingCardItems = services.map((service, index) => ({
    quote: <ServiceCard service={service} index={index} isMoving={true} />,
    name: t(service.titleKey),
    title: ""
  }))

  if (!mounted) {
    // Loading skeleton to prevent hydration mismatch
    return (
      <section className=" py-20 dark:bg-dark">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 h-10 w-3/4 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="mb-12 h-6 w-1/2 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 13 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900 h-64">
                <div className="mb-4 h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="mb-3 h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className=" py-20 dark:bg-dark">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Our <span className="text-primary">Services</span>
            </h2>
            <p className="mb-12 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              We offer comprehensive digital solutions to help your business thrive and grow in the digital world
            </p>
          </motion.div>
        </div>

        {/* Mobile: InfiniteMovingCards - visible only on mobile */}
        {isMobile && (
          <div className="mb-8 md:hidden">
            <div className="relative h-[300px] flex items-center justify-center overflow-hidden rounded-lg">
              <InfiniteMovingCards
                items={movingCardItems}
                direction="right"
                speed="slow"
                pauseOnHover={true}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Desktop: Grid Layout with fixed card heights - hidden on mobile, visible from MD up */}
        <div className="hidden gap-8 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}
        </div>

        <div className="mt-12 text-center">
          {/* <Link
            href="/products"
            className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
          >
            View All Services
          </Link> */}
          <Button
          >
            <Link href="/products">
              View All Services
            </Link>
              <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

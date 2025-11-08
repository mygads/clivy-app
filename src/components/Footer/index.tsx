"use client"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useLocale } from 'next-intl'

// Default menu data as specified - URLs updated to match navbar consistency
const defaultMenus = [
  {
    title: "Company",
    items: [
      { label: "About Us", href: "/about" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Appointment", href: "/appointment" },
    ],
  },
  {
    title: "Help",
    items: [
      { label: "FAQ", href: "/faq" },
      { label: "How to Order", href: "/how-to-order" },
      { label: "Contact Us", href: "/contact" },
      { label: "Customer Service", href: "/customer-service" },
    ],
  },
]

interface FooterProps {
  brand?: string
  tagline?: string
  contacts?: {
    whatsapp: string
    email: string
  }
  menus?: Array<{
    title: string
    items: Array<{
      label: string
      href: string
    }>
  }>
  year?: number
  cta?: {
    label: string
    href: string
  }
}

const Footer = ({
  contacts = {
    whatsapp: "+62 851 7431 4023",
    email: "clivy@gmail.com",
  },
  menus = defaultMenus,
  year = new Date().getFullYear(),
  cta = {
    label: "Consult Now",
    href: "/#contact",
  },
}: FooterProps = {}) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const locale = useLocale()

//   const nibInfo = `PT GENERATION INFINITY INDONESIA
// AHU-012127.AH.01.30.Tahun 2025
// NIB: 1303250009459
// Berkedudukan di BANDUNG`
  return (
    <>

      <footer className="text-white pt-32 md:pt-36 lg:pt-40 pb-6 md:pb-8 relative z-10 bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-950 to-black dark:from-gray-800 dark:via-gray-900 dark:to-black"></div>
        <div className="container mx-auto relative z-10 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
            <div className="lg:col-span-1">
              <div className="mb-4 md:mb-6">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  {/* Logo placeholder SVG */}
                  <Image
                    src="/logo-dark-mode.png"
                    alt="Clivy Logo"
                    width={160}
                    height={160}
                    className="rounded-full max-w-[120px] md:max-w-[140px] lg:max-w-[160px]"
                    priority={false}
                  />
                </div>
              </div>
                <h3 className="text-sm md:text-base font-semibold mb-4 md:mb-6 leading-tight text-balance text-gray-100 dark:text-gray-200">
                Empowering Your Brand,
                <br />
                Accelerating Your Digital Success
                </h3>

              <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                <div>
                  <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 mb-1">WhatsApp Number:</p>
                  <a
                    href={`tel:${contacts.whatsapp.replace(/\s+/g, "")}`}
                    className="text-white hover:text-green-400 dark:text-gray-200 dark:hover:text-green-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-400 focus-visible:outline-offset-2 rounded text-sm md:text-base"
                  >
                    {contacts.whatsapp}
                  </a>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 mb-1">Email Address:</p>
                  <a
                    href={`mailto:${contacts.email}`}
                    className="text-white hover:text-green-400 dark:text-gray-200 dark:hover:text-green-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-400 focus-visible:outline-offset-2 rounded text-sm md:text-base"
                  >
                    {contacts.email}
                  </a>
                </div>
              </div>

              <div className="flex gap-3 md:gap-4">
                {[
                  {
                    name: "Instagram",
                    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.073-1.689-.073-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                    link: "https://www.instagram.com/clivy.id"
                  },
                  // {
                  //   name: "Facebook",
                  //   icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                  //   link: "https://www.facebook.com/clivy"
                  // },
                  {
                    name: "LinkedIn",
                    icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
                    link: "https://www.linkedin.com/company/clivy"
                  },
                  // {
                  //   name: "TikTok",
                  //   icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
                  //   link: "https://www.tiktok.com/@clivy.id"
                  // },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 md:w-10 md:h-10 bg-gray-800 dark:bg-slate-700 rounded-full flex items-center justify-center hover:bg-red-600 dark:hover:bg-red-500 hover:scale-105 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400 focus-visible:outline-offset-2"
                    aria-label={`Visit our ${social.name}`}
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {menus.map((menu, index) => (
              <div key={index}>
                <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6 text-gray-100 dark:text-gray-200">{menu.title}</h3>
                <ul className="space-y-2 md:space-y-3">
                  {menu.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <Link
                        href={item.href}
                        className="text-gray-300 dark:text-gray-400 hover:text-green-400 dark:hover:text-green-300 hover:underline underline-offset-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-400 focus-visible:outline-offset-2 rounded text-sm md:text-base"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-700 dark:border-gray-600 pt-4 md:pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center text-xs md:text-sm text-gray-400 dark:text-gray-400 gap-3 md:gap-4">
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <Link
                  href={`/${locale}/terms-conditions`}
                  className="hover:text-green-400 dark:hover:text-green-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-400 focus-visible:outline-offset-2 rounded"
                >
                  Terms & Conditions
                </Link>
                <span className="text-gray-600 dark:text-gray-500">|</span>
                <Link
                  href={`/${locale}/privacy-policy`}
                  className="hover:text-green-400 dark:hover:text-green-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-400 focus-visible:outline-offset-2 rounded"
                >
                  Privacy Policy
                </Link>
                <span className="text-gray-600 dark:text-gray-500">|</span>
                <Link
                  href={`/${locale}/refund-policy`}
                  className="hover:text-green-400 dark:hover:text-green-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-400 focus-visible:outline-offset-2 rounded"
                >
                  Refund Policy
                </Link>
              </div>
              <div className="text-center md:text-right relative">
                <div 
                  className="relative inline-block"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <span className="text-gray-400 dark:text-gray-400 cursor-help  border-gray-500 dark:border-gray-400">
                    Copyright © {year}, Clivy App
                  </span>
                  
                  {/* Tooltip */}
                  {showTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-96 max-w-[90vw] bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50 p-4">
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white dark:border-t-slate-800"></div>
                      
                      {/* Content */}
                      {/* <div className="text-xs text-gray-700 dark:text-gray-300 text-left leading-relaxed whitespace-pre-line max-h-80 overflow-y-auto">
                        {nibInfo}
                      </div> */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer

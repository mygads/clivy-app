"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ScrollToTop from "@/components/ScrollToTop"
import WhatsAppFloatingButton from "@/components/ui/WhatsAppFloatingButton"
import React from "react"

export default function ConditionalLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Extract the base path segment after the locale (e.g., /en/dashboard -> dashboard)
  const segments = pathname.split("/")
  const basePath = segments.length > 2 ? segments[2] : "" 

  const isDashboard = basePath === "dashboard"
  const isAdminDashboard = pathname.includes("/admin/dashboard")

  // Don't show header/footer only for dashboard pages (customer and admin)
  const hideHeaderFooter = isDashboard || isAdminDashboard

  return (
    <>
      {!hideHeaderFooter && <Header />}
      {/* main tag removed as it's present in dashboard layout */}
      {children} 
      {!hideHeaderFooter && <Footer />}
      {!hideHeaderFooter && <ScrollToTop />}
      {!hideHeaderFooter && (
        <WhatsAppFloatingButton 
          phoneNumber="6285174314023"
          message="Hi! I'm interested in your services and would like to know more."
        />
      )}
    </>
  )
}

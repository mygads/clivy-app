"use client"

import type React from "react"
import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/CustomerSidebar"
import { DashboardNavbar } from "@/components/dashboard/CustomerNavbar"
import { SessionExpiryWarning } from "@/components/Auth/SessionExpiryWarning"
import CartSidebar from "@/components/Cart/CartSidebar"
import WhatsAppFloatingButton from "@/components/ui/WhatsAppFloatingButton"

interface DashboardLayoutClientProps {
  children: React.ReactNode
}

export default function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const [cartOpen, setCartOpen] = useState(false)
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardNavbar cartOpen={cartOpen} setCartOpen={setCartOpen} />
        <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800">{children}</main>
        <SessionExpiryWarning thresholdMinutes={30} />
      </SidebarInset>
      {/* Cart sidebar outside SidebarInset for proper viewport positioning */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      {/* WhatsApp floating button */}
      <WhatsAppFloatingButton 
        phoneNumber="628123456789"
        message="Hi! I need help with my dashboard or services."
      />
    </SidebarProvider>
  )
}

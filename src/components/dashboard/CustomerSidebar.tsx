"use client"

import type * as React from "react"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Bot,
  CreditCard,
  Home,
  MessageSquare,
  Package,
  Package2,
  Settings,
  ShoppingCart,
  Smartphone,
  TestTube,
  Users,
  Zap,
  Puzzle,
  FileText,
  TestTubes,
  Contact,
} from "lucide-react"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { getFullVersionString } from "@/lib/version"

// Menu data
const data = {
  mainNavigation: [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Product",
      url: "/dashboard/product",
      icon: ShoppingCart,
    },
    {
      title: "Transaction",
      url: "/dashboard/transaction",
      icon: CreditCard,
    },
  ],
  whatsappServices: {
    title: "WhatsApp Services",
    icon: MessageSquare,
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/whatsapp",
        icon: Home,
      },
      {
        title: "Perangkat",
        url: "/dashboard/whatsapp/devices",
        icon: Smartphone,
      },
      {
        title: "Contacts",
        url: "/dashboard/whatsapp/contacts",
        icon: Contact,
      },
      {
        title: "Broadcast",
        url: "/dashboard/whatsapp/campaign",
        icon: MessageSquare,
      },
      {
        title: "Subscription",
        url: "/dashboard/whatsapp/subscription",
        icon: Package,
      },
      {
        title: "Testing",
        url: "/dashboard/whatsapp/testing",
        icon: TestTubes,
      },
      {
        title: "API Documentation",
        url: "/dashboard/whatsapp/documentation",
        icon: FileText,
      },
    ],
  },
}

// Helper function untuk mengecek active menu
const isActivePath = (pathname: string, itemUrl: string) => {
  // Remove locale prefix (e.g., /en/, /id/) from pathname
  const cleanPathname = pathname.replace(/^\/[a-z]{2}\//, '/')
  
  // Exact match untuk dashboard utama
  if (itemUrl === "/dashboard") {
    return cleanPathname === "/dashboard" || cleanPathname === "/dashboard/home"
  }
  
  // Exact match untuk WhatsApp dashboard
  if (itemUrl === "/dashboard/whatsapp") {
    return cleanPathname === "/dashboard/whatsapp"
  }
  
  // Untuk menu lainnya, cek apakah path dimulai dengan itemUrl
  if (itemUrl !== "/dashboard" && itemUrl !== "/dashboard/whatsapp") {
    return cleanPathname.startsWith(itemUrl)
  }
  
  return false
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { theme, resolvedTheme } = useTheme()
  const { state, isMobile, setOpenMobile } = useSidebar()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-close sidebar on mobile/tablet when route changes
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, isMobile, setOpenMobile])

  const getLogoSrc = () => {
    if (!mounted) {
      // Return default during SSR to prevent hydration mismatch
      return "/logo.svg"
    }
    return resolvedTheme === 'dark' ? "/logo-dark-mode.svg" : "/logo.svg"
  }

  // Determine logo size based on sidebar state
  const getLogoSize = () => {
    if (state === "collapsed") {
      return { width: 48, height: 48 }
    }
    return { width: 140, height: 30 }
  }

  return (    
    <Sidebar collapsible="icon" {...props} className="border-none shadow-lg">        
      <SidebarHeader className="border-none bg-sidebar-background">        
        <div className={`flex items-center py-4 ${state === "collapsed" ? "justify-center px-2" : "justify-center px-4"}`}>
          <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
            <Image 
              src={getLogoSrc()}
              alt="Logo" 
              width={getLogoSize().width}
              height={getLogoSize().height}
              className={`transition-all duration-300 ${state === "collapsed" ? "min-w-[38px] min-h-[38px]" : ""}`}
              priority
            />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className={`bg-sidebar-background ${state === "collapsed" ? "px-1" : "px-2"}`}>          
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={`text-sm font-semibold text-sidebar-foreground/70 mb-2 px-2 ${state === "collapsed" ? "sr-only" : ""}`}>
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">              
              {data.mainNavigation.map((item) => {
                const isActive = isActivePath(pathname, item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <Link href={item.url} className="block w-full">
                      <button
                        className={`h-10 transition-all duration-200 relative overflow-hidden rounded-lg flex items-center gap-3 w-full ${
                          state === "collapsed" ? "px-2 justify-center" : "px-3"
                        } ${isActive 
                          ? 'bg-gradient-to-r from-primary to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity' 
                          : state === "collapsed"
                            ? 'hover:bg-sidebar-accent hover:shadow-md'
                            : 'hover:bg-sidebar-accent hover:shadow-md hover:scale-105 hover:border-l-2 hover:border-primary dark:hover:border-white'
                        }`}
                      >
                        <item.icon className={`${state === "collapsed" ? "h-5 w-5 flex-shrink-0" : "h-4 w-4"} transition-all duration-200 ${
                          isActive 
                            ? 'text-white drop-shadow-sm' 
                            : mounted && resolvedTheme === 'dark' 
                              ? 'text-white/80 group-hover:text-white' 
                              : 'text-gray-700 group-hover:text-gray-900'
                        }`} />
                        {state !== "collapsed" && (
                          <span className={`font-medium transition-all duration-200 ${
                            isActive 
                              ? 'text-white drop-shadow-sm' 
                              : mounted && resolvedTheme === 'dark' 
                                ? 'text-white/90 group-hover:text-white' 
                                : 'text-gray-800 group-hover:text-gray-900'
                          }`}>
                            {item.title}
                          </span>
                        )}
                        {isActive && state !== "collapsed" && (
                          <>
                            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-full opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none animate-pulse" />
                          </>
                        )}
                      </button>
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* <SidebarSeparator className={`my-4 bg-sidebar-border/30 ${state === "collapsed" ? "mx-1" : "mx-2"}`} /> */}
        
        {/* WhatsApp Services */}
        <SidebarGroup>
          <SidebarGroupLabel className={`text-sm font-semibold text-sidebar-foreground/70 mb-2 px-2 ${state === "collapsed" ? "sr-only" : ""}`}>
            WhatsApp Services
          </SidebarGroupLabel>
          <SidebarGroupContent>            
            <SidebarMenu className="gap-2">
              {data.whatsappServices.items.map((item) => {
                const isActive = isActivePath(pathname, item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <Link href={item.url} className="block w-full">
                      <button
                        className={`h-10 transition-all duration-200 relative overflow-hidden rounded-lg flex items-center gap-3 w-full ${
                          state === "collapsed" ? "px-2 justify-center" : "px-3"
                        } ${isActive 
                          ? 'bg-gradient-to-r from-primary to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity' 
                          : state === "collapsed"
                            ? 'hover:bg-sidebar-accent hover:shadow-md'
                            : 'hover:bg-sidebar-accent hover:shadow-md hover:scale-105 hover:border-l-2 hover:border-primary dark:hover:border-white'
                        }`}
                      >
                        <item.icon className={`${state === "collapsed" ? "h-5 w-5 flex-shrink-0" : "h-4 w-4"} transition-all duration-200 ${
                          isActive 
                            ? 'text-white drop-shadow-sm' 
                            : mounted && resolvedTheme === 'dark' 
                              ? 'text-white/80 group-hover:text-white' 
                              : 'text-gray-700 group-hover:text-gray-900'
                        }`} />
                        {state !== "collapsed" && (
                          <span className={`font-medium transition-all duration-200 ${
                            isActive 
                              ? 'text-white drop-shadow-sm' 
                              : mounted && resolvedTheme === 'dark' 
                                ? 'text-white/90 group-hover:text-white' 
                                : 'text-gray-800 group-hover:text-gray-900'
                          }`}>
                            {item.title}
                          </span>
                        )}
                        {isActive && state !== "collapsed" && (
                          <>
                            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-full opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none animate-pulse" />
                          </>
                        )}
                      </button>
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>        
        </SidebarGroup>

      <SidebarSeparator className={`my-4 bg-sidebar-border/30 ${state === "collapsed" ? "mx-1" : "mx-2"}`} />
      </SidebarContent>          
      <SidebarFooter className={`bg-sidebar-background border-none ${state === "collapsed" ? "p-1" : "p-2"}`}>
        {/* Version Display */}
        {state !== "collapsed" && (
          <div className="px-3 py-2">
            <p className="text-xs text-sidebar-foreground/50 text-center">
              {getFullVersionString()}
            </p>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

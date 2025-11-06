"use client"

import type React from "react"
import { useCart, type CartItem } from "./CartContext"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, X, Trash2, ArrowRight } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { useLocale } from "next-intl"
import { usePathname } from "next/navigation"
import { useCurrency, getCurrencySymbol } from "@/hooks/useCurrency"

interface CartSidebarProps {
  open: boolean
  onClose: () => void
}

const CartSidebar: React.FC<CartSidebarProps> = ({ open, onClose }) => {
  const { items, removeFromCart, clearCart, totalPrice, totalItems } = useCart()
  const locale = useLocale()
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLDivElement>(null)
  
  const { currency } = useCurrency()
  const isDashboardPage = pathname.includes('/dashboard')

  // Helper function to format price
  const formatPrice = (price: number) => {
    return `${getCurrencySymbol(currency)}${price.toLocaleString()}`
  }

  // Helper function to get localized name
  const getLocalizedName = (item: CartItem) => {
    if (item.name_en && item.name_id) {
      return locale === "en" ? item.name_en : item.name_id
    }
    return item.name
  }

  // Helper function to get localized price (IDR only now)
  const getLocalizedPrice = (item: CartItem) => {
    // Always use IDR price
    return item.price_idr || item.price
  }

  // Handle click outside to close cart
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, onClose])

  return (
    <>
      {/* Cart Sidebar */}      
      <AnimatePresence>
        {open && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`fixed right-0 w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[100000] flex flex-col ${
              isDashboardPage 
                ? 'top-14 h-[calc(100vh-3.5rem)]'
                : 'top-0 h-full'
            }`}
          >
            {/* Header with gradient */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-dark to-primary"></div>
              <div className="relative z-10 flex items-center justify-between px-4 sm:px-4 md:px-5 py-3 sm:py-2.5 md:py-3">
                <div className="flex items-center gap-2 text-white">
                  <ShoppingCart className="h-5 w-5" />
                  <h2 className="text-lg sm:text-lg md:text-xl font-bold">Cart</h2>
                  <div className="ml-2 flex h-5 min-w-5 sm:h-5 sm:min-w-5 md:h-6 md:min-w-6 items-center justify-center rounded-full bg-white text-xs font-medium text-primary">
                    {items.length}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-full bg-white/20 p-1.5 text-white transition-colors hover:bg-white/30"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Empty Cart State */}
            {items.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                >
                  <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
                    <ShoppingCart className="h-16 w-16 text-primary/30" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    Your cart is empty
                  </h3>
                  <p className="mb-6 text-gray-600 dark:text-gray-400">
                    Add WhatsApp packages to get started!
                  </p>
                  <Link
                    href={`/${locale}/layanan/whatsapp-api#pricing`}
                    onClick={onClose}
                    className="rounded-lg bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-white transition-all hover:shadow-lg hover:shadow-primary/25"
                  >
                    Browse Packages
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Cart Items */}
            {items.length > 0 && (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-6">
                  {/* WhatsApp Package Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <FaWhatsapp className="h-5 w-5 text-green-500" />
                    <h3 className="font-medium text-base sm:text-base md:text-lg">WhatsApp Package</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-green-500/30 to-transparent"></div>
                  </div>

                  {/* Single WhatsApp Package */}
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="group relative rounded-xl border border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20 p-4 shadow-sm transition-all hover:shadow-md"
                      >
                        {/* WhatsApp service indicator */}
                        <div className="absolute top-2 right-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                        
                        <div className="flex gap-4">
                          {/* WhatsApp Icon */}
                          <div className="h-16 w-16 overflow-hidden rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center border border-green-200 dark:border-green-700">
                            <FaWhatsapp className="h-10 w-10 text-green-500" />
                          </div>

                          {/* Package Info */}
                          <div className="flex flex-1 flex-col">
                            <div className="mb-1 font-medium flex items-center gap-2">
                              {getLocalizedName(item)}
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full dark:bg-green-900/50 dark:text-green-300">
                                {item.duration === 'month' ? 'Monthly' : 'Yearly'}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Up to {item.maxSession} Sessions
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                {formatPrice(getLocalizedPrice(item))}
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal ml-1">
                                  / {item.duration === 'month' ? 'mo' : 'yr'}
                                </span>
                              </div>

                              {/* Delete Button */}
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Clear Cart Button */}
                  {items.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={clearCart}
                      className="mt-4 w-full rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      Clear Cart
                    </motion.button>
                  )}
                </div>

                {/* Footer with Total and Checkout */}
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-lg font-medium">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  
                  <Link
                    href={`/${locale}/checkout`}
                    onClick={onClose}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-6 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02]"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999]"
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default CartSidebar

"use client"

import type React from "react"
import { useCart, type CartItem } from "./CartContext"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, X, Trash2, Plus, Minus, ArrowRight, Check, ChevronDown } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { useLocale } from "next-intl"
import { usePathname } from "next/navigation"
import { useCurrency, getCurrencySymbol, formatPrice as formatCurrencyPrice } from "@/hooks/useCurrency"

interface CartSidebarProps {
  open: boolean
  onClose: () => void
}

const CartSidebar: React.FC<CartSidebarProps> = ({ open, onClose }) => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleItemSelection,
    selectAllItems,
    selectedItemsTotal,
    selectedItemsCount,
  } = useCart()
  const locale = useLocale()
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLDivElement>(null)
  
  // Use IP-based currency detection
  const { currency, isLoading: currencyLoading } = useCurrency()

  // Check if we're in a dashboard page
  const isDashboardPage = pathname.includes('/dashboard')

  // Helper function to format price based on detected currency (not locale)
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

  // Helper function to get localized price based on detected currency
  const getLocalizedPrice = (item: CartItem) => {
    if (item.price_usd && item.price_idr) {
      return currency === "usd" ? item.price_usd : item.price_idr
    }
    return item.price
  }
  const total = items.reduce((sum, item) => sum + getLocalizedPrice(item) * item.qty, 0)
  const allSelected = items.length > 0 && items.every((item) => item.selected)

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
  }, [open, onClose])  // Group items by category only for proper visual hierarchy
  const groupedItems = () => {
    const groups: Record<string, {
      packages: CartItem[],
      addons: CartItem[]
    }> = {}
    
    const ungroupedItems: CartItem[] = []
    
    items.forEach(item => {
      if (item.category && item.type) {
        const groupKey = item.category
        if (!groups[groupKey]) {
          groups[groupKey] = { packages: [], addons: [] }
        }
        
        if (item.type === 'addon') {
          groups[groupKey].addons.push(item)
        } else {
          groups[groupKey].packages.push(item)
        }
      } else {
        // Items without proper categorization (WhatsApp, legacy items)
        ungroupedItems.push(item)
      }
    })
    
    return { groups, ungroupedItems }
  }
  
  const { groups, ungroupedItems } = groupedItems()
  
  const handleQuantityUpdate = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }
  
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
                ? 'top-14 h-[calc(100vh-3.5rem)]' // Dashboard: start below navbar (h-14 = 3.5rem)
                : 'top-0 h-full' // Other pages: full height
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

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-3 md:p-4 lg:p-5">
          <AnimatePresence initial={false}>
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex h-full flex-col items-center justify-center text-center"
              >
                <div className="relative mb-6 h-32 w-32 opacity-20">
                  <ShoppingCart className="h-full w-full" strokeWidth={1} />
                </div>
                <h3 className="mb-2 text-lg sm:text-lg md:text-xl font-medium">Keranjang Kosong</h3>
                <p className="mb-6 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                  Tambahkan beberapa produk untuk melanjutkan belanja
                </p>
                <Link href="/products" onClick={onClose}>
                  <button className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white dark:bg-primary/20">
                    Lanjutkan Belanja
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </motion.div>
            ) : (
              <>
                {/* Select All Option */}
                <div className="mb-4 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border ${
                        allSelected ? "bg-primary border-primary text-white" : "border-gray-300 dark:border-gray-600"
                      }`}
                      onClick={() => selectAllItems(!allSelected)}
                    >
                      {allSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className="text-sm font-medium">Pilih Semua</span>
                  </label>
                  <button onClick={clearCart} className="text-sm text-red-500 hover:underline">
                    Hapus Semua
                  </button>
                </div>                {/* Grouped Items by Category */}
                {Object.entries(groups).map(([categoryName, groupItems]) => {
                  const hasPackages = groupItems.packages.length > 0
                  const hasAddons = groupItems.addons.length > 0
                  
                  return (
                    <div key={categoryName} className="mb-6">
                      {/* Category Header */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-base sm:text-base md:text-lg text-gray-900 dark:text-white">
                          {categoryName}
                        </h3>
                        <div className="w-full h-px bg-gradient-to-r from-primary/30 to-transparent mt-1"></div>
                      </div>

                      {/* Packages */}
                      {hasPackages && (
                        <div className="mb-4">
                          <ul className="space-y-3 sm:space-y-3 md:space-y-4">
                            {groupItems.packages.map((item) => (
                              <motion.li
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className={`group relative rounded-xl border p-3 sm:p-3 md:p-4 shadow-sm transition-all hover:shadow-md ${
                                  item.selected
                                    ? "border-primary/30 bg-primary/5 dark:border-primary/20 dark:bg-primary/20"
                                    : "border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-800/50"
                                }`}
                              >
                                <div className="flex gap-3 sm:gap-3 md:gap-4">
                                  <div
                                    className="flex items-center justify-center cursor-pointer"
                                    onClick={() => toggleItemSelection(item.id, !item.selected)}
                                  >
                                    <div
                                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                        item.selected
                                          ? "bg-primary border-primary text-white"
                                          : "border-gray-300 dark:border-gray-600"
                                      }`}
                                    >
                                      {item.selected && <Check className="h-3 w-3" />}
                                    </div>
                                  </div>
                                  <div className="h-14 w-14 sm:h-14 sm:w-14 md:h-16 md:w-16 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                                    {item.image && (
                                      <Image
                                        src={item.image || "/placeholder.svg"}
                                        alt={getLocalizedName(item)}
                                        width={64}
                                        height={64}
                                        className="h-full w-full object-cover"
                                      />
                                    )}
                                  </div>
                                  <div className="flex flex-1 flex-col min-w-0">
                                    <div className="mb-1 font-medium text-sm sm:text-sm md:text-base break-words">{getLocalizedName(item)}</div>
                                    <div className="mb-3 text-sm text-primary dark:text-gray-200 break-words">{formatPrice(getLocalizedPrice(item))}</div>
                                    <div className="mt-auto flex items-center">
                                      <div className="flex items-center rounded-full border border-gray-200 dark:border-gray-700">
                                        <button
                                          onClick={() => handleQuantityUpdate(item.id, Math.max(0, item.qty - 1))}
                                          className="flex h-7 w-7 sm:h-7 sm:w-7 md:h-8 md:w-8 items-center justify-center rounded-l-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                                          aria-label="Kurangi jumlah"
                                        >
                                          <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="flex h-7 w-7 sm:h-7 sm:w-7 md:h-8 md:w-8 items-center justify-center text-sm font-medium tabular-nums">
                                          {item.qty}
                                        </span>
                                        <button
                                          onClick={() => updateQuantity(item.id, item.qty + 1)}
                                          disabled={item.type === 'whatsapp'} // Disable quantity increase for WhatsApp services
                                          className={`flex h-7 w-7 sm:h-7 sm:w-7 md:h-8 md:w-8 items-center justify-center rounded-r-full transition-colors ${
                                            item.type === 'whatsapp' 
                                              ? 'opacity-50 cursor-not-allowed' 
                                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                          }`}
                                          aria-label="Tambah jumlah"
                                        >
                                          <Plus className="h-3 w-3" />
                                        </button>
                                      </div>
                                      <div className="ml-auto text-sm font-medium break-words">
                                        {formatPrice(getLocalizedPrice(item) * item.qty)}
                                      </div>
                                      <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="ml-2 flex h-7 w-7 sm:h-7 sm:w-7 md:h-8 md:w-8 items-center justify-center rounded-full transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                                        aria-label="Hapus"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}                      
                      {/* Add-ons with visual hierarchy */}
                      {hasAddons && (
                        <div className="ml-3 relative">
                          {/* Improved downward arrow indicator */}
                          <div className="absolute -top-2 -left-2 flex items-center">
                            <ChevronDown className="h-4 w-4 text-primary dark:text-white" />
                          </div>
                          
                          <div className="border-l-2 border-primary/20 dark:border-white/20 pl-4">
                            <h4 className="font-medium text-sm mb-3 text-gray-800 dark:text-gray-200 flex items-center">
                              <span className="mr-2">Add-ons</span>
                              <span className="text-xs bg-primary/10 text-primary dark:text-white dark:bg-white/20 px-2 py-0.5 rounded-full">
                                {groupItems.addons.length}
                              </span>
                            </h4>
                            <ul className="space-y-3 sm:space-y-3 md:space-y-4">
                              {groupItems.addons.map((item) => (
                                <motion.li
                                  key={item.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                  className={`group relative rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
                                    item.selected
                                      ? "border-primary/30 bg-primary/5 dark:border-primary/20 dark:bg-primary/20"
                                      : "border-primary/20 bg-white dark:border-primary/10 dark:bg-gray-800/50"
                                  }`}
                                >
                                  <div className="flex gap-4">
                                    <div
                                      className="flex items-center justify-center cursor-pointer"
                                      onClick={() => toggleItemSelection(item.id, !item.selected)}
                                    >
                                      <div
                                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                          item.selected
                                            ? "bg-primary border-primary text-white"
                                            : "border-gray-300 dark:border-gray-600"
                                        }`}
                                      >
                                        {item.selected && <Check className="h-3 w-3" />}
                                      </div>
                                    </div>
                                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-primary/10 dark:bg-white/20">
                                      {item.image && (
                                        <Image
                                          src={item.image || "/placeholder.svg"}
                                          alt={getLocalizedName(item)}
                                          width={64}
                                          height={64}
                                          className="h-full w-full object-cover"
                                        />
                                      )}
                                    </div>
                                    <div className="flex flex-1 flex-col">
                                      <div className="mb-1 font-medium">{getLocalizedName(item)}</div>
                                      <div className="mb-3 text-sm text-primary dark:text-gray-200">{formatPrice(getLocalizedPrice(item))}</div>
                                      <div className="mt-auto flex items-center">
                                        <div className="flex items-center rounded-full border border-gray-200 dark:border-gray-700">
                                          <button
                                            onClick={() => handleQuantityUpdate(item.id, Math.max(0, item.qty - 1))}
                                            className="flex h-8 w-8 items-center justify-center rounded-l-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                                            aria-label="Kurangi jumlah"
                                          >
                                            <Minus className="h-3 w-3" />
                                          </button>
                                          <span className="flex h-8 w-8 items-center justify-center text-sm font-medium tabular-nums">
                                            {item.qty}
                                          </span>
                                          <button
                                            onClick={() => updateQuantity(item.id, item.qty + 1)}
                                            className="flex h-8 w-8 items-center justify-center rounded-r-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                                            aria-label="Tambah jumlah"
                                          >
                                            <Plus className="h-3 w-3" />
                                          </button>
                                        </div>
                                        <div className="ml-auto text-sm font-medium">
                                          {formatPrice(getLocalizedPrice(item) * item.qty)}
                                        </div>
                                        <button
                                          onClick={() => removeFromCart(item.id)}
                                          className="ml-2 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                                          aria-label="Hapus"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}                  {/* Ungrouped Items (WhatsApp, Legacy items) */}
                {ungroupedItems.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FaWhatsapp className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium text-base sm:text-base md:text-lg">WhatsApp Services</h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-green-500/30 to-transparent"></div>
                    </div>
                    <ul className="space-y-3 sm:space-y-3 md:space-y-4">
                      {ungroupedItems.map((item) => (
                        <motion.li
                          key={item.id}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0, scale: 0.9 }}
                          transition={{ type: "spring", damping: 25, stiffness: 200 }}
                          className={`group relative rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
                            item.selected
                              ? "border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                              : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
                          }`}
                        >
                          {/* WhatsApp service indicator */}
                          <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                          
                          <div className="flex gap-4">
                            <div
                              className="flex items-center justify-center cursor-pointer"
                              onClick={() => toggleItemSelection(item.id, !item.selected)}
                            >
                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                  item.selected
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "border-gray-300 dark:border-gray-600"
                                }`}
                              >
                                {item.selected && <Check className="h-3 w-3" />}
                              </div>
                            </div>
                            <div className="h-16 w-16 overflow-hidden rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center border border-green-200 dark:border-green-700">
                              <FaWhatsapp className="h-10 w-10 text-green-500" />
                            </div>
                            <div className="flex flex-1 flex-col">
                              <div className="mb-1 font-medium flex items-center gap-2">
                                {getLocalizedName(item)}
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full dark:bg-green-900/50 dark:text-green-300">
                                  Premium
                                </span>
                              </div>
                              <div className="mb-3 text-sm text-green-600 dark:text-green-400 font-semibold">
                                {formatPrice(getLocalizedPrice(item))}
                              </div>
                              <div className="mt-auto flex items-center">
                                {/* Quantity controls disabled for WhatsApp */}
                                <div className="flex items-center rounded-full border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30">
                                  <div className="flex h-8 w-8 items-center justify-center text-gray-400">
                                    <Minus className="h-3 w-3 opacity-30" />
                                  </div>
                                  <span className="flex h-8 w-8 items-center justify-center text-sm font-medium tabular-nums text-green-600 dark:text-green-400">
                                    1
                                  </span>
                                  <div className="flex h-8 w-8 items-center justify-center text-gray-400">
                                    <Plus className="h-3 w-3 opacity-30" />
                                  </div>
                                </div>
                                <div className="ml-auto text-sm font-medium text-green-600 dark:text-green-400">
                                  {formatPrice(getLocalizedPrice(item) * item.qty)}
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="ml-2 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                                  aria-label="Hapus"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-3 md:p-4 lg:p-5 dark:border-gray-800 dark:bg-gray-900/80">
          {items.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Subtotal ({selectedItemsCount} item)</span>
                <span className="break-words">{formatPrice(selectedItemsTotal)}</span>
              </div>
              <div className="mb-6 flex items-center justify-between font-medium">
                <span className="text-base">Total</span>
                <span className="text-lg break-words">{formatPrice(selectedItemsTotal)}</span>
              </div>
              <div className="space-y-3">
                <Link href="/checkout" onClick={onClose}>
                  <button
                    className="relative w-full overflow-hidden rounded-lg bg-primary py-2.5 font-medium text-white transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-70"
                    disabled={selectedItemsCount === 0}
                  >
                    <span className="relative z-10">Checkout ({selectedItemsCount})</span>
                    <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
                  </button>
                </Link>
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-700 py-2.5 text-sm text-red-700 dark:text-red-300 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:border-white"
                  onClick={clearCart}
                  disabled={items.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove Cart</span>                
                  </button>
              </div>
            </>
          )}
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default CartSidebar

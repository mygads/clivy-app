"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Check, ShoppingCart, Zap, TrendingUp, Shield, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useCart } from "@/components/Cart/CartContext"
import { useLocale } from "next-intl"

interface WhatsAppPackage {
  id: string
  name: string
  description: string | null
  priceMonth: number
  priceYear: number
  maxSession: number
  recommended?: boolean
  yearlyDiscount: number
}

export default function PricingSection() {
  const [packages, setPackages] = useState<WhatsAppPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month')
  const router = useRouter()
  const { addToCart, buyNow } = useCart()
  const locale = useLocale()

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/public/whatsapp/packages')
      const data = await response.json()
      
      if (data.success) {
        setPackages(data.data)
      } else {
        toast.error('Gagal memuat paket')
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast.error('Terjadi kesalahan saat memuat paket')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (pkg: WhatsAppPackage) => {
    const price = billingCycle === 'month' ? pkg.priceMonth : pkg.priceYear
    
    // Create cart item with proper format for CartContext
    const cartItem = {
      id: pkg.id,
      name: `${pkg.name} - ${billingCycle === 'month' ? 'Bulanan' : 'Tahunan'}`,
      name_en: `${pkg.name} - ${billingCycle === 'month' ? 'Monthly' : 'Yearly'}`,
      name_id: `${pkg.name} - ${billingCycle === 'month' ? 'Bulanan' : 'Tahunan'}`,
      price: price,
      price_idr: price,
      duration: billingCycle,
      maxSession: pkg.maxSession,
      qty: 1,
      image: '/images/whatsapp-icon.png'
    }

    // Add to cart using CartContext
    addToCart(cartItem)
    toast.success('Paket berhasil ditambahkan ke keranjang!')
  }

  const handleBuyNow = (pkg: WhatsAppPackage) => {
    const price = billingCycle === 'month' ? pkg.priceMonth : pkg.priceYear
    
    // Create cart item with proper format for CartContext
    const cartItem = {
      id: pkg.id,
      name: `${pkg.name} - ${billingCycle === 'month' ? 'Bulanan' : 'Tahunan'}`,
      name_en: `${pkg.name} - ${billingCycle === 'month' ? 'Monthly' : 'Yearly'}`,
      name_id: `${pkg.name} - ${billingCycle === 'month' ? 'Bulanan' : 'Tahunan'}`,
      price: price,
      price_idr: price,
      duration: billingCycle,
      maxSession: pkg.maxSession,
      qty: 1,
      image: '/images/whatsapp-icon.png'
    }

    // Use buyNow from CartContext - it will clear cart, add item, and redirect to checkout
    buyNow(cartItem)
    toast.success('Mengarahkan ke halaman checkout...')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getFeatures = (maxSession: number, packageName: string) => {
    const baseFeatures = [
      `${maxSession} WhatsApp Sessions`,
      'Webhook Integration',
      'Send & Receive Messages',
      'Media Support (Image, Video, Audio)',
      'Auto-reply & Chatbot',
      'Message Templates',
      'Real-time Dashboard',
      '24/7 Technical Support'
    ]

    if (packageName.toLowerCase().includes('business') || packageName.toLowerCase().includes('profesional')) {
      baseFeatures.push('Priority Support', 'Advanced Analytics')
    }

    if (packageName.toLowerCase().includes('enterprise')) {
      baseFeatures.push('Dedicated Account Manager', 'Custom Integration', 'SLA Guarantee')
    }

    return baseFeatures
  }

  if (loading) {
    return (
      <section id="pricing" className="relative z-10 py-16 md:py-20 lg:py-28 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent" />
            <p className="mt-4 text-body-color">Memuat paket WhatsApp API...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="pricing" className="relative z-10 py-12 sm:py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-8 sm:mb-12 max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
          >
            Harga <span className="text-primary">WhatsApp API</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 sm:mb-12 text-sm sm:text-base text-gray-600 dark:text-gray-300"
          >
            Pilih paket yang sesuai dengan kebutuhan bisnis Anda. Hemat hingga 20% dengan paket tahunan!
          </motion.p>
        </div>

        {/* Billing Cycle Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 flex justify-center"
        >
          <div className="inline-flex rounded-lg bg-white dark:bg-gray-dark p-1 shadow-md">
            <button
              onClick={() => setBillingCycle('month')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'month'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-body-color hover:text-red-600'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setBillingCycle('year')}
              className={`px-6 py-2 rounded-md font-medium transition-all relative ${
                billingCycle === 'year'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-body-color hover:text-green-600'
              }`}
            >
              Tahunan
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
          {packages.map((pkg, index) => {
            const price = billingCycle === 'month' ? pkg.priceMonth : pkg.priceYear
            const features = getFeatures(pkg.maxSession, pkg.name)
            const isRecommended = pkg.recommended || pkg.name.toLowerCase().includes('business')

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {isRecommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Paling Populer
                    </div>
                  </div>
                )}

                <div className={`h-full rounded-2xl bg-white dark:bg-gray-dark p-8 shadow-lg transition-all duration-300 hover:shadow-xl border-2 ${
                  isRecommended 
                    ? 'border-red-500 dark:border-red-600' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}>
                  {/* Package Name */}
                  <h3 className="mb-3 text-2xl font-bold text-black dark:text-white">
                    {pkg.name}
                  </h3>

                  {/* Description */}
                  {pkg.description && (
                    <p className="mb-6 text-sm text-body-color">
                      {pkg.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-black dark:text-white">
                        {formatPrice(price)}
                      </span>
                      <span className="text-body-color">
                        /{billingCycle === 'month' ? 'bulan' : 'tahun'}
                      </span>
                    </div>
                    {billingCycle === 'year' && pkg.yearlyDiscount > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="text-gray-400 line-through">
                          {formatPrice(pkg.priceMonth * 12)}
                        </span>
                        <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                          Hemat {pkg.yearlyDiscount.toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="mb-8 space-y-3">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-body-color">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handleBuyNow(pkg)}
                      className={`w-full rounded-lg px-6 py-3 text-center text-base font-semibold text-white transition duration-300 ${
                        isRecommended
                          ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl'
                          : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900'
                      }`}
                    >
                      Beli Sekarang
                    </button>
                    <button
                      onClick={() => handleAddToCart(pkg)}
                      className="w-full rounded-lg border-2 border-red-600 px-6 py-3 text-center text-base font-semibold text-red-600 hover:bg-red-600 hover:text-white transition duration-300 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Tambah ke Keranjang
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <Zap className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
              Aktivasi Instant
            </h4>
            <p className="text-sm text-body-color">
              Otomatis aktif setelah pembayaran dikonfirmasi
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
              Pembayaran Aman
            </h4>
            <p className="text-sm text-body-color">
              Berbagai metode pembayaran yang aman dan terpercaya
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
              Support 24/7
            </h4>
            <p className="text-sm text-body-color">
              Tim support siap membantu kapan saja
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

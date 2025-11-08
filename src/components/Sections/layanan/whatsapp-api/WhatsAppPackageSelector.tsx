"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, ShoppingCart, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/components/Cart/CartContext"
import { formatCurrency } from "@/lib/utils"
import { useLocale } from "next-intl"

interface WhatsAppPackage {
  id: string
  name: string
  description: string | null
  priceMonth: number  // IDR only
  priceYear: number   // IDR only
  maxSession: number
  yearlyDiscount: number
  recommended: boolean
}

export default function WhatsAppPackageSelector() {
  const [packages, setPackages] = useState<WhatsAppPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<{ [key: string]: 'month' | 'year' }>({})
  
  const { addToCart, items } = useCart()
  const locale = useLocale()

  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/public/whatsapp/packages')
        const data = await response.json()

        if (data.success) {
          setPackages(data.data)
          // Set default duration to 'month' for all packages
          const defaultDurations: { [key: string]: 'month' | 'year' } = {}
          data.data.forEach((pkg: WhatsAppPackage) => {
            defaultDurations[pkg.id] = 'month'
          })
          setSelectedDuration(defaultDurations)
        } else {
          setError(data.message || 'Failed to fetch packages')
        }
      } catch (err) {
        console.error('Error fetching packages:', err)
        setError('Failed to load WhatsApp packages')
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  // Get localized name (you can extend this with translation files)
  const getLocalizedName = (pkg: WhatsAppPackage) => {
    // For now, return package name as is
    // You can add translation logic here if needed
    return pkg.name
  }

  // Check if package is in cart (simplified - no type check needed)
  const isInCart = (packageId: string, duration: 'month' | 'year') => {
    return items.some(
      item => item.id === packageId && item.duration === duration
    )
  }

  // Handle add to cart
  const handleAddToCart = (pkg: WhatsAppPackage) => {
    const duration = selectedDuration[pkg.id] || 'month'
    const price = duration === 'month' ? pkg.priceMonth : pkg.priceYear

    addToCart({
      id: pkg.id,
      name: `${pkg.name} - ${duration === 'month' ? 'Monthly' : 'Yearly'}`,
      name_en: `${pkg.name} - ${duration === 'month' ? 'Monthly' : 'Yearly'}`,
      name_id: `${pkg.name} - ${duration === 'month' ? 'Bulanan' : 'Tahunan'}`,
      price: price,
      price_idr: price,  // IDR only
      image: '/images/whatsapp-icon.png',
      qty: 1,
      duration: duration,
      maxSession: pkg.maxSession
    })
  }

  // Toggle duration
  const toggleDuration = (packageId: string) => {
    setSelectedDuration(prev => ({
      ...prev,
      [packageId]: prev[packageId] === 'month' ? 'year' : 'month'
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <section className="bg-white dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your WhatsApp API Plan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Select the perfect plan for your business needs
          </p>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, index) => {
            const duration = selectedDuration[pkg.id] || 'month'
            const inCart = isInCart(pkg.id, duration)
            const currentPrice = duration === 'month' ? pkg.priceMonth : pkg.priceYear

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-2xl bg-white dark:bg-gray-800 border-2 p-8 shadow-lg ${
                  pkg.recommended
                    ? 'border-green-500 dark:border-green-400'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Recommended Badge */}
                {pkg.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Recommended
                    </span>
                  </div>
                )}

                {/* Package Name */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {getLocalizedName(pkg)}
                </h3>

                {/* Description */}
                {pkg.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {pkg.description}
                  </p>
                )}

                {/* Duration Toggle */}
                <div className="flex items-center justify-center gap-3 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedDuration(prev => ({ ...prev, [pkg.id]: 'month' }))}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      duration === 'month'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setSelectedDuration(prev => ({ ...prev, [pkg.id]: 'year' }))}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      duration === 'year'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Yearly
                    {pkg.yearlyDiscount > 0 && (
                      <span className="ml-1 text-green-600 dark:text-green-400">
                        (-{pkg.yearlyDiscount.toFixed(0)}%)
                      </span>
                    )}
                  </button>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(currentPrice, 'IDR')}
                    </span>
                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                      /{duration === 'month' ? 'month' : 'year'}
                    </span>
                  </div>
                  {duration === 'year' && pkg.yearlyDiscount > 0 && (
                    <p className="text-center text-sm text-green-600 dark:text-green-400 mt-2">
                      Save {formatCurrency((pkg.priceMonth * 12) - pkg.priceYear, 'IDR')} per year
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="mb-8">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Up to {pkg.maxSession} active session{pkg.maxSession > 1 ? 's' : ''}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Full WhatsApp Business API access
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Webhook integration
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">
                        24/7 Technical support
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(pkg)}
                  disabled={inCart}
                  className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    inCart
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : pkg.recommended
                      ? 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                      : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {inCart ? 'In Cart' : 'Add to Cart'}
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 dark:text-gray-300">
            Need a custom plan? <Link href="/contact" className="text-green-600 dark:text-green-400 font-semibold hover:underline">Contact us</Link> for enterprise solutions
          </p>
        </motion.div>
      </div>
    </section>
  )
}

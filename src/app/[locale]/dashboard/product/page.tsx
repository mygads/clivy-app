"use client"

import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { 
  Package, 
  ShoppingCart,
  Check,
  Zap,
  TrendingUp,
  Shield,
  Loader2,
  AlertCircle
} from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/components/Cart/CartContext"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"
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

export default function ProductPage() {
  const t = useTranslations()
  const { items, addToCart, buyNow } = useCart()
  const router = useRouter()
  const locale = useLocale()
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [packages, setPackages] = useState<WhatsAppPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month')

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/public/whatsapp/packages')
      const data = await response.json()
      
      if (data.success) {
        setPackages(data.data)
      } else {
        setError(data.message || 'Failed to fetch packages')
        toast.error('Gagal memuat paket')
      }
    } catch (err) {
      console.error('Error fetching packages:', err)
      setError('Failed to load WhatsApp packages')
      toast.error('Terjadi kesalahan saat memuat paket')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    if (isNaN(price) || price === null || price === undefined) {
      return 'Rp 0'
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = (pkg: WhatsAppPackage) => {
    const price = billingCycle === 'month' ? pkg.priceMonth : pkg.priceYear
    const duration = billingCycle
    
    setAddingToCart(`${pkg.id}-${duration}`)
    
    // Create cart item with proper format for CartContext
    const cartItem = {
      id: pkg.id,
      name: `${pkg.name} - ${billingCycle === 'month' ? 'Bulanan' : 'Tahunan'}`,
      name_en: `${pkg.name} - ${billingCycle === 'month' ? 'Monthly' : 'Yearly'}`,
      name_id: `${pkg.name} - ${billingCycle === 'month' ? 'Bulanan' : 'Tahunan'}`,
      price: price,
      price_idr: price,
      duration: duration,
      maxSession: pkg.maxSession,
      qty: 1,
      image: '/images/whatsapp-icon.png'
    }

    addToCart(cartItem)
    toast.success('Paket berhasil ditambahkan ke keranjang!')

    // Reset animation after 2 seconds
    setTimeout(() => {
      setAddingToCart(null)
    }, 2000)
  }

  const handleBuyNow = (pkg: WhatsAppPackage) => {
    const price = billingCycle === 'month' ? pkg.priceMonth : pkg.priceYear
    const duration = billingCycle
    
    // Create cart item with proper format for CartContext
    const cartItem = {
      id: pkg.id,
      name: `${pkg.name} - ${billingCycle === 'month' ? 'Bulanan' : 'Tahunan'}`,
      name_en: `${pkg.name} - ${billingCycle === 'month' ? 'Monthly' : 'Yearly'}`,
      name_id: `${pkg.name} - ${billingCycle === 'month' ? 'Bulanan' : 'Tahunan'}`,
      price: price,
      price_idr: price,
      duration: duration,
      maxSession: pkg.maxSession,
      qty: 1,
      image: '/images/whatsapp-icon.png'
    }

    // Use buyNow from CartContext - it will clear cart, add item, and redirect to checkout
    buyNow(cartItem)
    toast.success('Mengarahkan ke halaman checkout...')
  }

  const isInCart = (packageId: string) => {
    return items.some(item => item.id === packageId && item.duration === billingCycle)
  }

  const getPackageIcon = (name: string) => {
    const nameLower = name.toLowerCase()
    if (nameLower.includes('starter') || nameLower.includes('basic')) {
      return <Zap className="h-5 w-5" />
    } else if (nameLower.includes('professional') || nameLower.includes('pro')) {
      return <TrendingUp className="h-5 w-5" />
    } else if (nameLower.includes('business')) {
      return <Shield className="h-5 w-5" />
    } else if (nameLower.includes('enterprise')) {
      return <Package className="h-5 w-5" />
    }
    return <FaWhatsapp className="h-5 w-5" />
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

    if (packageName.toLowerCase().includes('business') || packageName.toLowerCase().includes('profesional') || packageName.toLowerCase().includes('professional')) {
      baseFeatures.push('Priority Support', 'Advanced Analytics')
    }

    if (packageName.toLowerCase().includes('enterprise')) {
      baseFeatures.push('Dedicated Account Manager', 'Custom Integration', 'SLA Guarantee')
    }

    return baseFeatures
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px] bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Memuat paket WhatsApp API...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px] bg-background">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Gagal Memuat Data</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchPackages}>
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-background">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FaWhatsapp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            Layanan WhatsApp API
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Pilih paket WhatsApp API yang sesuai dengan kebutuhan bisnis Anda
          </p>
        </div>
        <Button
          onClick={() => router.push('/checkout')}
          variant="outline"
          className="gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Checkout ({items.length})
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Badge 
          variant="outline" 
          className="cursor-pointer"
        >
          Semua Paket
        </Badge>
        <Badge 
          variant={billingCycle === 'month' ? 'default' : 'outline'} 
          className="cursor-pointer"
          onClick={() => setBillingCycle('month')}
        >
          Bulanan
        </Badge>
        <Badge 
          variant={billingCycle === 'year' ? 'default' : 'outline'} 
          className="cursor-pointer"
          onClick={() => setBillingCycle('year')}
        >
          Tahunan
          <span className="ml-1 text-xs">(-20%)</span>
        </Badge>
      </div>

      {/* Packages Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {packages.map((pkg, index) => {
          const price = billingCycle === 'month' ? pkg.priceMonth : pkg.priceYear
          const originalPrice = billingCycle === 'month' ? pkg.priceMonth : pkg.priceMonth * 12
          const features = getFeatures(pkg.maxSession, pkg.name)
          const isPopular = pkg.recommended
          const currentItemId = `${pkg.id}-${billingCycle}`

          return (
            <motion.div
              key={currentItemId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className={`relative overflow-hidden h-full flex flex-col ${isPopular ? 'border-primary shadow-lg' : ''}`}>
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                    Populer
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-lg ${isPopular ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-500'}`}>
                      {getPackageIcon(pkg.name)}
                    </div>
                    <Badge variant={billingCycle === 'year' ? 'default' : 'outline'} className="text-xs">
                      {billingCycle === 'month' ? 'Bulanan' : 'Tahunan'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {pkg.maxSession} sesi WhatsApp aktif
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-foreground">
                        {formatPrice(price)}
                      </span>
                    </div>
                    {billingCycle === 'year' && pkg.yearlyDiscount > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(originalPrice)}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          Hemat {pkg.yearlyDiscount.toFixed(0)}%
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">Fitur:</p>
                    <ul className="space-y-2">
                      {features.slice(0, 6).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 mt-4">
                    {/* Buy Now Button */}
                    <Button
                      onClick={() => handleBuyNow(pkg)}
                      className={`w-full gap-2 ${isPopular ? 'bg-gradient-to-r from-primary to-primary/80' : ''}`}
                      variant={isPopular ? 'default' : 'default'}
                    >
                      Beli Sekarang
                    </Button>

                    {/* Add to Cart Button */}
                    <Button
                      onClick={() => handleAddToCart(pkg)}
                      disabled={isInCart(pkg.id)}
                      variant="outline"
                      className={`w-full gap-2 ${isInCart(pkg.id) ? 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400' : ''}`}
                    >
                      {addingToCart === currentItemId ? (
                        <>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <Check className="h-4 w-4" />
                          </motion.div>
                          Ditambahkan!
                        </>
                      ) : isInCart(pkg.id) ? (
                        <>
                          <Check className="h-4 w-4" />
                          Sudah di Keranjang
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          Tambah ke Keranjang
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Info Footer */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Catatan Penting
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                <li>Hanya dapat memilih 1 paket WhatsApp API dalam keranjang</li>
                <li>Jika menambahkan paket baru, paket sebelumnya akan diganti secara otomatis</li>
                <li>Semua paket sudah termasuk unlimited pesan sesuai durasi yang dipilih</li>
                <li>Support tersedia 24/7 untuk semua paket</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

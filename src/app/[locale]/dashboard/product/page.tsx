"use client"

import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { 
  Package, 
  ShoppingCart,
  Check,
  Zap,
  TrendingUp,
  Shield
} from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/components/Cart/CartContext"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface WhatsAppPackage {
  id: string
  name: string
  category: string
  subcategory: string
  duration: "month" | "year"
  price: number
  originalPrice?: number
  sessionQuota: number
  features: string[]
  popular?: boolean
}

const whatsappPackages: WhatsAppPackage[] = [
  {
    id: "wa-starter-monthly",
    name: "Starter - Bulanan",
    category: "whatsapp",
    subcategory: "starter",
    duration: "month",
    price: 100000,
    originalPrice: 120000,
    sessionQuota: 1,
    features: [
      "1 Sesi WhatsApp Aktif",
      "Unlimited pesan per bulan",
      "Support 24/7",
      "API Documentation",
      "Webhook Integration"
    ]
  },
  {
    id: "wa-starter-yearly",
    name: "Starter - Tahunan",
    category: "whatsapp",
    subcategory: "starter",
    duration: "year",
    price: 1000000,
    originalPrice: 1200000,
    sessionQuota: 1,
    features: [
      "1 Sesi WhatsApp Aktif",
      "Unlimited pesan per tahun",
      "Support 24/7",
      "API Documentation",
      "Webhook Integration",
      "Hemat 2 bulan!"
    ],
    popular: true
  },
  {
    id: "wa-professional-monthly",
    name: "Professional - Bulanan",
    category: "whatsapp",
    subcategory: "professional",
    duration: "month",
    price: 250000,
    originalPrice: 300000,
    sessionQuota: 3,
    features: [
      "3 Sesi WhatsApp Aktif",
      "Unlimited pesan per bulan",
      "Priority Support 24/7",
      "API Documentation",
      "Webhook Integration",
      "Auto Reply Bot"
    ]
  },
  {
    id: "wa-professional-yearly",
    name: "Professional - Tahunan",
    category: "whatsapp",
    subcategory: "professional",
    duration: "year",
    price: 2500000,
    originalPrice: 3000000,
    sessionQuota: 3,
    features: [
      "3 Sesi WhatsApp Aktif",
      "Unlimited pesan per tahun",
      "Priority Support 24/7",
      "API Documentation",
      "Webhook Integration",
      "Auto Reply Bot",
      "Hemat 2 bulan!"
    ]
  },
  {
    id: "wa-business-monthly",
    name: "Business - Bulanan",
    category: "whatsapp",
    subcategory: "business",
    duration: "month",
    price: 500000,
    originalPrice: 600000,
    sessionQuota: 5,
    features: [
      "5 Sesi WhatsApp Aktif",
      "Unlimited pesan per bulan",
      "Dedicated Support 24/7",
      "API Documentation",
      "Webhook Integration",
      "Auto Reply Bot",
      "Advanced Analytics"
    ]
  },
  {
    id: "wa-business-yearly",
    name: "Business - Tahunan",
    category: "whatsapp",
    subcategory: "business",
    duration: "year",
    price: 5000000,
    originalPrice: 6000000,
    sessionQuota: 5,
    features: [
      "5 Sesi WhatsApp Aktif",
      "Unlimited pesan per tahun",
      "Dedicated Support 24/7",
      "API Documentation",
      "Webhook Integration",
      "Auto Reply Bot",
      "Advanced Analytics",
      "Hemat 2 bulan!"
    ],
    popular: true
  },
  {
    id: "wa-enterprise-monthly",
    name: "Enterprise - Bulanan",
    category: "whatsapp",
    subcategory: "enterprise",
    duration: "month",
    price: 1000000,
    originalPrice: 1200000,
    sessionQuota: 10,
    features: [
      "10 Sesi WhatsApp Aktif",
      "Unlimited pesan per bulan",
      "Dedicated Support 24/7",
      "API Documentation",
      "Webhook Integration",
      "Auto Reply Bot",
      "Advanced Analytics",
      "Custom Integration"
    ]
  },
  {
    id: "wa-enterprise-yearly",
    name: "Enterprise - Tahunan",
    category: "whatsapp",
    subcategory: "enterprise",
    duration: "year",
    price: 10000000,
    originalPrice: 12000000,
    sessionQuota: 10,
    features: [
      "10 Sesi WhatsApp Aktif",
      "Unlimited pesan per tahun",
      "Dedicated Support 24/7",
      "API Documentation",
      "Webhook Integration",
      "Auto Reply Bot",
      "Advanced Analytics",
      "Custom Integration",
      "Hemat 2 bulan!"
    ]
  }
]

export default function ProductPage() {
  const t = useTranslations()
  const { items, addToCart } = useCart()
  const router = useRouter()
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

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
    setAddingToCart(pkg.id)
    
    const cartItem = {
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      price_idr: pkg.price,
      duration: pkg.duration,
      maxSession: pkg.sessionQuota,
      qty: 1,
      name_en: pkg.name,
      name_id: pkg.name,
    }

    addToCart(cartItem)

    // Reset animation after 2 seconds
    setTimeout(() => {
      setAddingToCart(null)
    }, 2000)
  }

  const isInCart = (packageId: string) => {
    return items.some(item => item.id === packageId)
  }

  const getPackageIcon = (subcategory: string) => {
    switch (subcategory) {
      case 'starter':
        return <Zap className="h-5 w-5" />
      case 'professional':
        return <TrendingUp className="h-5 w-5" />
      case 'business':
        return <Shield className="h-5 w-5" />
      case 'enterprise':
        return <Package className="h-5 w-5" />
      default:
        return <FaWhatsapp className="h-5 w-5" />
    }
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
          Lihat Keranjang ({items.length})
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Badge variant="default" className="cursor-pointer">Semua Paket</Badge>
        <Badge variant="outline" className="cursor-pointer">Bulanan</Badge>
        <Badge variant="outline" className="cursor-pointer">Tahunan</Badge>
      </div>

      {/* Packages Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {whatsappPackages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className={`relative overflow-hidden h-full flex flex-col ${pkg.popular ? 'border-primary shadow-lg' : ''}`}>
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                  Populer
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${pkg.popular ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-500'}`}>
                    {getPackageIcon(pkg.subcategory)}
                  </div>
                  <Badge variant={pkg.duration === 'year' ? 'default' : 'outline'} className="text-xs">
                    {pkg.duration === 'month' ? 'Bulanan' : 'Tahunan'}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <CardDescription className="text-xs">
                  {pkg.sessionQuota} sesi WhatsApp aktif
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Pricing */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">
                      {formatPrice(pkg.price)}
                    </span>
                  </div>
                  {pkg.originalPrice && pkg.originalPrice !== pkg.price && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(pkg.originalPrice)}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        Hemat {Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}%
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Fitur:</p>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={() => handleAddToCart(pkg)}
                  disabled={isInCart(pkg.id)}
                  className={`w-full mt-4 gap-2 ${isInCart(pkg.id) ? 'bg-green-500 hover:bg-green-600' : ''}`}
                >
                  {addingToCart === pkg.id ? (
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
              </CardContent>
            </Card>
          </motion.div>
        ))}
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

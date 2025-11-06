// WhatsApp Package types (IDR only)
export interface WhatsAppPackage {
  id: string
  name: string
  description: string | null
  priceMonth: number  // IDR only
  priceYear: number   // IDR only
  maxSession: number
  createdAt: string
  yearlyDiscount: number  // Percentage discount for yearly
  recommended: boolean
  features: string[]
}

export interface WhatsAppPackageResponse {
  success: boolean
  data: WhatsAppPackage[]
  total: number
}

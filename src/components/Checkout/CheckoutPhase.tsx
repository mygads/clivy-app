"use client"

import { motion } from "framer-motion"
import { ArrowRight, Loader2 } from "lucide-react"
import { useState } from "react"
import { SessionManager } from "@/lib/storage"
import type { 
  CheckoutRequest, 
  CheckoutPackage,
  CheckoutAddon, 
  CheckoutWhatsApp,
  CheckoutResponse
} from "@/types/checkout"

interface CheckoutPhaseProps {
  formData: {
    name: string
    whatsapp: string
    email: string
    notes: string
    voucher: string
  }
  selectedItems: any[]
  whatsappItems: any[]
  // Removed: regularItems and addOns (WhatsApp only)
  voucherApplied: boolean
  selectedItemsTotal: number
  voucherDiscount: number
  onCheckoutSuccess: (response: CheckoutResponse) => void
  onError: (error: string) => void
}

export function CheckoutPhase({ 
  formData,
  selectedItems,
  whatsappItems,
  // Removed: regularItems and addOns
  voucherApplied,
  selectedItemsTotal,
  voucherDiscount,
  onCheckoutSuccess,
  onError
}: CheckoutPhaseProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCheckout = async () => {
    setIsProcessing(true)
    onError("") // Clear any previous errors

    try {
      // Prepare checkout data - WhatsApp only
      const whatsapp: CheckoutWhatsApp[] = whatsappItems.map(item => {
        // Extract package ID and duration from composite ID
        // WhatsApp items have IDs like "packageId_monthly" or "packageId_yearly"
        const idParts = item.id.split('_')
        const packageId = idParts[0] // Original package ID
        const billingType = idParts[1] // "monthly" or "yearly"
        
        // Convert billing type to duration format expected by backend
        const duration = billingType === "yearly" ? "year" : "month"
        
        return {
          packageId: packageId, // Use the original package ID, not the composite one
          duration: duration
        }
      })

      const checkoutData: CheckoutRequest = {
        currency: "idr",
        notes: formData.notes || undefined,
        // WhatsApp only - no packages or addons
        ...(whatsapp.length > 0 && { whatsapp }),
        ...(voucherApplied && formData.voucher && { voucherCode: formData.voucher })
      }

      // Process checkout using SessionManager pattern (same as admin)
      const token = SessionManager.getToken()
      if (!token) {
        throw new Error("Authentication required. Please login first.")
      }

      const response = await fetch('/api/customer/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(checkoutData)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Checkout failed')
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Checkout failed')
      }
      
      onCheckoutSuccess(result)

    } catch (error: any) {
      console.error('Checkout error:', error)
      onError(error.message || "Terjadi kesalahan saat memproses checkout. Silakan coba lagi.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 sm:space-y-4"
    >
      <div>
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
          Tinjau pesanan Anda dan lanjutkan ke pembayaran
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
        <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Ringkasan Pesanan</h4>
        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>Rp {selectedItemsTotal.toLocaleString('id-ID')}</span>
          </div>
          {voucherApplied && (
            <div className="flex justify-between text-green-600">
              <span>Diskon Voucher:</span>
              <span>-Rp {voucherDiscount.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-1.5 sm:pt-2 mt-1.5 sm:mt-2">
            <div className="flex justify-between font-medium text-base ">
              <span>Total:</span>
              <span className="text-primary">Rp {(selectedItemsTotal - voucherDiscount).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base text-white transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
            <span className="text-xs sm:text-sm">Memproses Checkout...</span>
          </>
        ) : (
          <>
            <span className="text-xs sm:text-sm">Lanjutkan ke Pembayaran</span>
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </>
        )}
      </button>
    </motion.div>
  )
}

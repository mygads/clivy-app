"use client"

import type React from "react"

import { Check, Gift, RefreshCw, X } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import type { CartItem } from "@/components/Cart/CartContext"
import { CheckoutForm } from "@/types/checkout"
import { useLocale } from "next-intl"
import { useCurrency, getCurrencySymbol } from "@/hooks/useCurrency"

interface OrderSummaryProps {
  // Simplified - WhatsApp only
  whatsappItems: CartItem[]
  selectedItemsTotal: number
  formData: CheckoutForm
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  voucherApplied: boolean
  voucherDiscount: number
  voucherData: any
  voucherError: string
  isSubmitting: boolean
  handleApplyVoucher: () => void
  setVoucherApplied: (applied: boolean) => void
  setVoucherDiscount: (discount: number) => void
  setVoucherData: (data: any) => void
  setFormData: (formData: CheckoutForm) => void
}

export function OrderSummary({
  whatsappItems,
  selectedItemsTotal,
  formData,
  handleInputChange,
  voucherApplied,
  voucherDiscount,
  voucherData,
  voucherError,
  isSubmitting,
  handleApplyVoucher,
  setVoucherApplied,
  setVoucherDiscount,
  setVoucherData,
  setFormData,
}: OrderSummaryProps) {
  const locale = useLocale()
  
  // Use IP-based currency detection
  const { currency, isLoading: currencyLoading } = useCurrency()

  // Helper function to format price based on detected currency (not locale)
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

  // Calculate totals with localized prices - WhatsApp only
  const calculateLocalizedTotal = (items: CartItem[]) => {
    return items.reduce((sum, item) => sum + getLocalizedPrice(item) * item.qty, 0)
  }

  const localizedTotal = calculateLocalizedTotal(whatsappItems)

  const finalAmount = localizedTotal - voucherDiscount
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-primary/60 dark:border-gray-600 p-4 sm:p-6 sticky top-20 sm:top-24">
      <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Order Summary</h2>

      <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto mb-3 sm:mb-4 pr-1 sm:pr-2">
        {/* WhatsApp Items Only */}
        {whatsappItems.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <h3 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3 text-gray-900 dark:text-white">WhatsApp Services</h3>
            <div className="w-full h-px bg-gradient-to-r from-green-500/30 to-transparent mb-2 sm:mb-3"></div>
            <ul className="space-y-2 sm:space-y-3">
              {whatsappItems.map((item) => (
                <li key={item.id} className="flex gap-2 sm:gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-green-50 dark:bg-green-600/20 flex-shrink-0 flex items-center justify-center">
                    <FaWhatsapp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-xs sm:text-sm truncate">{getLocalizedName(item)}</p>
                      <span className="text-xs sm:text-sm ml-2 flex-shrink-0">x{item.qty}</span>
                    </div>
                    <p className="text-primary dark:text-gray-200 text-xs sm:text-sm">
                      {getLocalizedPrice(item) === 0 ? "Free" : formatPrice(getLocalizedPrice(item))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-gray-200 dark:border-gray-800 pt-3 sm:pt-4 mb-3 sm:mb-4">
        <div className="flex items-center mb-2 sm:mb-3 gap-2">
          <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary dark:text-white" />
          <h3 className="font-medium text-sm sm:text-base">Voucher</h3>
        </div>

        <div className="flex gap-2 mb-2">
          <input
            type="text"
            name="voucher"
            value={formData.voucher}
            onChange={handleInputChange}
            placeholder="ENTER VOUCHER CODE"
            className="flex-1 rounded-lg border border-gray-300 p-2 text-xs sm:text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white uppercase placeholder:normal-case"
            disabled={voucherApplied || isSubmitting}
          />
          <button
            onClick={handleApplyVoucher}
            disabled={voucherApplied || isSubmitting}
            className="px-2 sm:px-3 py-2 rounded-lg bg-primary text-xs sm:text-sm text-white disabled:opacity-70 flex-shrink-0 min-w-[50px] sm:min-w-[60px]"
          >
            {isSubmitting ? (
              <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
            ) : voucherApplied ? (
              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              "Apply"
            )}
          </button>
        </div>

        {voucherError && <p className="text-red-500 text-xs mb-2">{voucherError}</p>}        {voucherApplied && (
          <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded text-sm mb-2">            <div className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              <span>{formData.voucher}</span>
              {voucherData && voucherData.discountType === "percentage" && (
                <span className="text-xs bg-green-100 dark:bg-green-800 px-1 rounded">
                  {voucherData.value}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span>-{formatPrice(voucherDiscount)}</span>
              <button                onClick={() => {
                  setVoucherApplied(false)
                  setVoucherDiscount(0)
                  setVoucherData(null)
                  setFormData({ ...formData, voucher: "" })
                }}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
          <span className="font-medium">{formatPrice(localizedTotal)}</span>
        </div>        {voucherApplied && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>
              Diskon
              {voucherData && voucherData.discountType === "percentage" && (
                <span className="text-xs ml-1">({voucherData.value}%)</span>
              )}
            </span>
            <span className="font-medium">-{formatPrice(voucherDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-sm sm:text-base pt-2 border-t border-gray-200 dark:border-gray-800">
          <span>Total</span>
          <span>{formatPrice(finalAmount)}</span>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { FaWhatsapp } from "react-icons/fa"
import type { CartItem } from "@/components/Cart/CartContext"
import { CheckoutResponse } from "@/types/checkout"
import { useLocale } from "next-intl"
import { useCurrency, getCurrencySymbol } from "@/hooks/useCurrency"

interface PaymentOrderSummaryProps {
  // Simplified - WhatsApp only
  whatsappItems: CartItem[]
  selectedItemsTotal: number
  voucherApplied: boolean
  voucherDiscount: number
  voucherData: any
  checkoutResponse?: CheckoutResponse
  selectedPaymentMethod?: string
}

export function PaymentOrderSummary({
  whatsappItems,
  selectedItemsTotal,
  voucherApplied,
  voucherDiscount,
  voucherData,
  checkoutResponse,
  selectedPaymentMethod,
}: PaymentOrderSummaryProps) {
  const locale = useLocale()
  
  // Use IP-based currency detection
  const { currency, isLoading: currencyLoading } = useCurrency()

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

  // Calculate service fee based on selected payment method
  const serviceFee = selectedPaymentMethod && checkoutResponse ? 
    checkoutResponse.data.serviceFeePreview?.find(
      fee => fee.paymentMethod === selectedPaymentMethod
    ) : null

  // Final total including service fee (if payment method is selected)
  const totalWithServiceFee = serviceFee ? serviceFee.totalWithFee : finalAmount

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-primary/60 dark:border-gray-600 p-4 sm:p-6 sticky top-20 sm:top-24">
      <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Order Summary</h2>

      <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto mb-3 sm:mb-4 pr-1 sm:pr-2">
        {/* WhatsApp Items Only */}
        {whatsappItems.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">WhatsApp Services</h3>
            <div className="w-full h-px bg-gradient-to-r from-green-500/30 to-transparent mb-3"></div>
            <ul className="space-y-3">
              {whatsappItems.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="h-12 w-12 rounded-md bg-green-50 dark:bg-green-600/20 flex-shrink-0 flex items-center justify-center">
                    <FaWhatsapp className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm truncate">{getLocalizedName(item)}</p>
                      <span className="text-sm ml-2">x{item.qty}</span>
                    </div>
                    <p className="text-primary dark:text-gray-200 text-sm">
                      {getLocalizedPrice(item) === 0 ? "Free" : formatPrice(getLocalizedPrice(item))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Applied Voucher Display (Read-only) */}
      {voucherApplied && (
        <div className="border-t border-dashed border-gray-200 dark:border-gray-800 pt-4 mb-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-sm">Voucher Applied:</span>
                <span className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs">
                  {voucherData?.code || 'VOUCHER'}
                </span>
                {voucherData && voucherData.discountType === "percentage" && (
                  <span className="text-sm bg-green-200 dark:bg-green-700 px-1.5 py-0.5 rounded">
                    {voucherData.value}%
                  </span>
                )}
              </div>
              <span className="font-medium text-sm">-{formatPrice(voucherDiscount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Summary */}
      <div className="space-y-2 text-sm border-t border-gray-200 dark:border-gray-800 pt-4">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
          <span>{formatPrice(localizedTotal)}</span>
        </div>

        {voucherApplied && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>
              Diskon
              {voucherData && voucherData.discountType === "percentage" && (
                <span className="text-xs ml-1">({voucherData.value}%)</span>
              )}
            </span>
            <span>-{formatPrice(voucherDiscount)}</span>
          </div>
        )}

        {/* Service Fee (only show if payment method is selected) */}
        {serviceFee && (
          <div className="flex justify-between text-orange-600 dark:text-orange-400">
            <span>
              Biaya Layanan
              {serviceFee.feeAmount === 0 && (
                <span className="text-xs ml-1 text-green-600">(Gratis)</span>
              )}
              {serviceFee.type === "percentage" && serviceFee.feeAmount > 0 && (
                <span className="text-xs ml-1">({serviceFee.value}%)</span>
              )}
            </span>
            <span>
              {serviceFee.feeAmount === 0 ? 'Gratis' : `+${formatPrice(serviceFee.feeAmount)}`}
            </span>
          </div>
        )}

        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-800">
          <span>Total</span>
          <span className="text-primary dark:text-white">{formatPrice(totalWithServiceFee)}</span>
        </div>
      </div>
    </div>
  )
}

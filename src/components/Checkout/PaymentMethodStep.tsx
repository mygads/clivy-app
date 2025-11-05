"use client"

import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { PaymentMethodPhase } from "./PaymentMethodPhase"
import type { CheckoutResponse, PaymentCreateResponse } from "@/types/checkout"

interface PaymentMethodStepProps {
  checkoutResponse: CheckoutResponse
  transactionData?: any // Optional existing transaction data
  setStep: (step: number) => void
  onPaymentCreated: (response: PaymentCreateResponse) => void
  onError: (error: string) => void
  error: string
  onPaymentMethodChange?: (paymentMethod: string) => void
}

export function PaymentMethodStep({
  checkoutResponse,
  transactionData,
  setStep,
  onPaymentCreated,
  onError,
  error,
  onPaymentMethodChange
}: PaymentMethodStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-primary/60 dark:border-gray-600 p-4 sm:p-6 mb-4 sm:mb-6"
    >
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold">Pilih Metode Pembayaran</h2>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Payment Method Phase */}
      <div className="mb-4 sm:mb-6">
        <PaymentMethodPhase
          checkoutResponse={checkoutResponse}
          onPaymentCreated={onPaymentCreated}
          onError={onError}
          onPaymentMethodChange={onPaymentMethodChange}
        />
      </div>

      {/* Navigation */}
      <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between">
        <button
          onClick={() => setStep(3)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
      </div>
    </motion.div>
  )
}

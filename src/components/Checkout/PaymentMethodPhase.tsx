"use client"

import { motion } from "framer-motion"
import { ArrowRight, Loader2, Check, CreditCard, Building, Smartphone, QrCode, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { SessionManager } from "@/lib/storage"
import { useToast } from "@/components/ui/toast"
import type { 
  PaymentCreateRequest,
  PaymentCreateResponse,
  CheckoutResponse
} from "@/types/checkout"

interface PaymentMethodPhaseProps {
  checkoutResponse: CheckoutResponse
  onPaymentCreated: (response: PaymentCreateResponse) => void
  onError: (error: string) => void
  onPaymentMethodChange?: (paymentMethod: string) => void
}

export function PaymentMethodPhase({ 
  checkoutResponse,
  onPaymentCreated,
  onError,
  onPaymentMethodChange
}: PaymentMethodPhaseProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({})
  const router = useRouter()
  const { addToast } = useToast()

  // Function to handle payment method selection
  const handlePaymentMethodSelect = (paymentMethod: string) => {
    setSelectedPaymentMethod(paymentMethod)
    // Notify parent component about the selection
    if (onPaymentMethodChange) {
      onPaymentMethodChange(paymentMethod)
    }
  }

  // Function to toggle category expansion
  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }))
  }

  // Debug: Log checkout response structure
  // console.log("[PaymentMethodPhase] Checkout Response:", JSON.stringify(checkoutResponse, null, 2))

  // Function to group payment methods by category
  const groupPaymentMethods = (methods: any[]) => {
    // console.log('[PaymentMethodPhase] All methods:', methods.map(m => ({ name: m.name, code: m.code, type: m.type })))
    
    const groups = {
      'manual_bank_transfer': {
        title: 'TRANSFER BANK',
        icon: Building,
        methods: []
      },
      'qris': {
        title: 'QRIS',
        icon: QrCode,
        methods: []
      },
      'credit_card': {
        title: 'CREDIT CARD',
        icon: CreditCard,
        methods: []
      },
      'va_bank_transfer': {
        title: 'VA',
        icon: Building,
        methods: []
      },
      'e_wallet': {
        title: 'E-WALLET',
        icon: Smartphone,
        methods: []
      },
      'credit_payment': {
        title: 'CREDIT PAYMENT',
        icon: CreditCard,
        methods: []
      },
      'retail': {
        title: 'RETAIL',
        icon: Building,
        methods: []
      }
    } as any

    methods.forEach(method => {
      let category = 'retail' // default
      
      // console.log(`[PaymentMethodPhase] Checking method:`, {
      //   name: method.name,
      //   code: method.code,
      //   type: method.type,
      //   gatewayProvider: method.gatewayProvider,
      //   bankDetail: !!method.bankDetail
      // })
      
      // Extract actual gateway code from duitku format (duitku_XX -> XX)
      const gatewayCode = method.code.startsWith('duitku_') ? method.code.replace('duitku_', '') : method.code
      // console.log(`[PaymentMethodPhase] Extracted gateway code: ${gatewayCode} from ${method.code}`)
      
      // Manual Bank Transfer (our custom methods)
      if (method.type === 'manual' || method.bankDetail) {
        category = 'manual_bank_transfer'
        // console.log(`[PaymentMethodPhase] Code: ${method.code} -> TRANSFER BANK`)
      }
      // Credit Card: VC
      else if (gatewayCode === 'VC') {
        category = 'credit_card'
        // console.log(`[PaymentMethodPhase] Code: ${method.code} (${gatewayCode}) -> CREDIT CARD`)
      }
      // Virtual Account: BC, M2, VA, I1, B1, BT, A1, AG, NC, BR, S1, DM, BV
      else if (['BC', 'M2', 'VA', 'I1', 'B1', 'BT', 'A1', 'AG', 'NC', 'BR', 'S1', 'DM', 'BV'].includes(gatewayCode)) {
        category = 'va_bank_transfer'
        // console.log(`[PaymentMethodPhase] Code: ${method.code} (${gatewayCode}) -> VA`)
      }
      // E-Wallet: OV, SA, LF, LA, DA, SL, OL, JP
      else if (['OV', 'SA', 'LF', 'LA', 'DA', 'SL', 'OL', 'JP'].includes(gatewayCode)) {
        category = 'e_wallet'
        // console.log(`[PaymentMethodPhase] Code: ${method.code} (${gatewayCode}) -> E-WALLET`)
      }
      // QRIS: SP, NQ, GQ, SQ
      else if (['SP', 'NQ', 'GQ', 'SQ'].includes(gatewayCode)) {
        category = 'qris'
        // console.log(`[PaymentMethodPhase] Code: ${method.code} (${gatewayCode}) -> QRIS`)
      }
      // Credit Payment: DN, AT
      else if (['DN', 'AT'].includes(gatewayCode)) {
        category = 'credit_payment'
        // console.log(`[PaymentMethodPhase] Code: ${method.code} (${gatewayCode}) -> CREDIT PAYMENT`)
      }
      // Retail: FT, IR
      else if (['FT', 'IR'].includes(gatewayCode)) {
        category = 'retail'
        // console.log(`[PaymentMethodPhase] Code: ${method.code} (${gatewayCode}) -> RETAIL`)
      }
      // Unknown code - put in retail as fallback
      else {
        category = 'retail'
        // console.log(`[PaymentMethodPhase] Code: ${method.code} (${gatewayCode}) -> RETAIL (unknown code)`)
      }
      
      // console.log(`[PaymentMethodPhase] Final category: ${category}`)
      groups[category].methods.push(method)
    })

    // Return groups in the requested order, filter out empty groups
    const orderedKeys = ['manual_bank_transfer', 'qris', 'credit_card', 'va_bank_transfer', 'e_wallet', 'credit_payment', 'retail']
    return orderedKeys
      .map(key => [key, groups[key]] as [string, typeof groups[string]])
      .filter(([_, group]) => group.methods.length > 0)
  }

  // Function to get appropriate icon for payment method
  const getPaymentMethodIcon = (method: any) => {
    // For manual bank transfer, use Building icon
    if (method.type === 'manual' || method.bankDetail) {
      return (
        <div className="h-12 w-12 flex items-center justify-center">
          <Building className="h-8 w-8 text-blue-600" />
        </div>
      )
    }
    
    // Priority 1: Use gatewayImageUrl if available
    if (method.gatewayImageUrl) {
      return (
        <div className="h-12 w-12 flex items-center justify-center flex-shrink-0">
          <Image 
            src={method.gatewayImageUrl} 
            alt={method.name}
            width={40}
            height={40}
            className="object-contain max-h-10 max-w-10"
            onError={(e) => {
              // Fallback to instructionImageUrl if gatewayImageUrl fails
              if (method.instructionImageUrl) {
                e.currentTarget.src = method.instructionImageUrl
              } else {
                e.currentTarget.style.display = 'none'
              }
            }}
          />
        </div>
      )
    }
    
    // Priority 2: Use instructionImageUrl if gatewayImageUrl not available
    if (method.instructionImageUrl) {
      return (
        <div className="h-12 w-12 flex items-center justify-center flex-shrink-0">
          <Image 
            src={method.instructionImageUrl} 
            alt={method.name}
            width={40}
            height={40}
            className="object-contain max-h-10 max-w-10"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )
    }
    
    // Priority 3: Fallback icons based on method code/type
    const iconClass = "h-8 w-8"
    const containerClass = "h-12 w-12 flex items-center justify-center"
    
    // Extract gateway code for matching
    const gatewayCode = method.code.startsWith('duitku_') ? method.code.replace('duitku_', '') : method.code
    
    // Check by gateway code first
    if (gatewayCode === 'VC') return <div className={containerClass}><CreditCard className={`${iconClass} text-purple-600`} /></div>
    if (['SP', 'NQ', 'GQ', 'SQ'].includes(gatewayCode)) return <div className={containerClass}><QrCode className={`${iconClass} text-green-600`} /></div>
    if (['OV', 'SA', 'LF', 'LA', 'DA', 'SL', 'OL', 'JP'].includes(gatewayCode)) {
      return <div className={containerClass}><Smartphone className={`${iconClass} text-orange-600`} /></div>
    }
    if (['BC', 'M2', 'VA', 'I1', 'B1', 'BT', 'A1', 'AG', 'NC', 'BR', 'S1', 'DM', 'BV'].includes(gatewayCode)) {
      return <div className={containerClass}><Building className={`${iconClass} text-blue-600`} /></div>
    }
    if (['FT', 'IR'].includes(gatewayCode)) {
      return <div className={containerClass}><Building className={`${iconClass} text-gray-600`} /></div>
    }
    if (['DN', 'AT'].includes(gatewayCode)) {
      return <div className={containerClass}><CreditCard className={`${iconClass} text-red-600`} /></div>
    }
    
    // Fallback by name if code doesn't match
    const nameUpper = method.name?.toUpperCase() || ''
    if (nameUpper.includes('VIRTUAL') || nameUpper.includes('VA ')) {
      return <div className={containerClass}><Building className={`${iconClass} text-blue-600`} /></div>
    }
    if (nameUpper.includes('QRIS')) {
      return <div className={containerClass}><QrCode className={`${iconClass} text-green-600`} /></div>
    }
    if (nameUpper.includes('SHOPEE') || nameUpper.includes('OVO') || nameUpper.includes('DANA') || nameUpper.includes('JENIUS')) {
      return <div className={containerClass}><Smartphone className={`${iconClass} text-orange-600`} /></div>
    }
    if (nameUpper.includes('CREDIT') || nameUpper.includes('CARD')) {
      return <div className={containerClass}><CreditCard className={`${iconClass} text-purple-600`} /></div>
    }
    if (nameUpper.includes('INDODANA') || nameUpper.includes('ATOME') || nameUpper.includes('PAYLATER')) {
      return <div className={containerClass}><CreditCard className={`${iconClass} text-red-600`} /></div>
    }
    
    return <div className={containerClass}><CreditCard className={`${iconClass} text-gray-600`} /></div>
  }

  // Helper function to check if payment method should auto-redirect
  const shouldAutoRedirect = (method: string): boolean => {
    // Extract Duitku payment method code (remove 'duitku_' prefix if exists)
    const duitkuMethod = method.replace(/^duitku_/, '').toUpperCase()
    
    // Define payment methods that should auto-redirect based on Duitku gateway mapping
    const autoRedirectMethods: { [key: string]: boolean } = {
      // Credit Card - requires redirect to gateway
      'VC': true,
      
      // E-Wallet Apps - requires redirect to respective app/gateway
      'SA': true,     // Shopee Pay Apps
      'LF': true,     // LinkAja Apps (Fixed Fee)
      'LA': true,     // LinkAja Apps (Percentage Fee)
      'DA': true,     // DANA
      'OV': true,     // OVO
      'SL': true,     // Shopee Pay Account Link
      'OL': true,     // OVO Account Link
      'JP': true,     // Jenius Pay
      
      // Paylater - requires redirect to gateway
      'DN': true,     // Indodana Paylater
      'AT': true,     // ATOME
    }
    
    return autoRedirectMethods[duitkuMethod] || false
  }

  const handlePayment = async (paymentMethod: string) => {
    if (!checkoutResponse?.data.transactionId) {
      addToast({
        type: "error",
        title: "Data Transaksi Tidak Ditemukan",
        description: "Silakan lakukan checkout ulang untuk melanjutkan pembayaran"
      })
      onError("Transaction ID tidak ditemukan. Silakan coba checkout lagi.")
      return
    }

    setIsProcessing(true)
    onError("") // Clear any previous errors

    try {
      const paymentData: PaymentCreateRequest = {
        transactionId: checkoutResponse.data.transactionId,
        paymentMethod: paymentMethod
      }

      // Use SessionManager for authentication (same pattern as admin)
      const token = SessionManager.getToken()
      if (!token) {
        addToast({
          type: "error",
          title: "Sesi Kedaluwarsa",
          description: "Silakan login kembali untuk melanjutkan pembayaran"
        })
        onError("Authentication required. Please login first.")
        return
      }

      const response = await fetch("/api/customer/payment/create", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        // Check for specific error types for better user messaging
        if (response.status === 400 && result.error) {
          if (result.error.includes('temporarily unavailable') || result.error.includes('technical issues')) {
            addToast({
              type: "error",
              title: "Metode Pembayaran Tidak Tersedia",
              description: "Metode pembayaran ini sedang mengalami gangguan. Silakan pilih metode lain seperti Bank Transfer atau Virtual Account."
            })
          } else if (result.error.includes('maximum limit') || result.error.includes('exceeds')) {
            addToast({
              type: "error", 
              title: "Jumlah Melebihi Batas",
              description: "Jumlah pembayaran melebihi batas untuk metode ini. Silakan pilih metode pembayaran lain."
            })
          } else {
            addToast({
              type: "error",
              title: "Gagal Membuat Pembayaran",
              description: result.error || "Silakan coba lagi atau pilih metode pembayaran lain"
            })
          }
        }
        throw new Error(result.error || 'Payment creation failed')
      }
      
      if (!result.success) {
        addToast({
          type: "error",
          title: "Gagal Membuat Pembayaran", 
          description: result.error || "Silakan coba lagi atau pilih metode pembayaran lain"
        })
        throw new Error(result.error || 'Payment creation failed')
      }
      
      // Check if this payment method should auto-redirect to gateway URL
      if (result.data.payment.id && result.data.payment.paymentUrl && shouldAutoRedirect(paymentMethod)) {
        console.log(`[CHECKOUT] Auto-redirecting to payment URL for method: ${paymentMethod}`)
        
        // Show success toast for auto-redirect methods
        addToast({
          type: "success",
          title: "Pembayaran Berhasil Dibuat",
          description: "Anda akan diarahkan ke halaman pembayaran"
        })
        
        // Direct redirect to payment URL for e-wallet, credit card, and paylater methods
        window.location.href = result.data.payment.paymentUrl
      } else {
        // For other methods (QRIS, VA, retail), redirect to payment status page
        if (result.data.payment.id) {
          // Show success toast
          addToast({
            type: "success",
            title: "Pembayaran Berhasil Dibuat",
            description: "Anda akan diarahkan ke halaman status pembayaran"
          })
          router.push(`/payment/status/${result.data.payment.id}`)
        } else {
          // Show error toast
          addToast({
            type: "error",
            title: "Gagal Membuat Pembayaran",
            description: "Silakan coba lagi atau pilih metode pembayaran lain"
          })
          onError("Gagal membuat pembayaran. Silakan coba lagi.")
        }
      }

    } catch (error: any) {
      console.error('Payment error:', error)
      
      // Show detailed error toast based on error message
      if (error.message.includes('temporarily unavailable') || error.message.includes('technical issues')) {
        addToast({
          type: "error",
          title: "Metode Pembayaran Tidak Tersedia",
          description: "Metode pembayaran ini sedang mengalami gangguan. Silakan pilih metode pembayaran lain seperti Bank Transfer, Virtual Account, atau QRIS lainnya."
        })
      } else if (error.message.includes('maximum limit') || error.message.includes('exceeds')) {
        addToast({
          type: "error",
          title: "Jumlah Pembayaran Melebihi Batas",
          description: "Silakan pilih metode pembayaran lain atau kurangi jumlah pesanan Anda."
        })
      } else {
        addToast({
          type: "error",
          title: "Gagal Memproses Pembayaran",
          description: error.message || "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi atau pilih metode pembayaran lain."
        })
      }
      
      onError(error.message || "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-lg p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          <div className="text-green-500 mt-0.5 flex-shrink-0">
            <Check className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-green-800 dark:text-green-300 font-medium text-sm sm:text-base">
              Checkout Berhasil!
            </p>
            <p className="text-green-700 dark:text-green-400 text-xs sm:text-sm mt-1">
              Silakan pilih metode pembayaran untuk melanjutkan.
            </p>
          </div>
        </div>
      </div>

      <div>

        {checkoutResponse.data.availablePaymentMethods && checkoutResponse.data.availablePaymentMethods.length > 0 ? (
          <div className="space-y-4">
            {groupPaymentMethods(checkoutResponse.data.availablePaymentMethods).map(([categoryKey, group]: [string, any]) => {
              const GroupIcon = group.icon
              const isExpanded = expandedCategories[categoryKey]
              
              return (
                <div key={categoryKey} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {/* Category Header - Clickable */}
                  <div 
                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => toggleCategory(categoryKey)}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <GroupIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                      <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{group.title}</h4>
                      <span className="text-xs sm:text-sm text-gray-500 bg-gray-200 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                        {group.methods.length}
                      </span>
                    </div>
                    <div className="text-gray-400 flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </div>
                  </div>
                  
                  {/* Payment Methods in this category - Collapsible */}
                  {isExpanded && (
                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 bg-white dark:bg-gray-900">
                      {group.methods.map((method: any) => {
                        const serviceFee = checkoutResponse.data.serviceFeePreview?.find(
                          (fee: any) => fee.paymentMethod === method.code
                        )
                        
                        return (
                          <div
                            key={method.code}
                            className={`border rounded-lg p-2 sm:p-3 cursor-pointer transition-all hover:shadow-md ${
                              selectedPaymentMethod === method.code
                                ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => handlePaymentMethodSelect(method.code)}
                          >
                            {/* Single row layout for all screen sizes */}
                            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                {/* Radio Button */}
                                <input
                                  type="radio"
                                  name="payment"
                                  checked={selectedPaymentMethod === method.code}
                                  onChange={() => handlePaymentMethodSelect(method.code)}
                                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary focus:ring-primary border-gray-300 flex-shrink-0"
                                />
                              
                                {/* Payment Method Icon/Image */}
                                <div className="flex-shrink-0">
                                  {getPaymentMethodIcon(method)}
                                </div>
                                
                                {/* Payment Method Details */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs sm:text-sm lg:text-base text-gray-900 dark:text-white break-words leading-tight">
                                    {method.name}
                                  </p>
                                  {/* Show simplified details inline on larger screens */}
                                  <div className="hidden sm:flex sm:items-center sm:gap-2 sm:mt-0.5">
                                    {method.gatewayProvider === 'DUITKU' ? (
                                      <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                                        via {method.gatewayProvider}
                                      </p>
                                    ) : method.bankDetail ? (
                                      <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                                        Transfer Manual
                                      </p>
                                    ) : null}
                                    {method.code && method.gatewayProvider === 'DUITKU' && (
                                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
                                        {method.code}
                                      </span>
                                    )}
                                  </div>
                                  {method.bankDetail && (
                                    <p className="hidden lg:block text-xs text-gray-500 dark:text-gray-500 mt-0.5 break-words">
                                      {method.bankDetail.bankName} - {method.bankDetail.accountNumber}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Service Fee Info - always inline */}
                              {serviceFee && (
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-900 dark:text-white break-words">
                                    Rp {Number(serviceFee.totalWithFee).toLocaleString('id-ID')}
                                  </p>
                                  {Number(serviceFee.feeAmount) > 0 ? (
                                    <p className="text-xs lg:text-sm text-red-500 break-words">
                                      +Rp {Number(serviceFee.feeAmount).toLocaleString('id-ID')} biaya
                                    </p>
                                  ) : (
                                    <p className="text-xs lg:text-sm text-green-600 break-words">
                                      Tanpa biaya tambahan
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
            <p className="text-yellow-800 dark:text-yellow-300 text-xs sm:text-sm">
              Tidak ada metode pembayaran yang tersedia saat ini. Silakan hubungi customer service.
            </p>
          </div>
        )}
      </div>

      {/* Summary showing total with selected service fee */}
      {selectedPaymentMethod && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-3 sm:p-4">
          {(() => {
            const serviceFee = checkoutResponse.data.serviceFeePreview?.find(
              fee => fee.paymentMethod === selectedPaymentMethod
            )
            return (
              <div>
                <h4 className="font-medium text-sm sm:text-base text-blue-800 dark:text-blue-300 mb-2">
                  Ringkasan Pembayaran
                </h4>                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-blue-700 dark:text-blue-400">
                    <span>Subtotal setelah diskon:</span>
                    <span className="font-medium">Rp {Number(checkoutResponse.data.totalAfterDiscount).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-blue-700 dark:text-blue-400">
                    <span>Biaya layanan:</span>
                    <span className="font-medium">Rp {Number(serviceFee?.feeAmount || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="border-t border-blue-200 dark:border-blue-800 pt-2 flex justify-between font-bold text-blue-800 dark:text-blue-300 text-base">
                    <span>Total Akhir:</span>
                    <span>Rp {Number(serviceFee?.totalWithFee || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {selectedPaymentMethod && (
        <button
          onClick={() => handlePayment(selectedPaymentMethod)}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 sm:px-6 py-2.5 sm:py-3 font-medium text-sm sm:text-base text-white transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Membuat Pembayaran...</span>
              <span className="sm:hidden">Processing...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Buat Pembayaran</span>
              <span className="sm:hidden">Bayar</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </motion.div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useCart } from "@/components/Cart/CartContext"
import { useAuth } from "@/components/Auth/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { useCheckoutState } from "@/hooks/useCheckoutPersistence"
import { EmptyCart } from "@/components/Checkout/EmptyCart"
import { LoadingState } from "@/components/Checkout/LoadingState"
import { Step } from "@/components/Checkout/Step"
import { ContactInformationStep } from "@/components/Checkout/ContactInformationStep"
import { VerificationStep } from "@/components/Checkout/VerificationStep"
import { CheckoutStep } from "@/components/Checkout/CheckoutStep"
import { PaymentMethodStep } from "@/components/Checkout/PaymentMethodStep"
import { OrderSummary } from "@/components/Checkout/OrderSummary"
import { PaymentOrderSummary } from "@/components/Checkout/PaymentOrderSummary"
import { SessionManager } from "@/lib/storage"

interface CheckoutData {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  message?: string;
  verificationCode?: string;
  transactionData?: any;
  paymentMethod?: string;
}

type CheckoutStep = "contact" | "verification" | "checkout" | "payment"

import { 
  // checkVoucher function will be replaced with direct fetch 
} from "@/types/checkout"
import type { 
  VoucherCheckRequest,
  VoucherCheckItem,
  VoucherCheckResponse,
  CheckoutResponse,
  PaymentCreateResponse,
} from "@/types/checkout"


export default function CheckoutPage() {
  const { user, isAuthenticated, isLoading, checkoutWithPhone, verifyCheckoutOtp, resendOtp } = useAuth()
  const { selectedItems, selectedItemsTotal } = useCart()
  const searchParams = useSearchParams()
  const transactionId = searchParams.get('transactionId')

  // State for handling existing transaction
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(false)
  const [transactionData, setTransactionData] = useState<any>(null)  // Handle successful login from modal
  const handleLoginSuccess = () => {
    // After successful login, the user state will automatically update via AuthContext
    // and the form will be automatically filled with user data
    console.log("[Checkout] Login successful, form will auto-fill with user data")
  }
  // Handle checkout completion
  const handleCheckoutSuccess = (response: CheckoutResponse) => {
    setCheckoutResponse(response)
    updateStep(4) // Move to payment method selection
  }
  // Handle payment creation - redirect to payment status page
  const handlePaymentCreated = (response: PaymentCreateResponse) => {
    const paymentId = response.data.payment.id
    router.push(`/payment/status/${paymentId}`)
  }

  // Simplified - WhatsApp items only
  const whatsappItems = selectedItems.filter(item => item.type === 'whatsapp')
    // Use checkout state hook
  const {
    step,
    formData,
    voucherApplied,
    voucherDiscount,
    voucherData,
    voucherError,
    selectedPaymentMethod,
    updateStep,
    updateFormData,
    updateVoucherState,
    updateSelectedPaymentMethod,
  } = useCheckoutState()

  // Wrapper functions for backward compatibility with OrderSummary component
  const setVoucherApplied = useCallback((applied: boolean) => {
    updateVoucherState({ voucherApplied: applied })
  }, [updateVoucherState])

  const setVoucherDiscount = useCallback((discount: number) => {
    updateVoucherState({ voucherDiscount: discount })
  }, [updateVoucherState])
  const setVoucherData = useCallback((data: VoucherCheckResponse['data'] | null) => {
    updateVoucherState({ voucherData: data })
  }, [updateVoucherState])
  // Additional state variables (not persisted)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState(["", "", "", ""])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [checkoutResponse, setCheckoutResponse] = useState<CheckoutResponse | null>(null)
  const router = useRouter()

  // Load existing transaction if transactionId is provided
  useEffect(() => {
    if (transactionId && isAuthenticated) {
      const loadTransaction = async () => {
        setIsLoadingTransaction(true)
        try {
          const token = SessionManager.getToken()
          const response = await fetch(`/api/customer/transactions/${transactionId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              setTransactionData(result.data)
              
              // Fetch available payment methods for the transaction
              const paymentMethodsResponse = await fetch('/api/customer/payment/methods?currency=idr', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })

              let availablePaymentMethods = []
              let serviceFeePreview = []

              if (paymentMethodsResponse.ok) {
                const paymentMethodsResult = await paymentMethodsResponse.json()
                // console.log("[Checkout] Payment methods response:", paymentMethodsResult)
                
                if (paymentMethodsResult.success) {
                  availablePaymentMethods = paymentMethodsResult.data.paymentMethods
                  // console.log("[Checkout] Available payment methods:", availablePaymentMethods.length, "methods found")
                  
                  // Generate service fee preview for each payment method
                  // Use totalAfterDiscount if available (fresh calculation), otherwise use original amount
                  // If finalAmount/serviceFeeAmount are null (payment cancelled), use base amount for fresh calculation
                  const baseAmount = Number(result.data.totalAfterDiscount) || Number(result.data.amount) || 0
                  console.log("[Checkout] Base transaction amount for fee calculation:", baseAmount, {
                    totalAfterDiscount: result.data.totalAfterDiscount,
                    amount: result.data.amount,
                    finalAmount: result.data.finalAmount,
                    paymentStatus: result.data.payment?.status
                  })
                  
                  serviceFeePreview = availablePaymentMethods.map((method: any) => {
                    console.log("[Checkout] Processing method:", method.code, "serviceFee:", method.serviceFee)
                    
                    let feeAmount = 0
                    if (method.serviceFee && method.serviceFee.type === 'percentage') {
                      feeAmount = Math.round(baseAmount * method.serviceFee.value / 100)
                    } else if (method.serviceFee && method.serviceFee.type === 'fixed') {
                      feeAmount = method.serviceFee.value || 0
                    }
                    
                    const totalWithFee = baseAmount + feeAmount
                    
                    console.log("[Checkout] Method:", method.code, "baseAmount:", baseAmount, "feeAmount:", feeAmount, "totalWithFee:", totalWithFee)
                    
                    return {
                      paymentMethod: method.code,
                      feeAmount: feeAmount,
                      totalWithFee: totalWithFee
                    }
                  })
                  console.log("[Checkout] Service fee preview:", serviceFeePreview)
                  
                  // Create mock checkout response from transaction data for payment method step
                  const mockCheckoutResponse: CheckoutResponse = {
                    success: true,
                    data: {
                      transactionId: result.data.id,
                      status: "pending",
                      currency: "idr",
                      notes: result.data.notes || "",
                      items: [], // We'll use transactionData for items display
                      totalItems: 1,
                      subtotal: baseAmount,
                      totalDiscount: Number(result.data.discountAmount) || 0,
                      totalAfterDiscount: baseAmount,
                      serviceFeePreview: serviceFeePreview,
                      availablePaymentMethods: availablePaymentMethods,
                      nextStep: "payment"
                    },
                    message: "Transaction loaded successfully"
                  }
                  
                  setCheckoutResponse(mockCheckoutResponse)
                } else {
                  console.error("[Checkout] Payment methods API returned error:", paymentMethodsResult.error)
                }
              } else {
                console.error("[Checkout] Payment methods API failed:", paymentMethodsResponse.status, paymentMethodsResponse.statusText)
              }

              // Skip to payment method step
              updateStep(4)
            } else {
              setError("Transaksi tidak dapat digunakan untuk pembayaran baru")
            }
          } else {
            setError("Gagal memuat data transaksi")
          }
        } catch (error) {
          console.error("Failed to load transaction:", error)
          setError("Gagal memuat data transaksi")
        } finally {
          setIsLoadingTransaction(false)
        }
      }

      loadTransaction()
    }
  }, [transactionId, isAuthenticated, router, updateStep])

  // Auto-skip verification step if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user && step === 2) {
      console.log("[Checkout] User authenticated, skipping to payment step")
      updateStep(3)
    }
  }, [isAuthenticated, user, step, updateStep])

  // Auto-fill form data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && (!formData.name || !formData.email || !formData.whatsapp)) {
      // console.log("[Checkout] Auto-filling form with user data:", user)
      updateFormData({
        ...formData,
        name: formData.name || user.name || "",
        email: formData.email || user.email || "",
        whatsapp: formData.whatsapp || user.phone || ""
      })
    }
  }, [isAuthenticated, user, formData, updateFormData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Auto uppercase for voucher input to ensure consistent voucher code format
    const processedValue = name === 'voucher' ? value.toUpperCase() : value
    
    updateFormData({ ...formData, [name]: processedValue })
  }
  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Auto-focus next input
      if (value && index < 3) {
        const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`) as HTMLInputElement
        if (nextInput) nextInput.focus()
      }
    }
  }
  const handleSendOtp = async () => {
    if (!formData.whatsapp || !formData.name || !formData.email) {
      setError("Harap isi semua kolom wajib (nama, WhatsApp, email)")
      return
    }

    setError("")
    setIsSubmitting(true)

    try {
      const { error, success } = await checkoutWithPhone(formData.whatsapp, formData.name, formData.email)

      if (success) {
        setOtpSent(true)
        setSuccessMessage("Kode OTP telah dikirim ke WhatsApp Anda")
      } else if (error) {
        setError(error.message || "Gagal mengirim OTP. Silakan coba lagi.")
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
      console.error("Error sending OTP:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    if (!formData.whatsapp) {
      setError("Nomor WhatsApp tidak ditemukan")
      return
    }

    setError("")
    setSuccessMessage("")
    setIsSubmitting(true)

    try {
      const { error, success } = await resendOtp(formData.whatsapp, "signup")

      if (success) {
        setOtp(["", "", "", ""]) // Reset OTP input
        setSuccessMessage("Kode OTP baru telah dikirim ke WhatsApp Anda")
      } else if (error) {
        setError(error.message || "Gagal mengirim ulang OTP. Silakan coba lagi.")
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
      console.error("Error resending OTP:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError("")
    setSuccessMessage("")
    setIsSubmitting(true)

    try {
      const otpValue = otp.join("")
      console.log("[Checkout] Verifying OTP for phone:", formData.whatsapp)

      const result = await verifyCheckoutOtp(formData.whatsapp, otpValue)
      console.log("[Checkout] Raw OTP verification result:", result)

      const { error, success, isNewUser, user, token, passwordGenerated } = result

      console.log("[Checkout] OTP verification result:", { 
        success, 
        isNewUser, 
        hasUser: !!user, 
        hasToken: !!token, 
        passwordGenerated,
        userDetails: user ? { id: user.id, name: user.name, email: user.email } : null
      })

      if (success && user && token) {
        // Set success message based on whether user is new or existing
        if (isNewUser || passwordGenerated) {
          setSuccessMessage("Akun baru telah dibuat dan Anda telah login otomatis")
        } else {
          setSuccessMessage("Anda telah berhasil login")
        }        console.log("[Checkout] OTP verification successful, proceeding to payment step")

        // Short delay to show success message, then proceed to payment step
        setTimeout(() => {
          updateStep(3)
        }, 1500)
      } else if (error) {
        console.error("[Checkout] OTP verification error:", error)
        setError(error.message || "Kode OTP tidak valid. Silakan coba lagi.")
      } else {
        console.error("[Checkout] OTP verification failed without specific error", {
          success,
          hasUser: !!user,
          hasToken: !!token,
          result
        })
        setError("Verifikasi OTP gagal. Silakan coba lagi.")
      }
    } catch (err) {
      console.error("Error verifying OTP:", err)
      setError("Terjadi kesalahan. Silakan coba lagi.")    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApplyVoucher = async () => {
    if (!formData.voucher) {
      updateVoucherState({ voucherError: "Masukkan kode voucher terlebih dahulu" })
      return
    }

    setIsSubmitting(true)
    updateVoucherState({ voucherError: "" })

    try {
      // Prepare items for voucher check - WhatsApp only
      const voucherItems: VoucherCheckItem[] = []
      
      // Add whatsapp items as "whatsapp" type
      whatsappItems.forEach(item => {
        // Extract package ID and duration from composite ID
        // WhatsApp items have IDs like "packageId_monthly" or "packageId_yearly"
        const idParts = item.id.split('_')
        const packageId = idParts[0] // Original package ID
        const billingType = idParts[1] // "monthly" or "yearly"
          // Convert billing type to duration format expected by backend
        const duration = billingType === "yearly" ? "year" : "month"
        voucherItems.push({
          type: "whatsapp",
          id: packageId, // Use the original package ID, not the composite one
          duration: duration
        })
      })

      const voucherRequest: VoucherCheckRequest = {
        code: formData.voucher,
        currency: "idr",
        items: voucherItems
      }

      // Direct API call to check voucher
      const response = await fetch('/api/public/check-voucher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voucherRequest)
      })
      
      const voucherResponse = await response.json()
      
      if (voucherResponse.success && voucherResponse.isValid && voucherResponse.data) {
        updateVoucherState({
          voucherData: voucherResponse.data.voucher,
          voucherApplied: true,
          voucherDiscount: voucherResponse.data.calculation.discountAmount,
          voucherError: ""
        })
      } else {
        updateVoucherState({
          voucherData: null,
          voucherApplied: false,
          voucherDiscount: 0,
          voucherError: "Voucher tidak valid atau sudah kadaluarsa"
        })
      }    } catch (error: unknown) {
      updateVoucherState({
        voucherData: null,
        voucherApplied: false,
        voucherDiscount: 0,
        voucherError: error instanceof Error ? error.message : "Gagal memvalidasi voucher. Silakan coba lagi."
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleNextStep = () => {
    // Validate current step before proceeding
    if (step === 1) {
      if (!formData.name || !formData.whatsapp || !formData.email) {
        setError("Harap isi semua kolom wajib (nama, WhatsApp, email)")
        return
      }

      // If user is authenticated, skip verification step and go directly to checkout
      if (isAuthenticated) {
        updateStep(3)
      } else {
        updateStep(2)
      }
    }
  }

  // Check if we're loading authentication or transaction data
  if (isLoading || isLoadingTransaction) {
    return <LoadingState />
  }

  // For existing transaction, allow empty cart
  if (selectedItems.length === 0 && !transactionData) {
    return <EmptyCart />
  }

  return (
    <div className="container mx-auto py-20 sm:py-24 lg:py-36 px-4 sm:px-6 lg:px-4">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Checkout</h1>        {/* Unified Progress Steps - Updated to 4 steps only */}
        <div className="flex items-center justify-between max-w-full sm:max-w-2xl lg:max-w-3xl mb-6 sm:mb-8 lg:mb-10">
          <Step number={1} title="Informasi" isActive={step === 1} isCompleted={step > 1} />
          <div className="h-0.5 flex-1 mx-1 sm:mx-2 bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full bg-primary"
              style={{ width: step > 1 ? "100%" : "0%", transition: "width 0.3s ease" }}
            />
          </div>

          {!isAuthenticated && (
            <>
              <Step number={2} title="Verifikasi" isActive={step === 2} isCompleted={step > 2} />
              <div className="h-0.5 flex-1 mx-1 sm:mx-2 bg-gray-200 dark:bg-gray-800">
                <div
                  className="h-full bg-primary"
                  style={{ width: step > 2 ? "100%" : "0%", transition: "width 0.3s ease" }}
                />
              </div>
            </>
          )}

          <Step 
            number={isAuthenticated ? 2 : 3} 
            title="Checkout" 
            isActive={step === 3} 
            isCompleted={step > 3} 
          />
          <div className="h-0.5 flex-1 mx-1 sm:mx-2 bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full bg-primary"
              style={{ width: step > 3 ? "100%" : "0%", transition: "width 0.3s ease" }}
            />
          </div>

          <Step 
            number={isAuthenticated ? 3 : 4} 
            title="Pilih Pembayaran" 
            isActive={step === 4} 
            isCompleted={step > 4} 
          />
        </div>
      </div>      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Column - Checkout Steps */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          {/* Step 1: Contact Information */}
          {step === 1 && (
            <ContactInformationStep
              formData={formData}
              handleInputChange={handleInputChange}
              handleNextStep={handleNextStep}
              isAuthenticated={isAuthenticated}
              user={user ? {
                ...user,
                role: user.role || 'customer' // Provide default role if undefined
              } : null}
              error={error}
              onLoginSuccess={handleLoginSuccess}
            />
          )}          {/* Step 2: WhatsApp Verification (Only for non-authenticated users) */}
          {step === 2 && !isAuthenticated && (
            <VerificationStep
              formData={formData}
              error={error}
              successMessage={successMessage}
              otpSent={otpSent}
              isSubmitting={isSubmitting}
              otp={otp}
              handleSendOtp={handleSendOtp}
              handleResendOtp={handleResendOtp}
              handleOtpChange={handleOtpChange}
              handleVerifyOtp={handleVerifyOtp}
              setStep={updateStep}
            />
          )}          {/* Step 3: Checkout */}
          {step === 3 && (
            <CheckoutStep
              isAuthenticated={isAuthenticated}
              formData={formData}
              selectedItems={selectedItems}
              whatsappItems={whatsappItems}
              voucherApplied={voucherApplied}
              selectedItemsTotal={selectedItemsTotal}
              voucherDiscount={voucherDiscount}
              setStep={updateStep}
              onCheckoutSuccess={handleCheckoutSuccess}
              onError={setError}
              error={error}
            />
          )}

          {/* Step 4: Payment Method Selection */}
          {step === 4 && checkoutResponse && (
            <PaymentMethodStep
              checkoutResponse={checkoutResponse}
              transactionData={transactionData}
              setStep={updateStep}
              onPaymentCreated={handlePaymentCreated}
              onError={setError}
              error={error}
              onPaymentMethodChange={updateSelectedPaymentMethod}
            />
          )}
        </div>        {/* Right Column - Order Summary */}
        <div className="order-1 lg:order-2">
          {/* Show PaymentOrderSummary during payment method selection (step 4), regular OrderSummary for other steps */}
          {step === 4 ? (
            <PaymentOrderSummary
              whatsappItems={whatsappItems}
              selectedItemsTotal={selectedItemsTotal}
              voucherApplied={voucherApplied}
              voucherDiscount={voucherDiscount}
              voucherData={voucherData}
              checkoutResponse={checkoutResponse || undefined}
              selectedPaymentMethod={selectedPaymentMethod}
            />
          ) : (
            <OrderSummary
              whatsappItems={whatsappItems}
              selectedItemsTotal={selectedItemsTotal}
              formData={formData}
              handleInputChange={handleInputChange}
              voucherApplied={voucherApplied}
              voucherDiscount={voucherDiscount}
              voucherData={voucherData}
              voucherError={voucherError}
              isSubmitting={isSubmitting}
              handleApplyVoucher={handleApplyVoucher}
              setVoucherApplied={setVoucherApplied}
              setVoucherDiscount={setVoucherDiscount}
              setVoucherData={setVoucherData}
              setFormData={updateFormData}
            />
          )}
        </div>
      </div>
    </div>
  )
}

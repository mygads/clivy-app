import { useState, useCallback } from "react"
import type { CheckoutForm } from "@/types/checkout"

const defaultFormData: CheckoutForm = {
  name: "",
  whatsapp: "",
  email: "",
  notes: "",
  voucher: "",
}

export function useCheckoutState() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CheckoutForm>(defaultFormData)
  const [voucherData, setVoucherData] = useState<any>(null)
  const [voucherApplied, setVoucherApplied] = useState(false)
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [voucherError, setVoucherError] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")

  // Update step
  const updateStep = useCallback((newStep: number) => {
    setStep(newStep)
  }, [])

  // Update form data
  const updateFormData = useCallback((newFormData: Partial<CheckoutForm>) => {
    setFormData(prev => ({ ...prev, ...newFormData }))
  }, [])

  // Update voucher state
  const updateVoucherState = useCallback((voucherState: {
    voucherData?: any
    voucherApplied?: boolean
    voucherDiscount?: number
    voucherError?: string
  }) => {
    if (voucherState.voucherData !== undefined) setVoucherData(voucherState.voucherData)
    if (voucherState.voucherApplied !== undefined) setVoucherApplied(voucherState.voucherApplied)
    if (voucherState.voucherDiscount !== undefined) setVoucherDiscount(voucherState.voucherDiscount)
    if (voucherState.voucherError !== undefined) setVoucherError(voucherState.voucherError)
  }, [])

  // Update selected payment method
  const updateSelectedPaymentMethod = useCallback((paymentMethod: string) => {
    setSelectedPaymentMethod(paymentMethod)
  }, [])

  return {
    // State
    step,
    formData,
    voucherData,
    voucherApplied,
    voucherDiscount,
    voucherError,
    selectedPaymentMethod,
    
    // Actions
    updateStep,
    updateFormData,
    updateVoucherState,
    updateSelectedPaymentMethod,
  }
}

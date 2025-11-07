"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import QRCode from "react-qr-code"
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  AlertTriangle, 
  Copy, 
  RefreshCw, 
  ArrowLeft,
  CreditCard,
  Building,
  Calendar,
  Hash,
  Loader2,
  Smartphone,
  LogIn
} from "lucide-react"
import Link from "next/link"
import { PaymentStatus } from "@/types/checkout"
import { SessionManager } from "@/lib/storage"
import { useAuth } from "@/components/Auth/AuthContext"
import { useCart } from "@/components/Cart/CartContext"

interface AdditionalInfo {
  // Manual bank transfer
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    swiftCode?: string;
    currency: string;
  };
  // Gateway payments
  paymentType?: 'qris' | 'virtual_account' | 'gateway_url' | 'gateway_other' | 'retail';
  qrString?: string;
  vaNumber?: string;
  paymentUrl?: string;
  amount?: string;
  // Common fields
  note?: string;
  steps?: string[];
}

interface PaymentStatusPageProps {
  paymentId: string
}

export default function PaymentStatusPage({ paymentId }: PaymentStatusPageProps) {
    const router = useRouter()
    const { isAuthenticated, user } = useAuth()
    const { clearSelectedItemsFromCart } = useCart()
    const [paymentData, setPaymentData] = useState<PaymentStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [attempts, setAttempts] = useState(0)
    const [timeLeft, setTimeLeft] = useState<string>("") 
    const [expiredDate, setExpiredDate] = useState<string>("")  
    const [cancellingPayment, setCancellingPayment] = useState(false)
    const [creatingNewPayment, setCreatingNewPayment] = useState(false)
    const maxAttempts = 10 * 60 // 10 minutes with 1-second intervals
    
    // Use refs to avoid race conditions and stale closures
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const isPollingRef = useRef(false)
    const paymentStatusRef = useRef<string | null>(null)
    const shouldStopPollingRef = useRef(false)
    const attemptsRef = useRef(0)
    
    // Helper function to check if payment method should show the continue payment button
    const shouldShowPaymentButton = (method: string): boolean => {
        // Extract Duitku payment method code (remove 'duitku_' prefix if exists)
        const duitkuMethod = method.replace(/^duitku_/, '').toUpperCase()
        
        // Define payment methods that should show the continue payment button
        const showButtonMethods: { [key: string]: boolean } = {
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
        
        return showButtonMethods[duitkuMethod] || false
    }

    // Function to fetch payment status from API
    const fetchPaymentStatus = useCallback(async () => {
        try {
            // Use public endpoint if not authenticated, otherwise use customer endpoint
            const apiUrl = `/api/public/payment/${paymentId}/status`
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }
            

            const response = await fetch(apiUrl, { headers })

            if (!response.ok) {
                throw new Error('Failed to fetch payment status')
            }

            const result = await response.json()
            setPaymentData(result)
            setError(null)

            return result
        } catch (error) {
            console.error('Error fetching payment status:', error)
            setError('Failed to load payment data')
            return null
        }
    }, [paymentId])

    // Cleanup function to stop polling
    const stopPolling = useCallback(() => {
        // console.log("[PaymentStatus] Stopping polling...")
        shouldStopPollingRef.current = true
        isPollingRef.current = false
        
        // Set window flag to prevent any new polling attempts
        if (typeof window !== 'undefined') {
            (window as any).__paymentPollingStopped = true
        }
        
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [])

    // Status polling for pending payments
    useEffect(() => {
        if (!paymentId) return
        
        // Check if polling was already stopped globally
        if (typeof window !== 'undefined' && (window as any).__paymentPollingStopped) {
            // console.log("[PaymentStatus] Polling already stopped globally, skipping")
            return
        }

        // Reset refs for this polling session
        shouldStopPollingRef.current = false
        attemptsRef.current = 0

        const checkStatus = async () => {
            // Check if we should stop polling
            if (shouldStopPollingRef.current) {
                // console.log("[PaymentStatus] Polling stopped by flag")
                return
            }
            
            // Double check window flag
            if (typeof window !== 'undefined' && (window as any).__paymentPollingStopped) {
                // console.log("[PaymentStatus] Polling stopped by window flag")
                return
            }

            // Check if already polling to prevent race conditions
            if (isPollingRef.current) {
                // console.log("[PaymentStatus] Already polling, skipping this check")
                return
            }

            isPollingRef.current = true

            try {
                setLoading(attemptsRef.current === 0) // Only show loading on first attempt
                
                const result = await fetchPaymentStatus()
                if (!result || shouldStopPollingRef.current) return

                const currentStatus = result.data.payment.status
                paymentStatusRef.current = currentStatus

                // console.log(`[PaymentStatus] Status check attempt ${attemptsRef.current + 1}, Status: ${currentStatus}`)

                // If payment is successful, clear selected items from cart and redirect to success page
                if (currentStatus === "paid") {
                    // console.log("[PaymentStatus] Payment successful - stopping polling and redirecting")
                    
                    // CRITICAL: Stop polling IMMEDIATELY before any other operations
                    stopPolling()
                    
                    // Clear selected items from cart after successful payment
                    clearSelectedItemsFromCart()
                    // console.log("[PaymentStatus] Payment successful - cleared selected items from cart")
                    
                    // Check notification status for debugging but don't block redirect
                    if (result.data.payment.emailSent === false || result.data.payment.whatsappSent === false) {
                        console.warn("[PaymentStatus] Some notifications failed but payment was successful", {
                            emailSent: result.data.payment.emailSent,
                            whatsappSent: result.data.payment.whatsappSent
                        })
                    }
                    
                    // Use replace instead of push to prevent back navigation to pending status
                    // Add small delay to ensure cleanup completes
                    setTimeout(() => {
                        router.replace(`/payment/success/${paymentId}`)
                    }, 100)
                    return
                }

                // If payment failed, expired, cancelled, or rejected, stop polling
                if (["failed", "expired", "cancelled", "rejected"].includes(currentStatus)) {
                    // console.log(`[PaymentStatus] Payment finalized with status: ${currentStatus} - stopping polling`)
                    stopPolling()
                    return
                }

                // Only continue polling if payment is still pending
                if (currentStatus === "pending") {
                    attemptsRef.current++
                    setAttempts(attemptsRef.current)
                    // console.log(`[PaymentStatus] Payment still pending, will check again in 3 seconds (attempt ${attemptsRef.current}/${maxAttempts})`)

                    // Check if max attempts reached
                    if (attemptsRef.current >= maxAttempts) {
                        // console.log("[PaymentStatus] Max attempts reached - stopping polling")
                        stopPolling()
                        setError("Timeout: Gagal mengecek status pembayaran setelah 10 menit")
                        return
                    }
                } else {
                    // Unknown status, stop polling to be safe
                    // console.log(`[PaymentStatus] Unknown status: ${currentStatus} - stopping polling`)
                    stopPolling()
                }

            } catch (err: any) {
                console.error("Error checking payment status:", err)
                setError("Gagal mengecek status pembayaran")
                attemptsRef.current++
                setAttempts(attemptsRef.current)
                
                if (attemptsRef.current >= maxAttempts) {
                    // console.log("[PaymentStatus] Max attempts reached due to errors - stopping polling")
                    stopPolling()
                    setError("Timeout: Gagal mengecek status pembayaran setelah 10 menit")
                }
            } finally {
                setLoading(false)
                isPollingRef.current = false
            }
        }

        // Initial check
        checkStatus()

        // Set up polling interval for pending payments only
        intervalRef.current = setInterval(() => {
            // Only continue if not marked to stop and no window flag
            if (typeof window !== 'undefined' && (window as any).__paymentPollingStopped) {
                // console.log("[PaymentStatus] Interval detected window stop flag, clearing interval")
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                    intervalRef.current = null
                }
                return
            }
            
            if (!shouldStopPollingRef.current && paymentStatusRef.current === "pending") {
                checkStatus()
            } else if (shouldStopPollingRef.current) {
                // console.log("[PaymentStatus] Interval detected stop flag, clearing interval")
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                    intervalRef.current = null
                }
            }
        }, 3000) // Check every 3 seconds

        return () => {
            // console.log("[PaymentStatus] Cleanup: stopping polling")
            stopPolling()
        }
    }, [paymentId, router, maxAttempts, fetchPaymentStatus, clearSelectedItemsFromCart, stopPolling])

    // Countdown timer for payment expiration using actual expiresAt from database
    useEffect(() => {
        if (!paymentData?.data?.payment) return

        const payment = paymentData.data.payment
        
        // Use expiresAt from database if available, otherwise calculate 24 hours from creation
        let expiryTime: number;
        if (payment.expiresAt) {
            expiryTime = new Date(payment.expiresAt).getTime()
        } else {
            // Fallback to 24 hours from creation (for older payments without expiresAt)
            const createdAt = new Date(payment.createdAt).getTime()
            expiryTime = createdAt + (24 * 60 * 60 * 1000) // 24 hours in milliseconds
        }
        
        // Set expired date display
        setExpiredDate(new Date(expiryTime).toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
        }))

        const updateCountdown = () => {
        const now = new Date().getTime()
        const difference = expiryTime - now

        if (difference > 0) {
            const hours = Math.floor(difference / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
        } else {
            setTimeLeft("00:00:00")
            
            // If payment just expired but status is still pending, refresh data from server
            if (payment.status === 'pending') {
                // console.log('[PAYMENT_EXPIRED] Payment expired, refreshing status from server...');
                fetchPaymentStatus();
            }
        }
        }

        // Update immediately
        updateCountdown()

        // Update every second
        const countdownInterval = setInterval(updateCountdown, 1000)

        return () => clearInterval(countdownInterval)
    }, [paymentData, fetchPaymentStatus])

    // Handle copy to clipboard
    const handleCopy = async (text: string, fieldName: string) => {
        try {
        await navigator.clipboard.writeText(text)
        setCopiedField(fieldName)
        setTimeout(() => setCopiedField(null), 2000)
        } catch (error) {
        console.error("Failed to copy:", error)
        }
    }

    // Handle create new payment for cancelled/expired payments (only for authenticated users)
    const handleCreateNewPayment = async () => {
        if (!paymentData?.data?.payment?.transactionId || !isAuthenticated) return
        
        try {
            setCreatingNewPayment(true)
            setError("") // Clear any previous errors
            
            const token = SessionManager.getToken()
            if (!token) {
                setError("Session expired. Please login again.")
                return
            }

            // Get transaction details to redirect to checkout
            const response = await fetch(`/api/customer/transactions/${paymentData.data.payment.transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Failed to get transaction details')
                } else if (response.status === 400) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Transaction cannot be used for new payment')
                } else {
                    throw new Error('Failed to load transaction data')
                }
            }
            
            const result = await response.json()
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to load transaction data')
            }
            
            // Redirect to checkout page with transaction ID
            router.push(`/checkout?transactionId=${paymentData.data.payment.transactionId}`)
        } catch (error) {
            console.error("Failed to create new payment:", error)
            const errorMessage = error instanceof Error ? error.message : "Failed to create new payment"
            setError(errorMessage)
        } finally {
            setCreatingNewPayment(false)
        }
    }

    // Handle cancel payment
    // Handle cancel payment (only for authenticated users)
    const handleCancelPayment = async () => {
        if (!paymentData?.data?.payment?.id || !isAuthenticated) return
        
        try {
            setCancellingPayment(true)
            
            const token = SessionManager.getToken()
            if (!token) {
                setError("Session expired. Please login again.")
                return
            }

            const response = await fetch(`/api/customer/payment/${paymentData.data.payment.id}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: "Cancelled by user" })
            })

            if (!response.ok) {
                throw new Error('Failed to cancel payment')
            }
            
            // Refresh payment data to show updated status
            const statusResponse = await fetch(`/api/public/payment/${paymentId}/status`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
        })
        
        if (statusResponse.ok) {
            const result = await statusResponse.json()
            setPaymentData(result)
        }
        } catch (error) {
        console.error("Failed to cancel payment:", error)
        setError("Gagal membatalkan pembayaran")
        } finally {
        setCancellingPayment(false)
        }
    }

    // Loading state
    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Memuat status pembayaran...</p>
            </div>
        </div>
        )
    }

    // Error state
    if (error || !paymentData) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md mx-auto text-center p-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Error Occurred
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || "Failed to load payment status"}
            </p>
            <div className="space-y-3">
                <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                Try Again
                </button>
                <Link
                href="/dashboard"
                className="block w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                Dashboard
                </Link>
            </div>
            </div>
        </div>
        )
    }

    const { payment, instructions, additionalInfo, pricing, items, voucher, serviceFeeInfo } = paymentData.data
    const additionalInfoTyped = additionalInfo as AdditionalInfo
    
    // Group items by category with prioritized order: Products -> Add-ons -> WhatsApp Services
    const groupItemsByCategory = () => {
        const whatsappServices = items.filter((item: any) => item.type === 'whatsapp_service')
        
        
        const whatsappGroups = whatsappServices.map((whatsappItem: any) => ({
            package: whatsappItem,
            categoryType: 'whatsapp'
        }))
        
        
        return {
        packageGroups: [...whatsappGroups],
        }
    }
    
    const { packageGroups } = groupItemsByCategory()
    
    // Status configuration
    const getStatusConfig = () => {
        switch (payment.status) {
        case "paid":
            return {
            icon: CheckCircle,
            color: "text-green-500",
            bgColor: "bg-green-50 dark:bg-green-900/20",
            borderColor: "border-green-200 dark:border-green-800",
            title: "Payment Successful!",
            description: "Pembayaran Anda telah berhasil dikonfirmasi dan diproses."
            }
        case "pending":
            return {
            icon: Clock,
            color: "text-yellow-500",
            bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
            borderColor: "border-yellow-200 dark:border-yellow-800",
            title: "Waiting for Payment",
            description: "Please make the payment according to the instructions below."
            }
        case "failed":
            return {
            icon: XCircle,
            color: "text-red-500",
            bgColor: "bg-red-50 dark:bg-red-900/20",
            borderColor: "border-red-200 dark:border-red-800",
            title: "Payment Failed",
            description: "Payment could not be processed. Please try again."
            }
        case "expired":
            return {
            icon: Clock,
            color: "text-orange-500",
            bgColor: "bg-orange-50 dark:bg-orange-900/20",
            borderColor: "border-orange-200 dark:border-orange-800",
            title: "Payment Expired",
            description: "Payment time has expired. You can create a new payment for this transaction."
            }
        case "cancelled":
            return {
            icon: XCircle,
            color: "text-gray-500",
            bgColor: "bg-gray-50 dark:bg-gray-900/20",
            borderColor: "border-gray-200 dark:border-gray-800",
            title: "Payment Cancelled",
            description: "Payment has been cancelled. You can create a new payment for this transaction."
            }
        default:
            return {
            icon: AlertCircle,
            color: "text-gray-500",
            bgColor: "bg-gray-50 dark:bg-gray-900/20",
            borderColor: "border-gray-200 dark:border-gray-800",
            title: "Unknown Status",
            description: "Payment status is being updated."
            }
        }
    }

    // Get payment method image URL from database or fallback
    const getPaymentMethodImage = (): string => {
        // Special case for QRIS - use standard QRIS image
        if (additionalInfoTyped?.paymentType === 'qris' || payment.method.toLowerCase().includes('qris')) {
            return 'https://sandbox.duitku.com/Images/qris/qris-standard.png';
        }
        
        // First priority: use gatewayImageUrl from database
        if (serviceFeeInfo && 'gatewayImageUrl' in serviceFeeInfo && serviceFeeInfo.gatewayImageUrl) {
            return serviceFeeInfo.gatewayImageUrl as string;
        }
        
        // Default payment icon
        return 'https://via.placeholder.com/120x60/f3f4f6/6b7280?text=Payment';
    };

    const statusConfig = getStatusConfig()
    const StatusIcon = statusConfig.icon

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 sm:py-4 md:py-6">
                {/* Header */}
                <div className="mb-3 sm:mb-4 md:mb-6">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors mb-2 sm:mb-3 md:mb-4"
                    >
                        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm md:text-base">Back to Dashboard</span>
                    </Link>
                    <div className="text-center">
                        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-1">Payment Status</h1>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-6 xl:gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5 xl:space-y-6">
                    {/* Status Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${statusConfig.bgColor} border ${statusConfig.borderColor} rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 shadow-sm`}
                    >
                        {payment.status === "pending" && (
                            <div className="mb-2 sm:mb-3 md:mb-4 space-y-1.5 sm:space-y-2 md:space-y-3">
                                {/* Countdown Timer */}
                                <div className="p-1.5 sm:p-2 md:p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1 sm:gap-2 mb-1">
                                                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                                <span className="text-xs md:text-sm font-medium text-amber-800 dark:text-amber-200 break-words">
                                                    Expired Time: {expiredDate}
                                                </span>
                                            </div>
                                            {timeLeft && timeLeft !== "00:00:00" ? (
                                                <div className="text-sm sm:text-base md:text-lg font-bold font-mono text-red-600 dark:text-red-400">
                                                    {timeLeft}
                                                </div>
                                            ) : (
                                                <div className="text-xs md:text-sm text-red-600 dark:text-red-400 font-medium">
                                                    Payment Expired
                                                </div>
                                            )}
                                        </div>
                                        {timeLeft && timeLeft !== "00:00:00" && isAuthenticated && (
                                            <button
                                                onClick={handleCancelPayment}
                                                disabled={cancellingPayment || timeLeft === "00:00:00"}
                                                className="bg-red-100 hover:bg-red-200 disabled:bg-gray-300 disabled:cursor-not-allowed text-red-700 disabled:text-gray-500 px-2 sm:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg transition-colors text-xs md:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 border border-red-300 dark:bg-red-900/50 dark:hover:bg-red-800/50 dark:text-red-200 dark:border-red-600 dark:disabled:bg-gray-800 w-full sm:w-auto"
                                            >
                                                {cancellingPayment ? (
                                                    <>
                                                        <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 animate-spin" />
                                                        <span className="hidden sm:inline">Cancelling...</span>
                                                        <span className="sm:hidden">Cancel...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                                                        Cancel
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Total Payment Amount */}
                                <div className="mb-2 sm:mb-3 md:mb-4 p-2 sm:p-3 md:p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                    <div className="text-center">
                                        <p className="text-xs md:text-sm text-primary font-medium mb-0.5 sm:mb-1">Payment Amount</p>
                                        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-primary break-words">
                                            Rp {payment.amount.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-2 sm:gap-3 md:gap-4 lg:gap-5">
                            <div className={`p-1.5 sm:p-2 md:p-3 rounded-full ${statusConfig.bgColor} border ${statusConfig.borderColor} flex-shrink-0`}>
                                <StatusIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 ${statusConfig.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className={`text-sm sm:text-base md:text-lg font-bold ${statusConfig.color} break-words`}>
                                    {statusConfig.title}
                                </h2>
                                <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 break-words">
                                    {statusConfig.description}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                    {(payment.status === "cancelled" || payment.status === "expired" || timeLeft === "00:00:00") && (
                        <div className="space-y-3 sm:space-y-4">
                            {isAuthenticated ? (
                                <div className="p-3 sm:p-4 bg-blue-50 dark:bg-gray-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="text-center">
                                        {(payment.status === "expired" || timeLeft === "00:00:00") && (
                                            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                                <p className="text-xs sm:text-sm text-orange-800 dark:text-orange-200 break-words">
                                                    <strong>Payment expired at:</strong><br />
                                                    {expiredDate}
                                                </p>
                                            </div>
                                        )}
                                        <button
                                            onClick={handleCreateNewPayment}
                                            disabled={creatingNewPayment}
                                            className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                                        >
                                            {creatingNewPayment ? (
                                                <>
                                                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                                    <span className="hidden sm:inline">Process New Payment...</span>
                                                    <span className="sm:hidden">Processing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    <span className="hidden sm:inline">Create New Payment</span>
                                                    <span className="sm:hidden">New Payment</span>
                                                </>
                                            )}
                                        </button>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 break-words">
                                            {payment.status === "expired" 
                                                ? "Transaction still valid, create payment with same or different method"
                                                : "You can choose the same or different payment method"
                                            }
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <div className="text-center">
                                        
                                        {(payment.status === "expired" || timeLeft === "00:00:00") && (
                                            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                                <p className="text-xs sm:text-sm text-orange-800 dark:text-orange-200 break-words">
                                                    <strong>Payment expired at:</strong><br />
                                                    {expiredDate}
                                                </p>
                                            </div>
                                        )}
                                        <Link
                                            href={`/signin?redirect=${encodeURIComponent(`/payment/status/${paymentId}`)}`}
                                            className="w-full bg-primary hover:bg-primary/90 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                                        >
                                            <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            <span className="hidden sm:inline">Login to Continue Payment</span>
                                            <span className="sm:hidden">Login to Continue</span>
                                        </Link>
                                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 break-words">
                                            After logging in, you can create a new payment for this transaction
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Helpful information about expiration policies */}
                            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center text-sm sm:text-base">
                                    <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 text-gray-500 flex-shrink-0" />
                                    <span className="break-words">Expiration Time Information</span>
                                </h4>
                                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    <p className="break-words">• <strong>Credit & Debit Card:</strong> 30 minutes after creation</p>
                                    <p className="break-words">• <strong>QRIS:</strong> 24 hours</p>
                                    <p className="break-words">• <strong>E-Wallet (OVO/DANA/LinkAja):</strong> 24 hours</p>
                                    <p className="break-words">• <strong>Virtual Account (BCA/Mandiri/BNI):</strong> 24 hours</p>
                                    <p className="break-words">• <strong>ShopeePayz/Jenius Pay:</strong> 60 minutes</p>
                                    <p className="break-words">• <strong>Transaction:</strong> Valid for up to 7 days after checkout</p>
                                    <p className="break-words">You can create a new payment as long as the transaction is still valid</p>
                                </div>
                            </div>
                        </div>
                    )}

                {/* Payment Instructions (for pending payments that are not expired) */}
                {payment.status === "pending" && timeLeft !== "00:00:00" && additionalInfoTyped && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6"
                    >
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4 break-words">
                            Payment Instructions - {payment.methodName || payment.method.replace(/_/g, ' ')}
                        </h3>
                        
                        <div className="mb-3 sm:mb-4 md:mb-6 p-1.5 sm:p-2 md:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-blue-800 dark:text-blue-200 font-medium text-xs md:text-sm lg:text-base break-words">{instructions}</p>
                        </div>

                        {/* Manual Bank Transfer - Bank Details */}
                        {additionalInfoTyped.bankDetails && (
                            <>
                                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                                    <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Account Details</h4>
                                    <div className="grid gap-2 sm:gap-3">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-1 sm:gap-0">
                                            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Bank:</span>
                                            <span className="font-medium text-sm sm:text-base break-words">{additionalInfoTyped.bankDetails.bankName}</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-1 sm:gap-2">
                                            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Account Number:</span>
                                            <div className="flex items-center gap-2">
                                            <span className="font-mono font-medium text-sm sm:text-base break-all">{additionalInfoTyped.bankDetails.accountNumber.replace(/(.{4})/g, '$1 ').trim()}</span>
                                            <button
                                                onClick={() => handleCopy(additionalInfoTyped.bankDetails!.accountNumber, 'accountNumber')}
                                                className="text-gray-400 hover:text-primary transition-colors p-1 flex-shrink-0"
                                                title="Salin nomor rekening"
                                            >
                                                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </button>
                                            {copiedField === 'accountNumber' && (
                                                <span className="text-xs text-green-600 flex-shrink-0">Copied!</span>
                                            )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-1 sm:gap-2">
                                            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Payment Amount:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-base sm:text-lg lg:text-xl text-primary break-all">
                                                    Rp {payment.amount.toLocaleString('id-ID')}
                                                </span>
                                                <button
                                                    onClick={() => handleCopy(payment.amount.toString(), 'totalPayment')}
                                                    className="text-gray-400 hover:text-primary transition-colors p-1 flex-shrink-0"
                                                    title="Salin total pembayaran"
                                                >
                                                    <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                </button>
                                                {copiedField === 'totalPayment' && (
                                                    <span className="text-xs text-green-600 flex-shrink-0">Copied!</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-1 sm:gap-0">
                                            <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Account Name:</span>
                                            <span className="font-medium text-sm sm:text-base break-words">{additionalInfoTyped.bankDetails.accountName}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* QRIS Payment - QR Code */}
                        {additionalInfoTyped.paymentType === 'qris' && additionalInfoTyped.qrString && (
                            <div className="mb-3 sm:mb-4 md:mb-6">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2 md:mb-3 text-xs sm:text-sm md:text-base">QR Code Payment</h4>
                                <div className="flex justify-center p-2 sm:p-3 md:p-4 lg:p-6 bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                    <div className="flex flex-col items-center justify-center space-y-1 sm:space-y-2 md:space-y-3">
                                        <div className="flex items-center justify-center">
                                            <div className="bg-white p-1 md:p-2">
                                                <Image
                                                    src={getPaymentMethodImage()}
                                                    alt={payment.method}
                                                    width={160}
                                                    height={80}
                                                    className="h-6 sm:h-8 md:h-10 lg:h-12 xl:h-14 w-auto object-contain"
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-white p-1 sm:p-2 md:p-4 lg:p-6">
                                            <QRCode
                                                value={additionalInfoTyped.qrString}
                                                size={window.innerWidth < 640 ? 160 : window.innerWidth < 768 ? 180 : window.innerWidth < 1024 ? 200 : window.innerWidth < 1440 ? 220 : 256}
                                                className="w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-52 lg:h-52 xl:w-64 xl:h-64"
                                            />
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <Image
                                                src="https://sandbox.duitku.com/Images/qris/bg-client-01.png"
                                                alt="QRIS Logo"
                                                width={200}
                                                height={80}
                                                className="h-12 sm:h-14 md:h-16 lg:h-20 xl:h-24 w-auto object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Retail Payment Methods (FT, IR) - Show database instructions */}
                        {additionalInfoTyped.paymentType === 'retail' && (
                            <div className="mb-6 space-y-4">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                    {payment.methodName || payment.method.replace(/_/g, ' ')} - Payment Instructions
                                </h4>
                                
                                {/* Payment Code Display */}
                                {additionalInfoTyped.vaNumber && (
                                    <div className="space-y-3">
                                        <div className="bg-white p-4 justify-center flex">
                                            <Image
                                                src={getPaymentMethodImage()}
                                                alt={payment.methodName || payment.method}
                                                width={160}
                                                height={80}
                                                className="h-12 w-auto object-contain"
                                            />
                                        </div>
                                        <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                                                <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">VA Number:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-base sm:text-lg lg:text-xl text-primary break-all">
                                                        {additionalInfoTyped.vaNumber!.replace(/(.{4})/g, '$1 ').trim()}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopy(additionalInfoTyped.vaNumber!, 'paymentCode')}
                                                        className="text-gray-400 hover:text-primary transition-colors p-1 flex-shrink-0"
                                                        title="Salin kode pembayaran"
                                                    >
                                                        <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    </button>
                                                    {copiedField === 'paymentCode' && (
                                                    <span className="text-xs text-green-600 flex-shrink-0">Copied!</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                                                <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Payment Amount:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-base sm:text-lg lg:text-xl text-primary break-all">
                                                            Rp {payment.amount.toLocaleString('id-ID')}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopy(payment.amount.toString(), 'amount')}
                                                        className="text-gray-400 hover:text-primary transition-colors p-1 flex-shrink-0"
                                                        title="Salin jumlah pembayaran"
                                                    >
                                                        <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    </button>
                                                    {copiedField === 'amount' && (
                                                    <span className="text-xs text-green-600 flex-shrink-0">Copied!</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Virtual Account Payment - VA Number (only for actual bank VA methods) */}
                        {additionalInfoTyped.paymentType === 'virtual_account' && additionalInfoTyped.vaNumber && (
                            <div className="mb-6 space-y-4">
                                <h4 className="font-medium text-gray-900 dark:text-white">Virtual Account</h4>
                                <div className="bg-white p-4 justify-center flex">
                                    <Image
                                        src={getPaymentMethodImage()}
                                        alt={payment.method}
                                        width={160}
                                        height={80}
                                        className="h-12 w-auto object-contain"
                                    />
                                </div>
                                <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                                        <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Virtual Account Number:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-base sm:text-lg lg:text-xl text-primary break-all">
                                                {additionalInfoTyped.vaNumber!.replace(/(.{4})/g, '$1 ').trim()}
                                            </span>
                                            <button
                                                onClick={() => handleCopy(additionalInfoTyped.vaNumber!, 'vaNumber')}
                                                className="text-gray-400 hover:text-primary transition-colors p-1 flex-shrink-0"
                                                title="Salin nomor VA"
                                            >
                                                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </button>
                                            {copiedField === 'vaNumber' && (
                                            <span className="text-xs text-green-600 flex-shrink-0">Copied!</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                                        <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Payment Amount:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-base sm:text-lg lg:text-xl text-primary break-all">
                                                    Rp {payment.amount.toLocaleString('id-ID')}
                                            </span>
                                            <button
                                                onClick={() => handleCopy(payment.amount.toString(), 'amount')}
                                                className="text-gray-400 hover:text-primary transition-colors p-1 flex-shrink-0"
                                                title="Salin jumlah pembayaran"
                                            >
                                                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </button>
                                            {copiedField === 'amount' && (
                                            <span className="text-xs text-green-600 flex-shrink-0">Copied</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Database Payment Instructions - Show for retail methods or if available */}
                        {serviceFeeInfo && serviceFeeInfo.instructions && (
                            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <h4 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center">
                                    <Building className="mr-2 h-4 w-4" />
                                    {payment.methodName || payment.method.replace(/_/g, ' ')} - Payment Instructions
                                </h4>
                                
                                {serviceFeeInfo.instructionType === "text" ? (
                                    <div className="text-sm text-green-800 dark:text-green-200 whitespace-pre-line">
                                        {serviceFeeInfo.instructions}
                                    </div>
                                ) : serviceFeeInfo.instructionType === "image" && serviceFeeInfo.instructionImageUrl ? (
                                    <div className="space-y-3">
                                        <div className="text-sm text-green-800 dark:text-green-200 whitespace-pre-line">
                                            {serviceFeeInfo.instructions}
                                        </div>
                                        <Image 
                                            src={serviceFeeInfo.instructionImageUrl} 
                                            alt="Instruksi Pembayaran"
                                            width={800}
                                            height={600}
                                            className="w-full h-auto rounded-lg border border-green-300 dark:border-green-700"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-sm text-green-800 dark:text-green-200 whitespace-pre-line">
                                        {serviceFeeInfo.instructions}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Gateway Payment URL - Show for all gateway methods with payment URL */}
                        {(additionalInfoTyped.paymentType === 'gateway_url' || additionalInfoTyped.paymentUrl) && (
                            <div className="mb-6">
                                
                                
                                {/* Show Continue Payment button only for credit card, e-wallet, and paylater methods */}
                                {shouldShowPaymentButton(payment.method) && (
                                    <div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Continue Payment</h4>
                                            <div className="bg-white p-4 justify-center flex mb-4">
                                                <Image
                                                    src={getPaymentMethodImage()}
                                                    alt={payment.method}
                                                    width={160}
                                                    height={80}
                                                    className="h-12 w-auto object-contain"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <a
                                                href={additionalInfoTyped.paymentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center justify-center gap-2 font-medium"
                                            >
                                                <CreditCard className="h-5 w-5" />
                                                Payment Link {payment.methodName || payment.method.replace(/_/g, ' ')}
                                            </a>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                                You will be redirected to the secure payment page.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Show payment URL info for other methods that don't show the button */}
                                {/* {/* {!shouldShowPaymentButton(payment.method) && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                            Payment Link
                                        </h5>
                                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                                            Metode pembayaran ini memiliki link pembayaran khusus yang dapat Anda akses jika diperlukan.
                                        </p>
                                        <a
                                            href={additionalInfoTyped.paymentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
                                        >
                                            Akses Link Pembayaran →
                                        </a>
                                    </div>
                                )} */}
                            </div>
                        )}

                        {/* Note */}
                        {/* {additionalInfoTyped.note && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                <strong>Catatan:</strong> {additionalInfoTyped.note}
                            </p>
                            </div>
                        )} */}
                    </motion.div>
                )}

                {/* Transaction Details */}
                {/* {payment.status === "pending" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Rincian Pemesanan
                        </h3>

                        <div className="space-y-3 mb-6">
                            {packageGroups.map((group, groupIndex) => (
                                <div key={groupIndex} className="space-y-2">
                                    
                                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                    {group.package.name}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                                    {group.package.type.replace('_', ' ')} - {group.package.category}
                                                    {group.package.subcategory && ` / ${group.package.subcategory}`}
                                                </p>
                                                {group.package.type === 'whatsapp_service' && (group.package as any).duration && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Durasi: {(group.package as any).duration === 'month' ? 'Bulanan' : 'Tahunan'}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 mt-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Qty: {(group.package as any).quantity || 1}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Harga satuan: Rp {(group.package.price / ((group.package as any).quantity || 1)).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">
                                                    Rp {((group.package as any).totalPrice || group.package.price).toLocaleString('id-ID')}
                                                </p>
                                                {group.package.originalPriceIdr && group.package.originalPriceIdr !== group.package.price && (
                                                    <p className="text-xs text-gray-500 line-through">
                                                    Rp {group.package.originalPriceIdr.toLocaleString('id-ID')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {standaloneGroups.map((group, groupIndex) => (
                                <div key={`standalone-${groupIndex}`} className="space-y-2">
                                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                            {group.category} Add-ons
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                                <span>Rp {pricing.subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            
                            {voucher && pricing.discountAmount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Diskon ({voucher.code}):</span>
                                <span className="text-green-600">-Rp {pricing.discountAmount.toLocaleString('id-ID')}</span>
                            </div>
                            )}

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Total setelah diskon:</span>
                                <span>Rp {pricing.totalAfterDiscount.toLocaleString('id-ID')}</span>
                            </div>
                            
                            {pricing.serviceFee && pricing.serviceFee.amount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Biaya Admin
                                    {pricing.serviceFee.type === "percentage" && (
                                        <span className="text-xs ml-1">({pricing.serviceFee.value}%)</span>
                                    )}
                                    :
                                </span>
                                <span>Rp {pricing.serviceFee.amount.toLocaleString('id-ID')}</span>
                            </div>
                            )}

                            {payment.uniqueCode && payment.uniqueCode > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Kode Unik:</span>
                                <span>Rp {payment.uniqueCode.toLocaleString('id-ID')}</span>
                            </div>
                            )}
                            
                            <hr className="my-2" />
                            
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total Bayar:</span>
                                <span className="text-primary">Rp {payment.amount.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </motion.div>
                )} */}

            </div>

                {/* Sidebar - Payment Details */}
                <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5 xl:space-y-6">
                {/* Payment Info */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6"
                >
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4">
                    Payment Details
                    </h3>
                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                        <Hash className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Payment ID</p>
                        <p className="font-mono text-xs md:text-sm break-all">{payment.id}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                        <CreditCard className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Payment Method</p>
                        <p className="text-xs md:text-sm capitalize break-words">{payment.methodName || payment.method.replace(/_/g, ' ')}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                        <Building className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                        <p className="text-xs md:text-sm font-medium break-all">Rp {payment.amount.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                        <p className="text-xs md:text-sm break-words">{new Date(payment.createdAt).toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    
                    <div className="pt-1.5 sm:pt-2 md:pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between gap-1 sm:gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                        <span className={`px-1 sm:px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs font-medium text-center break-words ${
                            payment.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            (payment.status === 'pending' && timeLeft !== "00:00:00") ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                            {payment.status === 'paid' && 'Paid'}
                            {(payment.status === 'pending' && timeLeft !== "00:00:00") && 'Pending Payment'}
                            {payment.status === 'failed' && 'Failed'}
                            {(payment.status === 'expired' || timeLeft === "00:00:00") && 'Expired'}
                            {payment.status === 'cancelled' && 'Cancelled'}
                        </span>
                        </div>
                    </div>
                    </div>
                </motion.div>

                {/* Transaction Items */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6"
                >
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4">
                        Transaction Items
                    </h3>

                    {/* Categorized Items Display */}
                    <div className="space-y-6">
                    {/* WhatsApp Services Section */}
                    {packageGroups.filter((group: any) => group.categoryType === 'whatsapp').length > 0 && (
                        <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">WhatsApp Services</h4>
                        </div>
                        {packageGroups
                            .filter((group: any) => group.categoryType === 'whatsapp')
                            .map((group, groupIndex) => (
                            <div key={`whatsapp-${groupIndex}`} className="space-y-2 ml-4">
                                <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {group.package.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {group.package.type.replace('_', ' ')} - {group.package.category}
                                    </p>
                                    {group.package.duration && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {group.package.duration === 'month' ? 'Bulanan' : 'Tahunan'}
                                    </p>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Qty: {(group.package as any).quantity || 1} × Rp {(group.package.price / ((group.package as any).quantity || 1)).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm">Rp {((group.package as any).totalPrice || group.package.price).toLocaleString('id-ID')}</p>
                                </div>
                                </div>
                            </div>
                            ))}
                        </div>
                    )}
                    </div>
                    
                    <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                        <span className="font-semibold">Rp {pricing.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    {voucher && pricing.discountAmount > 0 && (
                        <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Discount ({voucher.code})
                            {voucher.type === 'percentage' && ` - ${voucher.value}%`}
                        </span>
                        <span className="text-xs text-green-600">-Rp {pricing.discountAmount.toLocaleString('id-ID')}</span>
                        </div>
                    )}
                    {pricing.serviceFee && pricing.serviceFee.amount > 0 && (
                        <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Service Fee
                            {pricing.serviceFee.type === 'percentage' && ` (${pricing.serviceFee.value}%)`}
                        </span>
                        <span className="text-xs">Rp {pricing.serviceFee.amount.toLocaleString('id-ID')}</span>
                        </div>
                    )}
                    {payment.uniqueCode && payment.uniqueCode > 0 && (
                        <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Unique Code</span>
                        <span className="text-xs">Rp {payment.uniqueCode.toLocaleString('id-ID')}</span>
                        </div>
                    )}
                    <hr className="my-2" />
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">Total Payment</span>
                        <span className="font-bold">Rp {payment.amount.toLocaleString('id-ID')}</span>
                    </div>
                    </div>
                </motion.div>


                </div>
            </div>
            </div>
        </div>
    )
}

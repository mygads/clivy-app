"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  CheckCircle, 
  Download, 
  ExternalLink,
  Loader2,
  FileText,
  Package,
  Clock,
  Printer
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/Auth/AuthContext"
import { useCart } from "@/components/Cart/CartContext"
import { useToast } from "@/components/ui/use-toast"
import { PaymentStatus } from "@/types/checkout"
import type { Metadata } from 'next'

interface PaymentSuccessPageProps {
  params: Promise<{
    locale: string
    paymentId: string
  }>
}



export default function PaymentSuccessPage() {
  const { toast } = useToast()
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { clearSelectedItemsFromCart } = useCart()
  const paymentId = params.paymentId as string
  
  const [paymentData, setPaymentData] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState<string>("")
  const [customerEmail, setCustomerEmail] = useState<string>("")
  const [customerPhone, setCustomerPhone] = useState<string>("")

  // Clear selected items from cart when payment success page loads
  useEffect(() => {
    // Clear selected items from cart on success page load
    clearSelectedItemsFromCart?.()
    // console.log("[PaymentSuccess] Cleared selected items from cart on success page load")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount to avoid infinite loop

  // Get customer info from localStorage or payment data
  useEffect(() => {
    try {
      const userSession = localStorage.getItem('user_session')
      if (userSession) {
        const session = JSON.parse(userSession)
        setCustomerName(session.name || 'Customer')
        setCustomerEmail(session.email || '')
        setCustomerPhone(session.phone || '')
      } else {
        // Fallback to other possible keys
        const storedName = localStorage.getItem('customerName') || localStorage.getItem('name') || 'Customer'
        const storedEmail = localStorage.getItem('customerEmail') || localStorage.getItem('email') || ''
        const storedPhone = localStorage.getItem('customerPhone') || localStorage.getItem('phone') || ''
        setCustomerName(storedName)
        setCustomerEmail(storedEmail)
        setCustomerPhone(storedPhone)
      }
    } catch (error) {
      console.error('Error parsing user session:', error)
      setCustomerName('Customer')
      setCustomerEmail('')
      setCustomerPhone('')
    }
  }, [])

  // Fetch payment details
  useEffect(() => {
    if (!paymentId) return

    const fetchPaymentDetails = async () => {
      try {
        setLoading(true)
        
        // Always use public endpoint first
        const response = await fetch(`/api/public/payment/${paymentId}/status`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch payment details')
        }
        
        const result = await response.json()
        setPaymentData(result)
        setError(null)
        
        // Update customer info from payment data if not available in localStorage
        const userData = (result.data as any)?.transaction?.user
        if (userData) {
          setCustomerName(prevName => {
            // Only update if current name is default or empty
            if (!prevName || prevName === 'Customer') {
              return userData.name || 'Customer'
            }
            return prevName
          })
          setCustomerEmail(prevEmail => userData.email || prevEmail)
          setCustomerPhone(prevPhone => userData.phone || prevPhone)
        }
      } catch (err: unknown) {
        console.error("Error fetching payment details:", err)
        setError("Gagal memuat detail pembayaran")
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentDetails()
  }, [paymentId]) // Remove customerName dependency to prevent infinite loop

  // Handle download PDF
  const handleDownloadPDF = async () => {
    try {
      let apiUrl = `/api/public/payment/${paymentId}/receipt`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      // Use authenticated endpoint if user is logged in
      if (isAuthenticated) {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token')
        if (token) {
          apiUrl = `/api/customer/payment/${paymentId}/receipt`
          headers['Authorization'] = `Bearer ${token}`
        }
      }

      const response = await fetch(apiUrl, { headers })

      if (!response.ok) {
        throw new Error('Failed to generate receipt')
      }

      const result = await response.json()
      
      if (result.success) {
        // For now, we'll show the receipt data in console and display a message
        console.log('Receipt data:', result.receipt)
        toast({
          title: "Receipt Generated",
          description: "Receipt data generated successfully. PDF download will be available soon."
        })
      } else {
        throw new Error(result.error || 'Failed to generate receipt')
      }
    } catch (error) {
      console.error('Error generating receipt:', error)
      toast({
        title: "Error",
        description: "Failed to generate receipt. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle print invoice
  const handlePrintInvoice = () => {
    window.print()
  }  // Helper functions to get item price and calculate totals
  const getItemPrice = (item: any) => {
    if (!item) return "0"
    return item.price?.toString() || "0"
  }

  const getItemName = (item: any) => {
    if (!item) return "Item"
    return item.name || "Item"
  }

  const getItemDescription = (item: any) => {
    if (!item) return ""
    return item.category || ""
  }

  const getItemQuantity = (item: any) => {
    return item.quantity || 1
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Memuat detail pembayaran...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-sm sm:max-w-md mx-auto text-center p-4 sm:p-6">
          <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Detail Tidak Ditemukan
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            {error || "Gagal memuat detail pembayaran"}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
            >
              Coba Lagi
            </button>
            {isAuthenticated ? (
              <Link
                href="/dashboard/transaction"
                className="block w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                Kembali ke Transaksi
              </Link>
            ) : (
              <Link
                href="/#pricing"
                className="block w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                Lihat Layanan WhatsApp
              </Link>
            )}
          </div>
        </div>
      </div>
    )  }

  // Ensure data exists before destructuring
  if (!paymentData.data || !paymentData.data.payment || !paymentData.data.transaction) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-sm sm:max-w-md mx-auto text-center p-4 sm:p-6">
          <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Data Tidak Lengkap
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            Data pembayaran tidak lengkap atau rusak
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
            >
              Coba Lagi
            </button>
            {isAuthenticated ? (
              <Link
                href="/dashboard/transaction"
                className="block w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                Kembali ke Transaksi
              </Link>
            ) : (
              <Link
                href="/#pricing"
                className="block w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                Lihat Layanan WhatsApp
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }
  const { payment, pricing, items, voucher } = paymentData.data
  
  // Helper function to format date with WIB timezone
  const formatDateWIB = (dateString: string, includeTime: boolean = true) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    }
    return date.toLocaleString('id-ID', options) + (includeTime ? ' WIB' : '')
  }

  // Generate invoice data
  const invoiceData = {
    invoiceNumber: `INV-${new Date().getFullYear()}-${payment.transactionId.slice(-6).toUpperCase()}`,
    transactionId: payment.transactionId,
    transactionDate: (paymentData.data as any).transaction?.createdAt || payment.createdAt,
    issuedDate: new Date().toISOString(), // When the invoice was generated
    paymentDate: (payment as any).paymentDate || (payment as any).updatedAt || payment.createdAt // When payment was actually completed
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8 pt-20 sm:pt-24 lg:pt-32">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-5xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Invoice Pembayaran</h1>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handlePrintInvoice}
                className="flex items-center gap-1 sm:gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
              
              {/* Download PDF button only shows when user is authenticated */}
              {/* {isAuthenticated && (
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              )} */}
              
              {/* Login prompt if not authenticated */}
              {/* {!isAuthenticated && !authLoading && (
                <Link
                  href={`/signin?redirect=${encodeURIComponent(window.location.pathname)}`}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Login to Download PDF
                </Link>
              )} */}
            </div>
          </div>
        </div>

        {/* Success Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 print:hidden"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                Pembayaran Berhasil!
              </h2>
              <p className="text-sm sm:text-base text-green-700 dark:text-green-300 mb-4">
                Terima kasih! Pembayaran Anda telah berhasil diproses dan dikonfirmasi.
              </p>
              
              {/* Service Activation Status */}
              {(paymentData?.data as any)?.activationInfo && (
                <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-2 mb-2">
                    {(paymentData.data as any).activationInfo.activated ? (
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                    )}
                    <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                      Status Layanan
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {(paymentData.data as any).activationInfo.message}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {isAuthenticated ? (
                  <Link
                    href={`/dashboard/transaction/${paymentData.data.transaction.id}`}
                    className="flex items-center justify-center gap-2 bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
                  >
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">Lihat Detail Transaksi</span>
                  </Link>
                ) : (
                  <Link
                    href={`/signin?redirect=${encodeURIComponent(window.location.pathname)}`}
                    className="flex items-center justify-center gap-2 bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
                  >
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">Login untuk Dashboard</span>
                  </Link>
                )}
                <Link
                  href="/#pricing"
                  className="flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
                >
                  <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">Lihat Layanan WhatsApp</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Invoice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 print:shadow-none print:border-0"
        >
          {/* Invoice Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">INVOICE</h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">#{invoiceData.invoiceNumber}</p>
              </div>
              <div className="sm:text-right">
                {/* <div className="text-sm sm:text-lg lg:text-xl font-bold text-primary leading-tight">
                  PT GENERATION INFINITY INDONESIA
                </div> */}
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  CLIVY APP
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Bill To */}              
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">Tagihan Kepada:</h3>
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-medium">{customerName}</p>
                  <p className="text-gray-600 dark:text-gray-400 break-words">
                    {customerEmail || 'Email tidak tersedia'}
                  </p>
                  {customerPhone && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {customerPhone}
                    </p>
                  )}
                </div>
              </div>

              {/* Invoice Info */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">Detail Invoice:</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-gray-600 dark:text-gray-400">ID Transaksi:</span>
                    <span className="font-mono text-xs break-all">{invoiceData.transactionId}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-gray-600 dark:text-gray-400">ID Pembayaran:</span>
                    <span className="font-mono text-xs break-all">{payment?.id || 'ID tidak tersedia'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Tanggal Transaksi:</span>
                    <span className="text-xs sm:text-sm">{formatDateWIB(invoiceData.transactionDate)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Tanggal Bayar:</span>
                    <span className="text-xs sm:text-sm">{formatDateWIB(invoiceData.paymentDate)}</span>
                  </div>   
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Metode Bayar:</span>
                    <span className="capitalize text-xs sm:text-sm">{payment?.methodName || payment?.method?.replace(/_/g, ' ') || 'Metode tidak tersedia'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Rincian Pemesanan:</h3>
            
            {/* Mobile Card Layout */}
            <div className="block sm:hidden space-y-3">
              {items && Array.isArray(items) ? items.map((item, index) => {
                const itemPrice = getItemPrice(item)
                const quantity = getItemQuantity(item)
                const itemTotal = parseInt(itemPrice) * quantity
                
                return (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {getItemName(item)}
                        </p>
                        {getItemDescription(item) && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {getItemDescription(item)}
                          </p>
                        )}
                        {item.type === 'whatsapp_service' && item.duration && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Duration: {item.duration}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Qty: {quantity}</span>
                        <span className="text-gray-600 dark:text-gray-400">@Rp {parseInt(itemPrice).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Total:</span>
                        <span className="text-sm font-bold text-primary">Rp {itemTotal.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                )
              }) : (
                <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                  Tidak ada item ditemukan
                </div>
              )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Item</th>
                    <th className="text-center py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Qty</th>
                    <th className="text-right py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Harga</th>
                    <th className="text-right py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items && Array.isArray(items) ? items.map((item, index) => {
                    const itemPrice = getItemPrice(item)
                    const quantity = getItemQuantity(item)
                    const itemTotal = parseInt(itemPrice) * quantity
                    
                    return (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 sm:py-3">
                          <div>
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                              {getItemName(item)}
                            </p>
                            {getItemDescription(item) && (
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                {getItemDescription(item)}
                              </p>
                            )}
                            {item.type === 'whatsapp_service' && item.duration && (
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Duration: {item.duration}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 text-center text-sm">{quantity}</td>
                        <td className="py-2 sm:py-3 text-right text-xs sm:text-sm">Rp {parseInt(itemPrice).toLocaleString('id-ID')}</td>
                        <td className="py-2 sm:py-3 text-right font-medium text-sm sm:text-base">
                          Rp {itemTotal.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Tidak ada item ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="p-4 sm:p-6">
            <div className="max-w-sm sm:max-w-md ml-auto space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span>Rp {pricing?.subtotal?.toLocaleString('id-ID') || '0'}</span>
              </div>
              
              {voucher && voucher.discountAmount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Diskon ({voucher.code}):
                  </span>
                  <span className="text-green-600">-Rp {voucher.discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}

              {pricing?.serviceFee?.amount && pricing.serviceFee.amount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Biaya Admin:</span>
                  <span>Rp {pricing.serviceFee.amount.toLocaleString('id-ID')}</span>
                </div>
              )}

              <hr className="my-2" />
              
              <div className="flex justify-between text-base sm:text-lg font-bold">
                <span>Total Bayar:</span>
                <span className="text-primary">Rp {payment.amount.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between text-xs sm:text-sm mt-2">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-medium">
                  LUNAS
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg print:hidden"
        >
          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
            <strong>Catatan:</strong> Invoice ini telah dibayar penuh. Untuk pertanyaan lebih lanjut, 
            silakan hubungi tim support kami atau kunjungi dashboard Anda.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

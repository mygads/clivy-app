"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Package,
  CreditCard,
  Phone,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Ban,
  Loader2,
  Receipt,
  ExternalLink,
  RefreshCw,
  Download,
  Share,
  ChevronRight,
  Calendar,
  User,
  Mail,
  DollarSign,
  FileText,
  MapPin,
  Globe,
  Hash,
  Plus,
  TrendingUp,
  Shield,
  Target,
  Layers,
  MessageCircle,
  Calculator,
  Eye,
  Trash2,
  Edit,
  MoreVertical,
  Zap,
  Settings
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { TransactionItem, TransactionDetailResponse } from "@/types/checkout"
import { SessionManager } from "@/lib/storage"
import { useCurrency } from '@/hooks/useCurrency'

export default function TransactionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { currency } = useCurrency()
  const transactionId = params.transactionId as string

  // State management
  const [transactionData, setTransactionData] = useState<TransactionItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showPaymentMethods, setShowPaymentMethods] = useState(false)
  const [creatingPayment, setCreatingPayment] = useState(false)
  const [cancellingTransaction, setCancellingTransaction] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [expiryCountdown, setExpiryCountdown] = useState<string | null>(null)
  const [paymentExpiryCountdown, setPaymentExpiryCountdown] = useState<string | null>(null)
  const [creatingNewPayment, setCreatingNewPayment] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper formatters
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString)
    return {
      date: d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  }
  const formatCurrency = (amount: number | string, currency: string = 'IDR') => {
    const n = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(n)
  }

  // Helper function to get status information for transaction items (WhatsApp only)
  const getItemStatusInfo = (status: string, type: 'whatsapp') => {
    const statusMap: Record<string, { label: string; description: string; color: string; icon: any }> = {
      pending: {
        label: 'Pending',
        description: 'Service activation pending',
        color: 'text-yellow-600',
        icon: Clock
      },
      awaiting_delivery: {
        label: 'Awaiting Delivery',
        description: 'Order is being prepared for delivery',
        color: 'text-blue-600',
        icon: RefreshCw
      },
      in_progress: {
        label: 'In Progress',
        description: 'Service being activated',
        color: 'text-blue-600',
        icon: RefreshCw
      },
      delivered: {
        label: 'Delivered',
        description: 'Successfully delivered to customer',
        color: 'text-green-600',
        icon: CheckCircle
      },
      success: {
        label: 'Completed',
        description: 'Service successfully activated',
        color: 'text-green-600',
        icon: CheckCircle
      },
      active: {
        label: 'Active',
        description: 'Service is active and ready to use',
        color: 'text-green-600',
        icon: CheckCircle
      },
      activating: {
        label: 'Activating',
        description: 'Service activation in progress',
        color: 'text-blue-600',
        icon: RefreshCw
      },
      failed: {
        label: 'Failed',
        description: 'Processing failed, please contact support',
        color: 'text-red-600',
        icon: XCircle
      },
      cancelled: {
        label: 'Cancelled',
        description: 'Item has been cancelled',
        color: 'text-gray-600',
        icon: Ban
      }
    }
    
    return statusMap[status] || {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      description: 'Status information not available',
      color: 'text-gray-600',
      icon: AlertCircle
    }
  }

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field)
      toast({ title: 'Copied', description: 'Copied to clipboard' })
      setTimeout(() => setCopiedField(null), 1500)
    }).catch(() => toast({ variant: 'destructive', title: 'Copy failed' }))
  }

  const getStatusConfig = (status: string) => {
    const normalized = status.replace('-', '_')
    const configs = {
      created: { icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900/20', borderColor: 'border-orange-200 dark:border-orange-800', badgeVariant: 'secondary' as const, description: '🕐 Transaction created and waiting for payment' },
      pending: { icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800', badgeVariant: 'secondary' as const, description: '💳 Payment in progress' },
      in_progress: { icon: RefreshCw, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800', badgeVariant: 'secondary' as const, description: '⚡ Processing your order' },
        borderColor: "border-blue-200 dark:border-blue-800",
      success: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-800', badgeVariant: 'default' as const, description: '✅ Transaction completed successfully' },
      failed: { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-800', badgeVariant: 'destructive' as const, description: '❌ Transaction failed' },
      cancelled: { icon: Ban, color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-900/20', borderColor: 'border-gray-200 dark:border-gray-800', badgeVariant: 'outline' as const, description: '🚫 Transaction cancelled' },
      expired: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-800', badgeVariant: 'destructive' as const, description: '⏰ Transaction expired' }
    }
    return (configs as any)[normalized] || configs.created
  }

  // Fetch transaction
  const fetchTransaction = useCallback(async () => {
    try {
      const token = SessionManager.getToken()
      const res = await fetch(`/api/customer/transactions/${transactionId}`, { headers: { Authorization: `Bearer ${token}` } })
      const json: TransactionDetailResponse = await res.json()
      if (json.success) {
        setTransactionData(json.data)
      }
      else toast({ variant: 'destructive', title: 'Error', description: json.message })
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error fetching transaction' })
    } finally { setLoading(false); setRefreshing(false) }
  }, [transactionId, toast])

  useEffect(() => { fetchTransaction() }, [fetchTransaction])

  // Derived pricing numbers (guard after data load)
  const baseAmount = parseFloat(String(transactionData?.amount || '0'))
  const discountAmountNum = parseFloat(String(transactionData?.discountAmount || '0')) || 0
  const serviceFeeAmountNum = parseFloat(String(transactionData?.serviceFeeAmount || '0')) || 0
  const computedFinal = baseAmount - discountAmountNum + serviceFeeAmountNum
  const finalAmountNum = parseFloat(String(transactionData?.finalAmount || computedFinal))

  const isExpired = transactionData?.expiresAt ? new Date(transactionData.expiresAt) < new Date() : false
  const isTransactionExpired = isExpired

  // Handle create new payment
  const handleCreateNewPayment = async () => {
    if (!transactionData?.id) return
    
    try {
      setCreatingNewPayment(true)
      setError("") // Clear any previous errors
      
      const token = SessionManager.getToken()
      if (!token) {
        setError("Session expired. Please login again.")
        return
      }

      // Get transaction details to redirect to checkout
      const response = await fetch(`/api/customer/transactions/${transactionData.id}`, {
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
      router.push(`/checkout?transactionId=${transactionData.id}`)
    } catch (error) {
      console.error("Failed to create new payment:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create new payment"
      setError(errorMessage)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage
      })
    } finally {
      setCreatingNewPayment(false)
    }
  }

  // Expiry countdown effect with days, hours, minutes format
  useEffect(() => {
    if (!transactionData?.expiresAt) {
      setExpiryCountdown(null)
      return
    }
    if (isTransactionExpired) {
      setExpiryCountdown('Expired')
      return
    }
    const target = new Date(transactionData.expiresAt).getTime()
    const interval = setInterval(() => {
      const now = Date.now()
      const diff = target - now
      if (diff <= 0) {
        setExpiryCountdown('Expired')
        clearInterval(interval)
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (days > 0) {
        setExpiryCountdown(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setExpiryCountdown(`${hours}h ${minutes}m`)
      } else {
        setExpiryCountdown(`${minutes}m`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [transactionData?.expiresAt, isTransactionExpired])

  // Payment expiry countdown effect
  useEffect(() => {
    if (!transactionData?.payment?.expiresAt) {
      setPaymentExpiryCountdown(null)
      return
    }
    
    const target = new Date(transactionData.payment.expiresAt).getTime()
    const interval = setInterval(() => {
      const now = Date.now()
      const diff = target - now
      if (diff <= 0) {
        setPaymentExpiryCountdown('Expired')
        clearInterval(interval)
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (days > 0) {
        setPaymentExpiryCountdown(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setPaymentExpiryCountdown(`${hours}h ${minutes}m`)
      } else {
        setPaymentExpiryCountdown(`${minutes}m`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [transactionData?.payment?.expiresAt])

  // Check if payment can be created
  const canCreatePayment = transactionData && 
    transactionData.status === 'created' && 
    !isTransactionExpired

  // Check if transaction can be cancelled
  const canCancelTransaction = transactionData && 
    ['created', 'pending'].includes(transactionData.status) && 
    !isTransactionExpired

  // Handle refresh (reuse fetchTransaction)
  const handleRefresh = () => { setRefreshing(true); fetchTransaction() }

  // Handle create payment
  const handleShowCreatePayment = () => {
    setShowPaymentMethods(true)
  }

  // Handle cancel transaction
  const handleCancelTransaction = async () => {
    if (!transactionData) return

    setCancellingTransaction(true)
    try {
      const token = SessionManager.getToken()

      const response = await fetch(`/api/customer/transactions/${transactionData.id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to cancel transaction')
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Transaction Cancelled",
          description: "Your transaction has been cancelled successfully",
        })
        setShowCancelDialog(false)
  // Refresh transaction data
  fetchTransaction()
      } else {
        throw new Error(data.message || 'Failed to cancel transaction')
      }
    } catch (error) {
      console.error('Error cancelling transaction:', error)
      toast({
        title: "Error",
        description: "Failed to cancel transaction",
        variant: "destructive",
      })
    } finally {
      setCancellingTransaction(false)
    }
  }



  // (Removed duplicate initial load - already fetched via fetchTransaction effect above)

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-background">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading transaction details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!transactionData) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-background">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Transaction Not Found</h2>
          <p className="text-muted-foreground">The transaction you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
          <Button onClick={() => router.push('/dashboard/transaction')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transactions
          </Button>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(transactionData.status)
  const StatusIcon = statusConfig.icon

  return (
    <div>
      {/* Header */}
      <div className="px-3 sm:px-4 md:px-8 pt-4 sm:pt-6 bg-background">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Mobile Back Button + Title */}
          <div className="flex items-center gap-3 sm:hidden">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/dashboard/transaction')}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-base font-semibold text-foreground">
                #{transactionData.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-xs text-muted-foreground">Transaction Details</p>
            </div>
          </div>

          {/* Desktop Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/dashboard/transaction" className="hover:text-foreground transition-colors">Transactions</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">#{transactionData.id.slice(-8).toUpperCase()}</span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-8 hover:bg-primary/10 text-xs sm:text-sm"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-8 bg-background">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Main Content - Takes 2 columns on lg screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border border-border/20 shadow-sm bg-white dark:bg-gray-950">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
                    <div className="flex items-start gap-2 sm:gap-3 md:gap-4 flex-1">
                      <div className={`p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
                        <StatusIcon className={`h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 ${statusConfig.color}`} />
                      </div>
                      <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                        <div className="flex flex-col gap-1 sm:gap-2">
                          <h1 className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                            Transaction #{transactionData.id.slice(-8).toUpperCase()}
                          </h1>
                          <Badge variant={statusConfig.badgeVariant} className="w-fit text-xs">
                            {transactionData.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                          {statusConfig.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-center sm:text-right space-y-1 sm:space-y-2 bg-gray-50/50 dark:bg-gray-900/20 p-3 rounded-lg border border-border/10">
                      <div className="space-y-0.5 sm:space-y-1">
                        <p className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-none">
                          {formatCurrency(baseAmount - discountAmountNum + serviceFeeAmountNum, transactionData.currency || 'IDR')}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Final Amount
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Responsive Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50/50 dark:bg-gray-900/20 rounded-lg border border-border/10">
                    <div className="text-center space-y-1 sm:space-y-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Base</p>
                        <p className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">{formatCurrency(baseAmount, transactionData.currency || 'IDR')}</p>
                      </div>
                    </div>
                    <div className="text-center space-y-1 sm:space-y-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Discount</p>
                        <p className="font-medium text-xs text-green-600 truncate">
                          -{formatCurrency(discountAmountNum, transactionData.currency || 'IDR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-center space-y-1 sm:space-y-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
                        <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Service Fee</p>
                        <p className="font-medium text-xs text-gray-900 dark:text-gray-100 truncate">{formatCurrency(serviceFeeAmountNum, transactionData.currency || 'IDR')}</p>
                      </div>
                    </div>
                    <div className="text-center space-y-1 sm:space-y-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
                        <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Currency</p>
                        <p className="font-medium text-xs text-gray-900 dark:text-gray-100 uppercase">{transactionData.currency || 'IDR'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Responsive Transaction Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-border/10 bg-gray-50/50 dark:bg-gray-900/20">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Transaction Date</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{formatDate(transactionData.transactionDate)}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(transactionData.transactionDate).time}</p>
                      </div>
                    </div>
                  

                    {transactionData.expiresAt && (
                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-border/10 bg-gray-50/50 dark:bg-gray-900/20">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {isTransactionExpired ? 'Expired On' : 'Expires On'}
                          </p>
                          <p className={`text-xs sm:text-sm font-medium truncate ${isTransactionExpired ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>
                            {formatDate(transactionData.expiresAt)}
                          </p>
                          <p className="text-xs text-gray-500">{formatDateTime(transactionData.expiresAt).time}</p>
                          {!isTransactionExpired && expiryCountdown && (
                            <p className="text-[10px] text-orange-600 mt-0.5">{expiryCountdown} remaining</p>
                          )}
                        </div>
                      </div>
                    )}
{/* 
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-border/10 bg-gray-50/50 dark:bg-gray-900/20">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Type</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 capitalize truncate">
                          {(() => {
                            const type = transactionData.type;
                            if (!type) return 'Standard';
                            
                            // Handle the different transaction type formats
                            const typeMap: Record<string, string> = {
                              'whatsapp_service': 'WhatsApp Service',
                              'whatsapp': 'WhatsApp Service'
                            };
                            
                            return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          })()}
                        </p>
                      </div>
                    </div> */}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Responsive Order Items */}
            <div>
              <Card className="border border-border/20 shadow-sm bg-white dark:bg-gray-950">
                <CardHeader className="border-b border-border/10 pb-3 sm:pb-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div>
                      <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Order Items</CardTitle>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">Items in this transaction</p>
                    </div>
                    <Badge variant="outline" className="text-xs font-medium w-fit">
                        {transactionData.whatsappTransaction ? 1 : 0} item{transactionData.whatsappTransaction ? '' : 's'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-2 sm:p-3 md:p-4 space-y-3 sm:space-y-4">

                  {/* WhatsApp Service */}
                  {transactionData.whatsappTransaction && (
                    <motion.div 
                      className="space-y-3 sm:space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-2 sm:py-3 border-b border-border/10">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">WhatsApp Service</h3>
                          <Badge variant="outline" className="text-xs font-normal">
                            1 service
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs font-normal">
                          {transactionData.whatsappTransaction.status === 'active' ? 'Active' :
                           transactionData.whatsappTransaction.status === 'activating' ? 'Activating' :
                           transactionData.whatsappTransaction.status === 'pending' ? 'Pending' : 
                           transactionData.whatsappTransaction.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="p-2 sm:p-3 rounded-lg border border-border/10 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="relative flex-shrink-0">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-border/20 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <svg className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.485 3.516"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-2">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {transactionData.whatsappTransaction.whatsappPackage?.name || 'WhatsApp Service'}
                                      </h4>
                                      <Badge 
                                        variant={
                                          transactionData.whatsappTransaction.status === 'active' ? 'default' : 
                                          transactionData.whatsappTransaction.status === 'activating' || transactionData.whatsappTransaction.status === 'pending' ? 'secondary' : 
                                          'destructive'
                                        } 
                                        className="text-xs px-1.5 py-0.5 font-normal"
                                      >
                                        {getItemStatusInfo(transactionData.whatsappTransaction.status, 'whatsapp').label}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-1">
                                      {transactionData.whatsappTransaction.whatsappPackage?.description || 'Professional WhatsApp API service for business communication'}
                                    </p>
                                  </div>
                                  <div className="text-left sm:text-right shrink-0">
                                    <p className="text-xs text-gray-500">Duration: {transactionData.whatsappTransaction.duration}</p>
                                    <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                                      {formatCurrency(
                                        transactionData.whatsappTransaction.duration === 'year' 
                                          ? transactionData.whatsappTransaction.whatsappPackage?.priceYear || 0
                                          : transactionData.whatsappTransaction.whatsappPackage?.priceMonth || 0,
                                        currency.toUpperCase()
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Order Summary */}
                  <motion.div 
                    className="pt-3 sm:pt-4 border-t border-border/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 text-xs sm:text-sm">
                      Order Summary
                    </h3>
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(baseAmount, transactionData.currency || 'IDR')}</span>
                      </div>
                      {discountAmountNum > 0 && (
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Discount Applied</span>
                          <span className="font-medium text-green-600">-{formatCurrency(discountAmountNum, transactionData.currency || 'IDR')}</span>
                        </div>
                      )}
                      {serviceFeeAmountNum > 0 && (
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(serviceFeeAmountNum, transactionData.currency || 'IDR')}</span>
                        </div>
                      )}
                      {transactionData.notes && (
                        <div className="pt-1.5 sm:pt-2 border-t border-border/10 space-y-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Order Notes</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/30 p-2 rounded border border-border/10 break-words line-clamp-2">{transactionData.notes}</p>
                        </div>
                      )}
                      {transactionData.voucherId && (
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                          <span className="text-blue-700 dark:text-blue-300">Voucher Applied</span>
                          <span className="font-medium text-blue-700 dark:text-blue-300">#{transactionData.voucherId}</span>
                        </div>
                      )}
                      <div className="pt-1.5 sm:pt-2 border-t border-border/10">
                        <div className="flex justify-between items-center font-medium bg-gray-50 dark:bg-gray-900/30 p-2 sm:p-3 rounded border border-border/10">
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">Final Amount</span>
                          <span className="text-gray-900 dark:text-gray-100 text-sm font-semibold">{formatCurrency(baseAmount - discountAmountNum + serviceFeeAmountNum, transactionData.currency || 'IDR')}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border border-border/20 shadow-sm bg-white dark:bg-gray-950">
                <CardHeader className="border-b border-border/10 pb-2 sm:pb-3">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Actions</CardTitle>
                </CardHeader>            
                <CardContent className="p-2 sm:p-3 space-y-2">
                  {/* Create Payment button */}
                  {canCreatePayment && (
                    <Button 
                      className="w-full h-7 sm:h-8 text-xs" 
                      onClick={handleShowCreatePayment}
                      disabled={creatingPayment}
                    >
                      {creatingPayment ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-3 w-3 mr-1.5" />
                          <span>
                            {transactionData.payment ? "New Payment" : "Create Payment"}
                          </span>
                        </>
                      )}
                    </Button>
                  )}

                  {/* View Payment Status button */}
                  {transactionData.payment && (
                    <Button 
                      className="w-full h-7 sm:h-8 text-xs" 
                      variant={transactionData.payment.status === "pending" ? "default" : "outline"}
                      onClick={() => router.push(`/payment/status/${transactionData.payment!.id}`)}
                    >
                      <Receipt className="h-3 w-3 mr-1.5" />
                      <span>Payment Status</span>
                    </Button>
                  )}

                  {/* Download Invoice - for completed transactions */}
                  {transactionData.status === "success" && (
                    <Button variant="outline" className="w-full h-7 sm:h-8 text-xs">
                      <Download className="h-3 w-3 mr-1.5" />
                      <span>Invoice</span>
                    </Button>
                  )}

                  {/* Share button */}
                  <Button 
                    variant="outline" 
                    className="w-full h-7 sm:h-8 text-xs" 
                    onClick={() => handleCopy(window.location.href, 'url')}
                  >
                    {copiedField === 'url' ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1.5 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share className="h-3 w-3 mr-1.5" />
                        <span>Share</span>
                      </>
                    )}
                  </Button>

                  {/* Cancel Transaction button */}
                  {canCancelTransaction && (
                    <Button 
                      variant="destructive" 
                      className="w-full h-7 sm:h-8 text-xs"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      <Trash2 className="h-3 w-3 mr-1.5" />
                      <span>Cancel</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Information */}
            {transactionData.payment && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="border border-border/20 shadow-sm bg-white dark:bg-gray-950">
                  <CardHeader className="border-b border-border/10 pb-2 sm:pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <CreditCard className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      </div>
                      <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Payment Info</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-3">
                    <div className="space-y-2">
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center p-2 rounded-lg border border-border/10 bg-gray-50/50 dark:bg-gray-900/20">
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Payment ID</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-gray-900 dark:text-gray-100 break-all">{transactionData.payment.id.slice(-8).toUpperCase()}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
                            onClick={() => handleCopy(transactionData.payment!.id, 'paymentId')}
                          >
                            {copiedField === 'paymentId' ? (
                              <CheckCircle className="h-2.5 w-2.5 text-green-600" />
                            ) : (
                              <Copy className="h-2.5 w-2.5 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-2 rounded-lg border border-border/10 bg-gray-50/50 dark:bg-gray-900/20">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Status</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            transactionData.payment.status === 'paid' ? 'bg-green-500' : 
                            transactionData.payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                        </div>
                        <Badge variant={
                          transactionData.payment.status === 'paid' ? 'default' : 
                          transactionData.payment.status === 'pending' ? 'secondary' : 'destructive'
                        } className="font-normal text-xs h-4 px-1.5">
                          {transactionData.payment.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between p-2 rounded-lg border border-border/10 bg-gray-50/50 dark:bg-gray-900/20">
                          <div className="flex items-center gap-1.5">
                            <Globe className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Method</span>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 break-words">
                              {(() => {
                                const method = transactionData.payment.method;
                                if (!method) return 'Not specified';
                                
                                if (method.startsWith('duitku_')) {
                                  const code = method.replace('duitku_', '');
                                  const methodMapping: Record<string, string> = {
                                    'VC': 'Credit Card',
                                    'BC': 'BCA VA',
                                    'M2': 'Mandiri VA',
                                    'VA': 'Maybank VA',
                                    'I1': 'BNI VA',
                                    'B1': 'CIMB Niaga VA',
                                  'BT': 'Permata Bank VA',
                                  'A1': 'ATM Bersama VA',
                                  'AG': 'Bank Artha Graha VA',
                                  'NC': 'Bank Neo Commerce/BNC VA',
                                  'BR': 'BRIVA',
                                  'S1': 'Bank Sahabat Sampoerna VA',
                                  'DM': 'Danamon VA',
                                  'BV': 'BSI VA',
                                  'FT': 'Pegadaian/ALFA/Pos',
                                  'IR': 'Indomaret',
                                  'OV': 'OVO',
                                  'SA': 'Shopee Pay Apps',
                                  'LF': 'LinkAja Apps (Fixed Fee)',
                                  'LA': 'LinkAja Apps (Percentage Fee)',
                                  'DA': 'DANA',
                                  'SL': 'Shopee Pay Account Link',
                                  'OL': 'OVO Account Link',
                                  'JP': 'Jenius Pay',
                                  'SP': 'Shopee Pay QRIS',
                                  'NQ': 'Nobu QRIS',
                                  'GQ': 'Gudang Voucher QRIS',
                                  'SQ': 'Nusapay QRIS',
                                  'DN': 'Indodana Paylater',
                                  'AT': 'ATOME'
                                };
                                return methodMapping[code] || code;
                              } else {
                                return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between p-2 rounded-lg border border-border/10 bg-gray-50/50 dark:bg-gray-900/20">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Amount</span>
                        </div>
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{formatCurrency(transactionData.payment.amount, transactionData.currency || 'IDR')}</p>
                      </div>
                      
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between p-2 rounded-lg border border-border/10 bg-gray-50/50 dark:bg-gray-900/20">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Created</span>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{formatDate(transactionData.payment.createdAt)}</p>
                          <p className="text-xs text-gray-500">{formatDateTime(transactionData.payment.createdAt).time}</p>
                        </div>
                      </div>

                      {/* Payment Expiry Information */}
                      {transactionData.payment.status === 'pending' && transactionData.payment.expiresAt && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 sm:p-3 rounded-lg border border-border/10 bg-orange-50/50 dark:bg-orange-900/20">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                            <span className="text-xs text-orange-700 dark:text-orange-300">Payment Expires</span>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-xs sm:text-sm font-medium text-orange-900 dark:text-orange-100">{formatDate(transactionData.payment.expiresAt)}</p>
                            <p className="text-xs text-orange-600 dark:text-orange-400">{formatDateTime(transactionData.payment.expiresAt).time}</p>
                            {paymentExpiryCountdown && paymentExpiryCountdown !== 'Expired' && (
                              <p className="text-xs text-orange-600 font-medium mt-1">{paymentExpiryCountdown} remaining</p>
                            )}
                            {paymentExpiryCountdown === 'Expired' && (
                              <p className="text-xs text-red-600 font-medium mt-1">Payment Expired</p>
                            )}
                          </div>
                        </div>
                      )}

                      {transactionData.payment.externalId && (
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-2 sm:p-3 rounded-lg border border-border/10 bg-gray-50/50 dark:bg-gray-900/20">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">External ID</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-xs text-gray-900 dark:text-gray-100 break-all">{transactionData.payment.externalId}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 sm:h-5 sm:w-5 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
                              onClick={() => handleCopy(transactionData.payment!.externalId!, 'externalId')}
                            >
                              {copiedField === 'externalId' ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3 text-gray-500" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Actions */}
                    {transactionData.payment.status === 'pending' && transactionData.payment.paymentUrl && (
                      <div className="pt-3 border-t border-border/10">
                        <Button 
                          className="w-full h-8 sm:h-10 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white" 
                          onClick={() => window.open(transactionData.payment!.paymentUrl!, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          <span className="hidden sm:inline">Complete Payment</span>
                          <span className="sm:hidden">Pay Now</span>
                        </Button>
                      </div>
                    )}

                    {/* Create New Payment for expired/cancelled payments */}
                    {transactionData.payment && (
                     ['expired', 'cancelled', 'failed'].includes(transactionData.payment.status) || 
                     (transactionData.payment.status === 'pending' && paymentExpiryCountdown === 'Expired')
                    ) ? (
                      <div className="pt-3 border-t border-border/10">
                        {!isTransactionExpired ? (
                          <div className="space-y-3">
                            <Button 
                              className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900" 
                              onClick={handleCreateNewPayment}
                              disabled={creatingNewPayment}
                            >
                              {creatingNewPayment ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Creating New Payment...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Create New Payment
                                </>
                              )}
                            </Button>
                            <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                              {transactionData.payment.status === 'expired' 
                                ? "Payment expired, create new payment with same or different method"
                                : "Create new payment for this transaction"
                              }
                            </p>
                          </div>
                        ) : (
                          <div className="p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                            <p className="text-xs sm:text-sm text-orange-800 dark:text-orange-200 text-center">
                              Transaction has expired. New payments cannot be created.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            )}

            {/* Transaction Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="border border-border/20 shadow-sm bg-white dark:bg-gray-950">
                <CardHeader className="border-b border-border/10 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Clock className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    </div>
                    <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Timeline</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-2 sm:p-3">
                  <div className="space-y-2 sm:space-y-3">
                    {/* Transaction Created */}
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center border border-green-200 dark:border-green-800">
                        <CheckCircle className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-green-600" />
                      </div>
                      <div className="flex-1 pt-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Transaction Created</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1 mt-1 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            <span>{formatDateTime(transactionData.createdAt).date}</span>
                          </div>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-xs">{formatDateTime(transactionData.createdAt).time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Created */}
                    {transactionData.payment && (
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                          <CreditCard className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-blue-600" />
                        </div>
                        <div className="flex-1 pt-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Payment Created</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1 mt-1 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5" />
                              <span>{formatDateTime(transactionData.payment.createdAt).date}</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-xs">{formatDateTime(transactionData.payment.createdAt).time}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Status Updates */}
                    {transactionData.payment?.status === 'paid' && (
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center border border-green-200 dark:border-green-800">
                          <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Payment Completed</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            Payment has been successfully processed
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span>{formatDateTime(transactionData.payment.paymentDate || transactionData.payment.createdAt).date}</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-xs">{formatDateTime(transactionData.payment.paymentDate || transactionData.payment.createdAt).time}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transaction Status Change - In Progress */}
                    {(transactionData.status === 'in-progress' || transactionData.status === 'success') && transactionData.payment?.status === 'paid' && (
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center border border-orange-200 dark:border-orange-800">
                          <RefreshCw className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-600" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Transaction In Progress</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            Payment confirmed, services are being prepared and activated
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span>{formatDateTime(transactionData.payment.paymentDate || transactionData.payment.createdAt).date}</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-xs">{formatDateTime(transactionData.payment.paymentDate || transactionData.payment.createdAt).time}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transaction Completion */}
                    {transactionData.status === 'success' && (
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center border border-green-200 dark:border-green-800">
                          <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Transaction Completed</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            All services have been successfully delivered and activated
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span>{formatDateTime(transactionData.updatedAt).date}</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-xs">{formatDateTime(transactionData.updatedAt).time}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expired Status */}
                    {isTransactionExpired && (
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center border-2 border-red-200 dark:border-red-800">
                          <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-600" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-xs sm:text-sm font-medium text-foreground">Transaction Expired</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Transaction expired and is no longer available for processing
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span>{formatDateTime(transactionData.expiresAt!).date}</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-xs">{formatDateTime(transactionData.expiresAt!).time}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cancelled Status */}
                    {transactionData.status === 'cancelled' && (
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center border-2 border-red-200 dark:border-red-800">
                          <Ban className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-600" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-xs sm:text-sm font-medium text-foreground">Transaction Cancelled</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Transaction has been cancelled and will not be processed
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span>{formatDateTime(transactionData.updatedAt).date}</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-xs">{formatDateTime(transactionData.updatedAt).time}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection Modal */}
      {showPaymentMethods && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-background border rounded-xl shadow-xl max-w-sm w-full p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-semibold">Create Payment</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                  You will be redirected to create a payment for this transaction.
                </p>
              </div>
              
              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Transaction ID:</span>
                  <span className="font-mono">{transactionData?.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm mt-1">
                  <span>Amount:</span>
                  <span className="font-semibold">{formatCurrency(baseAmount - discountAmountNum + serviceFeeAmountNum, transactionData.currency || 'IDR')}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-8 text-xs"
                  onClick={() => setShowPaymentMethods(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-8 text-xs"
                  onClick={() => {
                    setShowPaymentMethods(false)
                    router.push(`/checkout/payment?transactionId=${transactionData?.id}`)
                  }}
                >
                  <CreditCard className="h-3 w-3 mr-1.5" />
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Transaction Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              Cancel Transaction
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Are you sure you want to cancel this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Transaction ID:</span>
                <span className="font-mono">{transactionData?.id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm mt-1">
                <span>Amount:</span>
                <span className="font-semibold">{formatCurrency(baseAmount - discountAmountNum + serviceFeeAmountNum, transactionData.currency || 'IDR')}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={cancellingTransaction}
              className="w-full sm:w-auto h-8 text-xs"
            >
              Keep Transaction
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelTransaction}
              disabled={cancellingTransaction}
              className="w-full sm:w-auto h-8 text-xs"
            >
              {cancellingTransaction ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <Trash2 className="h-3 w-3 mr-1.5" />
                  Cancel Transaction
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

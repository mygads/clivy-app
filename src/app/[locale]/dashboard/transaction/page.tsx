"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  X,
  Package,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Ban,
  Loader2,
  Plus,
  RefreshCw,
  TrendingUp,
  DollarSign,
  FileText,
  Download,
  MoreVertical,
  Phone
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SessionManager } from '@/lib/storage'
import { toast } from 'sonner'
import { useCurrency } from '@/hooks/useCurrency'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

// Simplified - WhatsApp only transactions
interface WhatsappTransactionDetail {
  id: string;
  whatsappPackageId: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  whatsappPackage: {
    id: string;
    name: string;
    priceMonth: number;
    priceYear: number;
  };
}

interface PaymentDetail {
  id: string;
  amount: number;
  method: string;
  status: string;
  paymentDate?: string;
  createdAt: string;
  expiresAt?: string;
  serviceFee?: number;
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  finalAmount?: number;
  status: string;
  type: string;
  currency?: string;
  transactionDate: string;
  notes?: string;
  discountAmount?: number;
  serviceFeeAmount?: number;
  expiresAt?: string;
  user?: { 
    id: string;
    name: string; 
    email: string;
  };
  whatsappTransaction?: WhatsappTransactionDetail;
  payment?: PaymentDetail;
  voucher?: {
    id: string;
    code: string;
    name: string;
    type: string;
    value: number;
  };
}

interface TransactionStats {
  total: number
  created: number
  pending: number
  inProgress: number
  success: number
  cancelled: number
  expired: number
  failed: number
  totalAmount: number
}

export default function TransactionDashboardPage() {
  const router = useRouter()
  const { currency } = useCurrency()
  
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]) // Data asli
  const [loading, setLoading] = useState(true)
  const [softLoading, setSoftLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount">("newest")
  const [cancellingTransactionId, setCancellingTransactionId] = useState<string | null>(null)
  
  // Detail modal state
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false
  })

  // Load transactions with proper authentication and API endpoint
  const loadTransactions = useCallback(async (offset: number = 0, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setSoftLoading(true)
      } else {
        setLoading(true)
      }
      
      // Get token for authentication like admin
      const token = SessionManager.getToken()
      if (!token) {
        toast.error('Authentication required')
        router.push('/signin')
        return
      }

      // Hanya ambil data tanpa filter - filter dilakukan di frontend
      const params = new URLSearchParams({
        limit: '100', // Ambil lebih banyak data untuk filter frontend
        offset: offset.toString(),
      })

      const response = await fetch(`/api/customer/transactions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setAllTransactions(result.data || [])
        setPagination(result.pagination || {
          total: result.data?.length || 0,
          limit: pagination.limit,
          offset: offset,
          hasMore: false
        })
      } else {
        throw new Error(result.error || 'Failed to fetch transactions')
      }
    } catch (error) {
      console.error("Failed to load transactions:", error)
      toast.error(error instanceof Error ? error.message : 'Failed to load transactions')
    } finally {
      setLoading(false)
      setSoftLoading(false)
    }
  }, [pagination.limit, router])

  // Cancel transaction with proper authentication
  const handleCancelTransaction = async (transactionId: string) => {
    try {
      setCancellingTransactionId(transactionId)
      
      // Get token for authentication like admin
      const token = SessionManager.getToken()
      if (!token) {
        toast.error('Authentication required')
        return
      }

      const response = await fetch(`/api/customer/transactions/${transactionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: "Cancelled by user" })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Transaction cancelled successfully')
        // Reload transactions
        loadTransactions(pagination.offset)
      } else {
        toast.error(result.error || 'Failed to cancel transaction')
      }
    } catch (error) {
      console.error("Failed to cancel transaction:", error)
      toast.error('Failed to cancel transaction. Please try again.')
    } finally {
      setCancellingTransactionId(null)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  // Filter dan sort dilakukan di frontend saja
  const filteredTransactions = useMemo(() => {
    return allTransactions
      .filter(transaction => {
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          return (
            transaction.id.toLowerCase().includes(searchLower) ||
            transaction.notes?.toLowerCase().includes(searchLower) ||
            transaction.currency?.toLowerCase().includes(searchLower) ||
            transaction.type?.toLowerCase().includes(searchLower) ||
            // Search in WhatsApp transactions
            transaction.whatsappTransaction?.whatsappPackage?.name.toLowerCase().includes(searchLower) ||
            // Search in voucher if exists
            transaction.voucher?.code?.toLowerCase().includes(searchLower) ||
            transaction.voucher?.name?.toLowerCase().includes(searchLower) ||
            // Search in payment method
            transaction.payment?.method?.toLowerCase().includes(searchLower)
          )
        }
        return true
      })
      .filter(transaction => {
        // Status filter
        if (statusFilter === "all") return true
        return transaction.status === statusFilter
      })
      .sort((a, b) => {
        // Sort by date or amount
        if (sortBy === "newest") {
          return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
        } else if (sortBy === "oldest") {
          return new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
        } else if (sortBy === "amount") {
          return Number(b.finalAmount || b.amount) - Number(a.finalAmount || a.amount)
        }
        return 0
      })
  }, [allTransactions, searchTerm, statusFilter, sortBy])

  // Calculate stats - gunakan allTransactions agar tidak berubah saat filter
  const stats: TransactionStats = useMemo(() => {
    return {
      total: allTransactions.length,
      created: allTransactions.filter(t => t.status === "created").length,
      pending: allTransactions.filter(t => t.status === "pending").length,
      inProgress: allTransactions.filter(t => t.status === "in_progress" || t.status === "in-progress").length,
      success: allTransactions.filter(t => t.status === "success").length,
      cancelled: allTransactions.filter(t => t.status === "cancelled").length,
      expired: allTransactions.filter(t => t.status === "expired").length,
      failed: allTransactions.filter(t => t.status === "failed").length,
      totalAmount: allTransactions
        .filter(t => t.status === "success")
        .reduce((sum, t) => sum + Number(t.amount), 0)
    }
  }, [allTransactions])

  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowDetailModal(true)
  }

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: "currency",
      currency: 'IDR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Invalid Date"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid Date"
    
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // Helper functions
  const getPaymentMethodDisplay = (method: string) => {
    const methodLabels: Record<string, string> = {
      // Duitku payment methods with underscore format (actual API format)
      'duitku_BR': 'BRI Virtual Account',
      'duitku_BC': 'BCA Virtual Account',
      'duitku_M2': 'Mandiri Virtual Account',
      'duitku_BN': 'BNI Virtual Account',
      'duitku_I1': 'BNI Virtual Account',
      'duitku_B1': 'CIMB Niaga Virtual Account',
      'duitku_AG': 'Bank Artha Graha Virtual Account',
      'duitku_NC': 'Bank Neo Commerce Virtual Account',
      'duitku_VA': 'Maybank Virtual Account',
      'duitku_BT': 'Permata Bank Virtual Account',
      'duitku_A1': 'ATM Bersama Virtual Account',
      'duitku_S1': 'Bank Sahabat Sampoerna Virtual Account',
      'duitku_DM': 'Danamon Virtual Account',
      'duitku_BV': 'BSI Virtual Account',
      'duitku_BSI': 'BSI Virtual Account',
      'duitku_IR': 'Indomaret',
      
      // Credit Card
      'duitku_VC': 'Credit Card',
      
      // E-Wallet
      'duitku_OV': 'OVO',
      'duitku_DA': 'DANA',
      'duitku_SP': 'QRIS',
      'duitku_SA': 'ShopeePay Apps',
      'duitku_SL': 'ShopeePay Account Link',
      'duitku_LF': 'LinkAja Apps',
      'duitku_LA': 'LinkAja Apps',
      'duitku_OL': 'OVO Account Link',
      'duitku_JP': 'Jenius Pay',
      'duitku_GP': 'GoPay',
      
      // QRIS
      'duitku_NQ': 'QRIS',
      'duitku_GQ': 'QRIS',
      'duitku_SQ': 'QRIS',
      
      // Retail
      'duitku_FT': 'Alfamart/Pegadaian/Pos',
      
      // Paylater
      'duitku_IM': 'Indodana Paylater',
      'duitku_DN': 'Indodana Paylater',
      'duitku_AT': 'ATOME',
      
      // Manual Transfer
      'manual_transfer_bank_bank_rakyat_indonesia_idr': 'BRI (Manual Transfer)',
    }
    
    // Debug log to check the actual method value
    console.log('Payment method received:', method)
    
    // Check if it's a direct match first (handles DUITKU BR, etc.)
    if (methodLabels[method]) {
      console.log('Found direct match:', methodLabels[method])
      return methodLabels[method]
    }
    
    // Try with trimmed method (in case of extra spaces)
    const trimmedMethod = method.trim()
    if (methodLabels[trimmedMethod]) {
      console.log('Found trimmed match:', methodLabels[trimmedMethod])
      return methodLabels[trimmedMethod]
    }
    
    console.log('No match found, using fallback for:', method)
    // For unknown methods, clean up the display
    return method
      .replace(/^DUITKU\s+/, '') // Remove DUITKU prefix
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
  }

  const getTransactionTypeDisplay = (transaction: Transaction) => {
    // Simplified - WhatsApp only
    if (transaction.whatsappTransaction) {
      return 'WhatsApp Service'
    }
    
    return transaction.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getStatusDisplayFormat = (status: string) => {
    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  const getTransactionTypeIcon = (transaction: Transaction) => {
    // Simplified - WhatsApp only (always Phone icon)
    return Phone
  }

  const getPaymentStatusDisplay = (transaction: Transaction) => {
    if (!transaction.payment) {
      return {
        label: "No Payment",
        color: "text-gray-600",
        bgColor: "bg-gray-100 dark:bg-gray-800",
        description: "Payment not created yet"
      }
    }

    const payment = transaction.payment
    const transactionStatus = transaction.status

    switch (payment.status) {
      case "paid":
        return {
          label: "Paid",
          color: "text-green-700 dark:text-green-300",
          bgColor: "bg-green-100 dark:bg-green-900/20",
          description: "Payment completed successfully"
        }
      case "cancelled":
        // Check if transaction is still active and can retry payment
        if (transactionStatus === "created" || transactionStatus === "pending") {
          return {
            label: "Cancelled (Can Retry)",
            color: "text-orange-700 dark:text-orange-300", 
            bgColor: "bg-orange-100 dark:bg-orange-900/20",
            description: "Payment cancelled, can create new payment"
          }
        } else {
          return {
            label: "Cancelled",
            color: "text-red-700 dark:text-red-300",
            bgColor: "bg-red-100 dark:bg-red-900/20", 
            description: "Payment was cancelled"
          }
        }
      case "pending":
        return {
          label: "Waiting Payment",
          color: "text-yellow-700 dark:text-yellow-300",
          bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
          description: "Waiting for payment confirmation"
        }
      case "failed":
        return {
          label: "Failed",
          color: "text-red-700 dark:text-red-300", 
          bgColor: "bg-red-100 dark:bg-red-900/20",
          description: "Payment failed"
        }
      default:
        return {
          label: payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
          color: "text-gray-700 dark:text-gray-300",
          bgColor: "bg-gray-100 dark:bg-gray-800",
          description: `Payment status: ${payment.status}`
        }
    }
  }

  const handlePageChange = (newOffset: number) => {
    loadTransactions(newOffset)
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "created":
        return {
          icon: Plus,
          label: "Created",
          color: "text-blue-600",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          badgeVariant: "outline" as const
        }
      case "pending":
        return {
          icon: Clock,
          label: "Pending Payment",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          badgeVariant: "secondary" as const
        }
      case "in_progress":
      case "in-progress":
        return {
          icon: Loader2,
          label: "In Progress",
          color: "text-orange-600",
          bgColor: "bg-orange-50 dark:bg-orange-900/20",
          badgeVariant: "outline" as const
        }
      case "success":
        return {
          icon: CheckCircle,
          label: "Completed",
          color: "text-green-600",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          badgeVariant: "default" as const
        }
      case "cancelled":
        return {
          icon: Ban,
          label: "Cancelled",
          color: "text-gray-600",
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          badgeVariant: "outline" as const
        }
      case "expired":
        return {
          icon: XCircle,
          label: "Expired",
          color: "text-red-600",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          badgeVariant: "destructive" as const
        }
      case "failed":
        return {
          icon: AlertCircle,
          label: "Failed",
          color: "text-red-600",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          badgeVariant: "destructive" as const
        }
      default:
        return {
          icon: AlertCircle,
          label: status,
          color: "text-gray-600",
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          badgeVariant: "outline" as const
        }
    }
  }

  if (loading && allTransactions.length === 0) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-background">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <CreditCard className="h-8 w-8" />
            <span>Transaction History</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2">
        <Button onClick={() => loadTransactions(pagination.offset, true)} variant="outline" size="sm" disabled={softLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${softLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        </div>
      </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-1" />
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search & Filter Skeleton */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex-1">
                <div className="relative">
                  <div className="h-10 w-full bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 w-36 bg-muted rounded animate-pulse" />
                <div className="h-10 w-32 bg-muted rounded animate-pulse" />
                <div className="h-10 w-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List Skeleton */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="space-y-2">
                          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-6 bg-background">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center space-x-2">
            <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
            <span>Transaction History</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Monitor and manage all your transaction activities
          </p>
        </div>
        <div className="flex items-center space-x-2">
        <Button onClick={() => loadTransactions(pagination.offset, true)} variant="outline" size="sm" disabled={softLoading} className="text-xs sm:text-sm w-full sm:w-auto">
          <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${softLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div>
          <Card className="border border-border hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Transactions</CardTitle>
              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All transactions
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border border-border hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium">Success</CardTitle>
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.success}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed transactions
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border border-border hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Being processed
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border border-border hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium">Waiting Payment</CardTitle>
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.created + stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pending payment
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border border-border hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium">Failed/Cancelled</CardTitle>
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.cancelled + stats.expired + stats.failed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Unsuccessful
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 sm:pl-10 text-sm h-9 sm:h-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative w-full sm:min-w-[150px]">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring shadow-sm hover:bg-accent/50 transition-colors"
                    style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 8px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="created">Created</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="success">Success</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="relative w-full sm:min-w-[140px]">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring shadow-sm hover:bg-accent/50 transition-colors"
                    style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 8px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px'
                    }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="amount">Highest Amount</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 text-base sm:text-lg text-foreground">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Transactions ({filteredTransactions.length})</span>
            </div>
            {softLoading && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                Refreshing...
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-foreground">No transactions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "You haven't made any transactions yet"
                }
              </p>
              {(!searchTerm && statusFilter === "all") && (
                <Link href="/products">
                  <Button>Browse Products</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction, index) => {
                const statusConfig = getStatusConfig(transaction.status)
                const StatusIcon = statusConfig.icon
                const TransactionTypeIcon = getTransactionTypeIcon(transaction)
                
                return (
                  <div key={transaction.id || index}>
                    <Card className="hover:bg-accent/50 transition-colors">
                      <CardContent className="pt-4 sm:pt-6">
                        {/* Header Section */}
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="p-1.5 sm:p-2 bg-background border rounded-lg flex-shrink-0">
                              <TransactionTypeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                <h3 className="font-semibold text-sm sm:text-base truncate">#{transaction.id.slice(-8).toUpperCase()}</h3>
                                <Badge variant={statusConfig.badgeVariant} className="text-xs w-fit">
                                  {statusConfig.label}
                                </Badge>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span className="truncate">{formatDate(transaction.transactionDate)}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Package className="h-3 w-3" />
                                  <span className="truncate">{getTransactionTypeDisplay(transaction)}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0 flex-shrink-0">
                                <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => viewTransactionDetails(transaction)} className="text-xs sm:text-sm">
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                Quick View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/transaction/${transaction.id}`)} className="text-xs sm:text-sm">
                                <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {transaction.payment?.status === 'paid' && (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    if (transaction.payment?.id) {
                                      router.push(`/payment/success/${transaction.payment.id}`)
                                    }
                                  }}
                                  className="text-xs sm:text-sm"
                                >
                                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                  Download Invoice
                                </DropdownMenuItem>
                              )}
                              {(transaction.status === "created" || transaction.status === "pending") && (
                                <DropdownMenuItem 
                                  onClick={() => handleCancelTransaction(transaction.id)}
                                  className="text-destructive text-xs sm:text-sm"
                                >
                                  {cancellingTransactionId === transaction.id ? (
                                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                                  ) : (
                                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                  )}
                                  Cancel Transaction
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Items Section - WhatsApp Service only */}
                        <div className="mb-3 sm:mb-4">
                          <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3">Items Purchased:</h4>
                          <div className="space-y-1.5 sm:space-y-2">
                            {/* WhatsApp Service */}
                            {transaction.whatsappTransaction && (
                              <div className="flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/30 rounded-lg border">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center border border-border">
                                    <svg className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.485 3.516"/>
                                      </svg>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs sm:text-sm font-medium truncate">
                                        {transaction.whatsappTransaction.whatsappPackage?.name || 'WhatsApp Service'}
                                      </p>
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs w-fit">
                                          <svg className="h-2 w-2 sm:h-3 sm:w-3 mr-1 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.485 3.516"/>
                                          </svg>
                                          WhatsApp
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          {transaction.whatsappTransaction.duration === 'year' ? '1 Year' : '1 Month'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right ml-2 sm:ml-3 flex-shrink-0">
                                      <p className="text-xs sm:text-sm font-semibold">
                                        {formatCurrency(
                                          transaction.whatsappTransaction.duration === 'year' 
                                            ? transaction.whatsappTransaction.whatsappPackage?.priceYear || 0
                                            : transaction.whatsappTransaction.whatsappPackage?.priceMonth || 0,
                                          currency.toUpperCase()
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Notes */}
                          {transaction.notes && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg border">
                              <p className="text-sm font-medium text-muted-foreground mb-1">Notes:</p>
                              <p className="text-sm">{transaction.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Amount and Payment Info */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0 flex-1">
                            <div className="flex-shrink-0">
                              <p className="text-xs sm:text-sm text-muted-foreground">Amount</p>
                              <p className="text-base sm:text-lg font-semibold">
                                {formatCurrency(
                                  Number((transaction as any).finalAmount || transaction.amount),
                                  transaction.currency || 'IDR'
                                )}
                              </p>
                            </div>
                            
                            {transaction.payment ? (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 min-w-0">
                                <div className="min-w-0">
                                  <p className="text-xs sm:text-sm text-muted-foreground">Payment</p>
                                  <div className="space-y-1">
                                    <p className="text-xs sm:text-sm font-medium truncate">
                                      {getPaymentMethodDisplay(transaction.payment.method)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getPaymentStatusDisplay(transaction).color} border-current`}
                                  >
                                    {getPaymentStatusDisplay(transaction).label}
                                  </Badge>
                                </div>
                              </div>
                            
                            ) : (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                                <div>
                                  <p className="text-xs sm:text-sm text-muted-foreground">Payment</p>
                                  <div className="space-y-1">
                                    <p className="text-xs sm:text-sm font-medium text-gray-500">Not Created</p>  
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs text-gray-600 border-current">
                                  No Payment
                                </Badge>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => router.push(`/dashboard/transaction/${transaction.id}`)}
                              className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto"
                            >
                              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                              View Detail
                            </Button>

                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => viewTransactionDetails(transaction)}
                              className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              Quick View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                Showing <span className="font-medium">{pagination.offset + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.offset + pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> transactions
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                  disabled={pagination.offset === 0}
                  className="gap-1 sm:gap-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-2 text-xs sm:text-sm h-8 sm:h-9"
                >
                  <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 rotate-90" />
                  Previous
                </Button>
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                    Page {Math.floor(pagination.offset / pagination.limit) + 1} of {Math.ceil(pagination.total / pagination.limit)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                  disabled={!pagination.hasMore}
                  className="gap-1 sm:gap-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-2 text-xs sm:text-sm h-8 sm:h-9"
                >
                  Next
                  <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 -rotate-90" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      <div>
        {showDetailModal && selectedTransaction && (
          <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
            <DialogContent className="max-w-[92vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-xl mx-auto">
              <DialogHeader className="border-b pb-3 sm:pb-4 px-4 sm:px-6">
                <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <DialogTitle className="text-base sm:text-xl font-semibold truncate">
                        Transaction #{selectedTransaction.id.slice(-8).toUpperCase()}
                      </DialogTitle>
                      <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                        {formatDate(selectedTransaction.transactionDate)}
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 flex-shrink-0">
                    <Badge variant="secondary" className="text-xs w-fit">
                      {getStatusDisplayFormat(selectedTransaction.status)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        setShowDetailModal(false)
                        router.push(`/dashboard/transaction/${selectedTransaction.id}`)
                      }}
                      className="gap-1 sm:gap-2 text-xs h-8 sm:h-9 w-full sm:w-auto"
                    >
                      <FileText className="h-3 w-3" />
                      Full Details
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 sm:space-y-6 py-3 sm:py-4 px-4 sm:px-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
                  <Card>
                    <CardContent className="p-2.5 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1 sm:p-2 bg-green-100 dark:bg-green-900/20 rounded-lg flex-shrink-0">
                          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-muted-foreground">Total Amount</p>
                          <p className="text-sm sm:text-base font-semibold truncate">
                            {formatCurrency(Number(selectedTransaction.amount))}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-2.5 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1 sm:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                          <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-muted-foreground">Type</p>
                          <p className="text-sm sm:text-base font-semibold capitalize truncate">
                            {getTransactionTypeDisplay(selectedTransaction)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedTransaction.payment && (
                    <Card className="sm:col-span-2 lg:col-span-1">
                      <CardContent className="p-2.5 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1 sm:p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex-shrink-0">
                            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-muted-foreground">Payment</p>
                            <p className="text-sm sm:text-base font-semibold truncate">
                              {getPaymentMethodDisplay(selectedTransaction.payment.method)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Items Section - WhatsApp Service only */}
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <h3 className="text-sm sm:text-lg font-semibold">WhatsApp Service</h3>
                  </div>

                  {/* WhatsApp Service */}
                  {selectedTransaction.whatsappTransaction && (
                    <Card className="border border-border/50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center border border-border">
                              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.485 3.516"/>
                              </svg>
                            </div>
                          </div>
                          
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-sm sm:text-base mb-1 truncate">
                                  {selectedTransaction.whatsappTransaction.whatsappPackage?.name}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    <div className="h-3 w-3 mr-1" >
                                      <svg className="h-3 w-3 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.485 3.516"/>
                                      </svg>
                                    </div>
                                    WhatsApp Service
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Duration: {selectedTransaction.whatsappTransaction.duration === 'year' ? '1 Year' : '1 Month'}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <p className="font-semibold text-lg">
                                  {formatCurrency(
                                    selectedTransaction.whatsappTransaction.duration === 'year' 
                                      ? selectedTransaction.whatsappTransaction.whatsappPackage?.priceYear || 0
                                      : selectedTransaction.whatsappTransaction.whatsappPackage?.priceMonth || 0,
                                    currency.toUpperCase()
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Activity Log Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Activity Log</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Transaction Created */}
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Transaction Created</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(selectedTransaction.transactionDate)} • {getTransactionTypeDisplay(selectedTransaction)}
                        </p>
                      </div>
                    </div>

                    {/* Payment Created */}
                    {selectedTransaction.payment && (
                      <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Payment Created</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(selectedTransaction.payment.createdAt)} • {getPaymentMethodDisplay(selectedTransaction.payment.method)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Payment Status Updates */}
                    {selectedTransaction.payment?.status === 'cancelled' && (
                      <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-700 dark:text-red-300">Payment Cancelled</p>
                          <p className="text-xs text-red-600 dark:text-red-400">
                            Payment was cancelled • {getPaymentMethodDisplay(selectedTransaction.payment.method)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Payment Completed */}
                    {selectedTransaction.payment?.status === 'paid' && selectedTransaction.payment?.paymentDate && (
                      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">Payment Completed</p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {formatDate(selectedTransaction.payment.paymentDate)} • {getPaymentMethodDisplay(selectedTransaction.payment.method)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Transaction Status - In Progress */}
                    {selectedTransaction.status === 'in_progress' && (
                      <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Transaction In Progress</p>
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            Services are being prepared for delivery
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Transaction Status - Success */}
                    {selectedTransaction.status === 'success' && (
                      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">Transaction Completed</p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            All services delivered successfully
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Transaction Status - Cancelled */}
                    {selectedTransaction.status === 'cancelled' && (
                      <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-700 dark:text-red-300">Transaction Cancelled</p>
                          <p className="text-xs text-red-600 dark:text-red-400">
                            Transaction was cancelled by user or expired
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Transaction Status - Expired */}
                    {selectedTransaction.status === 'expired' && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Transaction Expired</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Transaction expired due to timeout
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Special Case: Show if transaction was cancelled but user can retry payment */}
                    {(selectedTransaction.status === 'created' || selectedTransaction.status === 'pending') && 
                     selectedTransaction.payment?.status === 'cancelled' && (
                      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Payment Retry Available</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            Previous payment was cancelled, you can create a new payment
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                {selectedTransaction.notes && (
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      <h3 className="text-base sm:text-lg font-semibold">Notes</h3>
                    </div>
                    <Card>
                      <CardContent className="p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedTransaction.notes}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <h3 className="text-base sm:text-lg font-semibold">Payment Summary</h3>
                  </div>
                  <Card>
                    <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Subtotal</span>
                        <span className="font-medium">{formatCurrency(Number(selectedTransaction.amount), selectedTransaction.currency || 'IDR')}</span>
                      </div>
                      {Number(selectedTransaction.discountAmount) > 0 && (
                        <div className="flex justify-between text-xs sm:text-sm text-green-600">
                          <span>Discount</span>
                          <span className="font-medium">-{formatCurrency(Number(selectedTransaction.discountAmount), selectedTransaction.currency || 'IDR')}</span>
                        </div>
                      )}
                      {Number((selectedTransaction as any).serviceFeeAmount || 0) > 0 && (
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Service Fee</span>
                          <span className="font-medium">{formatCurrency(Number((selectedTransaction as any).serviceFeeAmount || 0), selectedTransaction.currency || 'IDR')}</span>
                        </div>
                      )}
                        <div className="border-t pt-2 sm:pt-3">
                        <div className="flex justify-between font-semibold text-sm sm:text-base">
                          <span>Total</span>
                          <span className="text-primary">
                          {formatCurrency(
                            Number(selectedTransaction.amount) - 
                            Number(selectedTransaction.discountAmount || 0) + 
                            Number((selectedTransaction as any).serviceFeeAmount || 0),
                            selectedTransaction.currency || 'IDR'
                          )}
                          </span>
                        </div>
                        </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Information */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <h3 className="text-base sm:text-lg font-semibold">Payment Information</h3>
                  </div>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      {selectedTransaction.payment ? (
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                            <div className="flex-1">
                              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                <div>
                                  <p className="text-xs sm:text-sm font-medium">Payment ID</p>
                                  <p className="text-xs text-muted-foreground font-mono break-all">
                                    {selectedTransaction.payment.id}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs sm:text-sm font-medium">Payment Method</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground">
                                    {getPaymentMethodDisplay(selectedTransaction.payment.method)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Badge 
                              className={`${getPaymentStatusDisplay(selectedTransaction).bgColor} ${getPaymentStatusDisplay(selectedTransaction).color} border-none text-xs`}
                            >
                              {getPaymentStatusDisplay(selectedTransaction).label}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            {getPaymentStatusDisplay(selectedTransaction).description}
                          </div>

                          {selectedTransaction.payment.paymentDate && (
                            <div className="pt-2 border-t">
                              <p className="text-sm font-medium">Payment Date</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(selectedTransaction.payment.paymentDate)}
                              </p>
                            </div>
                          )}

                          {selectedTransaction.payment.status === 'cancelled' && 
                           (selectedTransaction.status === 'created' || selectedTransaction.status === 'pending') && (
                            <div className="pt-2 border-t">
                              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Can Create New Payment</p>
                                  <p className="text-xs text-blue-600 dark:text-blue-400">
                                    Transaction is still active. You can create a new payment to complete this transaction.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <CreditCard className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No Payment Created</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Payment has not been created for this transaction yet
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
                  <Button
                    variant="default"
                    onClick={() => {
                      setShowDetailModal(false)
                      router.push(`/dashboard/transaction/${selectedTransaction.id}`)
                    }}
                    className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    View Full Details
                  </Button>

                  {/* Download Invoice - Only show when payment is paid */}
                  {selectedTransaction.payment?.status === 'paid' && (
                    <Button 
                      variant="default" 
                      onClick={() => {
                        if (selectedTransaction.payment?.id) {
                          router.push(`/payment/success/${selectedTransaction.payment.id}`)
                        }
                      }}
                      className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                      Download Invoice
                    </Button>
                  )}

                  {/* Payment Pending - Show payment detail button */}
                  {selectedTransaction.payment?.status === 'pending' && (
                    <Button 
                      variant="default"
                      onClick={() => {
                        setShowDetailModal(false)
                        router.push(`/dashboard/transaction/${selectedTransaction.id}`)
                      }}
                      className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                      Complete Payment
                    </Button>
                  )}

                  {/* Create Payment - Show when payment cancelled or no payment, and transaction not expired */}
                  {(!selectedTransaction.payment || selectedTransaction.payment.status === 'cancelled') && 
                   (selectedTransaction.status === 'created' || selectedTransaction.status === 'pending') && (
                    <Button 
                      variant="default"
                      onClick={() => {
                        setShowDetailModal(false)
                        router.push(`/dashboard/transaction/${selectedTransaction.id}`)
                      }}
                      className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                      Create Payment
                    </Button>
                  )}

                  {/* Cancel Transaction - Only for active transactions */}
                  {(selectedTransaction.status === "created" || selectedTransaction.status === "pending") && (
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        setShowDetailModal(false)
                        handleCancelTransaction(selectedTransaction.id)
                      }}
                      className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      Cancel Transaction
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Activity, 
  CreditCard, 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Eye,
  MessageSquare,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  Send,
  MessageCircle,
  Calendar,
  Loader2,
  RefreshCw,
  ExternalLink,
  History,
  PieChart,
  Plus,
  ArrowRight
} from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SimpleBarChart, SimpleDonutChart } from "@/components/ui/simple-charts"
import Link from "next/link"
import { SessionManager } from "@/lib/storage"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

// Dashboard skeleton components
const StatsCardSkeleton = () => (
  <Card className="border-border/50 shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-20" />
    </CardContent>
  </Card>
)

const ServiceCardSkeleton = () => (
  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-20" />
    </div>
    <div className="text-right">
      <Skeleton className="h-5 w-8 mb-1" />
      <Skeleton className="h-3 w-12" />
    </div>
  </div>
)

const SessionCardSkeleton = () => (
  <div className="border rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    
    <Skeleton className="h-4 w-48 mb-2" />
    
    <div className="flex items-center justify-between">
      <div className="text-center">
        <Skeleton className="h-6 w-12 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="text-center">
        <Skeleton className="h-6 w-12 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    
    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
      <Skeleton className="h-3 w-32" />
    </div>
  </div>
)

const TransactionItemSkeleton = () => (
  <div className="flex items-center justify-between p-3 border rounded-lg">
    <div className="flex items-center gap-3">
      <Skeleton className="h-4 w-4" />
      <div>
        <Skeleton className="h-4 w-32 mb-1" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
      </div>
    </div>
    <div className="text-right">
      <Skeleton className="h-4 w-20 mb-1" />
      <Skeleton className="h-4 w-12 rounded-full" />
    </div>
  </div>
)

// Dashboard data types
interface DashboardData {
  transactionSummary: {
    totalOverall: number;
    success: {
      total: number;
      product: number;
      whatsapp: number;
    };
    pending: {
      awaitingPayment: number;
      awaitingVerification: number;
    };
    failed: number;
  };
  whatsappSummary: {
    sessionQuota: {
      used: number;
      remaining: number;
      total: number;
    };
    messageStats: {
      sent: number;
      failed: number;
    };
    activeSessions: number;
    expiration: string | null;
  };
  recentHistory: {
    products: any[];
    whatsapp: any[];
    transactions: any[];
  };
  productDeliveryLog: any[];
}



export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  
  const router = useRouter()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = SessionManager.getToken()

      // Fetch dashboard data
      const dashboardResponse = await fetch('/api/customer/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      
      console.log('Dashboard Response status:', dashboardResponse.status)
      
      if (dashboardResponse.ok) {
        const dashboardResult = await dashboardResponse.json()
        console.log('Dashboard API Response:', dashboardResult)
        
        if (dashboardResult.success) {
          setDashboardData(dashboardResult.data)
        } else {
          setError(dashboardResult.error || "Failed to fetch dashboard data")
        }
      }

      setLastRefresh(new Date())
      
    } catch (err) {
      setError("Error loading dashboard data")
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = () => {
    fetchData()
  }

  if (loading && !dashboardData) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-background">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Three Column Layout Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {[
            { title: "Breakdown Transaksi per Tipe", items: 3 },
            { title: "Quick Actions", items: 3 }
          ].map((section, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array(section.items).fill(0).map((_, j) => (
                    <ServiceCardSkeleton key={j} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Two Column Layout Skeleton */}
        <div className="">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2].map((j) => (
                  <SessionCardSkeleton key={j} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error && !dashboardData) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-background">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }



  // Check if user has purchased different service types
  const hasWhatsAppPackages = (dashboardData?.transactionSummary?.success?.whatsapp ?? 0) > 0
  const hasProductPackages = (dashboardData?.transactionSummary?.success?.product ?? 0) > 0

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-6 bg-background">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Terakhir diperbarui: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-2 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Loading Indicator for Refresh */}
      {loading && dashboardData && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-700 dark:text-blue-300">
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            <span>Sedang memperbarui data dashboard...</span>
          </div>
        </div>
      )}

      {/* Development Mode Indicator */}
      {error && error.includes("development data") && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-700 dark:text-blue-300">
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Development Mode: Using mock data (backend API not available)</span>
          </div>
        </div>
      )}

      {/* Transaction Summary Stats Cards */}
      <div className={`grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4 transition-all duration-300 ${loading && dashboardData ? 'opacity-60 pointer-events-none' : ''}`}>
        {/* Total Transactions */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Transaksi</CardTitle>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold text-foreground">
              {dashboardData?.transactionSummary.totalOverall || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Semua transaksi
            </p>
          </CardContent>
        </Card>

        {/* Successful Transactions */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Sukses</CardTitle>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold text-foreground">
              {dashboardData?.transactionSummary.success.total || 0}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1 flex-wrap gap-1">
              {/* Always show Products */}
              <div className="flex items-center gap-1">
                <Package className="h-2 w-2 sm:h-3 sm:w-3" />
                <span className="text-xs">{dashboardData?.transactionSummary.success.product || 0} Produk</span>
              </div>
              
              {/* Only show WhatsApp if user has WhatsApp packages */}
              {hasWhatsAppPackages && (
                <>
                  <span className="mx-1">•</span>
                  <div className="flex items-center gap-1">
                    <FaWhatsapp className="h-2 w-2 sm:h-3 sm:w-3" />
                    <span className="text-xs">{dashboardData?.transactionSummary.success.whatsapp || 0} WhatsApp</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Transactions */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold text-foreground">
              {(dashboardData?.transactionSummary.pending.awaitingPayment || 0) + 
               (dashboardData?.transactionSummary.pending.awaitingVerification || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1 flex-wrap gap-1">
              <span>{dashboardData?.transactionSummary.pending.awaitingPayment || 0} Pembayaran</span>
              <span className="mx-1">•</span>
              <span>{dashboardData?.transactionSummary.pending.awaitingVerification || 0} Verifikasi</span>
            </div>
          </CardContent>
        </Card>

        {/* Failed Transactions */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Gagal</CardTitle>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold text-foreground">
              {dashboardData?.transactionSummary.failed || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Transaksi gagal
            </p>
          </CardContent>        
        </Card>
      </div>

      {/* Transaction Type Breakdown */}
      <div className={`grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-2 transition-all duration-300 ${loading && dashboardData ? 'opacity-60 pointer-events-none' : ''}`}>
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChart className="h-4 w-4 sm:h-5 sm:w-5" />
              Breakdown Transaksi per Tipe
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Distribusi transaksi berdasarkan kategori layanan</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 sm:space-y-4">
              {/* Always show Products section */}
              <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                  <span className="text-xs sm:text-sm font-medium">Paket Produk</span>
                </div>
                <div className="text-right">
                  <p className="text-sm sm:text-lg font-bold text-blue-600">{dashboardData?.transactionSummary.success.product || 0}</p>
                  <p className="text-xs text-muted-foreground">transaksi</p>
                </div>
              </div>
              
              {/* Only show WhatsApp section if user has WhatsApp packages */}
              {hasWhatsAppPackages && (
                <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaWhatsapp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span className="text-xs sm:text-sm font-medium">WhatsApp API</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm sm:text-lg font-bold text-green-600">{dashboardData?.transactionSummary.success.whatsapp || 0}</p>
                    <p className="text-xs text-muted-foreground">transaksi</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>



        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Aksi cepat untuk mengelola layanan</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 sm:space-y-3">
              <Link href="/dashboard/product" className="block">
                <Button className="w-full justify-start gap-2 h-auto py-2 sm:py-3 text-xs sm:text-sm" variant="outline">
                  <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                  Beli Paket Baru
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-auto" />
                </Button>
              </Link>
              
              {/* Only show WhatsApp Dashboard if user has WhatsApp packages */}
              {hasWhatsAppPackages && (
                <Link href="/dashboard/whatsapp" className="block">
                  <Button className="w-full justify-start gap-2 h-auto py-2 sm:py-3 text-xs sm:text-sm" variant="outline">
                    <FaWhatsapp className="h-3 w-3 sm:h-4 sm:w-4" />
                    WhatsApp Dashboard
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-auto" />
                  </Button>
                </Link>
              )}
              
              <Link href="/dashboard/transaction" className="block">
                <Button className="w-full justify-start gap-2 h-auto py-2 sm:py-3 text-xs sm:text-sm" variant="outline">
                  <History className="h-3 w-3 sm:h-4 sm:w-4" />
                  Riwayat Transaksi
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-auto" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent History */}
      <div className={`grid gap-4 sm:gap-6 md:grid-cols-1 transition-all duration-300 ${loading && dashboardData ? 'opacity-60 pointer-events-none' : ''}`}>


        {/* Recent Transaction History */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <History className="h-4 w-4 sm:h-5 sm:w-5" />
              Riwayat Transaksi Terbaru
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">10 transaksi terakhir Anda</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {dashboardData?.recentHistory?.transactions && dashboardData.recentHistory.transactions.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {dashboardData.recentHistory.transactions.map((transaction) => {
                  const getTypeIcon = (type: string) => {
                    switch (type) {
                      case 'product': return <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                      case 'addon': return <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                      case 'whatsapp': return <FaWhatsapp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                      default: return <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    }
                  }
                  
                  const getStatusBadge = (status: string) => {
                    switch (status) {
                      case 'paid':
                        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">Lunas</Badge>
                      case 'pending':
                        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">Pending</Badge>
                      case 'failed':
                        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">Gagal</Badge>
                      default:
                        return <Badge variant="outline" className="text-xs">{status}</Badge>
                    }
                  }
                  
                  const getTypeLabel = (type: string) => {
                    switch (type) {
                      case 'product': return 'Produk'
                      case 'whatsapp': return 'WhatsApp'
                      default: return 'Lainnya'
                    }
                  }
                  
                  return (
                    <div key={transaction.id} className="flex items-start sm:items-center justify-between p-2 sm:p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-1 sm:mt-0">
                          {getTypeIcon(transaction.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate">{transaction.name}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(transaction.createdAt), 'dd MMM yyyy HH:mm')}
                            </p>
                            <Badge variant="outline" className="text-xs w-fit">{getTypeLabel(transaction.type)}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-medium text-xs sm:text-sm whitespace-nowrap">
                          {transaction.currency === 'usd' ? '$' : 'Rp'} {Number(transaction.amount).toLocaleString()}
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <History className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm sm:text-base">Belum ada riwayat transaksi</p>
                <Link href="/dashboard/product">
                  <Button variant="outline" size="sm" className="mt-2 text-xs sm:text-sm">
                    Buat Transaksi Pertama
                  </Button>
                </Link>
              </div>
            )}
            
            {dashboardData?.recentHistory?.transactions && dashboardData.recentHistory.transactions.length > 0 && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                <Link href="/dashboard/transactions">
                  <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                    Lihat Semua Transaksi
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

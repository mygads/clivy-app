"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Activity, 
  AlertCircle,
  BarChart3,
  BookOpen, 
  Calendar,
  CheckCircle2,
  CreditCard, 
  FileText,
  ImageIcon,
  MessageSquare, 
  Package, 
  Phone,
  PieChart,
  Send,
  Smartphone, 
  TrendingUp,
  Users,
  Video,
  Volume2,
  Wifi,
  WifiOff,
  XCircle
} from "lucide-react"
import { format } from "date-fns"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { SessionManager } from "@/lib/storage"
import SubscriptionGuard from "@/components/whatsapp/subscription-guard"
import { useCurrency } from "@/hooks/useCurrency"

interface DashboardStats {
  sessions: {
    active: number
    total: number
    max: number
    details: Array<{
      id: string
      sessionId: string
      sessionName: string
      jid: string | null
      connected: boolean
      status: string
      phoneNumber: string | null
      messageStats: {
        totalMessagesSent: number
        totalMessagesFailed: number
        textMessagesSent: number
        textMessagesFailed: number
        imageMessagesSent: number
        imageMessagesFailed: number
        documentMessagesSent: number
        documentMessagesFailed: number
        audioMessagesSent: number
        audioMessagesFailed: number
        videoMessagesSent: number
        videoMessagesFailed: number
        stickerMessagesSent: number
        stickerMessagesFailed: number
        locationMessagesSent: number
        locationMessagesFailed: number
        contactMessagesSent: number
        contactMessagesFailed: number
        templateMessagesSent: number
        templateMessagesFailed: number
        lastMessageSentAt: string | null
        lastMessageFailedAt: string | null
      }
    }>
  }
  messages: {
    total: {
      totalSent: number
      totalFailed: number
      textSent: number
      textFailed: number
      imageSent: number
      imageFailed: number
      documentSent: number
      documentFailed: number
      audioSent: number
      audioFailed: number
      videoSent: number
      videoFailed: number
    }
  }
  campaigns: {
    scheduled: number
    successful: number
    total: number
    failed: number
    list: Array<{
      id: string
      name: string
      type: string
      status: string
      created_at: string
    }>
    bulkCampaigns: Array<{
      id: string
      name: string
      type: string
      status: string
      total_count: string
      sent_count: string
      failed_count: string
      scheduled_at?: string
      processed_at?: string
      completed_at?: string
      contacts_reached: number
      created_at: string
    }>
    weeklyData: Array<{
      date: string
      sent: number
      failed: number
      contacts: number
    }>
    upcoming: Array<{
      id: string
      name: string
      scheduled_at: string
      total_count: number
    }>
    upcomingContacts: number
  }
  subscription: {
    status: string
    packageName: string
    maxSessions: number
    expiredAt: string
    activatedAt: string
    priceMonth: number
    priceYear: number
  } | null
  transactions: Array<{
    id: string
    transactionId: string
    packageName: string
    duration: string
    status: string
    amount: number
    originalPrice?: number
    discountAmount?: number
    voucherInfo?: {
      code: string
      name: string
      discountType: string
      value: number
    } | null
    totalTransactionAmount?: number
    paymentId?: string
    paymentStatus: string
    paymentMethod: string
    paymentDate?: string
    transactionDate: string
    createdAt: string
  }>
}

export default function WhatsAppDashboardPage() {
  const { currency } = useCurrency()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = SessionManager.getToken()
      const response = await fetch('/api/customer/whatsapp/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Gagal memuat data dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-8">
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-red-500'
      case 'pending': return 'bg-yellow-500'
      case 'connected': return 'bg-green-500'
      case 'disconnected': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'inactive': return 'Tidak Aktif'
      case 'pending': return 'Pending'
      case 'connected': return 'Terhubung'
      case 'disconnected': return 'Terputus'
      case 'completed': return 'Selesai'
      case 'processing': return 'Diproses'
      case 'failed': return 'Gagal'
      default: return status
    }
  }

  const totalMessages = stats.messages.total.totalSent + stats.messages.total.totalFailed
  const successRate = totalMessages > 0 ? (stats.messages.total.totalSent / totalMessages) * 100 : 0

  return (
    <div className="px-2 sm:px-4 py-4 sm:py-6 md:py-8">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
          WhatsApp Services Dashboard
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">
          Complete analysis of WhatsApp API sessions, messages, campaigns, and subscriptions
        </p>
      </div>

      {/* Overview Stats - Always visible */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8">
        <Card>
          <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Session Aktif</p>
                <div className="flex items-baseline gap-1 sm:gap-2">
                  <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold">{stats.sessions.active}</p>
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">/ {stats.sessions.max}</p>
                </div>
                <Progress 
                  value={(stats.sessions.active / stats.sessions.max) * 100} 
                  className="mt-1 sm:mt-2 h-1 sm:h-2"
                />
              </div>
              <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-blue-500 flex-shrink-0 ml-1 sm:ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total Pesan</p>
                <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold">{stats.messages.total.totalSent.toLocaleString()}</p>
                <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                  <span className="text-[9px] sm:text-xs text-green-600">✓ {stats.messages.total.totalSent}</span>
                  <span className="text-[9px] sm:text-xs text-red-600">✗ {stats.messages.total.totalFailed}</span>
                </div>
              </div>
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-green-500 flex-shrink-0 ml-1 sm:ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Campaign Terjadwal</p>
                <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold">{stats.campaigns.scheduled}</p>
                <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">masa depan</p>
              </div>
              <Send className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-purple-500 flex-shrink-0 ml-1 sm:ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Success Rate</p>
                <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold">{successRate.toFixed(1)}%</p>
                <Progress value={successRate} className="mt-1 sm:mt-2 h-1 sm:h-2" />
              </div>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-emerald-500 flex-shrink-0 ml-1 sm:ml-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Status */}
      {stats.subscription && (
        <Card className="mb-4 sm:mb-6 md:mb-8">
          <CardHeader className="pb-2 sm:pb-3 md:pb-4 lg:pb-6">
            <CardTitle className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg">
              <Package className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              Status Langganan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getStatusColor(stats.subscription.status)}`}></div>
                  <Badge className={
                    stats.subscription.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-[9px] sm:text-xs px-1 sm:px-2 py-0.5'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-[9px] sm:text-xs px-1 sm:px-2 py-0.5'
                  }>
                    {getStatusText(stats.subscription.status)}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Paket</p>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold truncate">{stats.subscription.packageName}</p>
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Berakhir</p>
                <p className="text-[10px] sm:text-xs md:text-sm">{format(new Date(stats.subscription.expiredAt), 'dd MMM yyyy')}</p>
                <p className="text-[9px] sm:text-xs text-gray-500">
                  {formatDistanceToNow(new Date(stats.subscription.expiredAt), { addSuffix: true })}
                </p>
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Harga</p>
                <p className="text-[10px] sm:text-xs md:text-sm">
                  Rp {stats.subscription.priceMonth.toLocaleString()}/bulan
                </p>
                <p className="text-[9px] sm:text-xs text-gray-500">
                  Rp {stats.subscription.priceYear.toLocaleString()}/tahun
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SubscriptionGuard for detailed features */}
      <SubscriptionGuard featureName="WhatsApp Subscription" showRefreshButton={true}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <Card>
          <CardHeader className="pb-2 sm:pb-3 md:pb-4">
            <CardTitle className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              Analisis Pesan per Tipe
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-1 sm:gap-2">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                  <span className="text-[10px] sm:text-xs md:text-sm">Text</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium">{stats.messages.total.textSent.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-1 sm:gap-2">
                  <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  <span className="text-[10px] sm:text-xs md:text-sm">Gambar</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium">{stats.messages.total.imageSent.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-1 sm:gap-2">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                  <span className="text-[10px] sm:text-xs md:text-sm">Dokumen & Media</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium">
                    {(stats.messages.total.documentSent + stats.messages.total.audioSent + stats.messages.total.videoSent).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3 md:pb-4">
            <CardTitle className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg">
              <PieChart className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              Ringkasan Statistik
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
              <div className="text-center p-2 sm:p-3 md:p-4 lg:p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.messages.total.totalSent.toLocaleString()}
                </p>
                <p className="text-[10px] sm:text-xs md:text-sm text-green-600 dark:text-green-400">Pesan Berhasil</p>
              </div>
              
              <div className="text-center p-2 sm:p-3 md:p-4 lg:p-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg">
                <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.messages.total.totalFailed.toLocaleString()}
                </p>
                <p className="text-[10px] sm:text-xs md:text-sm text-red-600 dark:text-red-400">Pesan Gagal</p>
              </div>
              
              <div className="text-center p-2 sm:p-3 md:p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {successRate.toFixed(1)}%
                </p>
                <p className="text-[10px] sm:text-xs md:text-sm text-blue-600 dark:text-blue-400">Tingkat Keberhasilan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Session Details with Phone Numbers and Message Stats */}
      <Card className="mb-4 sm:mb-6 md:mb-8">
        <CardHeader className="pb-2 sm:pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg">
            <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            Detail Session WhatsApp ({stats.sessions.total})
          </CardTitle>
          <CardDescription className="text-[10px] sm:text-xs md:text-sm">
            Analisis lengkap setiap session termasuk nomor HP, status, dan statistik pesan terakhir
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {stats.sessions.details.map((session) => (
              <div key={session.id} className="border dark:border-gray-700 rounded-lg p-2 sm:p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${session.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[10px] sm:text-xs md:text-sm truncate">{session.sessionName}</p>
                      <p className="text-[9px] sm:text-xs text-gray-500 truncate">
                        {session.phoneNumber || session.jid || 'Belum login'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {session.connected ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-[8px] sm:text-[9px] md:text-xs px-1 sm:px-2 py-0.5">
                        <Wifi className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        Terhubung
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-[8px] sm:text-[9px] md:text-xs px-1 sm:px-2 py-0.5">
                        <WifiOff className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        Terputus
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 text-[9px] sm:text-xs md:text-sm mb-2 sm:mb-3 md:mb-4">
                  <div>
                    <p className="text-gray-500">Total Terkirim</p>
                    <p className="font-medium text-green-600">{session.messageStats.totalMessagesSent}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Gagal</p>
                    <p className="font-medium text-red-600">{session.messageStats.totalMessagesFailed}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Text/Gambar</p>
                    <p className="font-medium">{session.messageStats.textMessagesSent}/{session.messageStats.imageMessagesSent}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Dokumen & Media</p>
                    <p className="font-medium">
                      {session.messageStats.documentMessagesSent + session.messageStats.audioMessagesSent + session.messageStats.videoMessagesSent}
                    </p>
                  </div>
                </div>
                
                {/* Last message info with enhanced datetime formatting */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 text-[8px] sm:text-[9px] md:text-xs text-gray-500 pt-1 sm:pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div>
                    <span className="font-medium">Pesan Terakhir Terkirim: </span>
                    {session.messageStats.lastMessageSentAt ? (
                      <div className="mt-0.5 sm:mt-1">
                        <p className="text-green-600 font-medium">
                          {format(new Date(session.messageStats.lastMessageSentAt), 'dd MMM yyyy HH:mm:ss')}
                        </p>
                        <p className="text-gray-400">
                          {formatDistanceToNow(new Date(session.messageStats.lastMessageSentAt), { addSuffix: true })}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-400 mt-0.5 sm:mt-1">Belum ada pesan terkirim</p>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Pesan Terakhir Gagal: </span>
                    {session.messageStats.lastMessageFailedAt ? (
                      <div className="mt-0.5 sm:mt-1">
                        <p className="text-red-600 font-medium">
                          {format(new Date(session.messageStats.lastMessageFailedAt), 'dd MMM yyyy HH:mm:ss')}
                        </p>
                        <p className="text-gray-400">
                          {formatDistanceToNow(new Date(session.messageStats.lastMessageFailedAt), { addSuffix: true })}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-400 mt-0.5 sm:mt-1">Belum ada pesan gagal</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>



      {/* Enhanced Campaign Analytics */}
      <Card className="mb-4 sm:mb-6 md:mb-8">
        <CardHeader className="pb-2 sm:pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg">
            <Send className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            Analisis Campaign (1 Minggu Terakhir)
          </CardTitle>
          <CardDescription className="text-[10px] sm:text-xs md:text-sm">
            Analisis campaign terjadwal, berhasil, dan gagal dalam 7 hari terakhir
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-3 sm:mb-4 md:mb-6">
            <div className="text-center p-2 sm:p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.campaigns.scheduled}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-blue-600 dark:text-blue-400">Campaign Terjadwal</p>
              <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">masa depan</p>
            </div>
            
            <div className="text-center p-2 sm:p-3 md:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.campaigns.successful}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-green-600 dark:text-green-400">Campaign Berhasil</p>
              <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">7 hari terakhir</p>
            </div>
            
            <div className="text-center p-2 sm:p-3 md:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.campaigns.failed}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-red-600 dark:text-red-400">Campaign Gagal</p>
              <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">7 hari terakhir</p>
            </div>
            
            <div className="text-center p-2 sm:p-3 md:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.campaigns.upcomingContacts.toLocaleString()}
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-purple-600 dark:text-purple-400">Kontak Mendatang</p>
              <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">30 hari kedepan</p>
            </div>
          </div>
          
          {/* Weekly Campaign Chart */}
          {stats.campaigns.weeklyData.length > 0 && (
            <div className="mb-3 sm:mb-4 md:mb-6">
              <h4 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 md:mb-4">Grafik Campaign Minggu Ini (Berhasil vs Gagal)</h4>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {stats.campaigns.weeklyData.map((day, index) => (
                  <div key={index} className="text-center p-1 sm:p-2 md:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-[8px] sm:text-[9px] md:text-xs text-gray-500 mb-1 sm:mb-2">{format(new Date(day.date), 'dd/MM')}</p>
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="bg-green-100 dark:bg-green-800 rounded p-0.5 sm:p-1">
                        <p className="text-[9px] sm:text-xs md:text-sm font-bold text-green-600">{day.sent}</p>
                        <p className="text-[8px] sm:text-[9px] md:text-xs text-green-500">berhasil</p>
                      </div>
                      <div className="bg-red-100 dark:bg-red-800 rounded p-0.5 sm:p-1">
                        <p className="text-[9px] sm:text-xs md:text-sm font-bold text-red-600">{day.failed}</p>
                        <p className="text-[8px] sm:text-[9px] md:text-xs text-red-500">gagal</p>
                      </div>
                      <p className="text-[8px] sm:text-[9px] md:text-xs text-blue-500 mt-0.5 sm:mt-1">{day.contacts} kontak</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Upcoming Campaigns Preview */}
          {stats.campaigns.upcoming.length > 0 && (
            <div>
              <h4 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 md:mb-4">Preview Campaign Terjadwal (30 Hari)</h4>
              <div className="space-y-1 sm:space-y-2">
                {stats.campaigns.upcoming.slice(0, 3).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[10px] sm:text-xs md:text-sm truncate">{campaign.name}</p>
                      <p className="text-[9px] sm:text-xs text-gray-500">
                        {format(new Date(campaign.scheduled_at), 'dd MMM yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-[10px] sm:text-xs md:text-sm font-bold">{campaign.total_count.toLocaleString()}</p>
                      <p className="text-[9px] sm:text-xs text-gray-500">kontak</p>
                    </div>
                  </div>
                ))}
                {stats.campaigns.upcoming.length > 3 && (
                  <p className="text-[9px] sm:text-xs text-gray-500 text-center pt-1 sm:pt-2">
                    +{stats.campaigns.upcoming.length - 3} campaign lainnya
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Campaigns - Top 5 + Scheduled Only */}
      {(stats.campaigns.list.length > 0 || stats.campaigns.bulkCampaigns.length > 0) && (
        <Card className="mb-4 sm:mb-6 md:mb-8">
          <CardHeader className="pb-2 sm:pb-3 md:pb-4">
            <CardTitle className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg">
              <Send className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              5 Campaign Template & Campaign Terjadwal
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs md:text-sm">
              Menampilkan 5 campaign template terbaru dan campaign yang dijadwalkan untuk masa depan
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {/* Recent 5 Regular Campaigns */}
              {stats.campaigns.list.length > 0 && (
                <div>
                  <h4 className="text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 text-purple-600 dark:text-purple-400">
                    5 Campaign Template Terbaru
                  </h4>
                  {stats.campaigns.list.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-2 sm:p-3 md:p-4 border dark:border-gray-700 rounded-lg mb-1 sm:mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[10px] sm:text-xs md:text-sm truncate">{campaign.name}</p>
                        <p className="text-[9px] sm:text-xs text-gray-500">{campaign.type}</p>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0 ml-2">
                        <Badge className={
                          campaign.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-[8px] sm:text-[9px] md:text-xs px-1 sm:px-2 py-0.5'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 text-[8px] sm:text-[9px] md:text-xs px-1 sm:px-2 py-0.5'
                        }>
                          {getStatusText(campaign.status)}
                        </Badge>
                        <span className="text-[9px] sm:text-xs md:text-sm text-gray-500">
                          {format(new Date(campaign.created_at), 'dd MMM')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Recent 5 Bulk Campaigns */}
              {stats.campaigns.bulkCampaigns.length > 0 && (
                <div>
                  <h4 className="text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 text-blue-600 dark:text-blue-400">
                    5 Bulk Campaign Terbaru
                  </h4>
                  {stats.campaigns.bulkCampaigns.map((bulkCampaign) => (
                    <div key={bulkCampaign.id} className="p-2 sm:p-3 md:p-4 border dark:border-gray-700 rounded-lg bg-blue-50 dark:bg-blue-900/20 mb-1 sm:mb-2">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[10px] sm:text-xs md:text-sm truncate">{bulkCampaign.name}</p>
                          <p className="text-[9px] sm:text-xs text-gray-500">Bulk Campaign - {bulkCampaign.type}</p>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0 ml-2">
                          <Badge className={
                            bulkCampaign.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-[8px] sm:text-[9px] md:text-xs px-1 sm:px-2 py-0.5'
                              : bulkCampaign.status === 'processing'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-[8px] sm:text-[9px] md:text-xs px-1 sm:px-2 py-0.5'
                              : bulkCampaign.status === 'failed'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-[8px] sm:text-[9px] md:text-xs px-1 sm:px-2 py-0.5'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-[8px] sm:text-[9px] md:text-xs px-1 sm:px-2 py-0.5'
                          }>
                            {getStatusText(bulkCampaign.status)}
                          </Badge>
                          <span className="text-[9px] sm:text-xs md:text-sm text-gray-500">
                            {format(new Date(bulkCampaign.created_at), 'dd MMM')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Campaign Statistics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 sm:gap-2 text-[8px] sm:text-[9px] md:text-xs">
                        <div className="text-center p-1 sm:p-2 bg-gray-100 dark:bg-gray-700 rounded">
                          <p className="font-bold text-blue-600">{bulkCampaign.total_count}</p>
                          <p className="text-gray-500">Total</p>
                        </div>
                        <div className="text-center p-1 sm:p-2 bg-green-100 dark:bg-green-800 rounded">
                          <p className="font-bold text-green-600">{bulkCampaign.sent_count}</p>
                          <p className="text-gray-500">Terkirim</p>
                        </div>
                        <div className="text-center p-1 sm:p-2 bg-red-100 dark:bg-red-800 rounded">
                          <p className="font-bold text-red-600">{bulkCampaign.failed_count}</p>
                          <p className="text-gray-500">Gagal</p>
                        </div>
                        <div className="text-center p-1 sm:p-2 bg-orange-100 dark:bg-orange-800 rounded">
                          <p className="font-bold text-orange-600">{bulkCampaign.contacts_reached}</p>
                          <p className="text-gray-500">Kontak</p>
                        </div>
                      </div>
                      
                      {/* Schedule Information */}
                      {bulkCampaign.scheduled_at && (
                        <div className="mt-2 sm:mt-3 pt-1 sm:pt-2 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-[9px] sm:text-xs text-blue-600">
                            <Calendar className="h-2 w-2 sm:h-3 sm:w-3 inline mr-0.5 sm:mr-1" />
                            Dijadwalkan: {format(new Date(bulkCampaign.scheduled_at), 'dd MMM yyyy HH:mm')}
                          </p>
                        </div>
                      )}
                      
                      {/* Completion Information */}
                      {bulkCampaign.completed_at && (
                        <div className="mt-1 sm:mt-2">
                          <p className="text-[9px] sm:text-xs text-green-600">
                            <CheckCircle2 className="h-2 w-2 sm:h-3 sm:w-3 inline mr-0.5 sm:mr-1" />
                            Selesai: {format(new Date(bulkCampaign.completed_at), 'dd MMM yyyy HH:mm')}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Scheduled Campaigns Only */}
              {stats.campaigns.upcoming.length > 0 && (
                <div>
                  <h4 className="text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 text-orange-600 dark:text-orange-400">
                    Campaign Terjadwal (30 Hari Kedepan)
                  </h4>
                  {stats.campaigns.upcoming.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg mb-1 sm:mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[10px] sm:text-xs md:text-sm truncate">{campaign.name}</p>
                        <p className="text-[9px] sm:text-xs text-gray-500">
                          <Calendar className="h-2 w-2 sm:h-3 sm:w-3 inline mr-0.5 sm:mr-1" />
                          {format(new Date(campaign.scheduled_at), 'dd MMM yyyy HH:mm')}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-[10px] sm:text-xs md:text-sm font-bold text-orange-600">{campaign.total_count.toLocaleString()}</p>
                        <p className="text-[9px] sm:text-xs text-gray-500">kontak</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3 md:pb-4">
          <CardTitle className="text-sm sm:text-base md:text-lg">Quick Actions</CardTitle>
          <CardDescription className="text-[10px] sm:text-xs md:text-sm">
            Aksi cepat untuk mengelola WhatsApp Services
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <Link href="/dashboard/whatsapp/devices">
              <Button className="w-full h-12 sm:h-14 md:h-16 lg:h-20 flex flex-col gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm" variant="outline">
                <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                <span>Kelola Session</span>
              </Button>
            </Link>
            
            <Link href="/dashboard/whatsapp/playground">
              <Button className="w-full h-12 sm:h-14 md:h-16 lg:h-20 flex flex-col gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm" variant="outline">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                <span>Kirim Pesan Test</span>
              </Button>
            </Link>
            
            <Link href="/dashboard/whatsapp/subscription">
              <Button className="w-full h-12 sm:h-14 md:h-16 lg:h-20 flex flex-col gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm" variant="outline">
                <Package className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                <span>Kelola Langganan</span>
              </Button>
            </Link>
            
            <Link href="/dashboard/whatsapp/api-docs">
              <Button className="w-full h-12 sm:h-14 md:h-16 lg:h-20 flex flex-col gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm" variant="outline">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                <span>API Documentation</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    
      </SubscriptionGuard>
    </div>
  )
}

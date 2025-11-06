'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Copy,
  CreditCard,
  Calendar,
  DollarSign,
  Download
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { SessionManager } from '@/lib/storage'
import { usePaymentStatus } from '@/hooks/use-payment-status'

interface PaymentStatusProps {
  paymentId: string
  onStatusChange?: (status: string) => void
  autoRefresh?: boolean
  refreshInterval?: number
}

interface PaymentData {
  id: string
  amount: number
  status: string
  method: string
  paymentDate?: string
  createdAt: string
  expiresAt?: string
  externalId?: string
  paymentUrl?: string
  gatewayProvider?: string
  gatewayResponse?: any
  currency?: string
  transaction?: {
    id: string
    description?: string
    status: string
    currency?: string
  }
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  paymentId,
  onStatusChange,
  autoRefresh = false,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchPaymentData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)
      setError(null)

      const token = SessionManager.getToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`/api/customer/payment/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch payment data`)
      }

      const data = await response.json()
      
      if (data.success) {
        const oldStatus = payment?.status
        const newPayment = {
          id: data.data.payment.id,
          amount: data.data.payment.amount,
          status: data.data.payment.status,
          method: data.data.payment.method,
          paymentDate: data.data.payment.paymentDate,
          createdAt: data.data.payment.createdAt,
          expiresAt: data.data.payment.expiresAt,
          externalId: data.data.payment.externalId,
          paymentUrl: data.data.payment.paymentUrl,
          gatewayProvider: data.data.payment.gatewayProvider,
          gatewayResponse: data.data.payment.gatewayResponse,
          transaction: data.data.transaction
        }
        setPayment(newPayment)
        
        // Notify parent of status change
        if (oldStatus && oldStatus !== newPayment.status && onStatusChange) {
          onStatusChange(newPayment.status)
        }
      } else {
        throw new Error(data.error || 'Failed to fetch payment data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [paymentId, payment?.status, onStatusChange])

  useEffect(() => {
    fetchPaymentData()
  }, [fetchPaymentData])

  useEffect(() => {
    if (!autoRefresh || !payment) return

    const interval = setInterval(() => {
      // Only auto-refresh if payment is still pending
      if (payment.status === 'pending') {
        fetchPaymentData(true)
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, payment, fetchPaymentData])

  // Note: Duitku status check functionality is handled automatically through callbacks
  // Manual status check is redundant since Duitku sends status updates via webhook callbacks

  const downloadReceipt = async () => {
    try {
      setRefreshing(true)
      const token = SessionManager.getToken()
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(`/api/customer/payment/${paymentId}/receipt`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to download receipt')
      }

      const data = await response.json()
      
      if (data.success) {
        // Create a downloadable file
        const blob = new Blob([JSON.stringify(data.receipt, null, 2)], {
          type: 'application/json'
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `receipt-${paymentId}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Receipt Downloaded",
          description: "Payment receipt has been downloaded",
          variant: "default"
        })
      } else {
        throw new Error(data.error || 'Failed to download receipt')
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download receipt",
        variant: "destructive"
      })
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        icon: <Clock className="h-4 w-4" />,
        variant: 'secondary' as const,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-200',
        label: 'Pending Payment'
      },
      paid: {
        icon: <CheckCircle className="h-4 w-4" />,
        variant: 'default' as const,
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        label: 'Payment Successful'
      },
      failed: {
        icon: <XCircle className="h-4 w-4" />,
        variant: 'destructive' as const,
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        label: 'Payment Failed'
      },
      expired: {
        icon: <AlertCircle className="h-4 w-4" />,
        variant: 'secondary' as const,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200',
        label: 'Payment Expired'
      },
      cancelled: {
        icon: <XCircle className="h-4 w-4" />,
        variant: 'outline' as const,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50 border-gray-200',
        label: 'Payment Cancelled'
      }
    }
    return configs[status as keyof typeof configs] || configs.pending
  }

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    // Always use IDR formatting
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
      variant: "default"
    })
  }

  const openPaymentUrl = () => {
    if (payment?.paymentUrl) {
      window.open(payment.paymentUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-4"
            onClick={() => fetchPaymentData()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!payment) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Payment not found
        </AlertDescription>
      </Alert>
    )
  }

  const statusConfig = getStatusConfig(payment.status)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>Payment Status</span>
                {autoRefresh && payment.status === 'pending' && (
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                )}
              </CardTitle>
              <CardDescription>
                Payment ID: {payment.id}
              </CardDescription>
            </div>
            <Badge variant={statusConfig.variant} className="flex items-center space-x-1">
              {statusConfig.icon}
              <span>{statusConfig.label}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Amount</div>
                <div className="font-medium">{formatCurrency(payment.amount, payment.currency || payment.transaction?.currency || 'IDR')}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Payment Method</div>
                <div className="font-medium">{payment.method}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="font-medium">{formatDateTime(payment.createdAt)}</div>
              </div>
            </div>

            {payment.paymentDate && (
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Paid At</div>
                  <div className="font-medium">{formatDateTime(payment.paymentDate)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Details */}
          {(payment.externalId || payment.expiresAt) && (
            <>
              <Separator />
              <div className="space-y-2">
                {payment.externalId && (
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm font-medium">Reference ID:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono">{payment.externalId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(payment.externalId!, 'Reference ID')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {payment.expiresAt && payment.status === 'pending' && (
                  <div className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded">
                    <span className="text-sm font-medium text-orange-800">Expires At:</span>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-orange-600" />
                      <span className="text-sm text-orange-800">{formatDateTime(payment.expiresAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Transaction Info */}
          {payment.transaction && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-medium">Transaction Details</div>
                <div className="flex justify-between text-sm">
                  <span>Transaction ID:</span>
                  <span className="font-mono">{payment.transaction.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Transaction Status:</span>
                  <Badge variant="outline">{payment.transaction.status}</Badge>
                </div>
                {payment.transaction.description && (
                  <div className="flex justify-between text-sm">
                    <span>Description:</span>
                    <span>{payment.transaction.description}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => fetchPaymentData(true)}
          variant="outline"
          disabled={refreshing}
        >
          {refreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Status
        </Button>

        {/* Removed Duitku manual status check - handled automatically via callbacks */}

        {payment.status === 'paid' && (
          <Button
            onClick={downloadReceipt}
            variant="default"
            disabled={refreshing}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
        )}

        {payment.paymentUrl && payment.status === 'pending' && (
          <Button onClick={openPaymentUrl}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Complete Payment
          </Button>
        )}
      </div>
    </div>
  )
}

export default PaymentStatus

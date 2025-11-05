'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoaderIcon, CreditCard, AlertCircle, CheckCircle, ExternalLink, Copy, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { SessionManager } from '@/lib/storage'
import PaymentMethodSelector from './PaymentMethodSelector'
import PaymentInstructions from './PaymentInstructions'
import Image from 'next/image'

interface PaymentMethod {
  id: string
  code: string
  name: string
  currency: string
  isActive: boolean
  serviceFeeFixed?: number
  serviceFeePercent?: number
  instructionType?: string
  instructionText?: string
  instructionImageUrl?: string
  gatewayProvider?: string
}

interface Transaction {
  id: string
  amount: number
  currency: string
  description: string
  customerInfo: {
    name: string
    email: string
    phone?: string
  }
}

interface PaymentCreationProps {
  transaction: Transaction
  onPaymentCreated: (paymentData: any) => void
  onCancel: () => void
}

interface PaymentResponse {
  success: boolean
  data?: {
    payment: {
      id: string
      paymentUrl?: string
      qrCodeUrl?: string
      qrString?: string
      vaNumber?: string
      externalId?: string
      status: string
      expiresAt?: string
      gatewayResponse?: any
    }
  }
  error?: string
}

const PaymentCreation: React.FC<PaymentCreationProps> = ({
  transaction,
  onPaymentCreated,
  onCancel
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null)
  const { toast } = useToast()

  const calculateServiceFee = (method: PaymentMethod, amount: number) => {
    let fee = 0
    if (method.serviceFeeFixed) {
      fee += method.serviceFeeFixed
    }
    if (method.serviceFeePercent) {
      fee += (amount * method.serviceFeePercent) / 100
    }
    return fee
  }

  const calculateTotalAmount = () => {
    if (!selectedMethod) return transaction.amount
    const serviceFee = calculateServiceFee(selectedMethod, transaction.amount)
    return transaction.amount + serviceFee
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency === 'IDR' ? 'IDR' : 'USD',
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

  const handleCreatePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsCreating(true)

      const token = SessionManager.getToken()
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/customer/payment/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionId: transaction.id,
          paymentMethod: selectedMethod.code,
          currency: transaction.currency
        })
      })

      const data = await response.json()
      setPaymentResult(data)

      if (data.success) {
        toast({
          title: "Payment Created",
          description: "Payment has been created successfully. Please complete the payment process.",
          variant: "default"
        })
        onPaymentCreated(data.data.payment)
      } else {
        toast({
          title: "Payment Creation Failed",
          description: data.error || "Failed to create payment. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Payment creation error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
      setPaymentResult({
        success: false,
        error: "An unexpected error occurred. Please try again."
      })
    } finally {
      setIsCreating(false)
    }
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
    if (paymentResult?.data?.payment?.paymentUrl) {
      window.open(paymentResult.data.payment.paymentUrl, '_blank')
    }
  }

  // If payment is created successfully, show payment details
  if (paymentResult?.success && paymentResult.data?.payment) {
    const payment = paymentResult.data.payment
    const serviceFee = selectedMethod ? calculateServiceFee(selectedMethod, transaction.amount) : 0
    const totalAmount = calculateTotalAmount()

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">Payment Created Successfully</CardTitle>
            </div>
            <CardDescription>
              Complete your payment using the details below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Payment Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Transaction Amount:</span>
                <span>{formatCurrency(transaction.amount, transaction.currency)}</span>
              </div>
              {serviceFee > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Service Fee:</span>
                  <span>{formatCurrency(serviceFee, transaction.currency)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Amount:</span>
                <span>{formatCurrency(totalAmount, transaction.currency)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-4 w-4" />
                <div>
                  <div className="font-medium text-sm">{selectedMethod?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedMethod?.gatewayProvider || 'Manual Payment'}
                  </div>
                </div>
              </div>
              <Badge variant="outline">{payment.status}</Badge>
            </div>

            {/* Payment Details */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-2 bg-background border rounded">
                  <span className="text-sm font-medium">Payment ID:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono">{payment.id}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(payment.id, 'Payment ID')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {payment.externalId && (
                  <div className="flex items-center justify-between p-2 bg-background border rounded">
                    <span className="text-sm font-medium">Reference:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono">{payment.externalId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(payment.externalId!, 'Reference')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {payment.expiresAt && (
                  <div className="flex items-center justify-between p-2 bg-background border rounded">
                    <span className="text-sm font-medium">Expires At:</span>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-orange-500" />
                      <span className="text-sm">{formatDateTime(payment.expiresAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment URL Button */}
            {payment.paymentUrl && (
              <div className="space-y-2">
                <Button
                  onClick={openPaymentUrl}
                  className="w-full"
                  size="lg"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Complete Payment
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  You will be redirected to the payment gateway
                </p>
              </div>
            )}

            {/* Payment Instructions */}
            {selectedMethod && (
              <div className="pt-4 border-t">
                <PaymentInstructions
                  method={{
                    code: selectedMethod.code,
                    name: selectedMethod.name,
                    fee_percent: selectedMethod.serviceFeePercent || 0,
                    fee_amount: selectedMethod.serviceFeeFixed || 0,
                    min_amount: 10000, // Default minimum
                    max_amount: 999999999, // Default maximum
                    currency: selectedMethod.currency,
                    instructions: selectedMethod.instructionText
                  }}
                  amount={calculateTotalAmount()}
                  paymentUrl={payment.paymentUrl}
                  qrCodeUrl={payment.qrCodeUrl}
                  qrString={payment.gatewayResponse?.qrString}
                  vaNumber={payment.gatewayResponse?.vaNumber}
                  reference={payment.externalId}
                  expiryTime={payment.expiresAt}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // If payment creation failed, show error
  if (paymentResult && !paymentResult.success) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {paymentResult.error}
          </AlertDescription>
        </Alert>
        
        <div className="flex space-x-4">
          <Button onClick={() => setPaymentResult(null)} variant="outline">
            Try Again
          </Button>
          <Button onClick={onCancel} variant="ghost">
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  // Payment creation form
  return (
    <div className="space-y-6">
      {/* Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Summary</CardTitle>
          <CardDescription>
            Review your transaction details and select payment method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Transaction:</span>
              <span className="font-medium">{transaction.description}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Amount:</span>
              <span>{formatCurrency(transaction.amount, transaction.currency)}</span>
            </div>
            {selectedMethod && (
              <>
                {calculateServiceFee(selectedMethod, transaction.amount) > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Service Fee:</span>
                    <span>
                      {formatCurrency(calculateServiceFee(selectedMethod, transaction.amount), transaction.currency)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotalAmount(), transaction.currency)}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <PaymentMethodSelector
        currency={transaction.currency}
        onMethodSelect={setSelectedMethod}
        selectedMethod={selectedMethod || undefined}
        disabled={isCreating}
      />

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          onClick={handleCreatePayment}
          disabled={!selectedMethod || isCreating}
          className="flex-1"
          size="lg"
        >
          {isCreating && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
          {isCreating ? 'Creating Payment...' : 'Create Payment'}
        </Button>
        <Button onClick={onCancel} variant="outline" size="lg">
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default PaymentCreation

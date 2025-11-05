'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Copy, ExternalLink, Clock, CreditCard, Building, Smartphone } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import QRCodePayment from './QRCodePayment'

interface PaymentMethod {
  code: string
  name: string
  fee_percent: number
  fee_amount: number
  min_amount: number
  max_amount: number
  currency: string
  icon?: string
  instructions?: string
}

interface PaymentInstructionsProps {
  method: PaymentMethod
  amount: number
  paymentUrl?: string
  qrCodeUrl?: string
  qrString?: string
  vaNumber?: string
  reference?: string
  expiryTime?: string
  className?: string
}

export default function PaymentInstructions({ 
  method, 
  amount, 
  paymentUrl,
  qrCodeUrl,
  qrString,
  vaNumber,
  reference,
  expiryTime,
  className = ""
}: PaymentInstructionsProps) {
  const { toast } = useToast()

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`
      })
    }).catch(() => {
      toast({
        title: "Error",
        description: `Failed to copy ${label}`,
        variant: "destructive"
      })
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatExpiryTime = (expiryTime: string) => {
    try {
      const date = new Date(expiryTime)
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
      })
    } catch (error) {
      return expiryTime
    }
  }

  const getMethodIcon = (code: string) => {
    if (code.includes('BANK') || code.includes('BCA') || code.includes('BNI') || code.includes('BRI') || code.includes('MANDIRI')) {
      return <Building className="h-5 w-5" />
    }
    if (code.includes('OVO') || code.includes('DANA') || code.includes('GOPAY') || code.includes('LINKAJA')) {
      return <Smartphone className="h-5 w-5" />
    }
    return <CreditCard className="h-5 w-5" />
  }

  const getInstructionsByMethod = (code: string) => {
    const bankTransferInstructions = [
      "Login to your internet banking or visit ATM",
      "Select 'Transfer' or 'Transfer Dana'",
      "Enter the virtual account number provided",
      "Enter the exact payment amount",
      "Complete the transfer and save the receipt",
      "Payment will be processed automatically"
    ]

    const ewalletInstructions = [
      "Open your e-wallet application",
      "Scan the QR code or click the payment link",
      "Verify the merchant and payment amount",
      "Enter your PIN or use biometric authentication",
      "Complete the payment",
      "Payment confirmation will be sent immediately"
    ]

    const creditCardInstructions = [
      "Click the payment button below",
      "You will be redirected to secure payment page",
      "Enter your credit/debit card details",
      "Complete 3D Secure verification if required",
      "Confirm the payment",
      "Wait for payment confirmation"
    ]

    if (code.includes('BANK') || code.includes('VA')) {
      return bankTransferInstructions
    }
    if (code.includes('OVO') || code.includes('DANA') || code.includes('GOPAY') || code.includes('LINKAJA')) {
      return ewalletInstructions
    }
    if (code.includes('CREDIT') || code.includes('CARD')) {
      return creditCardInstructions
    }

    return [
      "Follow the instructions provided by your payment provider",
      "Complete the payment within the specified time limit",
      "Keep your transaction receipt for reference",
      "Contact support if you encounter any issues"
    ]
  }

  const instructions = method.instructions ? 
    method.instructions.split('\n').filter(line => line.trim()) : 
    getInstructionsByMethod(method.code)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* QR Code Payment for E-wallets */}
      {(qrCodeUrl || qrString || (paymentUrl && (method.code.includes('OVO') || method.code.includes('DANA') || method.code.includes('GOPAY') || method.code.includes('LINKAJA')))) && (
        <QRCodePayment
          qrCodeUrl={qrCodeUrl}
          qrString={qrString}
          paymentUrl={paymentUrl}
          amount={amount}
          method={method.name}
          reference={reference}
          expiryTime={expiryTime}
        />
      )}

      {/* Virtual Account Number Card */}
      {vaNumber && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Virtual Account Number
            </CardTitle>
            <CardDescription>
              Use this number to complete your payment via {method.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Virtual Account Number:</div>
                <div className="text-2xl font-mono font-bold text-primary">{vaNumber}</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(vaNumber, 'Virtual Account Number')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            {getMethodIcon(method.code)}
            <div>
              <CardTitle className="text-lg">{method.name}</CardTitle>
              <CardDescription>Payment Method</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Payment Amount:</span>
            <span className="font-semibold text-lg">{formatCurrency(amount)}</span>
          </div>
          
          {reference && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Reference:</span>
              <div className="flex items-center space-x-2">
                <code className="text-sm bg-muted px-2 py-1 rounded">{reference}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(reference, 'Reference')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {expiryTime && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Expires at:</span>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">{formatExpiryTime(expiryTime)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Instructions</CardTitle>
          <CardDescription>
            Follow these steps to complete your payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {instructions.map((instruction, index) => (
              <li key={index} className="flex items-start space-x-3">
                <Badge variant="outline" className="min-w-[24px] h-6 flex items-center justify-center">
                  {index + 1}
                </Badge>
                <span className="text-sm leading-relaxed">{instruction}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Payment Action */}
      {paymentUrl && (
        <Card>
          <CardContent className="pt-6">
            <Button asChild className="w-full" size="lg">
              <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Proceed to Payment
              </a>
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              You will be redirected to a secure payment page
            </p>
          </CardContent>
        </Card>
      )}

      {/* Important Notes */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Complete your payment before the expiry time to avoid cancellation. 
          If you encounter any issues, please contact our support team for assistance.
        </AlertDescription>
      </Alert>

      {/* Service Fee Info */}
      {(method.fee_percent > 0 || method.fee_amount > 0) && (
        <Alert>
          <AlertDescription>
            <strong>Service Fee:</strong> This payment method includes a service fee of{' '}
            {method.fee_percent > 0 && `${method.fee_percent}%`}
            {method.fee_percent > 0 && method.fee_amount > 0 && ' + '}
            {method.fee_amount > 0 && formatCurrency(method.fee_amount)}.
            The fee is already included in the total amount above.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

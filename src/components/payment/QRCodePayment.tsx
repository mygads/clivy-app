'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, Share, Copy, QrCode, Smartphone } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Image from 'next/image'

interface QRCodePaymentProps {
  qrCodeUrl?: string
  qrString?: string
  paymentUrl?: string
  amount: number
  method: string
  reference?: string
  expiryTime?: string
  className?: string
}

export default function QRCodePayment({
  qrCodeUrl,
  qrString,
  paymentUrl,
  amount,
  method,
  reference,
  expiryTime,
  className = ""
}: QRCodePaymentProps) {
  const { toast } = useToast()
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

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

  const copyPaymentUrl = () => {
    if (paymentUrl) {
      navigator.clipboard.writeText(paymentUrl).then(() => {
        toast({
          title: "Copied!",
          description: "Payment URL copied to clipboard"
        })
      }).catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy payment URL",
          variant: "destructive"
        })
      })
    }
  }

  const downloadQRCode = async () => {
    if (!displayQrCodeUrl) return

    try {
      const response = await fetch(displayQrCodeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-payment-${reference || 'code'}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Downloaded!",
        description: "QR code saved to your device"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive"
      })
    }
  }

  const sharePayment = async () => {
    if (navigator.share && paymentUrl) {
      try {
        await navigator.share({
          title: 'Payment Link',
          text: `Complete your payment of ${formatCurrency(amount)} via ${method}`,
          url: paymentUrl
        })
      } catch (error) {
        // Fallback to copying URL
        copyPaymentUrl()
      }
    } else {
      copyPaymentUrl()
    }
  }

  // If no QR code or payment URL, don't render
  if (!qrCodeUrl && !qrString && !paymentUrl) {
    return null
  }

  // Generate QR code URL from qrString if needed
  const displayQrCodeUrl = qrCodeUrl || (qrString ? 
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrString)}` : 
    null
  )

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <QrCode className="h-5 w-5" />
            <CardTitle className="text-lg">Scan to Pay</CardTitle>
          </div>
          <CardDescription>
            Scan the QR code below with your {method} app
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* QR Code Display */}
          {displayQrCodeUrl && (
            <div className="flex flex-col items-center space-y-4">
              <div 
                ref={qrRef}
                className="relative p-4 bg-white rounded-lg border-2 border-dashed border-muted-foreground/25"
              >
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
                
                {!imageError ? (
                  <Image
                    src={displayQrCodeUrl}
                    alt="Payment QR Code"
                    width={200}
                    height={200}
                    className={`transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setIsImageLoading(false)}
                    onError={() => {
                      setImageError(true)
                      setIsImageLoading(false)
                    }}
                  />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center bg-muted rounded">
                    <div className="text-center text-muted-foreground">
                      <QrCode className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">QR Code not available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code Actions */}
              <div className="flex space-x-2">
                {displayQrCodeUrl && !imageError && (
                  <Button onClick={downloadQRCode} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
                
                {paymentUrl && (
                  <>
                    <Button onClick={sharePayment} variant="outline" size="sm">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    
                    <Button onClick={copyPaymentUrl} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount to Pay:</span>
              <span className="font-semibold text-lg">{formatCurrency(amount)}</span>
            </div>
            
            {reference && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Reference:</span>
                <span className="text-sm font-mono">{reference}</span>
              </div>
            )}
            
            {expiryTime && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Valid until:</span>
                <span className="text-sm font-medium text-orange-600">
                  {formatExpiryTime(expiryTime)}
                </span>
              </div>
            )}
          </div>

          {/* Manual Payment Button */}
          {paymentUrl && (
            <Button asChild className="w-full" variant="outline">
              <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
                <Smartphone className="h-4 w-4 mr-2" />
                Open in {method} App
              </a>
            </Button>
          )}

          {/* Instructions */}
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              <strong>How to pay:</strong>
              <ol className="mt-2 space-y-1 text-sm">
                <li>1. Open your {method} mobile app</li>
                <li>2. Scan the QR code above or click &quot;Open in {method} App&quot;</li>
                <li>3. Verify the payment amount and merchant details</li>
                <li>4. Complete the payment using your app</li>
                <li>5. Wait for payment confirmation</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

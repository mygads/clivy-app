'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreditCard, Banknote, Smartphone, Building2, Globe, Info } from 'lucide-react'
import { SessionManager } from '@/lib/storage'
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

interface PaymentMethodSelectorProps {
  currency: string
  onMethodSelect: (method: PaymentMethod) => void
  selectedMethod?: PaymentMethod
  disabled?: boolean
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  currency,
  onMethodSelect,
  selectedMethod,
  disabled = false
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = SessionManager.getToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch('/api/customer/payment/methods', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods')
      }

      const data = await response.json()
      
      if (data.success) {
        // Filter payment methods by currency support and active status
        const filteredMethods = data.data.paymentMethods.filter((method: PaymentMethod) => 
          method.isActive && (method.currency === currency || method.currency === 'any')
        )
        setPaymentMethods(filteredMethods)
      } else {
        throw new Error(data.error || 'Failed to load payment methods')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [currency])

  useEffect(() => {
    fetchPaymentMethods()
  }, [currency, fetchPaymentMethods])

  const getPaymentMethodIcon = (code: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'CC': <CreditCard className="h-5 w-5" />,
      'BT': <Building2 className="h-5 w-5" />,
      'VA': <Banknote className="h-5 w-5" />,
      'OV': <Smartphone className="h-5 w-5" />,
      'DN': <Smartphone className="h-5 w-5" />,
      'LA': <Smartphone className="h-5 w-5" />,
      'GP': <Smartphone className="h-5 w-5" />,
    }
    return iconMap[code] || <Globe className="h-5 w-5" />
  }

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

  const formatCurrency = (amount: number, currency: string) => {
    // Always use IDR formatting
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-lg font-semibold">Select Payment Method</div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-4"
            onClick={fetchPaymentMethods}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (paymentMethods.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No payment methods available for {currency}. Please contact support.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">Select Payment Method</div>
      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <Card 
            key={method.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedMethod?.id === method.id 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onMethodSelect(method)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    {getPaymentMethodIcon(method.code)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{method.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {method.gatewayProvider ? `via ${method.gatewayProvider}` : 'Manual Payment'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {method.currency === 'any' ? 'Multi-Currency' : method.currency}
                  </Badge>
                  {selectedMethod?.id === method.id && (
                    <Badge variant="default" className="text-xs">
                      Selected
                    </Badge>
                  )}
                </div>
              </div>

              {/* Service Fee Display */}
              {(method.serviceFeeFixed || method.serviceFeePercent) && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">
                    Service Fee: 
                    {method.serviceFeeFixed && (
                      <span className="ml-1">
                        {formatCurrency(method.serviceFeeFixed, currency)}
                      </span>
                    )}
                    {method.serviceFeeFixed && method.serviceFeePercent && (
                      <span className="mx-1">+</span>
                    )}
                    {method.serviceFeePercent && (
                      <span>{method.serviceFeePercent}%</span>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Instructions Preview */}
              {selectedMethod?.id === method.id && method.instructionType && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Payment Instructions:
                  </div>
                  
                  {/* Text Instructions */}
                  {(method.instructionType === 'text' || method.instructionType === 'both') && 
                   method.instructionText && (
                    <div className="text-xs text-foreground bg-muted/30 p-2 rounded text-left whitespace-pre-wrap">
                      {method.instructionText}
                    </div>
                  )}
                  
                  {/* Image Instructions */}
                  {(method.instructionType === 'image' || method.instructionType === 'both') && 
                   method.instructionImageUrl && (
                    <div className="mt-2">
                      <Image
                        src={method.instructionImageUrl}
                        alt="Payment Instructions"
                        width={300}
                        height={200}
                        className="rounded border max-w-full h-auto"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PaymentMethodSelector

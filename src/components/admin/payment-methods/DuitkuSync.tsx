'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { SessionManager } from '@/lib/storage'

interface PaymentMethod {
  id: string
  code: string
  name: string
  type: string
  currency: string
  gatewayCode: string
  isActive: boolean
  feeType?: string
  feeValue?: number
  createdAt: string
  updatedAt: string
}

interface SyncResponse {
  success: boolean
  message: string
  data?: {
    syncResults: any[]
    summary: {
      totalProcessed: number
      created: number
      updated: number
      skipped: number
      errors: number
    }
    statistics: {
      totalMethods: number
      activeMethods: number
      duitkuMethods: number
    }
  }
  error?: string
}

export default function DuitkuPaymentMethodsSync() {
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingDefaults, setIsCreatingDefaults] = useState(false)
  const [syncedMethods, setSyncedMethods] = useState<PaymentMethod[]>([])
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // Fetch current Duitku methods from database
  const fetchCurrentMethods = async () => {
    try {
      const token = SessionManager.getToken()
      if (!token) return

      const response = await fetch('/api/admin/payment-methods/sync/duitku', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.currentMethods) {
          setSyncedMethods(data.data.currentMethods)
        }
      }
    } catch (error) {
      console.error('Error fetching current methods:', error)
    }
  }

  const handleSyncFromAPI = async () => {
    setIsLoading(true)
    try {
      const token = SessionManager.getToken()
      if (!token) {
        toast.error('Authentication required. Please login again.')
        return
      }

      const response = await fetch('/api/admin/payment-methods/sync/duitku', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Sync response status:', response.status) // Debug log
      
      const data: SyncResponse = await response.json()
      console.log('Sync response data:', data) // Debug log

      if (data.success && data.data) {
        // Refresh current methods from database to get accurate data
        await fetchCurrentMethods()
        setLastSyncTime(new Date())
        toast.success(`${data.data.summary.created + data.data.summary.updated} payment methods synced successfully (${data.data.summary.created} created, ${data.data.summary.updated} updated)`)
      } else {
        console.error('Sync failed:', data.error) // Debug log
        toast.error(data.error || 'Failed to sync payment methods')
      }
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Network error occurred during sync')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDefaults = async () => {
    setIsCreatingDefaults(true)
    try {
      const token = SessionManager.getToken()
      if (!token) {
        toast.error('Authentication required. Please login again.')
        return
      }

      console.log('Creating default methods...') // Debug log

      const response = await fetch('/api/admin/payment-methods/sync/duitku', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Create defaults response status:', response.status) // Debug log
      
      const data: SyncResponse = await response.json()
      console.log('Create defaults response data:', data) // Debug log

      if (data.success) {
        // Refresh current methods from database to get updated data
        await fetchCurrentMethods()
        toast.success('Default Duitku payment methods created successfully')
      } else {
        console.error('Create defaults failed:', data.error) // Debug log
        toast.error(data.error || 'Failed to create default payment methods')
      }
    } catch (error) {
      console.error('Create defaults error:', error)
      toast.error('Network error occurred during creation')
    } finally {
      setIsCreatingDefaults(false)
    }
  }

  const getMethodTypeColor = (type: string) => {
    switch (type) {
      case 'virtual_account': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'e_wallet': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'credit_card': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'qr_code': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'retail': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'atm': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Duitku Payment Methods Sync
          </CardTitle>
          <CardDescription>
            Sync payment methods from Duitku API to enable them for customers. 
            Make sure your Duitku credentials are configured in environment variables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={handleSyncFromAPI}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Sync from Duitku API
            </Button>
            
            <Button 
              onClick={handleCreateDefaults}
              disabled={isCreatingDefaults}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isCreatingDefaults ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Create Default Methods
            </Button>
          </div>

          {lastSyncTime && (
            <div className="text-sm text-muted-foreground">
              Last synced: {lastSyncTime.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* {syncedMethods && syncedMethods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Synced Payment Methods ({syncedMethods?.length || 0})</CardTitle>
            <CardDescription>
              These payment methods have been synced from Duitku API. 
              You can enable/disable them in the payment methods management page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {syncedMethods?.map((method) => (
                <div 
                  key={method.code}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{method.name}</div>
                    <Badge 
                      variant="secondary" 
                      className={getMethodTypeColor(method.type)}
                    >
                      {method.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {method.currency}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                      Code: {method.gatewayCode}
                    </div>
                    <Badge 
                      variant={method.isActive ? "default" : "secondary"}
                      className={method.isActive ? 
                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : 
                        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                      }
                    >
                      {method.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  )
}

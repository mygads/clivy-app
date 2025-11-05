import { useState, useEffect, useCallback, useRef } from 'react'
import { SessionManager } from '@/lib/storage'

interface PaymentStatus {
  id: string
  status: string
  amount: number
  method: string
  paymentDate?: string
  expiresAt?: string
  updatedAt: string
  transactionStatus: string
}

interface UsePaymentStatusOptions {
  paymentId: string
  pollInterval?: number // in milliseconds, default 30 seconds
  onStatusChange?: (oldStatus: string, newStatus: string) => void
  onError?: (error: string) => void
}

export function usePaymentStatus({
  paymentId,
  pollInterval = 30000, // 30 seconds
  onStatusChange,
  onError
}: UsePaymentStatusOptions) {
  const [status, setStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<string | null>(null)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isActiveRef = useRef(true)

  // Check payment status using the main payment details endpoint
  const checkStatus = useCallback(async () => {
    try {
      const token = SessionManager.getToken()
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`/api/customer/payment/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      const data = await response.json()

      if (data.success) {
        const paymentData = data.data.payment
        const newStatus = {
          id: paymentData.id,
          status: paymentData.status,
          amount: paymentData.amount,
          method: paymentData.method,
          paymentDate: paymentData.paymentDate,
          expiresAt: paymentData.expiresAt,
          updatedAt: paymentData.updatedAt || new Date().toISOString(),
          transactionStatus: data.data.transaction?.status || 'unknown'
        }
        
        // Check if status changed
        if (status && status.status !== newStatus.status && onStatusChange) {
          onStatusChange(status.status, newStatus.status)
        }
        
        setStatus(newStatus)
        setLastChecked(new Date().toISOString())
        setError(null)
      } else {
        throw new Error(data.error || 'Failed to check status')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [paymentId, status, onStatusChange, onError])

  // Start polling
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        checkStatus()
      }
    }, pollInterval)
  }, [checkStatus, pollInterval])

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Manual refresh
  const refresh = useCallback(async () => {
    setLoading(true)
    await checkStatus()
  }, [checkStatus])

  // Auto-stop polling for terminal statuses
  useEffect(() => {
    if (status) {
      const terminalStatuses = ['paid', 'cancelled', 'expired', 'failed']
      if (terminalStatuses.includes(status.status)) {
        stopPolling()
      }
    }
  }, [status, stopPolling])

  // Initialize and start polling
  useEffect(() => {
    isActiveRef.current = true
    checkStatus() // Initial check
    startPolling()

    return () => {
      isActiveRef.current = false
      stopPolling()
    }
  }, [checkStatus, startPolling, stopPolling])

  // Page visibility handling - pause polling when page is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false
      } else {
        isActiveRef.current = true
        // Immediate check when page becomes visible
        if (status && !['paid', 'cancelled', 'expired', 'failed'].includes(status.status)) {
          checkStatus()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [checkStatus, status])

  return {
    status,
    loading,
    error,
    lastChecked,
    refresh,
    startPolling,
    stopPolling
  }
}

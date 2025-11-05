"use client"

import { useState, useEffect } from 'react'

export interface CurrencyData {
  currency: 'idr' | 'usd'
  isLoading: boolean
  error: string | null
  countryCode?: string
  debug?: any
}

/**
 * Hook to detect user's currency based on IP location
 * Uses localStorage cache to avoid repeated API calls
 */
export function useCurrency(): CurrencyData {
  const [currency, setCurrency] = useState<'idr' | 'usd'>('idr') // Default to IDR
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<any>(null)
  const [countryCode, setCountryCode] = useState<string>()

  useEffect(() => {
    let mounted = true

    const detectCurrency = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Check if we have cached currency data
        const cachedData = localStorage.getItem('user-currency-data')
        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData)
            const cacheAge = Date.now() - parsed.timestamp
            const maxAge = 24 * 60 * 60 * 1000 // 24 hours
            
            if (cacheAge < maxAge && parsed.currency) {
            //   console.log(`[useCurrency] Using cached currency: ${parsed.currency.toUpperCase()}`)
              if (mounted) {
                setCurrency(parsed.currency)
                setDebug(parsed.debug)
                setCountryCode(parsed.countryCode)
                setIsLoading(false)
              }
              return
            } else {
              console.log('[useCurrency] Cache expired, detecting currency...')
            }
          } catch (e) {
            console.log('[useCurrency] Invalid cache data, detecting currency...')
          }
        }

        // Fetch from API if no cache or cache expired
        const response = await fetch('/api/public/location?includeCurrency=true&includeLocale=false')
        const data = await response.json()

        if (!mounted) return

        if (data.success && data.data) {
          const currencyData = {
            currency: data.data.currency,
            debug: data.data.debug,
            countryCode: data.data.debug?.countryCode || 'Unknown',
            timestamp: Date.now()
          }
          
          // Cache the result
          localStorage.setItem('user-currency-data', JSON.stringify(currencyData))
          
          setCurrency(data.data.currency)
          setDebug(data.data.debug)
          setCountryCode(currencyData.countryCode)
          
          console.log(`[useCurrency] Currency detected and cached: ${data.data.currency.toUpperCase()}`)
        } else {
          throw new Error(data.error || 'Currency detection failed')
        }
      } catch (err: any) {
        if (!mounted) return
        
        console.error('[useCurrency] Error detecting currency:', err)
        setError(err.message || 'Currency detection failed')
        // Keep default IDR on error
        setCurrency('idr')
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    detectCurrency()

    return () => {
      mounted = false
    }
  }, [])

  return {
    currency,
    isLoading,
    error,
    countryCode,
    debug
  }
}

/**
 * Get currency symbol based on currency type
 */
export function getCurrencySymbol(currency: 'idr' | 'usd'): string {
  return currency === 'idr' ? 'Rp' : '$'
}

/**
 * Format currency with proper locale formatting
 */
export function formatCurrency(amount: number, currency: 'idr' | 'usd'): string {
  if (currency === 'idr') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }
}

/**
 * Simple number formatting without currency symbol
 */
export function formatPrice(amount: number, currency: 'idr' | 'usd'): string {
  if (currency === 'idr') {
    return amount.toLocaleString('id-ID')
  } else {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
}

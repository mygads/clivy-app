"use client"

import { useState, useEffect } from 'react'

export interface CurrencyData {
  currency: 'idr'
  isLoading: boolean
  error: string | null
  countryCode?: string
  debug?: any
}

/**
 * Hook to get currency - now always returns IDR
 * Simplified to remove multi-currency support
 */
export function useCurrency(): CurrencyData {
  const [isLoading, setIsLoading] = useState(false)

  return {
    currency: 'idr',
    isLoading,
    error: null,
    countryCode: 'ID',
    debug: null
  }
}

/**
 * Get currency symbol - always returns IDR symbol
 */
export function getCurrencySymbol(currency?: 'idr'): string {
  return 'Rp'
}

/**
 * Format currency with proper IDR locale formatting
 */
export function formatCurrency(amount: number, currency?: 'idr'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Simple number formatting without currency symbol
 */
export function formatPrice(amount: number, currency?: 'idr'): string {
  return amount.toLocaleString('id-ID')
}

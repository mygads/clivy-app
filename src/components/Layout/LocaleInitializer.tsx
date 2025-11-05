"use client"

import { useEffect } from 'react'
import { initializeLocalePreference } from '@/lib/locale-management'

/**
 * Component to initialize locale preferences on app load
 * This ensures proper locale management without unnecessary redirects
 */
export default function LocaleInitializer() {
  useEffect(() => {
    initializeLocalePreference()
  }, [])

  return null // This component doesn't render anything
}

"use client"

/**
 * Client-side locale management utilities
 * Handles user locale preferences without triggering unnecessary IP detection
 */

export interface LocalePreference {
  locale: 'id' | 'en'
  timestamp: number
  source: 'user_choice' | 'ip_detection' | 'browser_fallback'
}

/**
 * Get user's current locale preference from localStorage
 */
export function getStoredLocalePreference(): LocalePreference | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem('user-locale-preference')
    if (stored) {
      const parsed: LocalePreference = JSON.parse(stored)
      
      // Check if preference is still valid (not older than 1 year)
      const age = Date.now() - parsed.timestamp
      const maxAge = 365 * 24 * 60 * 60 * 1000 // 1 year
      
      if (age < maxAge) {
        return parsed
      } else {
        // Remove expired preference
        localStorage.removeItem('user-locale-preference')
      }
    }
  } catch (error) {
    console.error('[LOCALE_STORAGE] Error reading stored preference:', error)
    localStorage.removeItem('user-locale-preference')
  }
  
  return null
}

/**
 * Store user's locale preference in localStorage
 */
export function storeLocalePreference(locale: 'id' | 'en', source: LocalePreference['source'] = 'user_choice'): void {
  if (typeof window === 'undefined') return
  
  const preference: LocalePreference = {
    locale,
    timestamp: Date.now(),
    source
  }
  
  try {
    localStorage.setItem('user-locale-preference', JSON.stringify(preference))
    
    // Also update the cookie for middleware
    document.cookie = `locale-preference=${locale}; max-age=${365 * 24 * 60 * 60}; path=/; SameSite=Lax`
    
    console.log(`[LOCALE_STORAGE] Stored preference: ${locale} (${source})`)
  } catch (error) {
    console.error('[LOCALE_STORAGE] Error storing preference:', error)
  }
}

/**
 * Handle user's manual locale change (when they click language switcher)
 */
export function handleLocaleChange(newLocale: 'id' | 'en', currentPath: string): void {
  // Store the new preference
  storeLocalePreference(newLocale, 'user_choice')
  
  // Redirect to new locale URL
  const currentLocale = currentPath.split('/')[1]
  const pathWithoutLocale = currentPath.replace(`/${currentLocale}`, '') || '/'
  const newPath = `/${newLocale}${pathWithoutLocale}`
  
  console.log(`[LOCALE_CHANGE] Redirecting from ${currentPath} to ${newPath}`)
  window.location.href = newPath
}

/**
 * Check if current URL locale matches stored preference
 * Returns true if they match or if no preference is stored
 */
export function isLocaleConsistent(): boolean {
  if (typeof window === 'undefined') return true
  
  const currentLocale = window.location.pathname.split('/')[1] as 'id' | 'en'
  const storedPreference = getStoredLocalePreference()
  
  // If no stored preference, consider current locale as valid
  if (!storedPreference) {
    // Store current locale as user preference since they're visiting it
    if (['id', 'en'].includes(currentLocale)) {
      storeLocalePreference(currentLocale, 'browser_fallback')
    }
    return true
  }
  
  return storedPreference.locale === currentLocale
}

/**
 * Initialize locale preference on app load
 * This should be called once in the root layout or main app component
 */
export function initializeLocalePreference(): void {
  if (typeof window === 'undefined') return
  
  // Check consistency
  if (!isLocaleConsistent()) {
    const storedPreference = getStoredLocalePreference()
    if (storedPreference) {
      console.log(`[LOCALE_INIT] Inconsistent locale detected, redirecting to: ${storedPreference.locale}`)
      // Don't auto-redirect, let user decide
      // handleLocaleChange(storedPreference.locale, window.location.pathname)
    }
  }
  
//   console.log('[LOCALE_INIT] Locale preference initialized')
}

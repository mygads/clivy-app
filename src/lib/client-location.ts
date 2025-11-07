// Client-side utilities for location detection
interface LocationAPIResponse {
  success: boolean;
  data: {
    currency?: 'IDR' | 'USD';
    locale?: 'id' | 'en';
    currencySuccess?: boolean;
    localeSuccess?: boolean;
    currencyError?: string;
    localeError?: string;
    fallbackReason?: string;
  };
  timestamp: string;
  message?: string;
  error?: string;
}

/**
 * Detect user location from client-side using public API
 */
export async function detectUserLocation(options: {
  includeCurrency?: boolean;
  includeLocale?: boolean;
} = {}): Promise<LocationAPIResponse> {
  const { includeCurrency = true, includeLocale = true } = options;
  
  try {
    const params = new URLSearchParams();
    if (!includeCurrency) params.set('includeCurrency', 'false');
    if (!includeLocale) params.set('includeLocale', 'false');
    
    const url = `/api/public/location${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data: LocationAPIResponse = await response.json();
    
    console.log('[CLIENT_LOCATION] Detection result:', data);
    return data;
    
  } catch (error) {
    console.error('[CLIENT_LOCATION] Detection failed:', error);
    
    // Return safe fallback
    return {
      success: false,
      data: {
        currency: 'IDR',
        locale: 'en',
        currencySuccess: false,
        localeSuccess: false,
        fallbackReason: `Client error: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      timestamp: new Date().toISOString(),
      error: 'Location detection failed'
    };
  }
}

/**
 * Get user's currency preference with fallback
 */
export async function getUserCurrency(): Promise<'IDR' | 'USD'> {
  try {
    const result = await detectUserLocation({ includeCurrency: true, includeLocale: false });
    return result.data.currency || 'IDR';
  } catch (error) {
    console.error('[CLIENT_LOCATION] Currency detection failed:', error);
    return 'IDR'; // Safe fallback
  }
}

/**
 * Get user's locale preference with fallback
 */
export async function getUserLocale(): Promise<'id' | 'en'> {
  try {
    const result = await detectUserLocation({ includeCurrency: false, includeLocale: true });
    return result.data.locale || 'en';
  } catch (error) {
    console.error('[CLIENT_LOCATION] Locale detection failed:', error);
    // Fallback to browser language
    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    return browserLang.includes('id') ? 'id' : 'en';
  }
}

/**
 * Store location preferences in localStorage
 */
export function storeLocationPreferences(currency: 'IDR' | 'USD', locale: 'id' | 'en') {
  try {
    localStorage.setItem('clivy_currency', currency);
    localStorage.setItem('clivy_locale', locale);
    localStorage.setItem('clivy_location_timestamp', new Date().toISOString());
    console.log('[CLIENT_LOCATION] Stored preferences:', { currency, locale });
  } catch (error) {
    console.error('[CLIENT_LOCATION] Failed to store preferences:', error);
  }
}

/**
 * Get stored location preferences from localStorage
 */
export function getStoredLocationPreferences(): {
  currency: 'IDR' | 'USD' | null;
  locale: 'id' | 'en' | null;
  timestamp: string | null;
} {
  try {
    const currency = localStorage.getItem('clivy_currency') as 'IDR' | 'USD' | null;
    const locale = localStorage.getItem('clivy_locale') as 'id' | 'en' | null;
    const timestamp = localStorage.getItem('clivy_location_timestamp');
    
    return { currency, locale, timestamp };
  } catch (error) {
    console.error('[CLIENT_LOCATION] Failed to get stored preferences:', error);
    return { currency: null, locale: null, timestamp: null };
  }
}

/**
 * Check if stored preferences are still valid (not older than 24 hours)
 */
export function areStoredPreferencesValid(): boolean {
  try {
    const { timestamp } = getStoredLocationPreferences();
    if (!timestamp) return false;
    
    const stored = new Date(timestamp);
    const now = new Date();
    const hoursDiff = (now.getTime() - stored.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff < 24; // Valid for 24 hours
  } catch (error) {
    console.error('[CLIENT_LOCATION] Failed to check preferences validity:', error);
    return false;
  }
}

/**
 * Get location preferences with caching
 */
export async function getLocationPreferencesWithCache(): Promise<{
  currency: 'IDR' | 'USD';
  locale: 'id' | 'en';
  fromCache: boolean;
}> {
  // Check if we have valid cached preferences
  if (areStoredPreferencesValid()) {
    const stored = getStoredLocationPreferences();
    if (stored.currency && stored.locale) {
      console.log('[CLIENT_LOCATION] Using cached preferences:', stored);
      return {
        currency: stored.currency,
        locale: stored.locale,
        fromCache: true
      };
    }
  }
  
  // Fetch fresh preferences
  console.log('[CLIENT_LOCATION] Fetching fresh preferences...');
  const result = await detectUserLocation();
  
  const currency = result.data.currency || 'IDR';
  const locale = result.data.locale || 'en';
  
  // Store for next time
  storeLocationPreferences(currency, locale);
  
  return {
    currency,
    locale,
    fromCache: false
  };
}

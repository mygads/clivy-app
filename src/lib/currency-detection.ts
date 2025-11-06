import { NextRequest } from 'next/server';

/**
 * Detect user's currency - now always returns 'idr'
 * Multi-currency support has been removed
 */
export async function detectCurrency(request: NextRequest): Promise<'idr'> {
  return 'idr';
}

/**
 * Synchronous currency detection - now always returns 'idr'
 * Multi-currency support has been removed
 */
export function detectCurrencySync(request: NextRequest): 'idr' {
  return 'idr';
}

/**
 * Determine locale based on browser language
 * Simplified - no longer uses IP location API
 */
export async function detectLocale(request: NextRequest): Promise<'id' | 'en'> {
  try {
    const acceptLanguage = request.headers.get('accept-language');
    
    console.log(`[LOCALE_DETECTION] Accept-Language: ${acceptLanguage}`);
    
    // Check if browser requests Indonesian
    if (acceptLanguage?.includes('id')) {
      return 'id';
    }
    
    // Default to English
    return 'en';
  } catch (error) {
    console.error('[LOCALE_DETECTION] Error detecting locale, using default:', error);
    return 'en';
  }
}

/**
 * Synchronous locale detection based on browser language (for middleware)
 */
export function detectLocaleSync(request: NextRequest): 'id' | 'en' {
  try {
    const acceptLanguage = request.headers.get('accept-language');
    
    console.log(`[LOCALE_DETECTION_SYNC] Accept-Language: ${acceptLanguage}`);
    
    // Check if browser requests Indonesian
    if (acceptLanguage?.includes('id')) {
      return 'id';
    }
    
    // Default to English
    return 'en';
  } catch (error) {
    console.error('[LOCALE_DETECTION_SYNC] Error detecting locale, using default:', error);
    return 'en';
  }
}

/**
 * Format currency - always uses IDR formatting
 */
export function formatCurrency(amount: number, currency?: 'idr'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get currency symbol - always returns IDR symbol
 */
export function getCurrencySymbol(currency?: 'idr'): string {
  return 'Rp';
}

/**
 * Get currency code - always returns IDR
 */
export function getCurrencyCode(currency?: 'idr'): string {
  return 'IDR';
}

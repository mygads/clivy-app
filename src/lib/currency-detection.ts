import { NextRequest } from 'next/server';

// IP Location API Response Type
interface IpLocationResponse {
  ip: string;
  country: string;
  country_code: string;
  is_eu: boolean;
  city: string;
  continent: string;
  latitude: number;
  longitude: number;
  time_zone: string;
  postal_code: string | null;
  subdivision: string;
  currency_code: string;
  calling_code: string;
  is_anycast: boolean;
  is_satellite: boolean;
  asn: {
    asn: string;
    route: string;
    netname: string;
    name: string;
    country_code: string;
    domain: string;
    type: string;
    rir: string;
  };
  privacy: {
    is_abuser: boolean;
    is_anonymous: boolean;
    is_bogon: boolean;
    is_hosting: boolean;
    is_icloud_relay: boolean;
    is_proxy: boolean;
    is_tor: boolean;
    is_vpn: boolean;
  };
  company: {
    name: string;
    domain: string;
    country_code: string;
    type: string;
  };
  abuse: {
    address: string;
    country_code: string;
    email: string;
    name: string;
    network: string;
    phone: string;
  };
}

interface LocationInfo {
  country_code: string;
  currency_code: string;
  is_indonesia: boolean;
  city?: string;
  timezone?: string;
}

/**
 * Indonesian IP Ranges (Major ISPs) - Fallback when API fails
 * This is a simplified version - in production you might want to use a more comprehensive database
 */
const INDONESIAN_IP_RANGES = [
  // Telkom Indonesia
  { start: '114.4.0.0', end: '114.7.255.255' },
  { start: '118.96.0.0', end: '118.99.255.255' },
  { start: '125.160.0.0', end: '125.167.255.255' },
  { start: '180.241.0.0', end: '180.255.255.255' },
  
  // Indosat
  { start: '202.3.208.0', end: '202.3.223.255' },
  { start: '202.67.0.0', end: '202.67.255.255' },
  
  // XL Axiata
  { start: '180.244.0.0', end: '180.247.255.255' },
  { start: '182.1.0.0', end: '182.3.255.255' },
  
  // First Media / LinkNet
  { start: '103.28.0.0', end: '103.31.255.255' },
  { start: '182.16.0.0', end: '182.31.255.255' },
  
  // Biznet
  { start: '103.47.132.0', end: '103.47.135.255' },
  { start: '103.58.102.0', end: '103.58.103.255' },
  
  // Common Indonesian ranges
  { start: '36.64.0.0', end: '36.95.255.255' },
  { start: '103.0.0.0', end: '103.255.255.255' },
  { start: '114.0.0.0', end: '114.255.255.255' },
  { start: '202.0.0.0', end: '202.255.255.255' }
];

/**
 * Extract real IP from request headers (handles proxies, cloudflare, etc.)
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  // Priority order: CF-Connecting-IP > X-Real-IP > X-Forwarded-For > fallback
  if (cfConnectingIP) {
    return cfConnectingIP.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.split(',')[0].trim();
  }
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Fallback for development
  return '180.244.139.100'; // Default Indonesian IP for testing
}

/**
 * Fetch location info from iplocate.io API with fallback mechanism
 * Level 1: Primary API Key (IPLOCATION_API_KEY)
 * Level 2: Backup API Key (IPLOCATION_API_KEY_BACKUP)
 * Level 3: IP Range Fallback (Indonesian IP detection from predefined ranges)
 */
async function getLocationFromIP(ip: string): Promise<LocationInfo> {
  const defaultLocation: LocationInfo = {
    country_code: 'ID',
    currency_code: 'IDR',
    is_indonesia: true,
    city: 'Jakarta',
    timezone: 'Asia/Jakarta'
  };

  // Level 1: Try Primary API Key
  const primaryApiKey = process.env.IPLOCATION_API_KEY;
  if (primaryApiKey) {
    const result = await tryIpLocationAPI(ip, primaryApiKey, 'PRIMARY');
    if (result) {
      return result;
    }
    console.log('[CURRENCY_DETECTION] Primary API failed, trying backup...');
  } else {
    console.log('[CURRENCY_DETECTION] Primary API key not found');
  }

  // Level 2: Try Backup API Key
  const backupApiKey = process.env.IPLOCATION_API_KEY_BACKUP;
  if (backupApiKey) {
    const result = await tryIpLocationAPI(ip, backupApiKey, 'BACKUP');
    if (result) {
      return result;
    }
    console.log('[CURRENCY_DETECTION] Backup API also failed, using IP range fallback...');
  } else {
    console.log('[CURRENCY_DETECTION] Backup API key not found');
  }

  // Level 3: IP Range Fallback
  console.log('[CURRENCY_DETECTION] Using IP range fallback detection');
  const isIndonesian = isIndonesianIPFallback(ip);
  
  if (isIndonesian) {
    console.log(`[CURRENCY_DETECTION] IP ${ip} detected as Indonesian (fallback)`);
    return defaultLocation;
  } else {
    console.log(`[CURRENCY_DETECTION] IP ${ip} detected as Foreign (fallback)`);
    return {
      country_code: 'US', // Default foreign to US
      currency_code: 'USD',
      is_indonesia: false,
      city: 'Unknown',
      timezone: 'UTC'
    };
  }
}

/**
 * Try to fetch location from iplocate.io API with a specific key
 * Returns LocationInfo if successful, null if failed
 */
async function tryIpLocationAPI(ip: string, apiKey: string, keyType: 'PRIMARY' | 'BACKUP'): Promise<LocationInfo | null> {
  try {
    const response = await fetch(
      `https://iplocate.io/api/lookup/${ip}?apikey=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Genfity-App/1.0'
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }
    );

    // Check HTTP status
    if (!response.ok) {
      console.log(`[CURRENCY_DETECTION] ${keyType} API HTTP error: ${response.status} ${response.statusText}`);
      
      // Log additional info for specific errors
      if (response.status === 429) {
        console.log(`[CURRENCY_DETECTION] ${keyType} API rate limit exceeded`);
      } else if (response.status === 401 || response.status === 403) {
        console.log(`[CURRENCY_DETECTION] ${keyType} API authentication failed`);
      }
      
      return null;
    }

    const data: IpLocationResponse = await response.json();
    
    // Validate response data
    if (!data || !data.country_code || data.country_code === '') {
      console.log(`[CURRENCY_DETECTION] ${keyType} API returned invalid data (no country_code)`);
      return null;
    }

    // Additional validation: check if essential fields exist
    if (typeof data.country_code !== 'string' || data.country_code.length !== 2) {
      console.log(`[CURRENCY_DETECTION] ${keyType} API returned invalid country_code format: ${data.country_code}`);
      return null;
    }

    // Success! Build location info
    const locationInfo: LocationInfo = {
      country_code: data.country_code.toUpperCase(),
      currency_code: data.currency_code?.toUpperCase() || (data.country_code.toUpperCase() === 'ID' ? 'IDR' : 'USD'),
      is_indonesia: data.country_code.toUpperCase() === 'ID',
      city: data.city || 'Unknown',
      timezone: data.time_zone || 'UTC'
    };

    console.log(`[CURRENCY_DETECTION] ${keyType} API SUCCESS: ${ip} -> ${locationInfo.country_code} (${locationInfo.currency_code})`);
    return locationInfo;

  } catch (error: any) {
    // Handle network errors, timeouts, JSON parse errors, etc.
    if (error.name === 'AbortError') {
      console.log(`[CURRENCY_DETECTION] ${keyType} API timeout after 5 seconds`);
    } else if (error instanceof SyntaxError) {
      console.log(`[CURRENCY_DETECTION] ${keyType} API returned invalid JSON`);
    } else {
      console.log(`[CURRENCY_DETECTION] ${keyType} API error:`, error.message || error);
    }
    return null;
  }
}

/**
 * Convert IP string to number for comparison
 */
function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

/**
 * Check if IP is in Indonesian range (fallback method)
 */
function isIndonesianIPFallback(ip: string): boolean {
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    // Localhost or private IP - default to Indonesian for development
    return true;
  }

  const ipNumber = ipToNumber(ip);
  
  return INDONESIAN_IP_RANGES.some(range => {
    const startNumber = ipToNumber(range.start);
    const endNumber = ipToNumber(range.end);
    return ipNumber >= startNumber && ipNumber <= endNumber;
  });
}

/**
 * Detect user's currency based on IP location using iplocate.io API
 * Rules:
 * - Indonesian IP (from API or fallback) → IDR
 * - Foreign IP → USD  
 * - Default fallback (API error) → IDR
 */
export async function detectCurrency(request: NextRequest): Promise<'idr' | 'usd'> {
  try {
    const clientIP = getClientIP(request);
    // console.log(`[CURRENCY_DETECTION] Client IP: ${clientIP}`);
    
    // Try to get location from API first
    const locationInfo = await getLocationFromIP(clientIP);
    
    // Determine currency based on location
    let currency: 'idr' | 'usd';
    
    if (locationInfo.is_indonesia || locationInfo.country_code === 'ID') {
      currency = 'idr';
    } else if (locationInfo.currency_code === 'IDR') {
      // Some regions might use IDR
      currency = 'idr';
    } else {
      // Default to USD for all other countries
      currency = 'usd';
    }
    
    // console.log(`[CURRENCY_DETECTION] IP: ${clientIP}, Country: ${locationInfo.country_code}, Currency: ${currency.toUpperCase()}`);
    
    return currency;
  } catch (error) {
    console.error('[CURRENCY_DETECTION] Error detecting currency:', error);
    // Default to IDR on error
    return 'idr';
  }
}

/**
 * Synchronous currency detection using fallback IP ranges (for middleware)
 * This version doesn't use the API and is faster for middleware use
 */
export function detectCurrencySync(request: NextRequest): 'idr' | 'usd' {
  try {
    const clientIP = getClientIP(request);
    console.log(`[CURRENCY_DETECTION_SYNC] Client IP: ${clientIP}`);
    
    // Use fallback IP range checking
    const isIndonesian = isIndonesianIPFallback(clientIP);
    const currency = isIndonesian ? 'idr' : 'usd';
    
    console.log(`[CURRENCY_DETECTION_SYNC] IP: ${clientIP}, Indonesian: ${isIndonesian}, Currency: ${currency.toUpperCase()}`);
    
    return currency;
  } catch (error) {
    console.error('[CURRENCY_DETECTION_SYNC] Error detecting currency:', error);
    // Default to IDR on error
    return 'idr';
  }
}

/**
 * Determine locale based on IP location and browser language using API
 */
export async function detectLocale(request: NextRequest): Promise<'id' | 'en'> {
  try {
    const clientIP = getClientIP(request);
    const acceptLanguage = request.headers.get('accept-language');
    
    console.log(`[LOCALE_DETECTION] Client IP: ${clientIP}, Accept-Language: ${acceptLanguage}`);
    
    // Try to get location from API first
    const locationInfo = await getLocationFromIP(clientIP);
    
    // Priority 1: If Indonesia, check browser language
    if (locationInfo.is_indonesia || locationInfo.country_code === 'ID') {
      // If browser explicitly requests Indonesian, use 'id'
      if (acceptLanguage?.includes('id')) {
        return 'id';
      }
      // Indonesian IP regardless of browser language -> use 'id'
      return 'id';
    }
    
    // Priority 2: Foreign IP with Indonesian language preference
    if (acceptLanguage?.includes('id')) {
      return 'en'; // Foreign user but using Indonesian browser -> use English
    }
    
    // Priority 3: Default to English for all foreign IPs
    return 'en';
  } catch (error) {
    console.error('[LOCALE_DETECTION] Error detecting locale, falling back to browser language:', error);
    
    // Fallback to browser language detection when API fails
    const acceptLanguage = request.headers.get('accept-language');
    
    if (acceptLanguage?.includes('id')) {
      return 'id';
    }
    
    // Default fallback to English
    return 'en';
  }
}

/**
 * Synchronous locale detection using fallback IP ranges (for middleware)
 * This version doesn't use the API and is faster for middleware use
 */
export function detectLocaleSync(request: NextRequest): 'id' | 'en' {
  try {
    const clientIP = getClientIP(request);
    const acceptLanguage = request.headers.get('accept-language');
    
    console.log(`[LOCALE_DETECTION_SYNC] Client IP: ${clientIP}, Accept-Language: ${acceptLanguage}`);
    
    // Use fallback IP range checking
    const isIndonesian = isIndonesianIPFallback(clientIP);
    
    // Priority 1: If Indonesia IP, use 'id' regardless of browser language
    if (isIndonesian) {
      return 'id';
    }
    
    // Priority 2: Foreign IP with Indonesian language preference
    if (acceptLanguage?.includes('id')) {
      return 'en'; // Foreign user but using Indonesian browser -> use English
    }
    
    // Priority 3: Default to English for all foreign IPs
    return 'en';
  } catch (error) {
    console.error('[LOCALE_DETECTION_SYNC] Error detecting locale, falling back to browser language:', error);
    
    // Fallback to browser language detection when IP detection fails
    const acceptLanguage = request.headers.get('accept-language');
    
    if (acceptLanguage?.includes('id')) {
      return 'id';
    }
    
    // Default fallback to English
    return 'en';
  }
}

/**
 * Format currency based on type
 */
export function formatCurrency(amount: number, currency: 'idr' | 'usd'): string {
  if (currency === 'idr') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: 'idr' | 'usd'): string {
  return currency === 'idr' ? 'Rp' : '$';
}

/**
 * Get currency code in uppercase
 */
export function getCurrencyCode(currency: 'idr' | 'usd'): string {
  return currency.toUpperCase();
}

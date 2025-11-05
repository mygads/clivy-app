import { NextRequest, NextResponse } from 'next/server';
import { detectCurrency, detectLocale } from '@/lib/currency-detection';
import { withCORS } from '@/lib/cors';

// GET /api/public/location - Detect user location, currency, and locale
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCurrency = searchParams.get('includeCurrency') !== 'false'; // default true
    const includeLocale = searchParams.get('includeLocale') !== 'false'; // default true
    
    console.log('[LOCATION_API] Processing location detection request');
    
    const results: any = {};
    
    // Get currency detection if requested
    if (includeCurrency) {
      try {
        const currency = await detectCurrency(request);
        results.currency = currency.toLowerCase(); // Send as lowercase for consistency
        results.currencySuccess = true;
      } catch (error) {
        console.error('[LOCATION_API] Currency detection failed:', error);
        results.currency = 'idr'; // Fallback
        results.currencySuccess = false;
        results.currencyError = 'API error, using default IDR';
      }
    }
    
    // Get locale detection if requested  
    if (includeLocale) {
      try {
        const locale = await detectLocale(request);
        results.locale = locale;
        results.localeSuccess = true;
      } catch (error) {
        console.error('[LOCATION_API] Locale detection failed:', error);
        // Fallback to browser language
        const acceptLanguage = request.headers.get('accept-language');
        results.locale = acceptLanguage?.includes('id') ? 'id' : 'en';
        results.localeSuccess = false;
        results.localeError = 'API error, using browser language fallback';
      }
    }
    
    // Add debugging info (country code from IP detection)
    try {
      const debugInfo = await import('@/lib/currency-detection').then(m => m.detectCurrency(request));
      results.debug = {
        detectedCurrency: debugInfo.toLowerCase(),
        clientIP: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || 'unknown'
      };
    } catch (error) {
      results.debug = { error: 'Debug info unavailable' };
    }
    
    const response = {
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
      message: 'Location detection completed'
    };
    
    // console.log('[LOCATION_API] Response:', response);
    
    return withCORS(NextResponse.json(response));
  } catch (error) {
    console.error('[LOCATION_API] Unexpected error:', error);
    
    const errorResponse = {
      success: false,
      error: 'Location detection failed',
      data: {
        currency: 'idr', // Safe fallback
        locale: 'en',    // Safe fallback
        currencySuccess: false,
        localeSuccess: false,
        fallbackReason: 'Unexpected API error'
      },
      timestamp: new Date().toISOString()
    };
    
    return withCORS(NextResponse.json(errorResponse, { status: 500 }));
  }
}

// OPTIONS - Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return withCORS(new NextResponse(null, { status: 204 }));
}

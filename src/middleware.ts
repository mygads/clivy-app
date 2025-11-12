import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Edge Runtime compatible JWT verification
async function verifyJWT(token: string, secret: string) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }

        const [headerB64, payloadB64, signatureB64] = parts;
        
        const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
        const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
        
        if (payload.exp && Date.now() >= payload.exp * 1000) {
            throw new Error('Token expired');
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(`${headerB64}.${payloadB64}`);
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign', 'verify']
        );

        const signature = Uint8Array.from(
            atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
            c => c.charCodeAt(0)
        );
        
        const isValid = await crypto.subtle.verify(
            'HMAC',
            key,
            signature,
            data
        );

        if (!isValid) {
            throw new Error('Invalid signature');
        }

        return payload;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`JWT verification failed: ${errorMessage}`);
    }
}

// Helper function to check if Accept-Language indicates Indonesian preference
function hasIndonesianLanguagePreference(acceptLanguage: string | null): boolean {
    if (!acceptLanguage) {
        return false;
    }
    
    const languages = acceptLanguage.split(',').map(lang => lang.trim().split(';')[0].toLowerCase());
    
    // Check for Indonesian language indicators
    return languages.some(lang => 
        lang.startsWith('id') ||        // Indonesian
        lang.startsWith('ms') ||        // Malay (similar to Indonesian)
        lang === 'en-id' ||            // English (Indonesia)
        lang.includes('indonesia') ||   // Any variation with Indonesia
        lang.includes('bahasa')         // Bahasa Indonesia
    );
}

// Helper function to get stored locale preference from cookies
function getStoredLocalePreference(request: NextRequest): string | null {
    try {
        const localePref = request.cookies.get('locale-preference')?.value;
        if (localePref && ['id', 'en'].includes(localePref)) {
            return localePref;
        }
    } catch (error) {
        console.error('[MIDDLEWARE_LOCALE] Error reading stored preference:', error);
    }
    return null;
}

// Detect locale from browser language preference
function detectLocaleFromBrowser(request: NextRequest): string {
    try {
        // First check if user already has stored preference
        const storedLocale = getStoredLocalePreference(request);
        if (storedLocale) {
            // console.log(`[MIDDLEWARE_LOCALE] Using stored preference: ${storedLocale}`);
            return storedLocale;
        }
        
        // console.log('[MIDDLEWARE_LOCALE] No stored preference, detecting from browser language...');
        
        // Detect from Accept-Language header
        const acceptLanguage = request.headers.get('accept-language');
        const hasIndoLangPref = hasIndonesianLanguagePreference(acceptLanguage);
        
        const detectedLocale = hasIndoLangPref ? 'id' : 'en';
        // console.log(`[MIDDLEWARE_LOCALE] Detected locale from browser: ${detectedLocale}`);
        return detectedLocale;
        
    } catch (error) {
        // console.error('[MIDDLEWARE_LOCALE] Error in locale detection:', error);
        // Default fallback to Indonesian
        return 'id';
    }
}

export async function middleware(req: NextRequest) {
    const { pathname, searchParams } = req.nextUrl;

    // Handle CORS for all API routes
    if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });
    }

    // ROOT REDIRECT LOGIC - Priority: stored preference > browser language
    if (pathname === '/') {
        const detectedLocale = detectLocaleFromBrowser(req);
        console.log(`[MIDDLEWARE] Root redirect to locale: ${detectedLocale}`);
        
        // Set cookie to remember this choice and redirect
        const response = NextResponse.redirect(new URL(`/${detectedLocale}`, req.url));
        response.cookies.set('locale-preference', detectedLocale, {
            maxAge: 60 * 60 * 24 * 365, // 1 year
            httpOnly: false, // Allow client-side access
            sameSite: 'lax'
        });
        return response;
    }

    // ADMIN REDIRECT LOGIC - Priority: stored preference > browser language
    if (pathname === '/admin') {
        const detectedLocale = detectLocaleFromBrowser(req);
        const response = NextResponse.redirect(new URL(`/${detectedLocale}/admin`, req.url));
        response.cookies.set('locale-preference', detectedLocale, {
            maxAge: 60 * 60 * 24 * 365, // 1 year
            httpOnly: false,
            sameSite: 'lax'
        });
        return response;
    }

    // Check if path needs locale prefix
    const isRootPath = pathname === '/';
    const hasLocaleInPath = /^\/(en|id)/.test(pathname);
    const isApiRoute = pathname.startsWith('/api/');
    const isStaticAsset = /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/.test(pathname);

    // Handle locale detection for non-API, non-static routes (only for routes without locale)
    if (!isApiRoute && !isStaticAsset && (!hasLocaleInPath || isRootPath)) {
        // Manual locale override (for testing)
        const forceLocale = searchParams.get('locale');
        if (forceLocale && ['en', 'id'].includes(forceLocale)) {
            const url = req.nextUrl.clone();
            url.pathname = `/${forceLocale}${pathname === '/' ? '' : pathname}`;
            url.searchParams.delete('locale');
            
            // Update cookie preference
            const response = NextResponse.redirect(url);
            response.cookies.set('locale-preference', forceLocale, {
                maxAge: 60 * 60 * 24 * 365,
                httpOnly: false,
                sameSite: 'lax'
            });
            return response;
        }

        // Check if user already has locale preference stored
        const detectedLocale = detectLocaleFromBrowser(req);
        const url = req.nextUrl.clone();
        url.pathname = `/${detectedLocale}${pathname === '/' ? '' : pathname}`;
        
        const response = NextResponse.redirect(url);
        response.cookies.set('locale-preference', detectedLocale, {
            maxAge: 60 * 60 * 24 * 365,
            httpOnly: false,
            sameSite: 'lax'
        });
        return response;
    }

    // API ROUTES AUTHENTICATION
    if (isApiRoute) {
        // Get JWT token from Authorization header
        let jwtToken = null;
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const tokenValue = authHeader.substring(7);
            // Only try to verify if token has proper format
            if (tokenValue && tokenValue.length > 10 && tokenValue.includes('.')) {
                try {
                    jwtToken = await verifyJWT(tokenValue, JWT_SECRET);
                } catch (error) {
                    // Silently log JWT verification errors but don't block request
                    console.log('JWT verification failed for token:', tokenValue.substring(0, 20) + '...');
                }
            }
        }

        // Public routes (tidak memerlukan token)
        const publicRoutes = [
            '/api/auth/',
            '/api/public/',
            '/api/health',
            '/api/cron/',
            '/api/og',        // Open Graph image generation
            '/api/docs',      // API documentation (Swagger)
            '/api/whatsapp/', // WhatsApp internal APIs (protected by INTERNAL_API_KEY)
        ];

        if (publicRoutes.some(route => pathname.startsWith(route))) {
            const response = NextResponse.next();
            response.headers.set("Access-Control-Allow-Origin", "*");
            response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
            return response;
        }

        // Account API routes - require JWT (semua user yang login)
        if (pathname.startsWith('/api/account')) {
            if (!jwtToken) {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: 'Authentication required',
                        message: 'Please provide a valid JWT token in Authorization header' 
                    }, 
                    { status: 401 }
                );
            }
            
            const response = NextResponse.next();
            response.headers.set("Access-Control-Allow-Origin", "*");
            response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
            return response;
        }

        // Customer API routes - require JWT with customer role (or admin/super_admin)
        if (pathname.startsWith('/api/customer')) {
            if (!jwtToken) {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: 'Authentication required',
                        message: 'Please provide a valid JWT token in Authorization header' 
                    }, 
                    { status: 401 }
                );
            }
            
            // Customer routes allow customer, admin, and super_admin roles
            if (jwtToken.role !== 'customer' && jwtToken.role !== 'admin' && jwtToken.role !== 'super_admin') {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: 'Insufficient permissions',
                        message: 'Customer access required' 
                    }, 
                    { status: 403 }
                );
            }
            
            const response = NextResponse.next();
            response.headers.set("Access-Control-Allow-Origin", "*");
            response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
            return response;
        }

        // Admin API routes - require JWT with admin role
        if (pathname.startsWith('/api/admin')) {
            if (!jwtToken || (jwtToken.role !== 'admin' && jwtToken.role !== 'super_admin')) {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: 'Admin authentication required',
                        message: 'Please provide a valid admin JWT token in Authorization header' 
                    }, 
                    { status: 403 }
                );
            }
            
            const response = NextResponse.next();
            response.headers.set("Access-Control-Allow-Origin", "*");
            response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
            return response;
        }

        // All other API routes - require admin token
        if (!jwtToken || (jwtToken.role !== 'admin' && jwtToken.role !== 'super_admin')) {
            return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
        }
        
        const response = NextResponse.next();
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        return response;
    }

    // UI ROUTES - Apply intl middleware for localized routes
    if (hasLocaleInPath && !isApiRoute && !isStaticAsset) {
        const locale = pathname.split('/')[1];
        const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
        
        // Customer Dashboard Routes Protection
        if (pathWithoutLocale.startsWith('/dashboard')) {
            // Check for JWT token in localStorage via cookies for customer UI
            const jwtToken = req.cookies.get('auth-token')?.value;
            
            let isValidCustomer = false;
            if (jwtToken) {
                try {
                    const payload = await verifyJWT(jwtToken, JWT_SECRET);
                    // Only allow customers to access customer dashboard, redirect admin to admin panel
                    if (payload && payload.role === 'customer') {
                        isValidCustomer = true;
                    } else if (payload && (payload.role === 'admin' || payload.role === 'super_admin')) {
                        // Redirect admin to admin dashboard
                        return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, req.url));
                    }
                } catch (error) {
                    // JWT verification failed - token expired or invalid
                    console.log('Customer JWT verification failed:', error);
                }
            }
            
            if (!isValidCustomer) {
                const signInUrl = new URL(`/${locale}/signin`, req.url);
                signInUrl.searchParams.set('callbackUrl', req.url);
                return NextResponse.redirect(signInUrl);
            }
        }

        // Signin/Signup Pages - Redirect if already authenticated
        if (pathWithoutLocale === '/signin' || pathWithoutLocale === '/signup') {
            const jwtToken = req.cookies.get('auth-token')?.value;
            
            if (jwtToken) {
                try {
                    const payload = await verifyJWT(jwtToken, JWT_SECRET);
                    if (payload) {
                        // Redirect based on role
                        if (payload.role === 'customer') {
                            return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
                        } else if (payload.role === 'admin' || payload.role === 'super_admin') {
                            return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, req.url));
                        }
                    }
                } catch (error) {
                    // Token invalid/expired - let them continue to signin
                    console.log('Signin page JWT check failed:', error);
                }
            }
        }

        // Admin UI Routes Protection
        if (pathWithoutLocale.startsWith('/admin')) {
            // Check for JWT token in cookies for admin UI (same cookie as customer but check admin role)
            const jwtToken = req.cookies.get('auth-token')?.value;
            
            let isValidAdmin = false;
            if (jwtToken) {
                try {
                    const payload = await verifyJWT(jwtToken, JWT_SECRET);
                    isValidAdmin = payload && (payload.role === 'admin' || payload.role === 'super_admin');
                } catch (error) {
                    console.error('Admin JWT verification failed:', error);
                }
            }
            
            if (!isValidAdmin) {
                const signInUrl = new URL(`/${locale}/signin`, req.url);
                signInUrl.searchParams.set('callbackUrl', req.url);
                return NextResponse.redirect(signInUrl);
            }
        }

        // Continue processing other UI routes
        const response = NextResponse.next();
        
        // Save locale preference when user directly visits localized URL
        const currentStoredLocale = req.cookies.get('locale-preference')?.value;
        if (currentStoredLocale !== locale && ['en', 'id'].includes(locale)) {
            response.cookies.set('locale-preference', locale, {
                maxAge: 60 * 60 * 24 * 365, // 1 year
                httpOnly: false, // Allow client-side access
                sameSite: 'lax'
            });
            // console.log(`[MIDDLEWARE] Saved locale preference from direct URL visit: ${locale}`);
        }
        
        return response;
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .well-known (ACME challenges, DevTools, etc.)
     * - public assets (images, etc. ending with common extensions)
     */
    '/((?!_next/static|_next/image|favicon.ico|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

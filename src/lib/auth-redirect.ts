import { UserSession } from "@/lib/storage"

export interface PostSigninRedirectOptions {
  userRole: string
  callbackUrl?: string | null
  currentPath?: string
}

export function getPostSigninRedirect({ userRole, callbackUrl, currentPath }: PostSigninRedirectOptions): string {
  // If there's a callback URL, validate it and use if appropriate
  if (callbackUrl) {
    try {
      const url = new URL(callbackUrl)
      const pathname = url.pathname
      
      // Extract locale and path
      const localeMatch = pathname.match(/^\/(en|id)(.*)$/)
      const locale = localeMatch?.[1] || 'en'
      const pathWithoutLocale = localeMatch?.[2] || pathname
      
      // Check if the callback URL matches user's role
      if (userRole === 'customer' && pathWithoutLocale.startsWith('/dashboard')) {
        // Customer trying to access customer dashboard - allow
        return callbackUrl
      } else if ((userRole === 'admin' || userRole === 'super_admin') && pathWithoutLocale.startsWith('/admin')) {
        // Admin trying to access admin dashboard - allow
        return callbackUrl
      } else if (userRole === 'customer' && pathWithoutLocale.startsWith('/admin')) {
        // Customer trying to access admin area - redirect to customer dashboard
        return `/${locale}/dashboard`
      } else if ((userRole === 'admin' || userRole === 'super_admin') && pathWithoutLocale.startsWith('/dashboard')) {
        // Admin trying to access customer area - redirect to admin dashboard
        return `/${locale}/admin/dashboard`
      }
      
      // For other paths, use callback URL if it's safe
      if (!pathWithoutLocale.startsWith('/signin') && !pathWithoutLocale.startsWith('/signup')) {
        return callbackUrl
      }
    } catch (error) {
      console.warn('Invalid callback URL:', callbackUrl)
    }
  }
  
  // Default redirects based on role
  const locale = currentPath?.match(/^\/(en|id)/)?.[1] || 'en'
  
  if (userRole === 'customer') {
    return `/${locale}/dashboard`
  } else if (userRole === 'admin' || userRole === 'super_admin') {
    return `/${locale}/admin/dashboard`
  }
  
  // Fallback
  return `/${locale}/dashboard`
}

export function getSessionTimeRemaining(session: UserSession | null): number {
  if (!session) return 0
  
  const remaining = session.expiresAt - Date.now()
  return Math.max(0, remaining)
}

export function getSessionTimeRemainingMinutes(session: UserSession | null): number {
  const remaining = getSessionTimeRemaining(session)
  return Math.floor(remaining / (60 * 1000))
}

export function isSessionExpiringSoon(session: UserSession | null, thresholdMinutes: number = 30): boolean {
  const remainingMinutes = getSessionTimeRemainingMinutes(session)
  return remainingMinutes > 0 && remainingMinutes <= thresholdMinutes
}

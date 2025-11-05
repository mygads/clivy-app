"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PhoneAuthService } from "./services/phone-auth-service"
import { PasswordAuthService } from "./services/password-auth-service"
import { CheckoutAuthService } from "./services/checkout-auth-service"
import { AuthResponse, ProfileUpdateData, TempCheckoutData, User, VerifyCheckoutOtpResponse, VerifyOtpResponse } from "@/types/auth"
import { SessionManager, UserSession } from "@/lib/storage"
import { getPostSigninRedirect } from "@/lib/auth-redirect"
import { 
  validateAuthWithServer, 
  getSessionTimeRemaining as getClientSessionTimeRemaining, 
  getSessionTimeRemainingMinutes as getClientSessionTimeRemainingMinutes, 
  isSessionExpiringSoon as isClientSessionExpiringSoon 
} from "@/lib/client-auth"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  signInWithPhone: (identifier: string, password: string) => Promise<{ error: any; success: boolean }>
  verifyOtp: (identifier: string, otp: string) => Promise<{ error: any; success: boolean; user?: User | null }>
  completeSignUp: (email: string, password: string, name: string, phone: string) => Promise<{ error: any; success: boolean }>
  signInWithPassword: (identifier: string, password: string) => Promise<{ error: any; success: boolean }>
  signInWithSSO: (identifier: string) => Promise<{ error: any; success: boolean }>
  verifySSO: (identifier: string, otp: string) => Promise<{ error: any; success: boolean; user?: User | null }>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: { name?: string; email?: string }) => Promise<{ error: any; success: boolean }>
  refreshUser: () => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: any; success: boolean }>
  resetPassword: (identifier: string) => Promise<{ error: any; success: boolean }>
  verifyPasswordReset: (
    identifier: string,
    token: string,
    newPassword: string,
  ) => Promise<{ error: any; success: boolean }>
  checkoutWithPhone: (phone: string, name: string, email: string) => Promise<{ error: any; success: boolean }>
  verifyCheckoutOtp: (phone: string, token: string) => Promise<{ error: any; success: boolean; isNewUser: boolean; user?: User | null; token?: string; passwordGenerated?: boolean }>;
  resendOtp: (identifier: string, purpose: "signup" | "reset-password" | "verify-email" | "sso-login") => Promise<{ error: any; success: boolean }>
  sendEmailOtp: (email: string) => Promise<{ error: any; success: boolean }>
  isAuthenticated: boolean
  error: string | null
  // Session management functions
  getSessionTimeRemaining: () => number
  getSessionTimeRemainingMinutes: () => number
  isSessionExpiringSoon: (thresholdMinutes?: number) => boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  signInWithPhone: async () => ({ error: null, success: false }),
  verifyOtp: async () => ({ error: null, success: false, user: null }),
  completeSignUp: async () => ({ error: null, success: false }),
  signInWithPassword: async () => ({ error: null, success: false }),
  signInWithSSO: async () => ({ error: null, success: false }),
  verifySSO: async () => ({ error: null, success: false, user: null }),
  signInWithGoogle: async () => {},
  logout: async () => {},
  updateProfile: async () => ({ error: null, success: false }),
  refreshUser: async () => {},
  updatePassword: async () => ({ error: null, success: false }),
  resetPassword: async () => ({ error: null, success: false }),
  verifyPasswordReset: async () => ({ error: null, success: false }),
  checkoutWithPhone: async () => ({ error: null, success: false }),
  verifyCheckoutOtp: async () => ({ error: null, success: false, isNewUser: false, user: null, token: undefined, passwordGenerated: false }),
  resendOtp: async () => ({ error: null, success: false }),
  sendEmailOtp: async () => ({ error: null, success: false }),
  isAuthenticated: false,
  error: null,
  getSessionTimeRemaining: () => 0,
  getSessionTimeRemainingMinutes: () => 0,
  isSessionExpiringSoon: () => false,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tempPhone, setTempPhone] = useState<string | null>(null)
  const [tempOtp, setTempOtp] = useState<string | null>(null)
  const [tempCheckoutData, setTempCheckoutData] = useState<TempCheckoutData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const userRef = useRef<User | null>(null)

  // Keep userRef in sync with user state
  useEffect(() => {
    userRef.current = user
  }, [user])  // Enhanced session check with better cleanup and integrity check
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true)
      try {
        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          setIsLoading(false)
          return
        }

        // First check session integrity (localStorage vs cookies)
        const isIntegrityValid = SessionManager.checkSessionIntegrity()
        if (!isIntegrityValid) {
          console.log("[AuthContext] Session integrity check failed - session cleaned")
          setUser(null)
          setIsLoading(false)
          return
        }

        // Get session after integrity check
        const localSession = SessionManager.getSession()
        if (localSession) {
          // Use validateAuthWithServer from client-auth.ts for consistency
          try {
            const authResult = await validateAuthWithServer()
            
            if (authResult.success && authResult.authenticated && authResult.session) {
              // Use data from server to ensure role is up-to-date
              setUser(authResult.session.user)
              setIsLoading(false)
              return
            } else if (authResult.error === 'Server temporarily unavailable. Please try again later.') {
              // Server error (500), keep local session
              console.error("[AuthContext] Server error during session check, keeping session")
              const user: User = {
                id: localSession.id,
                name: localSession.name,
                email: localSession.email,
                phone: localSession.phone,
                role: localSession.role,
                image: localSession.image,
                verification: {
                  phoneVerified: localSession.verification?.phoneVerified ? new Date(localSession.verification.phoneVerified) : null,
                  emailVerified: localSession.verification?.emailVerified ? new Date(localSession.verification.emailVerified) : null
                }
              }
              setUser(user)
              setIsLoading(false)
              return
            } else {
              // Token invalid/expired (401), session already cleared by validateAuthWithServer
              console.log("[AuthContext] Session invalid or expired - cleaned by validateAuthWithServer")
              setUser(null)
            }
          } catch (sessionError) {
            console.error("[AuthContext] Backend session check failed:", sessionError)
            // Network error, keep local session
            const user: User = {
              id: localSession.id,
              name: localSession.name,
              email: localSession.email,
              phone: localSession.phone,
              role: localSession.role,
              image: localSession.image,
              verification: {
                phoneVerified: localSession.verification?.phoneVerified ? new Date(localSession.verification.phoneVerified) : null,
                emailVerified: localSession.verification?.emailVerified ? new Date(localSession.verification.emailVerified) : null
              }
            }
            setUser(user)
          }
        } else {
          // No local session - ensure everything is clean
          SessionManager.clearSession()
          setUser(null)
        }
      } catch (err) {
        console.log("[AuthContext] Session check error:", err)
        SessionManager.clearSession()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()

    // Set up periodic session integrity check (every 30 seconds)
    const integrityCheckInterval = setInterval(() => {
      if (userRef.current) {
        const isIntegrityValid = SessionManager.checkSessionIntegrity()
        if (!isIntegrityValid) {
          console.log("[AuthContext] Periodic integrity check failed - logging out")
          setUser(null)
          router.push('/signin')
        }
      }
    }, 30 * 1000) // Check every 30 seconds

    // Set up window focus event to check session integrity when user returns to tab
    const handleWindowFocus = () => {
      if (userRef.current) {
        SessionManager.forceSyncSession()
        const isIntegrityValid = SessionManager.checkSessionIntegrity()
        if (!isIntegrityValid) {
          console.log("[AuthContext] Window focus integrity check failed - logging out")
          setUser(null)
          router.push('/signin')
        }
      }
    }

    window.addEventListener('focus', handleWindowFocus)

    return () => {
      clearInterval(integrityCheckInterval)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [router]) // Use userRef to avoid stale closure
  // Phone/Email Authentication Methods
  const signInWithPhone = async (identifier: string, password: string) => {
    setError(null)
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, password })
      })
      const result = await response.json()
      
      if (result.success && result.user) {
        setUser(result.user)
        return { error: null, success: true }
      } else if (result.error) {
        setError(result.error.message)
        return { error: result.error, success: false }
      }
      return { error: { message: "Sign in failed" }, success: false }
    } catch (err: any) {
      const error = { message: err.message || "Sign in failed" }
      setError(error.message)
      return { error, success: false }
    }
  }  // OTP Verification after signup
  const verifyOtp = async (identifier: string, otp: string) => {
    setError(null)
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, otp, purpose: "signup" })
      })
      const result = await response.json()
      console.log("[AuthContext] verifyOtp result:", result)
      
      if (result.success && result.data?.user) {
        const userData = result.data.user
        // Token might be inside user object or separate
        const token = (userData as any).token || result.data?.token
        
        if (token) {
          // Create clean user object without token
          const cleanUserData: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone
          }
          
          // Save to localStorage
          SessionManager.saveSession(cleanUserData, token)
          
          // Also set cookie for middleware (expires in 7 days) - verifyOtp
          if (typeof document !== 'undefined') {
            const isProduction = window.location.protocol === 'https:';
            const cookieOptions = isProduction 
              ? `auth-token=${token}; path=/; secure; samesite=strict; max-age=${7 * 24 * 60 * 60}`
              : `auth-token=${token}; path=/; samesite=strict; max-age=${7 * 24 * 60 * 60}`;
            document.cookie = cookieOptions;
          }
          
          setUser(cleanUserData)
          return { error: null, success: true, user: cleanUserData }
        } else {
          console.warn("[AuthContext] Missing token in verification response:", result)
          return { error: { message: "Verification successful but missing token" }, success: false, user: null }
        }
      } else if (result.error) {
        setError(result.error.message)
        return { error: result.error, success: false, user: null }
      }
      return { error: { message: "OTP verification failed" }, success: false, user: null }
    } catch (err: any) {
      const error = { message: err.message || "OTP verification failed" }
      setError(error.message)
      return { error, success: false, user: null }
    }
  }

  // Signup: requires name, email, whatsapp, password
  const completeSignUp = async (email: string, password: string, name: string, phone: string) => {
    setError(null)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, password })
      })
      const result = await response.json()
      
      if (result.success) {
        // Don't set user yet - wait for OTP verification
        return { error: null, success: true }
      } else if (result.error) {
        setError(result.error.message || result.message)
        return { error: result.error || { message: result.message }, success: false }
      }
      return { error: { message: "Sign up failed" }, success: false }
    } catch (err: any) {
      const error = { message: err.message || "Sign up failed" }
      setError(error.message)
      return { error, success: false }
    }
  }  // Password Authentication Methods
  const signInWithPassword = async (identifier: string, password: string) => {
    setError(null)
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, password })
      })
      const result = await response.json()
      console.log("[AuthContext] signInWithPassword result:", result)
      
      if (result.success) {
        // Handle both possible response formats
        const userData = result.data?.user || result.user
        const token = result.data?.token || result.token
        
        if (userData && token) {
          // Create clean user object with all required fields
          const cleanUserData: User & { role?: string } = {
            id: userData.id,
            name: userData.name || 'Unknown User',
            email: userData.email || '',
            phone: userData.phone || '',
            role: userData.role || 'customer'
          }
          
          // Save to localStorage
          SessionManager.saveSession(cleanUserData, token)
          
          // Also set cookie for middleware (expires in 7 days)
          if (typeof document !== 'undefined') {
            const isProduction = window.location.protocol === 'https:';
            const cookieOptions = isProduction 
              ? `auth-token=${token}; path=/; secure; samesite=strict; max-age=${7 * 24 * 60 * 60}`
              : `auth-token=${token}; path=/; samesite=strict; max-age=${7 * 24 * 60 * 60}`;
            document.cookie = cookieOptions;
          }
          
          setUser(cleanUserData)
          return { error: null, success: true }
        } else {
          console.warn("[AuthContext] Missing user or token in successful response:", result)
          return { error: { message: "Authentication successful but missing user data" }, success: false }
        }
      } else if (result.error) {
        setError(result.error.message || result.message)
        return { error: result.error || { message: result.message }, success: false }
      }
      return { error: { message: "Sign in failed" }, success: false }
    } catch (err: any) {
      const error = { message: err.message || "Sign in failed" }
      setError(error.message)
      return { error, success: false }
    }
  }

  // SSO Authentication Methods
  const signInWithSSO = async (identifier: string) => {
    setError(null)
    try {
      const response = await fetch('/api/auth/sso-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier })
      })
      const result = await response.json()
      console.log("[AuthContext] signInWithSSO result:", result, "status:", response.status)
      
      if (result.success) {
        return { error: null, success: true }
      } else if (result.error) {
        // For rate limiting (status 429), preserve the error type and message
        const error = {
          error: result.error,
          message: result.message
        }
        setError(result.message)
        return { error, success: false }
      }
      return { error: { message: "SSO sign in failed" }, success: false }    
    } catch (err: any) {
      const error = { message: err.message || "SSO sign in failed" }
      setError(error.message)
      return { error, success: false }
    }
  }

  const verifySSO = async (identifier: string, otp: string) => {
    setError(null)
    try {
      const response = await fetch('/api/auth/sso-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, otp, purpose: "sso-login" })
      })
      const result = await response.json()
      console.log("[AuthContext] verifySSO result:", result)
      
      if (result.success && result.data?.user) {
        const userData = result.data.user
        // Token is inside the user object
        const token = (userData as any).token || result.data?.token
        
        if (token) {
          // Create clean user object with all required fields including role
          const cleanUserData: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role || 'customer', // Include role
            image: userData.image,
            verification: userData.verification
          }
          
          // Save to localStorage
          SessionManager.saveSession(cleanUserData, token)
          
          // Also set cookie for middleware (expires in 7 days) - verifySSO
          if (typeof document !== 'undefined') {
            const isProduction = process.env.NODE_ENV === 'production'
            const secureFlag = isProduction ? 'secure; ' : ''
            document.cookie = `auth-token=${token}; path=/; ${secureFlag}samesite=strict; max-age=${7 * 24 * 60 * 60}`
          }
          
          setUser(cleanUserData)
          return { error: null, success: true, user: cleanUserData }
        } else {
          console.warn("[AuthContext] Missing token in SSO response:", result)
          return { error: { message: "Authentication successful but missing token" }, success: false, user: null }
        }
      } else if (result.error) {
        setError(result.error.message || result.message)
        return { error: result.error || { message: result.message }, success: false, user: null }
      }
      return { error: { message: "SSO verification failed" }, success: false, user: null }
    } catch (err: any) {
      const error = { message: err.message || "SSO verification failed" }
      setError(error.message)
      return { error, success: false, user: null }
    }
  }

  // Google Authentication
  const signInWithGoogle = async () => {
    // Implement Google sign-in via backend if needed
    setError("Google sign-in not implemented.")
  }

  // Profile Management
  const updateProfile = async (data: { name?: string; email?: string }) => {
    setError(null)
    if (!user) {
      const err = { message: "User not authenticated" }
      setError(err.message)
      return { error: err, success: false }
    }
    
    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      
      if (result.success) {
        // Update user in state if successful
        setUser((prev: User | null) => prev ? { ...prev, ...data } : null)
        return { error: null, success: true }
      } else if (result.error) {
        setError(result.error.message || result.message)
        return { error: result.error || { message: result.message }, success: false }
      }
      return { error: { message: "Profile update failed" }, success: false }
    } catch (err: any) {
      const error = { message: err.message || "Profile update failed" }
      setError(error.message)
      return { error, success: false }
    }
  }

  // Password Management
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    setError(null)
    if (!user?.email) {
      const err = new Error("User email not found")
      setError(err.message)
      return { error: err, success: false }
    }
    const result = await PasswordAuthService.updatePassword(currentPassword, newPassword, user.email)
    if (!result.success && result.error) {
      setError(result.error.message)
    }
    return result
  }

  const refreshUser = async () => {
    try {
      const token = SessionManager.getToken()
      if (!token) return

      const response = await fetch('/api/account/session', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.session?.user) {
          setUser(result.session.user)
          // Update local session storage with new user data
          SessionManager.saveSession(result.session.user, token)
        }
      }
    } catch (error) {
      console.error('[AuthContext] Error refreshing user:', error)
    }
  }

  const resetPassword = async (identifier: string) => {
    setError(null)
    try {
      const response = await fetch('/api/auth/send-password-reset-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, method: "email" })
      })
      const result = await response.json()
      
      if (result.success) {
        return { error: null, success: true }
      } else if (result.error) {
        setError(result.error.message || result.message)
        return { error: result.error || { message: result.message }, success: false }
      }
      return { error: { message: "Password reset failed" }, success: false }
    } catch (err: any) {
      const error = { message: err.message || "Password reset failed" }
      setError(error.message)
      return { error, success: false }
    }
  }

  const verifyPasswordReset = async (identifier: string, token: string, newPassword: string) => {
    setError(null)
    try {
      const response = await fetch('/api/auth/verify-password-reset-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, otp: token, newPassword })
      })
      const result = await response.json()
      
      if (result.success) {
        return { error: null, success: true }
      } else if (result.error) {
        setError(result.error.message || result.message)
        return { error: result.error || { message: result.message }, success: false }
      }
      return { error: { message: "Password reset verification failed" }, success: false }
    } catch (err: any) {
      const error = { message: err.message || "Password reset verification failed" }
      setError(error.message)
      return { error, success: false }
    }
  }

  // Checkout Authentication
  const checkoutWithPhone = async (phone: string, name: string, email: string) => {
    setError(null)
    const result = await CheckoutAuthService.checkoutWithPhone(phone, name, email)
    if (result.success && result.checkoutData && result.otp) {
      setTempCheckoutData(result.checkoutData)
      setTempOtp(result.otp)
    } else if (result.error) {
      const errorMessage = typeof result.error === 'string' ? result.error : 
                         (result.error as any)?.message || 'Checkout failed'
      setError(errorMessage)
    }
    return { error: result.error, success: result.success }
  }
  const verifyCheckoutOtp = async (phone: string, token: string) => {
    setError(null)
    const result = await CheckoutAuthService.verifyCheckoutOtp(phone, token, tempCheckoutData, tempOtp)
    if (result.success) {
      setTempOtp(null)
      setTempCheckoutData(null)
      if (result.user && result.token) {
        // Save session to localStorage
        SessionManager.saveSession(result.user, result.token)
        
        // Also set cookie for middleware (expires in 7 days) - verifyCheckoutOtp
        if (typeof document !== 'undefined') {
          const isProduction = process.env.NODE_ENV === 'production'
          const secureFlag = isProduction ? 'secure; ' : ''
          document.cookie = `auth-token=${result.token}; path=/; ${secureFlag}samesite=strict; max-age=${7 * 24 * 60 * 60}`
        }
        
        setUser(result.user)
      }
    } else if (result.error) {
      const errorMessage = typeof result.error === 'string' ? result.error : 
                         (result.error as any)?.message || 'Verification failed'
      setError(errorMessage)
    }
    return result
  }
  // Resend OTP
  const resendOtpFunc = async (identifier: string, purpose: "signup" | "reset-password" | "verify-email" | "sso-login") => {
    setError(null)
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, purpose })
      })
      const result = await response.json()
      
      if (result.success) {
        return { error: null, success: true }
      } else if (result.error) {
        setError(result.error.message || result.message)
        return { error: result.error || { message: result.message }, success: false }
      }
      return { error: { message: "Resend OTP failed" }, success: false }
    } catch (err: any) {
      const error = { message: err.message || "Resend OTP failed" }
      setError(error.message)
      return { error, success: false }
    }
  }

  // Send Email OTP
  const sendEmailOtpFunc = async (email: string) => {
    setError(null)
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier: email, method: "email" })
      })
      const result = await response.json()
      
      if (result.success) {
        return { error: null, success: true }
      } else if (result.error) {
        setError(result.error.message || result.message)
        return { error: result.error || { message: result.message }, success: false }
      }
      return { error: { message: "Send email OTP failed" }, success: false }
    } catch (err: any) {
      const error = { message: err.message || "Send email OTP failed" }
      setError(error.message)
      return { error, success: false }
    }
  }
  // Logout
  const logout = async () => {
    try {
      // Get current token for logout API call
      const token = SessionManager.getToken()
      
      // Clear local session first
      SessionManager.clearSession()
      
      // Clear auth cookie
      if (typeof document !== 'undefined') {
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
      
      setUser(null)
      
      // Try to logout from backend with proper Authorization header
      if (token) {
        try {
          await fetch("/api/account/logout", { 
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        } catch (backendError) {
          // Don't block logout if backend call fails
          console.warn("Backend logout failed:", backendError)
        }
      }
      
      router.push("/signin")
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      setError(err.message)
    }
  }
  // Session management functions - now using client-auth utilities
  const getSessionTimeRemaining = (): number => {
    return getClientSessionTimeRemaining() // Use client-auth function
  }

  const getSessionTimeRemainingMinutes = (): number => {
    return getClientSessionTimeRemainingMinutes() // Use client-auth function
  }

  const isSessionExpiringSoon = (thresholdMinutes: number = 30): boolean => {
    return isClientSessionExpiringSoon(thresholdMinutes) // Use client-auth function
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token: typeof window !== 'undefined' ? SessionManager.getToken() : null,
        isLoading,
        signInWithPhone,
        verifyOtp,
        completeSignUp,
        signInWithPassword,
        signInWithSSO,
        verifySSO,
        signInWithGoogle,
        logout,
        updateProfile,
        refreshUser,
        updatePassword,
        resetPassword,
        verifyPasswordReset,
        checkoutWithPhone,
        verifyCheckoutOtp,
        resendOtp: resendOtpFunc,
        sendEmailOtp: sendEmailOtpFunc,
        isAuthenticated: !!user,
        error,
        getSessionTimeRemaining,
        getSessionTimeRemainingMinutes,
        isSessionExpiringSoon,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

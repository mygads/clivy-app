export interface UserSession {
  id: string
  name: string
  email: string
  phone: string
  role: string
  image: string | null
  verification: {
    phoneVerified: string | null
    emailVerified: string | null
  }
  token: string
  expiresAt: number // timestamp
}

const STORAGE_KEYS = {
  USER_SESSION: 'user_session',
  TOKEN: 'auth_token'
} as const

// Session duration: 7 days
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export class SessionManager {
  static saveSession(userData: any, token: string): void {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || !window.localStorage) {
        return
      }

      const session: UserSession = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        image: userData.image,
        verification: userData.verification,
        token: token,
        expiresAt: Date.now() + SESSION_DURATION
      }

      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session))
      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      
      // Also save token in cookies for middleware access
      if (typeof document !== 'undefined') {
        // Set cookie with 7 days expiry
        const expiryDate = new Date(Date.now() + SESSION_DURATION);
        document.cookie = `auth-token=${token}; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=lax`;
      }
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  static getSession(): UserSession | null {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || !window.localStorage) {
        return null
      }

      const sessionData = localStorage.getItem(STORAGE_KEYS.USER_SESSION)
      const cookieToken = this.getTokenFromCookie()
      
      if (!sessionData) {
        // No localStorage session - ensure cookies are also clean
        if (cookieToken) {
          this.clearSession() // Clean any orphaned cookies
        }
        return null
      }

      const session: UserSession = JSON.parse(sessionData)
      
      // Cross-validation: localStorage token should match cookie token
      if (session.token !== cookieToken) {
        console.log('Session inconsistency detected: localStorage token != cookie token')
        this.clearSession()
        return null
      }
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        this.clearSession()
        return null
      }

      return session
    } catch (error) {
      console.error('Error getting session:', error)
      this.clearSession()
      return null
    }
  }

  static getToken(): string | null {
    try {
      const session = this.getSession()
      return session?.token || null
    } catch (error) {
      console.error('Error getting token:', error)
      return null
    }
  }

  static getTokenFromCookie(): string | null {
    try {
      if (typeof document === 'undefined') {
        return null;
      }
      
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'auth-token') {
          return value;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting token from cookie:', error);
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const session = this.getSession()
    return session !== null && !!session.token && !!session.id
  }

  static clearSession(): void {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || !window.localStorage) {
        return
      }

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION)
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      
      // Clear all auth-related items (in case there are any orphaned items)
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('auth') || key.includes('session') || key.includes('token'))) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (e) {
          console.warn('Failed to remove localStorage key:', key)
        }
      })
      
      // Also clear auth token cookie
      if (typeof document !== 'undefined') {
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        // Also try clearing with different path and domain combinations
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname + ';';
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname + ';';
      }
    } catch (error) {
      console.error('Error clearing session:', error)
    }
  }

  static updateSession(updates: Partial<UserSession>): void {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || !window.localStorage) {
        return
      }

      const currentSession = this.getSession()
      
      if (!currentSession) {
        return
      }

      const updatedSession: UserSession = {
        ...currentSession,
        ...updates,
        // Don't allow updating expiresAt through this method
        expiresAt: currentSession.expiresAt
      }

      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(updatedSession))
    } catch (error) {
      console.error('Error updating session:', error)
    }
  }

  static refreshSession(): void {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || !window.localStorage) {
        return
      }

      const currentSession = this.getSession()
      
      if (!currentSession) {
        return
      }

      // Extend session by another 7 days
      const refreshedSession: UserSession = {
        ...currentSession,
        expiresAt: Date.now() + SESSION_DURATION
      }

      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(refreshedSession))
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }
  static getRemainingTime(): number {
    const session = this.getSession()
    
    if (!session) {
      return 0
    }

    return Math.max(0, session.expiresAt - Date.now())
  }

  static isSessionExpiringSoon(minutesThreshold: number = 60): boolean {
    const remainingTime = this.getRemainingTime()
    const thresholdMs = minutesThreshold * 60 * 1000
    
    return remainingTime > 0 && remainingTime < thresholdMs
  }

  // Get time until session expires (in minutes)
  static getTimeUntilExpiry(): number {
    const session = this.getSession()
    if (!session) return 0
    
    const timeLeft = session.expiresAt - Date.now()
    return Math.max(0, Math.floor(timeLeft / (60 * 1000))) // Convert to minutes
  }

  // Show expiry warning (can be used by components)
  static shouldShowExpiryWarning(): boolean {
    const timeLeft = this.getTimeUntilExpiry()
    return timeLeft > 0 && timeLeft <= 30 // Show warning when 30 minutes or less remain
  }

  // Auto-refresh session (extend expiry by 7 days)
  static autoRefreshSession(): boolean {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || !window.localStorage) {
        return false
      }

      const session = this.getSession()
      if (!session) return false

      // Only refresh if session is still valid but expiring soon
      if (this.isSessionExpiringSoon(120)) { // Check if expiring within 2 hours
        session.expiresAt = Date.now() + SESSION_DURATION
        localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session))
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error auto-refreshing session:', error)
      return false
    }
  }

  // Listen for session changes across tabs
  static onSessionChange(callback: (session: UserSession | null) => void): () => void {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.USER_SESSION) {
        const session = this.getSession()
        callback(session)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Return cleanup function
    return () => window.removeEventListener('storage', handleStorageChange)
  }

  // Check session integrity (localStorage vs cookies)
  static checkSessionIntegrity(): boolean {
    try {
      if (typeof window === 'undefined') {
        return false
      }

      const localToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
      const cookieToken = this.getTokenFromCookie()
      const sessionData = localStorage.getItem(STORAGE_KEYS.USER_SESSION)

      // Case 1: No session at all - OK
      if (!localToken && !cookieToken && !sessionData) {
        return true
      }

      // Case 2: Partial session data - Inconsistent
      if (!localToken || !cookieToken || !sessionData) {
        console.log('Session integrity check failed: Partial session data found')
        this.clearSession()
        return false
      }

      // Case 3: Token mismatch - Inconsistent
      if (localToken !== cookieToken) {
        console.log('Session integrity check failed: Token mismatch')
        this.clearSession()
        return false
      }

      // Case 4: Parse session and check token consistency
      try {
        const session: UserSession = JSON.parse(sessionData)
        if (session.token !== localToken) {
          console.log('Session integrity check failed: Session token mismatch')
          this.clearSession()
          return false
        }

        // Check expiry
        if (Date.now() > session.expiresAt) {
          console.log('Session integrity check failed: Session expired')
          this.clearSession()
          return false
        }

        return true
      } catch (parseError) {
        console.log('Session integrity check failed: Invalid session data')
        this.clearSession()
        return false
      }

    } catch (error) {
      console.error('Error checking session integrity:', error)
      this.clearSession()
      return false
    }
  }

  // Force sync localStorage with cookies (emergency cleanup)
  static forceSyncSession(): void {
    try {
      if (typeof window === 'undefined') {
        return
      }

      const cookieToken = this.getTokenFromCookie()
      const localToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
      const sessionData = localStorage.getItem(STORAGE_KEYS.USER_SESSION)

      // If no cookie token, clear everything
      if (!cookieToken) {
        this.clearSession()
        return
      }

      // If no localStorage data but cookie exists, clear cookie too
      if (!localToken || !sessionData) {
        this.clearSession()
        return
      }

      // Try to parse and validate session
      try {
        const session: UserSession = JSON.parse(sessionData)
        
        // If session token doesn't match cookie, clear all
        if (session.token !== cookieToken || session.token !== localToken) {
          this.clearSession()
          return
        }

        // If expired, clear all
        if (Date.now() > session.expiresAt) {
          this.clearSession()
          return
        }

        // All good - session is in sync
      } catch (parseError) {
        // Invalid session data - clear all
        this.clearSession()
      }

    } catch (error) {
      console.error('Error force syncing session:', error)
      this.clearSession()
    }
  }
}

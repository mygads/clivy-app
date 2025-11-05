"use client"

import { useState, useEffect } from 'react'
import { Clock, AlertTriangle, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/Auth/AuthContext'

interface SessionExpiryWarningProps {
  thresholdMinutes?: number
  showAlways?: boolean
}

export function SessionExpiryWarning({ 
  thresholdMinutes = 30, 
  showAlways = false 
}: SessionExpiryWarningProps) {
  const { isSessionExpiringSoon, getSessionTimeRemainingMinutes, logout } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [remainingMinutes, setRemainingMinutes] = useState(0)

  useEffect(() => {
    const updateTimer = () => {
      const remaining = getSessionTimeRemainingMinutes()
      setRemainingMinutes(remaining)
      
      if (remaining <= 0) {
        // Session expired - auto logout
        logout()
        return
      }
      
      setIsVisible(showAlways || isSessionExpiringSoon(thresholdMinutes))
    }

    // Update immediately
    updateTimer()

    // Update every minute
    const interval = setInterval(updateTimer, 60 * 1000)

    return () => clearInterval(interval)
  }, [isSessionExpiringSoon, getSessionTimeRemainingMinutes, thresholdMinutes, showAlways, logout])

  const handleExtendSession = async () => {
    try {
      // Use validateAuthWithServer from client-auth instead of direct fetch
      const { validateAuthWithServer } = await import('@/lib/client-auth')
      const result = await validateAuthWithServer()
      
      if (result.success && result.authenticated) {
        // Session refreshed successfully
        setIsVisible(false)
      } else if (result.error === 'Server temporarily unavailable. Please try again later.') {
        // Server error, don't hide warning but show error message
        console.error('Server error during session refresh')
      }
    } catch (error) {
      console.error('Failed to extend session:', error)
    }
  }

  const getWarningLevel = () => {
    if (remainingMinutes <= 5) return 'critical'
    if (remainingMinutes <= 15) return 'warning'
    return 'info'
  }

  const getWarningColor = () => {
    const level = getWarningLevel()
    switch (level) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  const getIconColor = () => {
    const level = getWarningLevel()
    switch (level) {
      case 'critical':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-orange-600 dark:text-orange-400'
      default:
        return 'text-blue-600 dark:text-blue-400'
    }
  }

  if (!isVisible || remainingMinutes <= 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className={`border ${getWarningColor()} shadow-lg`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getWarningLevel() === 'critical' ? (
                <AlertTriangle className={`h-5 w-5 ${getIconColor()}`} />
              ) : (
                <Clock className={`h-5 w-5 ${getIconColor()}`} />
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">
                  Session Expiring Soon
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="h-6 w-6 p-0 hover:bg-transparent"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Your session will expire in{' '}
                <Badge variant="outline" className="mx-1">
                  {remainingMinutes} minute{remainingMinutes !== 1 ? 's' : ''}
                </Badge>
                {remainingMinutes <= 5 && 'You will be automatically logged out.'}
              </p>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleExtendSession}
                  className="flex-1"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Extend Session
                </Button>
                
                {remainingMinutes <= 5 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={logout}
                    className="flex-1"
                  >
                    Logout Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

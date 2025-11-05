"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/Auth/AuthContext'
import { getPostSigninRedirect } from '@/lib/auth-redirect'

export function PostSigninRedirectHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (user) {
      // User is signed in, handle redirect
      const callbackUrl = searchParams.get('callbackUrl')
      const currentPath = window.location.pathname

      const redirectUrl = getPostSigninRedirect({
        userRole: user.role || 'customer',
        callbackUrl,
        currentPath
      })

      router.push(redirectUrl)
    }
  }, [user, isLoading, router, searchParams])

  return null // This component doesn't render anything
}

export default PostSigninRedirectHandler

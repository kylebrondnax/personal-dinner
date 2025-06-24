'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/ClerkAuthContext'

function SSOCallbackContent() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Check if there's a redirect URL in the search params
        const afterSignUpUrl = searchParams.get('after_sign_up_url')
        const redirectUrl = searchParams.get('redirect_url')
        
        // Use the redirect URL if provided, otherwise use role-based routing
        if (afterSignUpUrl) {
          // Extract the path from the full URL
          const url = new URL(afterSignUpUrl)
          router.push(url.pathname)
        } else if (redirectUrl) {
          const url = new URL(redirectUrl)
          router.push(url.pathname)
        } else {
          router.push('/dashboard')
        }
      } else {
        // If not authenticated, redirect to home
        router.push('/')
      }
    }
  }, [isAuthenticated, isLoading, user, router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Completing authentication...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we redirect you to the right place.
        </p>
      </div>
    </div>
  )
}

export default function SSOCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <SSOCallbackContent />
    </Suspense>
  )
}
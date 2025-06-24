'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/ClerkAuthContext'
import { ThemeToggle } from '@/components/ThemeToggle'

function VerifyContent() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Check for redirect URLs in search params
        const redirectUrl = searchParams.get('redirect_url')
        const signUpFallbackRedirectUrl = searchParams.get('sign_up_fallback_redirect_url')
        const signInFallbackRedirectUrl = searchParams.get('sign_in_fallback_redirect_url')
        
        if (redirectUrl) {
          const url = new URL(redirectUrl)
          router.push(url.pathname)
        } else if (signUpFallbackRedirectUrl) {
          const url = new URL(signUpFallbackRedirectUrl)
          router.push(url.pathname)
        } else if (signInFallbackRedirectUrl) {
          const url = new URL(signInFallbackRedirectUrl)
          router.push(url.pathname)
        } else {
          router.push('/dashboard')
        }
      } else {
        // Check for client mismatch or other error statuses
        const clerkStatus = searchParams.get('__clerk_status')
        if (clerkStatus === 'client_mismatch') {
          // Redirect back to general auth page for re-authentication
          router.push('/auth/signup')
        }
      }
    }
  }, [isAuthenticated, isLoading, user, router, searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Verifying your account...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we verify your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="max-w-md mx-auto pt-16 pb-20 px-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Account Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            We&apos;re processing your account verification. Please wait a moment.
          </p>
        </div>

        {/* Verification Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Verification in Progress
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your account verification is being processed. You&apos;ll be redirected automatically once complete.
            </p>

            <div className="space-y-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Having trouble?</p>
                <ul className="mt-2 space-y-1">
                  <li>• Make sure you clicked the most recent verification link</li>
                  <li>• Check that you&apos;re using the same browser</li>
                  <li>• Try refreshing this page</li>
                </ul>
              </div>

              <button
                onClick={() => router.push('/auth/signup')}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Back to Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Back to Browse */}
        <div className="mt-6 text-center">
          <a
            href="/browse"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Back to browse dinners
          </a>
        </div>
      </div>
    </div>
  )
}

export default function SignupVerifyPage() {
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
      <VerifyContent />
    </Suspense>
  )
}
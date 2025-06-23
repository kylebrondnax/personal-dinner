'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/ClerkAuthContext'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function FactorOnePage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'CHEF') {
        router.push('/chef/dashboard')
      } else {
        router.push('/browse')
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
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
            Verify Your Email
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Check your email and enter the verification code to complete your chef account setup.
          </p>
        </div>

        {/* Verification Message */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Email Verification Required
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We&apos;ve sent a verification code to your email address. Please check your inbox and enter the code to continue.
            </p>

            <div className="space-y-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Didn&apos;t receive the email?</p>
                <ul className="mt-2 space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>• Make sure you entered the correct email address</li>
                  <li>• Wait a few minutes and try again</li>
                </ul>
              </div>

              <button
                onClick={() => router.push('/chef/auth')}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Back to Sign In
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
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/ClerkAuthContext'

export default function SSOCallbackPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect based on user role
        router.push('/dashboard')
      } else {
        // If not authenticated, redirect to chef auth
        router.push('/chef/auth')
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Completing your sign up...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we set up your account.
        </p>
      </div>
    </div>
  )
}
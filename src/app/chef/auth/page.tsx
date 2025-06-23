'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/ClerkAuthContext'
import { SignIn, SignUp } from '@clerk/nextjs'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useState } from 'react'

export default function ChefAuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated and is a chef
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === 'CHEF') {
      router.push('/chef/dashboard')
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
            {mode === 'login' ? 'Welcome Back, Chef!' : 'Join as a Chef'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {mode === 'login' 
              ? 'Sign in to manage your dinners and connect with food lovers.'
              : 'Create your chef account and start hosting amazing dinners.'
            }
          </p>
        </div>

        {/* Auth Component */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex justify-center mb-6">
            {mode === 'login' ? (
              <SignIn 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none bg-transparent border-none w-full"
                  }
                }}
                forceRedirectUrl="/chef/dashboard"
                signUpUrl="#"
              />
            ) : (
              <SignUp 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none bg-transparent border-none w-full"
                  }
                }}
                forceRedirectUrl="/chef/dashboard"
                signInUrl="#"
              />
            )}
          </div>

          {/* Toggle Mode */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {mode === 'login' ? 'Sign up as a chef' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Back to Browse */}
          <div className="mt-4 text-center">
            <a
              href="/browse"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ← Back to browse dinners
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
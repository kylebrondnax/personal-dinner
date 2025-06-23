'use client'

import { useAuth } from '@/contexts/ClerkAuthContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'

export function Navigation() {
  const { user, logout } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🍽️</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Family Dinner
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/browse" 
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Browse Dinners
            </Link>
            
            {user?.role === 'CHEF' && (
              <>
                <Link 
                  href="/chef/dashboard" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/chef/create-event" 
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Create Event
                </Link>
              </>
            )}
          </div>

          {/* Right side - Auth + Theme */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2">
                  {user.profile?.avatarUrl && (
                    <img 
                      src={user.profile.avatarUrl} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                    {user.role}
                  </span>
                </div>
                
                <button
                  onClick={logout}
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm font-medium px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
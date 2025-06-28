'use client'

import { useAuth } from '@/contexts/ClerkAuthContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export function Navigation() {
  const { user } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-bg border-b nav-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🍽️</span>
            <span className="text-xl font-bold text-theme-primary">
              Family Dinner
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/browse" 
              className="nav-link transition-colors"
            >
              Browse Dinners
            </Link>
            
            {user && (
              <>
                <Link 
                  href="/dashboard" 
                  className="nav-link transition-colors"
                >
                  My Dinners
                </Link>
                <Link 
                  href="/create-event" 
                  className="nav-link transition-colors"
                >
                  Host a Dinner
                </Link>
              </>
            )}
            
            <Link 
              href="/changelog" 
              className="nav-link transition-colors"
            >
              What&apos;s New
            </Link>
          </div>

          {/* Right side - Auth + Theme */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-sm font-medium nav-user-text">
                    {user.name}
                  </span>
                </div>
                
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium nav-link transition-colors"
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
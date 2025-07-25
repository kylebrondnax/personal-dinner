'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/ClerkAuthContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export function Navigation() {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

          {/* Right side - Auth + Theme + Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            
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
              <div className="hidden md:flex items-center space-x-3">
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

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md nav-link"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 nav-bg border-t nav-border">
              <Link
                href="/browse"
                className="block px-3 py-2 rounded-md text-base font-medium nav-link transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Dinners
              </Link>
              
              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium nav-link transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Dinners
                  </Link>
                  <Link
                    href="/create-event"
                    className="block px-3 py-2 rounded-md text-base font-medium nav-link transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Host a Dinner
                  </Link>
                </>
              )}
              
              <Link
                href="/changelog"
                className="block px-3 py-2 rounded-md text-base font-medium nav-link transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                What&apos;s New
              </Link>

              {/* Mobile auth links */}
              {!user && (
                <div className="pt-4 border-t nav-border space-y-1">
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 rounded-md text-base font-medium nav-link transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2 mx-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile theme toggle */}
              <div className="pt-4 border-t nav-border">
                <div className="px-3 py-2">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
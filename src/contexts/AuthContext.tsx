'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
  role: 'CHEF' | 'GUEST'
  profile?: {
    avatarUrl?: string
    bio?: string
    phone?: string
    venmoUsername?: string
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

interface SignupData {
  email: string
  password: string
  name: string
  role: 'CHEF' | 'GUEST'
  phone?: string
  bio?: string
  venmoUsername?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // For now, check localStorage for a simple session
        const savedUser = localStorage.getItem('family-dinner-user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      // Make API call to login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.message || 'Login failed' }
      }

      if (result.success) {
        setUser(result.data)
        localStorage.setItem('family-dinner-user', JSON.stringify(result.data))
        return { success: true }
      }
      
      return { success: false, error: result.message || 'Login failed' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (data: SignupData) => {
    try {
      setIsLoading(true)
      
      // Make API call to signup endpoint
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.message || 'Signup failed' }
      }

      if (result.success) {
        setUser(result.data)
        localStorage.setItem('family-dinner-user', JSON.stringify(result.data))
        return { success: true }
      }
      
      return { success: false, error: result.message || 'Signup failed' }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error: 'Signup failed. Please try again.' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('family-dinner-user')
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
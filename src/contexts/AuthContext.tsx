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
      
      // TODO: Replace with actual API call
      // For now, simulate API call with demo users
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Demo chef user
      if (email === 'chef@example.com' && password === 'password') {
        const demoUser: User = {
          id: 'chef1',
          email: 'chef@example.com',
          name: 'Sarah Johnson',
          role: 'CHEF',
          profile: {
            avatarUrl: '/api/placeholder/48/48',
            bio: 'Passionate home chef specializing in comfort food and international cuisine.',
            phone: '+1 (555) 123-4567',
            venmoUsername: 'sarah-chef'
          }
        }
        
        setUser(demoUser)
        localStorage.setItem('family-dinner-user', JSON.stringify(demoUser))
        return { success: true }
      }
      
      return { success: false, error: 'Invalid email or password' }
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
      
      // TODO: Replace with actual API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: data.email,
        name: data.name,
        role: data.role,
        profile: {
          bio: data.bio,
          phone: data.phone,
          venmoUsername: data.venmoUsername
        }
      }
      
      setUser(newUser)
      localStorage.setItem('family-dinner-user', JSON.stringify(newUser))
      return { success: true }
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
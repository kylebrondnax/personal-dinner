'use client'

import { useTheme } from '@/contexts/ThemeContext'

interface ThemeWrapperProps {
  children: React.ReactNode
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { resolvedTheme } = useTheme()
  
  console.log('🎨 ThemeWrapper rendering with resolvedTheme:', resolvedTheme)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {children}
    </div>
  )
}
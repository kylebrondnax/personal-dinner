'use client'

import { useTheme } from '@/contexts/ThemeContext'

interface ThemeWrapperProps {
  children: React.ReactNode
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { resolvedTheme } = useTheme()
  
  console.log('🎨 ThemeWrapper rendering with resolvedTheme:', resolvedTheme)

  // Conditionally apply classes based on resolved theme
  const backgroundClasses = resolvedTheme === 'dark' 
    ? 'min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 transition-colors'
    : 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 transition-colors'

  return (
    <div className={backgroundClasses}>
      {children}
    </div>
  )
}
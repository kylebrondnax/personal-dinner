'use client'

import { useTheme } from '@/contexts/ThemeContext'

interface ThemeWrapperProps {
  children: React.ReactNode
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { resolvedTheme } = useTheme()

  return (
    <div className={`min-h-screen bg-theme-body transition-colors ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      {children}
    </div>
  )
}
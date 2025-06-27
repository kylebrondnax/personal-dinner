'use client'

import { useTheme } from '@/contexts/ThemeContext'

export function TailwindDarkTest() {
  const { resolvedTheme } = useTheme()
  
  // Conditional classes based on resolved theme
  const containerClasses = resolvedTheme === 'dark'
    ? 'fixed bottom-4 left-4 p-4 border rounded bg-gray-800 border-gray-600'
    : 'fixed bottom-4 left-4 p-4 border rounded bg-white border-gray-300'
    
  const contentClasses = resolvedTheme === 'dark'
    ? 'p-2 bg-blue-900 text-blue-100'
    : 'p-2 bg-blue-100 text-blue-900'
    
  const buttonClasses = resolvedTheme === 'dark'
    ? 'mt-2 px-3 py-1 bg-gray-700 text-gray-200 rounded'
    : 'mt-2 px-3 py-1 bg-gray-200 text-gray-800 rounded'

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        Theme-aware component (resolvedTheme: {resolvedTheme})
      </div>
      <button 
        onClick={() => {
          document.documentElement.classList.toggle('dark')
          console.log('Toggled dark class manually')
        }}
        className={buttonClasses}
      >
        Manual Dark Toggle
      </button>
    </div>
  )
}
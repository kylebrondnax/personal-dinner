'use client'

import { useTheme } from '@/contexts/ThemeContext'

export function ThemeTestComponent() {
  const { theme, resolvedTheme } = useTheme()

  console.log('🧪 ThemeTestComponent render - theme:', theme, 'resolvedTheme:', resolvedTheme)

  // Check if dark class is on document element
  const isDarkClassPresent = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  
  // Conditional classes based on resolved theme
  const containerClasses = resolvedTheme === 'dark'
    ? 'fixed bottom-4 right-4 bg-gray-800 border border-gray-600 text-gray-300 p-4 rounded-lg shadow-lg transition-colors'
    : 'fixed bottom-4 right-4 bg-white border border-gray-300 text-gray-700 p-4 rounded-lg shadow-lg transition-colors'
  
  const textClasses = resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  const mutedTextClasses = resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
  
  return (
    <div className={containerClasses}>
      <div className="text-sm font-mono">
        <div className={textClasses}>
          <strong>Current Theme:</strong> {theme}
        </div>
        <div className={textClasses}>
          <strong>Resolved Theme:</strong> {resolvedTheme}
        </div>
        <div className={textClasses}>
          <strong>HTML has &lsquo;dark&rsquo; class:</strong> {isDarkClassPresent ? 'Yes' : 'No'}
        </div>
        <div className={`mt-2 text-xs ${mutedTextClasses}`}>
          Background should be: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
        </div>
        {!isDarkClassPresent && resolvedTheme === 'dark' && (
          <div className="mt-2 text-xs text-red-500">
            ⚠️ Dark class missing on HTML element!
          </div>
        )}
      </div>
    </div>
  )
}
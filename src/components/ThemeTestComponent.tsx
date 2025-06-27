'use client'

import { useTheme } from '@/contexts/ThemeContext'

export function ThemeTestComponent() {
  const { theme, resolvedTheme } = useTheme()

  console.log('🧪 ThemeTestComponent render - theme:', theme, 'resolvedTheme:', resolvedTheme)

  // Check if dark class is on document element
  const isDarkClassPresent = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-lg transition-colors">
      <div className="text-sm font-mono">
        <div className="text-gray-700 dark:text-gray-300">
          <strong>Current Theme:</strong> {theme}
        </div>
        <div className="text-gray-700 dark:text-gray-300">
          <strong>Resolved Theme:</strong> {resolvedTheme}
        </div>
        <div className="text-gray-700 dark:text-gray-300">
          <strong>HTML has &lsquo;dark&rsquo; class:</strong> {isDarkClassPresent ? 'Yes' : 'No'}
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
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
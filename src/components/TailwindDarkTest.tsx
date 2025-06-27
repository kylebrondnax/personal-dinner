'use client'

export function TailwindDarkTest() {
  return (
    <div className="fixed bottom-4 left-4 p-4 border rounded bg-white dark:bg-gray-800">
      <div className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100">
        This should change colors in dark mode
      </div>
      <button 
        onClick={() => {
          document.documentElement.classList.toggle('dark')
          console.log('Toggled dark class manually')
        }}
        className="mt-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
      >
        Manual Dark Toggle
      </button>
    </div>
  )
}
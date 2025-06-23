'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface VenmoSetupProps {
  initialUsername?: string
  onSave: (username: string, link: string) => void
  className?: string
}

export function VenmoSetup({ initialUsername = '', onSave, className }: VenmoSetupProps) {
  const [username, setUsername] = useState(initialUsername)
  const [isValid, setIsValid] = useState(true)

  const validateUsername = (value: string) => {
    // Basic validation for Venmo username (alphanumeric, dashes, underscores)
    const isValidFormat = /^[a-zA-Z0-9_-]+$/.test(value) && value.length >= 3
    setIsValid(isValidFormat)
    return isValidFormat
  }

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    if (value) {
      validateUsername(value)
    } else {
      setIsValid(true)
    }
  }

  const handleSave = () => {
    if (username && validateUsername(username)) {
      const venmoLink = `https://venmo.com/${username}`
      onSave(username, venmoLink)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <label htmlFor="venmo-username" className="block text-sm font-medium mb-2 text-gray-900">
          Venmo Username
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            @
          </span>
          <input
            id="venmo-username"
            type="text"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="your-username"
            className={cn(
              'w-full pl-8 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white',
              !isValid && username ? 'border-red-500' : 'border-gray-300'
            )}
          />
        </div>
        {!isValid && username && (
          <p className="text-red-500 text-sm mt-1">
            Username must be at least 3 characters and contain only letters, numbers, hyphens, and underscores
          </p>
        )}
        {username && isValid && (
          <p className="text-gray-500 text-sm mt-1">
            Your Venmo link: https://venmo.com/{username}
          </p>
        )}
      </div>
      
      <button
        onClick={handleSave}
        disabled={!username || !isValid}
        className={cn(
          'w-full py-3 px-4 rounded-lg font-medium transition-colors',
          username && isValid
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        )}
      >
        Save Venmo Info
      </button>
    </div>
  )
}
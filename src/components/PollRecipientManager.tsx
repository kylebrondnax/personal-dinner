'use client'

import { useState } from 'react'
import { PollRecipient } from '@/types'

interface PollRecipientManagerProps {
  recipients: PollRecipient[]
  onChange: (recipients: PollRecipient[]) => void
}

export function PollRecipientManager({ recipients, onChange }: PollRecipientManagerProps) {
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')

  const addRecipient = () => {
    if (!newEmail || !isValidEmail(newEmail)) return

    // Check for duplicates
    if (recipients.some(r => r.email.toLowerCase() === newEmail.toLowerCase())) {
      return
    }

    const newRecipient: PollRecipient = {
      email: newEmail.toLowerCase(),
      name: newName || undefined
    }

    onChange([...recipients, newRecipient])
    setNewEmail('')
    setNewName('')
  }

  const removeRecipient = (index: number) => {
    const updated = recipients.filter((_, i) => i !== index)
    onChange(updated)
  }

  const updateRecipient = (index: number, field: 'email' | 'name', value: string) => {
    const updated = recipients.map((recipient, i) => 
      i === index ? { ...recipient, [field]: value || undefined } : recipient
    )
    onChange(updated)
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addRecipient()
    }
  }

  const bulkAddEmails = (emailString: string) => {
    const emails = emailString
      .split(/[,;\n]/)
      .map(email => email.trim())
      .filter(email => email && isValidEmail(email))
      .filter(email => !recipients.some(r => r.email.toLowerCase() === email.toLowerCase()))

    const newRecipients = emails.map(email => ({ email: email.toLowerCase() }))
    onChange([...recipients, ...newRecipients])
  }

  return (
    <div className="space-y-4">
      {/* Existing Recipients */}
      {recipients.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Poll Recipients ({recipients.length})
          </h4>
          <div className="space-y-2">
            {recipients.map((recipient, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="email"
                        value={recipient.email}
                        onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={recipient.name || ''}
                        onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm"
                        placeholder="Name (optional)"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRecipient(index)}
                    className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Remove recipient"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Single Recipient */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Add Friend to Poll
          </h4>
          <div className="flex items-end space-x-3">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  placeholder="friend@example.com"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  placeholder="Name (optional)"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addRecipient}
              disabled={!newEmail || !isValidEmail(newEmail)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Add (Advanced) */}
      <details className="bg-gray-50 dark:bg-gray-800 rounded-lg">
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
          📋 Bulk add multiple emails
        </summary>
        <div className="px-4 pb-4">
          <textarea
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-sm"
            placeholder="Paste multiple emails separated by commas, semicolons, or new lines..."
            onBlur={(e) => {
              if (e.target.value.trim()) {
                bulkAddEmails(e.target.value)
                e.target.value = ''
              }
            }}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Example: alice@example.com, bob@example.com; charlie@example.com
          </p>
        </div>
      </details>

      {/* Validation Messages */}
      {newEmail && !isValidEmail(newEmail) && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Please enter a valid email address
        </p>
      )}

      {recipients.length === 0 && (
        <p className="text-sm text-orange-600 dark:text-orange-400">
          Add at least one friend to send the poll to
        </p>
      )}

      {/* Helper Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>Note:</strong> Friends don&apos;t need accounts to respond to polls. They&apos;ll get a simple email with a link to share their availability.
        </p>
      </div>
    </div>
  )
}
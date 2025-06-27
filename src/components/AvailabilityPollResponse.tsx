'use client'

import { useState } from 'react'
import { AvailabilityPollData } from '@/types'

interface AvailabilityPollResponseProps {
  pollData: AvailabilityPollData
  onSubmit: (responses: Array<{
    proposedDateId: string
    available: boolean
    tentative?: boolean
  }>, guestInfo: {
    email: string
    name?: string
  }) => Promise<void>
  isSubmitting?: boolean
}

type ResponseOption = 'available' | 'tentative' | 'unavailable' | null

export function AvailabilityPollResponse({ 
  pollData, 
  onSubmit, 
  isSubmitting = false 
}: AvailabilityPollResponseProps) {
  const [responses, setResponses] = useState<Record<string, ResponseOption>>({})
  const [guestEmail, setGuestEmail] = useState('')
  const [guestName, setGuestName] = useState('')
  const [error, setError] = useState('')

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateTime = new Date(`${date}T${time}`)
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }).format(dateTime)
    } catch {
      return `${date} at ${time}`
    }
  }

  const handleResponseChange = (proposedDateId: string, response: ResponseOption) => {
    setResponses(prev => ({
      ...prev,
      [proposedDateId]: response
    }))
  }

  const getResponseIcon = (response: ResponseOption) => {
    switch (response) {
      case 'available': return '✅'
      case 'tentative': return '⚠️'
      case 'unavailable': return '❌'
      default: return '⭕'
    }
  }

  const getResponseColor = (response: ResponseOption) => {
    switch (response) {
      case 'available': return 'border-green-500 bg-green-50 dark:bg-green-900/20'
      case 'tentative': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'unavailable': return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      default: return 'border-gray-300 dark:border-gray-600'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!guestEmail || !guestEmail.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    const responseCount = Object.values(responses).filter(r => r !== null).length
    if (responseCount === 0) {
      setError('Please respond to at least one date option')
      return
    }

    // Convert responses to API format
    const formattedResponses = Object.entries(responses)
      .filter(([, response]) => response !== null)
      .map(([proposedDateId, response]) => ({
        proposedDateId,
        available: response === 'available' || response === 'tentative',
        tentative: response === 'tentative'
      }))

    try {
      await onSubmit(formattedResponses, {
        email: guestEmail,
        name: guestName || undefined
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit response')
    }
  }

  const isDeadlinePassed = pollData.pollDeadline && new Date() > pollData.pollDeadline

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🗳️ When can you join?
          </h1>
          <h2 className="text-xl text-gray-700 dark:text-gray-300 mb-2">
            {pollData.eventTitle}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Hosted by <span className="font-medium">{pollData.chefName}</span>
          </p>
          {pollData.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {pollData.description}
            </p>
          )}
        </div>

        {/* Deadline Warning */}
        {isDeadlinePassed ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200 text-center">
              ⏰ Sorry, the response deadline has passed. This poll is no longer accepting responses.
            </p>
          </div>
        ) : pollData.pollDeadline && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 dark:text-yellow-200 text-center">
              ⏰ Please respond by {new Intl.DateTimeFormat('en-US', {
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              }).format(pollData.pollDeadline)}
            </p>
          </div>
        )}

        {!isDeadlinePassed && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Please mark your availability for each option:
              </h3>
              <div className="space-y-4">
                {pollData.proposedDates.map((proposedDate) => (
                  <div 
                    key={proposedDate.id}
                    className={`border-2 rounded-lg p-4 transition-colors ${getResponseColor(responses[proposedDate.id!])}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {formatDateTime(proposedDate.date, proposedDate.time)}
                        </h4>
                        {proposedDate.responses.length > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {proposedDate.responses.filter(r => r.available && !r.tentative).length} available, {' '}
                            {proposedDate.responses.filter(r => r.tentative).length} tentative
                          </p>
                        )}
                      </div>
                      <div className="text-2xl">
                        {getResponseIcon(responses[proposedDate.id!])}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleResponseChange(proposedDate.id!, 'available')}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          responses[proposedDate.id!] === 'available'
                            ? 'border-green-500 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        ✅ Available
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResponseChange(proposedDate.id!, 'tentative')}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          responses[proposedDate.id!] === 'tentative'
                            ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        ⚠️ Maybe
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResponseChange(proposedDate.id!, 'unavailable')}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          responses[proposedDate.id!] === 'unavailable'
                            ? 'border-red-500 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        ❌ Can&apos;t make it
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guest Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="guestEmail"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    id="guestName"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                    placeholder="Your name"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Response...
                  </div>
                ) : (
                  'Submit My Availability'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You&apos;ll receive an email confirmation once {pollData.chefName} finalizes the date.
          </p>
        </div>
      </div>
    </div>
  )
}
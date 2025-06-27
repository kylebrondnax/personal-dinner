'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AvailabilityPollResponse } from '@/components/AvailabilityPollResponse'
import { AvailabilityPollData } from '@/types'

export default function PollPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [pollData, setPollData] = useState<AvailabilityPollData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Fetch poll data
  useEffect(() => {
    const fetchPollData = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/poll`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Failed to load poll')
        }

        if (result.success) {
          setPollData(result.data)
        } else {
          throw new Error(result.message || 'Failed to load poll data')
        }
      } catch (err) {
        console.error('Error fetching poll data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load poll')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchPollData()
    }
  }, [eventId])

  // Handle poll response submission
  const handleSubmit = async (
    responses: Array<{
      proposedDateId: string
      available: boolean
      tentative?: boolean
    }>,
    guestInfo: {
      email: string
      name?: string
    }
  ) => {
    try {
      const response = await fetch(`/api/events/${eventId}/poll/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses,
          guestInfo
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit response')
      }

      if (result.success) {
        setSubmitted(true)
      } else {
        throw new Error(result.message || 'Failed to submit response')
      }
    } catch (err) {
      console.error('Error submitting response:', err)
      throw err // Re-throw so the component can handle it
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading poll...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-5xl mb-4">✅</div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Thank you for your response!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your availability has been recorded. {pollData?.chefName} will review all responses and send an update when the final date is confirmed.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Submit Another Response
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Other Dinners
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!pollData) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full text-center">
          <div className="text-gray-400 text-5xl mb-4">📊</div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Poll not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This poll doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <AvailabilityPollResponse
        pollData={pollData}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
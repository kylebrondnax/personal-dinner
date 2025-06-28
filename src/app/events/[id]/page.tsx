'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { EventCard } from '@/components/EventCard'
import { PublicDinnerEvent } from '@/types'

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<PublicDinnerEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const handleReserve = (eventId: string) => {
    // Handle reservation logic here
    // This could open a modal, navigate to a reservation page, etc.
    console.log('Reserve clicked for event:', eventId)
  }

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load event')
        }

        if (data.success) {
          setEvent(data.event)
        } else {
          throw new Error(data.message || 'Event not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event')
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-theme-muted">Loading event...</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !event) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-theme-primary mb-4">Event Not Found</h1>
            <p className="text-theme-muted mb-6">{error || 'This event does not exist or has been removed.'}</p>
            <a 
              href="/browse" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Other Events
            </a>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto p-4 pt-24">
        <EventCard event={event} onReserve={handleReserve} />
      </div>
    </>
  )
}
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { EventCard } from '@/components/EventCard'
import { RSVPFlow } from '@/components/RSVPFlow'
import { EventAttendeeList } from '@/components/EventAttendeeList'
import { PublicDinnerEvent, RSVPStatus, EventAttendee } from '@/types'
import { useAuth } from '@/contexts/ClerkAuthContext'
import { useToast } from '@/components/Toast'

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [event, setEvent] = useState<PublicDinnerEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRSVP, setShowRSVP] = useState(false)
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus | null>(null)
  const [attendees, setAttendees] = useState<EventAttendee[]>([])
  const [attendeesLoading, setAttendeesLoading] = useState(false)

  // Fetch RSVP status for authenticated users
  const fetchRSVPStatus = useCallback(async () => {
    if (!isAuthenticated || !eventId) {
      setRsvpStatus(null)
      return
    }
    
    try {
      const response = await fetch(`/api/events/rsvp-status?eventId=${eventId}`)
      const result = await response.json()
      
      if (response.ok && result.success && result.data[eventId]) {
        const status = result.data[eventId]
        // Convert date strings back to Date objects
        setRsvpStatus({
          status: status.status,
          guestCount: status.guestCount,
          rsvpedAt: new Date(status.rsvpedAt)
        })
      }
    } catch (err) {
      console.error('Error fetching RSVP status:', err)
    }
  }, [isAuthenticated, eventId])

  // Fetch attendees for the event
  const fetchAttendees = useCallback(async () => {
    if (!eventId) return
    
    setAttendeesLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/attendees`)
      const result = await response.json()
      
      if (response.ok && result.success) {
        setAttendees(result.data)
      } else {
        console.error('Failed to fetch attendees:', result.message)
        setAttendees([])
      }
    } catch (err) {
      console.error('Error fetching attendees:', err)
      setAttendees([])
    } finally {
      setAttendeesLoading(false)
    }
  }, [eventId])

  const handleReserve = () => {
    // Check if user already has an RSVP for this event
    if (rsvpStatus) {
      const status = rsvpStatus.status
      if (status === 'CONFIRMED') {
        showToast(`You already have a confirmed reservation for ${event?.title}.`, 'info')
      } else if (status === 'WAITLIST') {
        showToast(`You're already on the waitlist for ${event?.title}.`, 'info')
      }
      return
    }
    
    setShowRSVP(true)
  }

  const handleRSVPSuccess = (reservationData: { message?: string; status?: string }) => {
    console.log('Reservation created:', reservationData)
    setShowRSVP(false)
    
    // Show success message with reservation details
    const message = reservationData.message || 'Reservation confirmed!'
    const status = reservationData.status
    
    if (status === 'WAITLIST') {
      showToast(`${message} for ${event?.title}. You're on the waitlist and will be notified if spots become available.`, 'success', 6000)
    } else {
      showToast(`${message} for ${event?.title}! You'll receive a confirmation email shortly.`, 'success', 6000)
    }
    
    // Refresh event, RSVP status, and attendees
    fetchEvent()
    fetchRSVPStatus()
    fetchAttendees()
  }

  const handleRSVPClose = () => {
    setShowRSVP(false)
  }

  const fetchEvent = useCallback(async () => {
    try {
      console.log('🔍 [EVENT DETAIL] Fetching event with ID:', eventId)
      const response = await fetch(`/api/events/${eventId}`)
      const data = await response.json()

      console.log('📡 [EVENT DETAIL] API Response:', {
        status: response.status,
        ok: response.ok,
        data: data
      })

      if (!response.ok) {
        console.error('❌ [EVENT DETAIL] API Error:', data)
        throw new Error(data.message || 'Failed to load event')
      }

      if (data.success) {
        console.log('✅ [EVENT DETAIL] Event data received:', data.data)
        console.log('🔍 [EVENT DETAIL] Event fields check:', {
          id: data.data?.id,
          title: data.data?.title,
          estimatedDuration: data.data?.estimatedDuration,
          maxCapacity: data.data?.maxCapacity,
          currentReservations: data.data?.currentReservations,
          cuisineType: data.data?.cuisineType,
          dietaryAccommodations: data.data?.dietaryAccommodations,
          location: data.data?.location
        })
        
        const eventWithRsvp = {
          ...data.data,
          userRsvpStatus: rsvpStatus
        }
        setEvent(eventWithRsvp)
      } else {
        console.error('❌ [EVENT DETAIL] API returned success=false:', data)
        throw new Error(data.message || 'Event not found')
      }
    } catch (err) {
      console.error('💥 [EVENT DETAIL] Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load event')
    } finally {
      setIsLoading(false)
    }
  }, [eventId, rsvpStatus])

  useEffect(() => {
    if (eventId) {
      fetchEvent()
      fetchAttendees()
    }
  }, [eventId, fetchEvent, fetchAttendees])

  useEffect(() => {
    if (eventId && isAuthenticated) {
      fetchRSVPStatus()
    }
  }, [eventId, isAuthenticated, fetchRSVPStatus])

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
      <div className="max-w-4xl mx-auto p-4 pt-24 space-y-6">
        <EventCard event={event} onReserve={handleReserve} />
        
        {/* Attendee List */}
        {!attendeesLoading && (
          <EventAttendeeList 
            attendees={attendees}
            maxCapacity={event.maxCapacity}
          />
        )}
        
        {attendeesLoading && (
          <div className="bg-theme-secondary rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-theme-muted">Loading attendees...</p>
          </div>
        )}
      </div>
      
      {/* RSVP Modal */}
      {event && (
        <RSVPFlow
          event={event}
          isOpen={showRSVP}
          onClose={handleRSVPClose}
          onSuccess={handleRSVPSuccess}
        />
      )}
    </>
  )
}
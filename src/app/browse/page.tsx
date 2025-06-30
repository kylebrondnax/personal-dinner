'use client'

import { useState, useEffect, useCallback } from 'react'
import { EventCard } from '@/components/EventCard'
import { RSVPFlow } from '@/components/RSVPFlow'
import { Navigation } from '@/components/Navigation'
import { PublicDinnerEvent, RSVPStatus } from '@/types'
import { useAuth } from '@/contexts/ClerkAuthContext'
import { useToast } from '@/components/Toast'

// API response type
interface EventsResponse {
  success: boolean
  data: PublicDinnerEvent[]
  error?: string
  meta?: {
    total: number
    filters: Record<string, unknown>
  }
}


export default function BrowsePage() {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<PublicDinnerEvent | null>(null)
  const [showRSVP, setShowRSVP] = useState(false)
  
  // API state
  const [events, setEvents] = useState<PublicDinnerEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rsvpStatuses, setRsvpStatuses] = useState<Record<string, RSVPStatus>>({})

  // Fetch RSVP statuses for authenticated users
  const fetchRSVPStatuses = useCallback(async () => {
    if (!isAuthenticated) {
      setRsvpStatuses({})
      return
    }
    
    try {
      const response = await fetch('/api/events/rsvp-status')
      const result = await response.json()
      
      if (response.ok && result.success) {
        // Convert date strings back to Date objects
        const statusesWithDates = Object.entries(result.data).reduce((acc, [eventId, status]) => {
          const typedStatus = status as RSVPStatus
          acc[eventId] = {
            ...typedStatus,
            rsvpedAt: new Date(typedStatus.rsvpedAt)
          }
          return acc
        }, {} as Record<string, RSVPStatus>)
        
        setRsvpStatuses(statusesWithDates)
      }
    } catch (err) {
      console.error('Error fetching RSVP statuses:', err)
      // Don't show error for RSVP status fetch failures
    }
  }, [isAuthenticated])

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCuisine) params.append('cuisineTypes', selectedCuisine)
      if (maxPrice) params.append('maxPrice', maxPrice.toString())
      
      const url = `/api/events?${params.toString()}`
      console.log('Fetching events from:', url)
      
      const response = await fetch(url)
      const result: EventsResponse = await response.json()
      
      console.log('API Response:', result)
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Failed to fetch events`)
      }
      
      if (result.success) {
        // Convert date strings back to Date objects
        const eventsWithDates = result.data.map(event => ({
          ...event,
          date: new Date(event.date),
          reservationDeadline: new Date(event.reservationDeadline),
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt)
        }))
        console.log('Events loaded:', eventsWithDates)
        setEvents(eventsWithDates)
        
        // Fetch RSVP statuses for authenticated users
        if (isAuthenticated) {
          fetchRSVPStatuses()
        }
      } else {
        throw new Error(result.error || 'API returned success: false')
      }
    } catch (err) {
      console.error('Error fetching events:', err)
      setError(err instanceof Error ? err.message : 'Failed to load events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCuisine, maxPrice, isAuthenticated, fetchRSVPStatuses])

  // Fetch events on component mount and when filters change
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Filter events based on search and filters (client-side for now)
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.chefName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCuisine = !selectedCuisine || event.cuisineType.includes(selectedCuisine)
    
    const matchesPrice = !maxPrice || event.estimatedCostPerPerson <= maxPrice

    return matchesSearch && matchesCuisine && matchesPrice
  }).map(event => ({
    ...event,
    userRsvpStatus: rsvpStatuses[event.id]
  }))

  // Get unique cuisine types for filter
  const cuisineTypes = Array.from(new Set(events.flatMap(event => event.cuisineType || [])))

  const handleReservation = (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (event) {
      // Check if user already has an RSVP for this event
      if (rsvpStatuses[eventId]) {
        const status = rsvpStatuses[eventId].status
        if (status === 'CONFIRMED') {
          showToast(`You already have a confirmed reservation for ${event.title}.`, 'info')
        } else if (status === 'WAITLIST') {
          showToast(`You're already on the waitlist for ${event.title}.`, 'info')
        }
        return
      }
      
      setSelectedEvent({
        ...event,
        userRsvpStatus: rsvpStatuses[eventId]
      })
      setShowRSVP(true)
    }
  }

  const handleRSVPSuccess = (reservationData: { message?: string; status?: string }) => {
    console.log('Reservation created:', reservationData)
    setShowRSVP(false)
    setSelectedEvent(null)
    
    // Show success message with reservation details
    const message = reservationData.message || 'Reservation confirmed!'
    const status = reservationData.status
    
    if (status === 'WAITLIST') {
      showToast(`${message} for ${selectedEvent?.title}. You're on the waitlist and will be notified if spots become available.`, 'success', 6000)
    } else {
      showToast(`${message} for ${selectedEvent?.title}! You'll receive a confirmation email shortly.`, 'success', 6000)
    }
    
    // Refresh events and RSVP statuses
    fetchEvents()
    fetchRSVPStatuses()
  }

  const handleRSVPClose = () => {
    setShowRSVP(false)
    setSelectedEvent(null)
  }

  return (
    <div className="min-h-screen bg-theme-secondary transition-colors">
      <Navigation />
      <div className="max-w-7xl mx-auto p-4 pt-20 space-y-6">
        {/* Header */}
        <header className="text-center py-8 relative">
          <h1 className="text-4xl font-bold text-theme-primary mb-3">
            Browse Family Dinners
          </h1>
          <p className="text-lg text-theme-muted max-w-2xl mx-auto">
            Discover amazing home-cooked meals from talented chefs in your area
          </p>
        </header>

        {/* Search and Filters */}
        <div className="bg-theme-elevated rounded-xl shadow-sm border border-theme-primary p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-theme-primary mb-2">
                Search dinners
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, chef, or description..."
                className="w-full px-3 py-3 input-theme rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Cuisine Filter */}
            <div>
              <label htmlFor="cuisine" className="block text-sm font-medium text-theme-primary mb-2">
                Cuisine type
              </label>
              <select
                id="cuisine"
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full px-3 py-3 input-theme rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All cuisines</option>
                {cuisineTypes.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-theme-primary mb-2">
                Max price per person
              </label>
              <select
                id="price"
                value={maxPrice || ''}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-3 input-theme rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Any price</option>
                <option value="50">Under $50</option>
                <option value="75">Under $75</option>
                <option value="100">Under $100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-theme-subtle">
            Found {filteredEvents.length} dinner{filteredEvents.length !== 1 ? 's' : ''}
          </p>
          {(searchTerm || selectedCuisine || maxPrice) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCuisine('')
                setMaxPrice(null)
              }}
              className="text-theme-subtle hover:text-theme-primary text-sm font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-theme-subtle">Loading amazing dinners...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-theme-primary mb-2">Oops! Something went wrong</h3>
            <p className="text-theme-subtle mb-4">{error}</p>
            <button
              onClick={fetchEvents}
              className="px-4 py-2 btn-primary rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Event Grid */}
        {!loading && !error && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onReserve={handleReservation}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <h3 className="text-lg font-medium text-theme-primary mb-2">No dinners found</h3>
            <p className="text-theme-subtle mb-4">
              Try adjusting your search criteria or check back later for new events.
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCuisine('')
                setMaxPrice(null)
              }}
              className="px-4 py-2 btn-primary rounded-lg transition-colors"
            >
              View all dinners
            </button>
          </div>
        )}

        {/* RSVP Modal */}
        {selectedEvent && (
          <RSVPFlow
            event={selectedEvent}
            isOpen={showRSVP}
            onClose={handleRSVPClose}
            onSuccess={handleRSVPSuccess}
          />
        )}
      </div>
    </div>
  )
}
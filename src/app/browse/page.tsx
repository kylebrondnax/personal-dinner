'use client'

import { useState, useEffect, useCallback } from 'react'
import { EventCard } from '@/components/EventCard'
import { RSVPFlow } from '@/components/RSVPFlow'
import { Navigation } from '@/components/Navigation'
import { PublicDinnerEvent } from '@/types'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<PublicDinnerEvent | null>(null)
  const [showRSVP, setShowRSVP] = useState(false)
  
  // API state
  const [events, setEvents] = useState<PublicDinnerEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
  }, [searchTerm, selectedCuisine, maxPrice])

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
  })

  // Get unique cuisine types for filter
  const cuisineTypes = Array.from(new Set(events.flatMap(event => event.cuisineType || [])))

  const handleReservation = (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    if (event) {
      setSelectedEvent(event)
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
      alert(`${message} for ${selectedEvent?.title}. You're on the waitlist and will be notified if spots become available.`)
    } else {
      alert(`${message} for ${selectedEvent?.title}! You'll receive a confirmation email shortly.`)
    }
    
    // Refresh events to show updated capacity
    fetchEvents()
  }

  const handleRSVPClose = () => {
    setShowRSVP(false)
    setSelectedEvent(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <Navigation />
      <div className="max-w-7xl mx-auto p-4 pt-20 space-y-6">
        {/* Header */}
        <header className="text-center py-8 relative">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Browse Family Dinners
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover amazing home-cooked meals from talented chefs in your area
          </p>
        </header>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Search dinners
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, chef, or description..."
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
              />
            </div>

            {/* Cuisine Filter */}
            <div>
              <label htmlFor="cuisine" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Cuisine type
              </label>
              <select
                id="cuisine"
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
              >
                <option value="">All cuisines</option>
                {cuisineTypes.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Max price per person
              </label>
              <select
                id="price"
                value={maxPrice || ''}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
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
          <p className="text-gray-600 dark:text-gray-400">
            Found {filteredEvents.length} dinner{filteredEvents.length !== 1 ? 's' : ''}
          </p>
          {(searchTerm || selectedCuisine || maxPrice) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCuisine('')
                setMaxPrice(null)
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading amazing dinners...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchEvents}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No dinners found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search criteria or check back later for new events.
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCuisine('')
                setMaxPrice(null)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
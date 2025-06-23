'use client'

import { useState, useEffect } from 'react'
import { EventCard } from '@/components/EventCard'
import { RSVPFlow } from '@/components/RSVPFlow'
import { ThemeToggle } from '@/components/ThemeToggle'
import { PublicDinnerEvent } from '@/types'

// API response type
interface EventsResponse {
  success: boolean
  data: PublicDinnerEvent[]
  error?: string
  meta?: {
    total: number
    filters: any
  }
}

// Mock data - keeping as fallback
const mockEvents: PublicDinnerEvent[] = [
  {
    id: '1',
    title: 'Prime Rib Dinner',
    description: 'A classic prime rib dinner with Yorkshire pudding, roasted vegetables, and red wine reduction. Perfect for a special evening with friends.',
    chefId: 'chef1',
    chefName: 'Sarah Johnson',
    chefPhoto: '/api/placeholder/48/48',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    estimatedDuration: 180, // 3 hours
    maxCapacity: 8,
    currentReservations: 5,
    estimatedCostPerPerson: 65.00,
    cuisineType: ['American', 'Comfort Food'],
    dietaryAccommodations: ['Gluten-free options'],
    status: 'open',
    reservationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    location: {
      neighborhood: 'Capitol Hill',
      city: 'Seattle'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Italian Night - Homemade Pasta',
    description: 'Fresh handmade pasta with authentic Italian sauces. Multiple courses including antipasti, pasta course, and tiramisu for dessert.',
    chefId: 'chef2',
    chefName: 'Marco Rossi',
    chefPhoto: '/api/placeholder/48/48',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    estimatedDuration: 150, // 2.5 hours
    maxCapacity: 6,
    currentReservations: 2,
    estimatedCostPerPerson: 45.00,
    cuisineType: ['Italian'],
    dietaryAccommodations: ['Vegetarian', 'Vegan options'],
    status: 'open',
    reservationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    location: {
      neighborhood: 'Fremont',
      city: 'Seattle'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    title: 'Korean BBQ & Banchan',
    description: 'Traditional Korean BBQ with house-made banchan (side dishes). Interactive cooking experience with premium wagyu beef.',
    chefId: 'chef3',
    chefName: 'David Kim',
    chefPhoto: '/api/placeholder/48/48',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    estimatedDuration: 120, // 2 hours
    maxCapacity: 4,
    currentReservations: 4,
    estimatedCostPerPerson: 75.00,
    cuisineType: ['Korean', 'BBQ'],
    dietaryAccommodations: ['Vegetarian options'],
    status: 'full',
    reservationDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    location: {
      neighborhood: 'Ballard',
      city: 'Seattle'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    title: 'French Bistro Experience',
    description: 'Classic French bistro dinner featuring coq au vin, ratatouille, and crème brûlée. Wine pairings included.',
    chefId: 'chef4',
    chefName: 'Amélie Dubois',
    chefPhoto: '/api/placeholder/48/48',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    estimatedDuration: 210, // 3.5 hours
    maxCapacity: 6,
    currentReservations: 1,
    estimatedCostPerPerson: 85.00,
    cuisineType: ['French'],
    dietaryAccommodations: ['Pescatarian options'],
    status: 'open',
    reservationDeadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    location: {
      neighborhood: 'Queen Anne',
      city: 'Seattle'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

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
  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCuisine) params.append('cuisineTypes', selectedCuisine)
      if (maxPrice) params.append('maxPrice', maxPrice.toString())
      
      const response = await fetch(`/api/events?${params.toString()}`)
      const result: EventsResponse = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch events')
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
        setEvents(eventsWithDates)
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (err) {
      console.error('Error fetching events:', err)
      setError(err instanceof Error ? err.message : 'Failed to load events')
      // Fallback to mock data on error
      setEvents(mockEvents)
    } finally {
      setLoading(false)
    }
  }

  // Fetch events on component mount and when filters change
  useEffect(() => {
    fetchEvents()
  }, [searchTerm, selectedCuisine, maxPrice])

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

  const handleRSVPSuccess = (reservationData: any) => {
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
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <header className="text-center py-8 relative">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
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
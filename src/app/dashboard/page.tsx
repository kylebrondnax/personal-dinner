'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/ClerkAuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  maxGuests: number
  currentGuests: number
  estimatedCost: number
  actualCost?: number
  imageUrl?: string
  chefId: string
  chefName: string
}

interface EventWithRole extends Event {
  userRole: 'host' | 'attendee'
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<EventWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'hosting' | 'attending'>('hosting')

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  const loadUserEvents = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Load events user is hosting
      const hostingResponse = await fetch('/api/chef/events', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      })
      
      // Load events user is attending (would need new API endpoint)
      const attendingResponse = await fetch('/api/user/attending', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      })

      const hostingEvents = hostingResponse.ok ? await hostingResponse.json() : []
      const attendingEvents = attendingResponse.ok ? await attendingResponse.json() : []

      const combinedEvents: EventWithRole[] = [
        ...hostingEvents.map((event: Event) => ({ ...event, userRole: 'host' as const })),
        ...attendingEvents.map((event: Event) => ({ ...event, userRole: 'attendee' as const }))
      ]

      setEvents(combinedEvents)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserEvents()
  }, [user])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  const hostingEvents = events.filter(event => event.userRole === 'host')
  const attendingEvents = events.filter(event => event.userRole === 'attendee')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Dinners
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage dinners you&apos;re hosting and attending
            </p>
          </div>
          
          <Link
            href="/create-event"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Host a Dinner
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-8 w-fit">
          <button
            onClick={() => setActiveTab('hosting')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'hosting'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Hosting ({hostingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('attending')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'attending'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Attending ({attendingEvents.length})
          </button>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your dinners...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'hosting' && (
              <>
                {hostingEvents.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No dinners yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Start hosting amazing dinners for your friends and family.
                    </p>
                    <Link
                      href="/create-event"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Host Your First Dinner
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {hostingEvents.map((event) => (
                      <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {event.imageUrl && (
                          <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover" />
                        )}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {event.title}
                            </h3>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Host
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                            {event.description}
                          </p>
                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2">📅</span>
                              {new Date(event.date).toLocaleDateString()} at {event.time}
                            </div>
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2">👥</span>
                              {event.currentGuests}/{event.maxGuests} guests
                            </div>
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2">💰</span>
                              ${event.actualCost || event.estimatedCost} per person
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Link
                              href={`/events/${event.id}/manage`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Manage Event →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'attending' && (
              <>
                {attendingEvents.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No reservations yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Browse amazing dinners hosted by others in your community.
                    </p>
                    <Link
                      href="/browse"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse Dinners
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {attendingEvents.map((event) => (
                      <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {event.imageUrl && (
                          <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover" />
                        )}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {event.title}
                            </h3>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Guest
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            Hosted by {event.chefName}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                            {event.description}
                          </p>
                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2">📅</span>
                              {new Date(event.date).toLocaleDateString()} at {event.time}
                            </div>
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2">📍</span>
                              {event.location}
                            </div>
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2">💰</span>
                              ${event.actualCost || event.estimatedCost} per person
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Link
                              href={`/events/${event.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View Details →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
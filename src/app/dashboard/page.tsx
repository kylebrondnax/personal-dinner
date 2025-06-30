'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/ClerkAuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { EventShareButton } from '@/components/EventShareButton'
import { Navigation } from '@/components/Navigation'

interface Event {
  id: string
  title: string
  description?: string
  date: string
  location: string | { neighborhood?: string; city?: string }
  maxCapacity: number
  currentReservations: number
  estimatedCostPerPerson: number
  actualCostPerPerson?: number
  imageUrl?: string
  chefId?: string
  chefName?: string
  status?: 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED' | 'POLL_ACTIVE'
  useAvailabilityPoll?: boolean
  pollStatus?: 'ACTIVE' | 'CLOSED' | 'FINALIZED'
  pollDeadline?: string
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
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Date TBD'
    
    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) {
        return 'Date TBD'
      }
      
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }).format(dateObj)
    } catch {
      return 'Date TBD'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'badge-success'
      case 'FULL':
        return 'badge-warning'
      case 'COMPLETED':
        return 'badge-info'
      case 'CANCELLED':
        return 'badge-error'
      case 'POLL_ACTIVE':
        return 'badge-purple'
      default:
        return 'badge-default'
    }
  }

  const formatLocation = (location: string | { neighborhood?: string; city?: string } | null) => {
    if (typeof location === 'string') {
      return location
    }
    if (location && typeof location === 'object') {
      const parts = []
      if (location.neighborhood) parts.push(location.neighborhood)
      if (location.city) parts.push(location.city)
      return parts.join(', ')
    }
    return ''
  }

  const handleEditEvent = (eventId: string) => {
    router.push(`/events/${eventId}/edit`)
  }

  const handleCancelEvent = async (eventId: string) => {
    setCancelLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })

      if (response.ok) {
        // Refresh the events list
        await loadUserEvents()
        setShowCancelModal(null)
      } else {
        console.error('Failed to cancel event')
        // TODO: Add toast notification
      }
    } catch (error) {
      console.error('Error cancelling event:', error)
      // TODO: Add toast notification
    } finally {
      setCancelLoading(false)
    }
  }

  const handleViewResponses = (eventId: string) => {
    router.push(`/events/${eventId}/poll/responses`)
  }

  const handleViewReceipt = (eventId: string) => {
    router.push(`/events/${eventId}/receipt`)
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  const loadUserEvents = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Load events user is hosting
      const hostingResponse = await fetch('/api/chef/events')
      
      // Load events user is attending
      const attendingResponse = await fetch('/api/user/attending')

      const hostingData = hostingResponse.ok ? await hostingResponse.json() : { success: false, data: [] }
      const attendingData = attendingResponse.ok ? await attendingResponse.json() : { success: false, data: [] }

      const hostingEvents = hostingData.success ? hostingData.data : []
      const attendingEvents = attendingData.success ? attendingData.data : []

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
  }, [user])

  useEffect(() => {
    loadUserEvents()
  }, [loadUserEvents])

  if (isLoading || !user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-theme-muted">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  const hostingEvents = events.filter(event => event.userRole === 'host')
  const attendingEvents = events.filter(event => event.userRole === 'attendee')

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-theme-secondary pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary">
                My Dinners
              </h1>
              <p className="text-theme-muted mt-1 sm:mt-2 text-sm sm:text-base">
                Manage dinners you&apos;re hosting and attending
              </p>
            </div>
          
          <Link
            href="/create-event"
            className="btn-primary px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-center whitespace-nowrap"
          >
            Host a Dinner
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 tab-container mb-6 sm:mb-8 w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('hosting')}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-md font-medium transition-colors text-sm sm:text-base ${
              activeTab === 'hosting' ? 'tab-active' : 'tab-inactive'
            }`}
          >
            Hosting ({hostingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('attending')}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-md font-medium transition-colors text-sm sm:text-base ${
              activeTab === 'attending' ? 'tab-active' : 'tab-inactive'
            }`}
          >
            Attending ({attendingEvents.length})
          </button>
        </div>

        {/* Quick Stats for Hosting Tab */}
        {activeTab === 'hosting' && !loading && hostingEvents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="stats-card p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-lg" style={{backgroundColor: 'rgba(161, 92, 34, 0.1)'}}>
                  <span className="text-xl sm:text-2xl">📅</span>
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm text-theme-subtle">Active Events</p>
                  <p className="text-xl sm:text-2xl font-bold text-theme-primary">
                    {hostingEvents.filter(e => e.status === 'OPEN' || e.status === 'FULL').length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="stats-card p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-lg" style={{backgroundColor: 'rgba(179, 138, 105, 0.2)'}}>
                  <span className="text-xl sm:text-2xl">👥</span>
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm text-theme-subtle">Total Guests</p>
                  <p className="text-xl sm:text-2xl font-bold text-theme-primary">
                    {hostingEvents.reduce((sum, e) => sum + (e.currentReservations || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="stats-card p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-lg" style={{backgroundColor: 'rgba(139, 108, 94, 0.2)'}}>
                  <span className="text-xl sm:text-2xl">🍽️</span>
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm text-theme-subtle">Completed Dinners</p>
                  <p className="text-xl sm:text-2xl font-bold text-theme-primary">
                    {hostingEvents.filter(e => e.status === 'COMPLETED').length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your dinners...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'hosting' && (
              <>
                {hostingEvents.length === 0 ? (
                  <div className="text-center py-12 bg-theme-card rounded-lg">
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
                      className="inline-flex items-center px-4 py-2 btn-primary rounded-lg transition-colors"
                    >
                      Host Your First Dinner
                    </Link>
                  </div>
                ) : (
                  <div className="event-card">
                    <div className="p-6 border-b border-theme-primary">
                      <h2 className="text-xl font-bold text-theme-primary">Your Hosted Dinners</h2>
                    </div>
                    <div className="divide-y border-theme-primary">
                      {hostingEvents.map((event) => (
                        <div key={event.id} className="p-4 sm:p-6 event-item-hover transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                <h3 className="text-base sm:text-lg font-semibold text-theme-primary">
                                  {event.useAvailabilityPoll && '📊 '}
                                  {event.title}
                                </h3>
                                {event.status && (
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${getStatusColor(event.status)}`}>
                                    {event.status === 'POLL_ACTIVE' ? 'POLL_ACTIVE' : event.status}
                                  </span>
                                )}
                              </div>
                              
                              <div className="space-y-1 text-xs sm:text-sm text-theme-muted">
                                {event.useAvailabilityPoll && event.pollDeadline ? (
                                  <p>🗳️ Poll deadline: {formatDate(event.pollDeadline)}</p>
                                ) : (
                                  <p>📅 {formatDate(event.date)}</p>
                                )}
                                <p>👥 {event.currentReservations || 0}/{event.maxCapacity || 0} guests</p>
                                <p>📍 {formatLocation(event.location)}</p>
                                <p>
                                  💰 {formatCurrency(event.estimatedCostPerPerson || 0)} per person
                                  {event.actualCostPerPerson && (
                                    <span className="text-green-600 dark:text-green-400 ml-2">
                                      (actual: {formatCurrency(event.actualCostPerPerson)})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-1 sm:space-x-2">
                              <EventShareButton
                                eventId={event.id}
                                eventTitle={event.title}
                                isPollEvent={event.useAvailabilityPoll || false}
                              />
                              
                              {event.status === 'OPEN' && (
                                <>
                                  <button 
                                    onClick={() => handleEditEvent(event.id)}
                                    className="px-3 py-2 text-xs sm:text-sm badge-info rounded-md"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => setShowCancelModal(event.id)}
                                    className="px-3 py-2 text-xs sm:text-sm badge-error rounded-md"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              
                              {event.status === 'POLL_ACTIVE' && (
                                <button 
                                  onClick={() => handleViewResponses(event.id)}
                                  className="px-3 py-2 text-xs sm:text-sm badge-purple rounded-md"
                                >
                                  View Responses
                                </button>
                              )}
                              
                              {event.status === 'COMPLETED' && (
                                <button 
                                  onClick={() => handleViewReceipt(event.id)}
                                  className="px-3 py-2 text-xs sm:text-sm badge-success rounded-md"
                                >
                                  View Receipt
                                </button>
                              )}
                              
                              <Link
                                href={`/events/${event.id}`}
                                className="px-3 py-2 text-xs sm:text-sm badge-default rounded-md"
                              >
                                Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'attending' && (
              <>
                {attendingEvents.length === 0 ? (
                  <div className="text-center py-12 bg-theme-card rounded-lg">
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
                      className="inline-flex items-center px-4 py-2 btn-primary rounded-lg transition-colors"
                    >
                      Browse Dinners
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {attendingEvents.map((event) => (
                      <div key={event.id} className="event-card overflow-hidden event-item-hover">
                        {event.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover" />
                        )}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-theme-primary">
                              {event.title}
                            </h3>
                            <span className="text-xs badge-info px-2 py-1 rounded-full">
                              Guest
                            </span>
                          </div>
                          <p className="text-theme-muted text-sm mb-2">
                            Hosted by {event.chefName}
                          </p>
                          <p className="text-theme-muted text-sm mb-4 line-clamp-2">
                            {event.description}
                          </p>
                          <div className="space-y-2 text-sm text-theme-muted">
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2">📅</span>
                              {formatDate(event.date)}
                            </div>
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2">📍</span>
                              {formatLocation(event.location)}
                            </div>
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2">💰</span>
                              {formatCurrency(event.actualCostPerPerson || event.estimatedCostPerPerson)} per person
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Link
                              href={`/events/${event.id}`}
                              className="text-theme-subtle hover:text-theme-primary text-sm font-medium"
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

      {/* Cancel Event Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-theme-card rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-theme-primary mb-4">
              Cancel Event
            </h3>
            <p className="text-theme-muted mb-6">
              Are you sure you want to cancel this event? This action cannot be undone. 
              All attendees will be notified of the cancellation.
            </p>
            <div className="flex space-x-4 justify-end">
              <button
                onClick={() => setShowCancelModal(null)}
                disabled={cancelLoading}
                className="btn-cancel px-4 py-2 rounded-lg transition-colors"
              >
                Keep Event
              </button>
              <button
                onClick={() => handleCancelEvent(showCancelModal)}
                disabled={cancelLoading}
                className="btn-danger px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
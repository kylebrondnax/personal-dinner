'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/ClerkAuthContext'
import { Navigation } from '@/components/Navigation'
import { EventShareButton } from '@/components/EventShareButton'

interface DashboardEvent {
  id: string
  title: string
  date: Date
  maxCapacity: number
  currentReservations: number
  status: 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED' | 'POLL_ACTIVE'
  estimatedCostPerPerson: number
  actualCostPerPerson?: number
  useAvailabilityPoll?: boolean
  pollStatus?: 'ACTIVE' | 'CLOSED' | 'FINALIZED'
  pollDeadline?: Date
  location?: {
    neighborhood: string
    city: string
  }
  createdAt: Date
  updatedAt: Date
}

export default function ChefDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<DashboardEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Load chef's events
  useEffect(() => {
    if (user) {
      loadChefEvents()
    }
  }, [user]) // loadChefEvents recreated when user changes

  const loadChefEvents = async () => {
    try {
      setIsLoading(true)
      
      // Fetch chef's events from API
      const response = await fetch(`/api/chef/events?chefId=${user!.id}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to load events')
      }
      
      if (result.success) {
        // Convert date strings back to Date objects, handling null values
        const eventsWithDates = result.data.map((event: DashboardEvent) => ({
          ...event,
          date: event.date ? new Date(event.date) : new Date(),
          pollDeadline: event.pollDeadline ? new Date(event.pollDeadline) : undefined,
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt)
        }))
        setEvents(eventsWithDates)
      } else {
        throw new Error(result.message || 'Failed to load events')
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date)
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
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'FULL':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'POLL_ACTIVE':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <Navigation />
      <div className="max-w-7xl mx-auto p-4 pt-20">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center space-x-4">
            {user.profile?.avatarUrl && (
              <img 
                src={user.profile.avatarUrl} 
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your dinners and connect with food lovers
              </p>
            </div>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {events.filter(e => e.status === 'OPEN' || e.status === 'FULL').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Guests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {events.reduce((sum, e) => sum + e.currentReservations, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <span className="text-2xl">🍽️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Dinners</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {events.filter(e => e.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => router.push('/chef/create-event')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <span className="mr-2">+</span>
            Create New Dinner
          </button>
          <button
            onClick={() => router.push('/browse')}
            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Browse All Dinners
          </button>
        </div>

        {/* Events List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Dinners</h2>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🍽️</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No dinners yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first dinner to start connecting with food lovers in your area.
              </p>
              <button
                onClick={() => router.push('/chef/create-event')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create Your First Dinner
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {events.map((event) => (
                <div key={event.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {event.useAvailabilityPoll && '📊 '}
                          {event.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                          {event.status === 'POLL_ACTIVE' ? 'POLL_ACTIVE' : event.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {event.useAvailabilityPoll ? (
                          <p>🗳️ Poll deadline: {event.pollDeadline ? formatDate(event.pollDeadline) : 'Not set'}</p>
                        ) : (
                          <p>📅 {formatDate(event.date)}</p>
                        )}
                        <p>👥 {event.currentReservations}/{event.maxCapacity} guests</p>
                        {event.location && (
                          <p>📍 {event.location.neighborhood}, {event.location.city}</p>
                        )}
                        <p>
                          💰 {formatCurrency(event.estimatedCostPerPerson)} per person
                          {event.actualCostPerPerson && (
                            <span className="text-green-600 dark:text-green-400 ml-2">
                              (actual: {formatCurrency(event.actualCostPerPerson)})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Share button for all events */}
                      <EventShareButton
                        eventId={event.id}
                        eventTitle={event.title}
                        isPollEvent={event.useAvailabilityPoll || false}
                      />
                      
                      {event.status === 'OPEN' && (
                        <>
                          <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                            Edit
                          </button>
                          <button className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                            Cancel
                          </button>
                        </>
                      )}
                      
                      {event.status === 'POLL_ACTIVE' && (
                        <button className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                          View Responses
                        </button>
                      )}
                      
                      {event.status === 'COMPLETED' && (
                        <button className="px-3 py-1 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                          View Receipt
                        </button>
                      )}
                      
                      <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
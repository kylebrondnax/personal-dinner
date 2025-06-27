'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/ClerkAuthContext'
import { Navigation } from '@/components/Navigation'
import { AvailabilityPollSection } from '@/components/AvailabilityPollSection'
import { EventFormDataWithPolling, ProposedDateTime } from '@/types'

const cuisineOptions = [
  'American', 'Italian', 'French', 'Mexican', 'Chinese', 'Japanese', 'Korean', 
  'Thai', 'Indian', 'Mediterranean', 'Greek', 'Spanish', 'BBQ', 'Comfort Food', 
  'Vegetarian', 'Vegan', 'Seafood', 'Farm-to-Table'
]

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-free options', 'Dairy-free options', 
  'Nut-free options', 'Pescatarian options', 'Halal', 'Kosher'
]

interface EventData {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: number
  maxCapacity: number
  estimatedCostPerPerson: number
  location: {
    neighborhood: string
    city: string
    address?: string
    showFullAddress?: boolean
  }
  cuisineTypes: string[]
  dietaryAccommodations: string[]
  useAvailabilityPoll: boolean
  pollDeadline?: string
  pollDateRange?: {
    startDate: string
    endDate: string
  }
  chefAvailability?: ProposedDateTime[]
}

export default function EditEventPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<EventFormDataWithPolling>({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 180,
    maxCapacity: 8,
    estimatedCostPerPerson: 25,
    location: {
      neighborhood: '',
      city: '',
      address: '',
      showFullAddress: false
    },
    cuisineTypes: [],
    dietaryAccommodations: [],
    useAvailabilityPoll: false,
    pollDeadline: '',
    pollDateRange: {
      startDate: '',
      endDate: ''
    },
    chefAvailability: []
  })

  // Load event data
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (user && eventId) {
      loadEventData()
    }
  }, [user, authLoading, eventId, router, loadEventData])

  const loadEventData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${eventId}`)
      
      if (!response.ok) {
        throw new Error('Failed to load event data')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load event')
      }

      const event = data.data
      setEventData(event)

      // Populate form with existing data
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        time: event.time || '',
        duration: event.duration || 180,
        maxCapacity: event.maxCapacity || 8,
        estimatedCostPerPerson: event.estimatedCostPerPerson || 25,
        location: {
          neighborhood: event.location?.neighborhood || '',
          city: event.location?.city || '',
          address: event.location?.address || '',
          showFullAddress: event.location?.showFullAddress || false
        },
        cuisineTypes: event.cuisineTypes || [],
        dietaryAccommodations: event.dietaryAccommodations || [],
        useAvailabilityPoll: event.useAvailabilityPoll || false,
        pollDeadline: event.pollDeadline ? new Date(event.pollDeadline).toISOString().split('T')[0] : '',
        pollDateRange: {
          startDate: event.pollDateRange?.startDate || '',
          endDate: event.pollDateRange?.endDate || ''
        },
        chefAvailability: event.chefAvailability || []
      })

    } catch (error) {
      console.error('Error loading event:', error)
      setError(error instanceof Error ? error.message : 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          chefId: user?.id,
          chefName: user?.name,
          chefEmail: user?.email
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/dashboard')
      } else {
        setError(data.message || 'Failed to update event')
      }
    } catch (error) {
      console.error('Error updating event:', error)
      setError('Failed to update event. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
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

  if (error && !eventData) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-theme-primary mb-2">Error Loading Event</h3>
            <p className="text-theme-muted mb-4">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-theme-primary">
              Edit Event: {eventData?.title}
            </h1>
            <p className="text-theme-muted mt-2">
              Update your event details
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="form-section">
              <h2 className="text-xl font-semibold text-theme-primary mb-6">Event Details</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="title" className="block form-label mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full px-3 py-3 border rounded-lg input-theme"
                    placeholder="e.g., Italian Night - Homemade Pasta"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block form-label mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-3 border rounded-lg input-theme"
                    placeholder="Tell your guests what to expect..."
                  />
                </div>

                {!formData.useAvailabilityPoll && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="block form-label mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        id="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        required={!formData.useAvailabilityPoll}
                        className="w-full px-3 py-3 border rounded-lg input-theme"
                      />
                    </div>

                    <div>
                      <label htmlFor="time" className="block form-label mb-2">
                        Time *
                      </label>
                      <input
                        type="time"
                        id="time"
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        required={!formData.useAvailabilityPoll}
                        className="w-full px-3 py-3 border rounded-lg input-theme"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="duration" className="block form-label mb-2">
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      id="duration"
                      min="60"
                      max="480"
                      step="30"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      required
                      className="w-full px-3 py-3 border rounded-lg input-theme"
                    />
                  </div>

                  <div>
                    <label htmlFor="maxCapacity" className="block form-label mb-2">
                      Max Guests *
                    </label>
                    <input
                      type="number"
                      id="maxCapacity"
                      min="2"
                      max="20"
                      value={formData.maxCapacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                      required
                      className="w-full px-3 py-3 border rounded-lg input-theme"
                    />
                  </div>

                  <div>
                    <label htmlFor="estimatedCostPerPerson" className="block form-label mb-2">
                      Cost per Person ($) *
                    </label>
                    <input
                      type="number"
                      id="estimatedCostPerPerson"
                      min="5"
                      max="200"
                      step="5"
                      value={formData.estimatedCostPerPerson}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedCostPerPerson: parseInt(e.target.value) }))}
                      required
                      className="w-full px-3 py-3 border rounded-lg input-theme"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="form-section">
              <h2 className="text-xl font-semibold text-theme-primary mb-6">Location</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="neighborhood" className="block form-label mb-2">
                    Neighborhood *
                  </label>
                  <input
                    type="text"
                    id="neighborhood"
                    value={formData.location.neighborhood}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, neighborhood: e.target.value }
                    }))}
                    required
                    className="w-full px-3 py-3 border rounded-lg input-theme"
                    placeholder="e.g., Capitol Hill"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block form-label mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.location.city}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, city: e.target.value }
                    }))}
                    required
                    className="w-full px-3 py-3 border rounded-lg input-theme"
                    placeholder="e.g., Seattle"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="address" className="block form-label mb-2">
                  Address (optional)
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, address: e.target.value }
                  }))}
                  className="w-full px-3 py-3 border rounded-lg input-theme"
                  placeholder="Full address (will be shared with confirmed guests)"
                />
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.location.showFullAddress}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, showFullAddress: e.target.checked }
                    }))}
                    className="checkbox-theme mr-2"
                  />
                  <span className="form-label">Show full address publicly (recommended: keep unchecked for safety)</span>
                </label>
              </div>
            </div>

            {/* Cuisine and Dietary */}
            <div className="form-section">
              <h2 className="text-xl font-semibold text-theme-primary mb-6">Menu Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block form-label mb-3">
                    Cuisine Types (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {cuisineOptions.map((cuisine) => (
                      <label key={cuisine} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.cuisineTypes.includes(cuisine)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ 
                                ...prev, 
                                cuisineTypes: [...prev.cuisineTypes, cuisine] 
                              }))
                            } else {
                              setFormData(prev => ({ 
                                ...prev, 
                                cuisineTypes: prev.cuisineTypes.filter(c => c !== cuisine) 
                              }))
                            }
                          }}
                          className="checkbox-theme mr-2"
                        />
                        <span className="text-sm text-theme-secondary">{cuisine}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block form-label mb-3">
                    Dietary Accommodations (select all you can provide)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {dietaryOptions.map((dietary) => (
                      <label key={dietary} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.dietaryAccommodations.includes(dietary)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ 
                                ...prev, 
                                dietaryAccommodations: [...prev.dietaryAccommodations, dietary] 
                              }))
                            } else {
                              setFormData(prev => ({ 
                                ...prev, 
                                dietaryAccommodations: prev.dietaryAccommodations.filter(d => d !== dietary) 
                              }))
                            }
                          }}
                          className="checkbox-theme mr-2"
                        />
                        <span className="text-sm text-theme-secondary">{dietary}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Poll Section */}
            <AvailabilityPollSection
              enabled={formData.useAvailabilityPoll}
              onToggle={(enabled) => setFormData(prev => ({ ...prev, useAvailabilityPoll: enabled }))}
              pollDeadline={formData.pollDeadline}
              onDeadlineChange={(deadline) => setFormData(prev => ({ ...prev, pollDeadline: deadline }))}
              pollDateRange={formData.pollDateRange}
              onDateRangeChange={(range) => setFormData(prev => ({ ...prev, pollDateRange: range }))}
              chefAvailability={formData.chefAvailability}
              onChefAvailabilityChange={(availability) => setFormData(prev => ({ ...prev, chefAvailability: availability }))}
            />

            {/* Submit */}
            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="btn-cancel px-6 py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
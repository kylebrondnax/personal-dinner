'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '@/components/ThemeToggle'

interface EventFormData {
  title: string
  description: string
  date: string
  time: string
  duration: number
  maxCapacity: number
  estimatedCostPerPerson: number
  cuisineTypes: string[]
  dietaryAccommodations: string[]
  location: {
    address: string
    neighborhood: string
    city: string
    showFullAddress: boolean
  }
  reservationDeadline: string
}

const cuisineOptions = [
  'American', 'Italian', 'French', 'Mexican', 'Chinese', 'Japanese', 'Korean', 
  'Thai', 'Indian', 'Mediterranean', 'Greek', 'Spanish', 'BBQ', 'Comfort Food', 
  'Vegetarian', 'Vegan', 'Seafood', 'Farm-to-Table'
]

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-free options', 'Dairy-free options', 
  'Nut-free options', 'Pescatarian options', 'Halal', 'Kosher'
]

export default function CreateEventPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 180, // 3 hours default
    maxCapacity: 6,
    estimatedCostPerPerson: 50,
    cuisineTypes: [],
    dietaryAccommodations: [],
    location: {
      address: '',
      neighborhood: '',
      city: 'Seattle',
      showFullAddress: false
    },
    reservationDeadline: ''
  })

  // Redirect if not authenticated or not a chef
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'CHEF')) {
      router.push('/chef/auth')
    }
  }, [user, authLoading, router])

  // Set default reservation deadline to 1 day before event
  useEffect(() => {
    if (formData.date) {
      const eventDate = new Date(formData.date)
      const deadline = new Date(eventDate)
      deadline.setDate(deadline.getDate() - 1)
      setFormData(prev => ({
        ...prev,
        reservationDeadline: deadline.toISOString().split('T')[0]
      }))
    }
  }, [formData.date])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }))
    }
    setError('')
  }

  const handleCheckboxChange = (field: 'cuisineTypes' | 'dietaryAccommodations', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.title || !formData.date || !formData.time) {
        throw new Error('Please fill in all required fields')
      }

      if (formData.cuisineTypes.length === 0) {
        throw new Error('Please select at least one cuisine type')
      }

      const eventDateTime = new Date(`${formData.date}T${formData.time}`)
      const now = new Date()
      
      if (eventDateTime <= now) {
        throw new Error('Event date must be in the future')
      }

      const deadlineDate = new Date(formData.reservationDeadline)
      if (deadlineDate >= eventDateTime) {
        throw new Error('Reservation deadline must be before the event date')
      }

      // Prepare API request data
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: `${formData.date}T${formData.time}`,
        duration: formData.duration,
        maxCapacity: formData.maxCapacity,
        estimatedCostPerPerson: formData.estimatedCostPerPerson,
        chefId: user!.id, // From auth context
        cuisineTypes: formData.cuisineTypes,
        dietaryAccommodations: formData.dietaryAccommodations,
        reservationDeadline: formData.reservationDeadline,
        location: formData.location
      }

      // Create event via API
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create event')
      }

      if (result.success) {
        // Redirect to dashboard with success
        router.push('/chef/dashboard?created=true')
      } else {
        throw new Error(result.message || 'Failed to create event')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'CHEF') {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="max-w-3xl mx-auto p-4 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Dinner
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Set up your dinner event and start connecting with food lovers
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Dinner Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
                    placeholder="e.g., Homemade Italian Pasta Night"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
                    placeholder="Describe your dinner, menu highlights, and what guests can expect..."
                  />
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Date & Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="60"
                    max="480"
                    step="30"
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Pricing */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Capacity & Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="maxCapacity" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    id="maxCapacity"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleInputChange}
                    min="2"
                    max="20"
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="estimatedCostPerPerson" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Estimated Cost per Person ($)
                  </label>
                  <input
                    type="number"
                    id="estimatedCostPerPerson"
                    name="estimatedCostPerPerson"
                    value={formData.estimatedCostPerPerson}
                    onChange={handleInputChange}
                    min="10"
                    max="200"
                    step="5"
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Cuisine Types */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Cuisine & Dietary Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Cuisine Types * (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {cuisineOptions.map((cuisine) => (
                      <label key={cuisine} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.cuisineTypes.includes(cuisine)}
                          onChange={() => handleCheckboxChange('cuisineTypes', cuisine)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-900 dark:text-white">{cuisine}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Dietary Accommodations (optional)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {dietaryOptions.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.dietaryAccommodations.includes(option)}
                          onChange={() => handleCheckboxChange('dietaryAccommodations', option)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-900 dark:text-white">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Location</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location.neighborhood" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Neighborhood
                    </label>
                    <input
                      type="text"
                      id="location.neighborhood"
                      name="location.neighborhood"
                      value={formData.location.neighborhood}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
                      placeholder="e.g., Capitol Hill"
                    />
                  </div>

                  <div>
                    <label htmlFor="location.city" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      id="location.city"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
                      placeholder="Seattle"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location.address" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Full Address (private until booking confirmed)
                  </label>
                  <input
                    type="text"
                    id="location.address"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
                    placeholder="123 Main St, Seattle, WA 98101"
                  />
                </div>
              </div>
            </div>

            {/* Reservation Deadline */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Reservation Settings</h2>
              <div>
                <label htmlFor="reservationDeadline" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Reservation Deadline
                </label>
                <input
                  type="date"
                  id="reservationDeadline"
                  name="reservationDeadline"
                  value={formData.reservationDeadline}
                  onChange={handleInputChange}
                  max={formData.date}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Guests must RSVP by this date
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Dinner...
                  </div>
                ) : (
                  'Create Dinner'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/chef/dashboard')}
                className="py-3 px-6 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
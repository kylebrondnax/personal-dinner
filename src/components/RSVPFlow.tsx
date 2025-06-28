'use client'

import React, { useState } from 'react'
import { PublicDinnerEvent } from '@/types'
import { cn, formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/ClerkAuthContext'

interface RSVPFlowProps {
  event: PublicDinnerEvent
  isOpen: boolean
  onClose: () => void
  onSuccess: (reservationData: ReservationFormData) => void
}

interface ReservationFormData {
  attendeeName: string
  attendeeEmail: string
  dietaryRestrictions: string
  guestCount: number
  agreedToCost: boolean
  phoneNumber?: string
  reservationId?: string
  status?: string
  message?: string
}

export function RSVPFlow({ event, isOpen, onClose, onSuccess }: RSVPFlowProps) {
  const { user, isAuthenticated } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<ReservationFormData>({
    attendeeName: user?.name || '',
    attendeeEmail: user?.email || '',
    dietaryRestrictions: '',
    guestCount: 1,
    agreedToCost: false,
    phoneNumber: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Require authentication for RSVP
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to make a reservation for this dinner.
            </p>
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => window.location.href = '/sign-in'}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const spotsAvailable = event.maxCapacity - event.currentReservations
  const totalCost = event.estimatedCostPerPerson * formData.guestCount

  if (!isOpen) return null

  const handleInputChange = (field: keyof ReservationFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const handlePrevStep = () => {
    if (step > 1) {
      // If we're at step 2 and user has auth data, go back to step 1 anyway
      // to allow them to review/edit their info
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          guestCount: formData.guestCount,
          dietaryRestrictions: formData.dietaryRestrictions || undefined,
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create reservation')
      }

      if (result.success) {
        onSuccess({
          ...formData,
          reservationId: result.data.id,
          status: result.data.status,
          message: result.message
        })
      } else {
        throw new Error(result.message || 'Reservation failed')
      }
    } catch (error) {
      console.error('Reservation error:', error)
      // Show error to user instead of calling onSuccess
      alert(error instanceof Error ? error.message : 'Failed to create reservation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStep1Valid = true // For authenticated users, step 1 is always valid
  const isStep2Valid = formData.guestCount >= 1 && formData.guestCount <= spotsAvailable
  const isStep3Valid = formData.agreedToCost

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reserve Your Spot</h2>
            <p className="text-gray-600">{event.title} by {event.chefName}</p>
            <p className="text-sm text-blue-600">Reserving as {user?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum, index) => (
              <React.Fragment key={stepNum}>
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                )}>
                  {stepNum}
                </div>
                {index < 2 && (
                  <div className={cn(
                    'h-1 flex-1 mx-4',
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Additional Info</span>
            <span>Party Size</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-800 font-medium">
                        ✓ Your basic info is ready from your profile
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        {user?.name} • {user?.email}
                      </p>
                    </div>
                    <button 
                      onClick={() => window.open('/profile', '_blank')}
                      className="text-xs text-green-700 hover:text-green-800 underline"
                    >
                      Update Profile
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Add your phone number so the chef can contact you if needed.</p>
                  </div>

                  <div>
                    <label htmlFor="dietary" className="block text-sm font-medium text-gray-900 mb-2">
                      Dietary Restrictions or Allergies (Optional)
                    </label>
                    <textarea
                      id="dietary"
                      value={formData.dietaryRestrictions}
                      onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
                      placeholder="Please let the chef know about any allergies or dietary restrictions..."
                      rows={3}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Help the chef prepare a meal that&apos;s perfect for you.</p>
                  </div>

                  <div className="mt-6 p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-2">Want to save this info for future reservations?</p>
                    <button 
                      onClick={() => window.open('/profile', '_blank')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      → Update your profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How many people?</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-2">Available spots: {spotsAvailable}</p>
                  <p className="text-sm text-gray-600">Cost per person: {formatCurrency(event.estimatedCostPerPerson)}</p>
                </div>

                <div>
                  <label htmlFor="guestCount" className="block text-sm font-medium text-gray-900 mb-2">
                    Number of people (including yourself)
                  </label>
                  <select
                    id="guestCount"
                    value={formData.guestCount}
                    onChange={(e) => handleInputChange('guestCount', Number(e.target.value))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    {Array.from({ length: spotsAvailable }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'person' : 'people'} - {formatCurrency(event.estimatedCostPerPerson * num)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total estimated cost:</span>
                    <span className="text-xl font-bold text-blue-600">{formatCurrency(totalCost)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Final amount may vary based on actual ingredient costs
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm your reservation</h3>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Reservation Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event:</span>
                      <span className="text-gray-900">{event.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900">
                        {new Intl.DateTimeFormat('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        }).format(event.date)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Party size:</span>
                      <span className="text-gray-900">{formData.guestCount} {formData.guestCount === 1 ? 'person' : 'people'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="text-gray-900">{formData.attendeeName}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Estimated total:</span>
                      <span className="text-blue-600">{formatCurrency(totalCost)}</span>
                    </div>
                  </div>
                </div>

                {/* Agreement */}
                <div className="space-y-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.agreedToCost}
                      onChange={(e) => handleInputChange('agreedToCost', e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      I understand that the final cost may vary based on actual ingredient prices and agree to pay my fair share via Venmo after the dinner.
                    </span>
                  </label>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Cancellations must be made at least 24 hours in advance</p>
                    <p>• Payment will be requested after the dinner based on actual costs</p>
                    <p>• By reserving, you agree to our terms of service</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between p-6 border-t border-gray-200">
          <button
            onClick={step === 1 ? onClose : handlePrevStep}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          <button
            onClick={step === 3 ? handleSubmit : handleNextStep}
            disabled={
              (step === 1 && !isStep1Valid) ||
              (step === 2 && !isStep2Valid) ||
              (step === 3 && (!isStep3Valid || isSubmitting))
            }
            className={cn(
              'px-6 py-3 rounded-lg font-medium transition-colors',
              (step === 1 && isStep1Valid) ||
              (step === 2 && isStep2Valid) ||
              (step === 3 && isStep3Valid && !isSubmitting)
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            )}
          >
            {isSubmitting ? 'Reserving...' : step === 3 ? 'Confirm Reservation' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
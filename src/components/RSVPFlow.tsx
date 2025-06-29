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
      <div className="fixed inset-0 bg-theme-overlay flex items-center justify-center p-4 z-50">
        <div className="bg-theme-elevated rounded-xl max-w-md w-full p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-theme-primary mb-4">Sign In Required</h2>
            <p className="text-theme-muted mb-6">
              Please sign in to make a reservation for this dinner.
            </p>
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-theme-primary border border-theme-primary rounded-lg hover:bg-theme-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => window.location.href = '/sign-in'}
                className="flex-1 px-4 py-2 btn-primary rounded-lg"
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
    <div className="fixed inset-0 bg-theme-overlay flex items-center justify-center p-4 z-50">
      <div className="bg-theme-elevated rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-primary">
          <div>
            <h2 className="text-2xl font-bold text-theme-primary">Reserve Your Spot</h2>
            <p className="text-theme-muted">{event.title} by {event.chefName}</p>
            <p className="text-sm text-theme-subtle">Reserving as {user?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-theme-subtle hover:text-theme-primary text-xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 bg-theme-secondary">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum, index) => (
              <React.Fragment key={stepNum}>
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  step >= stepNum ? 'btn-primary' : 'bg-theme-card text-theme-muted'
                )}>
                  {stepNum}
                </div>
                {index < 2 && (
                  <div className={cn(
                    'h-1 flex-1 mx-4 transition-colors',
                    step > stepNum ? 'bg-theme-subtle' : 'bg-theme-card'
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-theme-muted">
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
                <h3 className="text-lg font-semibold text-theme-primary mb-4">Additional Information</h3>
                
                <div className="bg-theme-accent-bg border border-theme-accent-border rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-theme-primary font-medium">
                        ✓ Your basic info is ready from your profile
                      </p>
                      <p className="text-xs text-theme-muted mt-1">
                        {user?.name} • {user?.email}
                      </p>
                    </div>
                    <button 
                      onClick={() => window.open('/profile', '_blank')}
                      className="text-xs text-theme-subtle hover:text-theme-primary underline transition-colors"
                    >
                      Update Profile
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-theme-primary mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-3 py-3 input-theme rounded-lg"
                    />
                    <p className="text-xs text-theme-muted mt-1">Add your phone number so the chef can contact you if needed.</p>
                  </div>

                  <div>
                    <label htmlFor="dietary" className="block text-sm font-medium text-theme-primary mb-2">
                      Dietary Restrictions or Allergies (Optional)
                    </label>
                    <textarea
                      id="dietary"
                      value={formData.dietaryRestrictions}
                      onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
                      placeholder="Please let the chef know about any allergies or dietary restrictions..."
                      rows={3}
                      className="w-full px-3 py-3 input-theme rounded-lg resize-none"
                    />
                    <p className="text-xs text-theme-muted mt-1">Help the chef prepare a meal that&apos;s perfect for you.</p>
                  </div>

                  <div className="mt-6 p-3 bg-theme-secondary rounded-lg text-center">
                    <p className="text-xs text-theme-muted mb-2">Want to save this info for future reservations?</p>
                    <button 
                      onClick={() => window.open('/profile', '_blank')}
                      className="text-sm text-theme-subtle hover:text-theme-primary font-medium transition-colors"
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
                <h3 className="text-lg font-semibold text-theme-primary mb-4">How many people?</h3>
                
                <div className="bg-theme-secondary rounded-lg p-4 mb-6">
                  <p className="text-sm text-theme-muted mb-2">Available spots: {spotsAvailable}</p>
                  <p className="text-sm text-theme-muted">Cost per person: {formatCurrency(event.estimatedCostPerPerson)}</p>
                </div>

                <div>
                  <label htmlFor="guestCount" className="block text-sm font-medium text-theme-primary mb-2">
                    Number of people (including yourself)
                  </label>
                  <select
                    id="guestCount"
                    value={formData.guestCount}
                    onChange={(e) => handleInputChange('guestCount', Number(e.target.value))}
                    className="w-full px-3 py-3 input-theme rounded-lg"
                  >
                    {Array.from({ length: spotsAvailable }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'person' : 'people'} - {formatCurrency(event.estimatedCostPerPerson * num)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 p-4 bg-theme-accent-bg rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-theme-primary">Total estimated cost:</span>
                    <span className="text-xl font-bold text-theme-subtle">{formatCurrency(totalCost)}</span>
                  </div>
                  <p className="text-sm text-theme-muted mt-1">
                    Final amount may vary based on actual ingredient costs
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-theme-primary mb-4">Confirm your reservation</h3>

                {/* Summary */}
                <div className="bg-theme-secondary rounded-lg p-6 mb-6">
                  <h4 className="font-medium text-theme-primary mb-3">Reservation Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Event:</span>
                      <span className="text-theme-primary">{event.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Date:</span>
                      <span className="text-theme-primary">
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
                      <span className="text-theme-muted">Party size:</span>
                      <span className="text-theme-primary">{formData.guestCount} {formData.guestCount === 1 ? 'person' : 'people'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Name:</span>
                      <span className="text-theme-primary">{formData.attendeeName}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-theme-primary">
                      <span className="text-theme-primary">Estimated total:</span>
                      <span className="text-theme-subtle">{formatCurrency(totalCost)}</span>
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
                      className="mt-1 w-4 h-4 checkbox-theme rounded"
                    />
                    <span className="text-sm text-theme-primary">
                      I understand that the final cost may vary based on actual ingredient prices and agree to pay my fair share via Venmo after the dinner.
                    </span>
                  </label>

                  <div className="text-xs text-theme-muted space-y-1">
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
        <div className="flex justify-between p-6 border-t border-theme-primary">
          <button
            onClick={step === 1 ? onClose : handlePrevStep}
            className="px-6 py-3 text-theme-muted hover:text-theme-primary font-medium transition-colors"
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
                ? 'btn-primary'
                : 'bg-theme-secondary text-theme-subtle cursor-not-allowed'
            )}
          >
            {isSubmitting ? 'Reserving...' : step === 3 ? 'Confirm Reservation' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
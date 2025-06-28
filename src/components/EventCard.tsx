'use client'

import { PublicDinnerEvent } from '@/types'
import { cn, formatCurrency } from '@/lib/utils'

interface EventCardProps {
  event: PublicDinnerEvent
  onReserve: (eventId: string) => void
  className?: string
}

export function EventCard({ event, onReserve, className }: EventCardProps) {
  const spotsAvailable = event.maxCapacity - event.currentReservations
  const isAlmostFull = spotsAvailable <= 2 && spotsAvailable > 0
  const isFull = event.status === 'full' || spotsAvailable <= 0
  const hasRSVP = !!event.userRsvpStatus
  const isRSVPConfirmed = event.userRsvpStatus?.status === 'CONFIRMED'
  const isRSVPWaitlisted = event.userRsvpStatus?.status === 'WAITLIST'
  
  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
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
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Date TBD'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  return (
    <div className={cn('bg-theme-elevated rounded-xl border border-theme-primary shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full', className)}>
      {/* RSVP Status Banner */}
      {hasRSVP && (
        <div className={cn(
          'px-6 py-2 text-sm font-medium text-center',
          isRSVPConfirmed ? 'bg-green-100 text-green-800' :
          isRSVPWaitlisted ? 'bg-yellow-100 text-yellow-800' :
          'bg-theme-secondary text-theme-muted'
        )}>
          {isRSVPConfirmed && `✓ You're going! (${event.userRsvpStatus?.guestCount} ${event.userRsvpStatus?.guestCount === 1 ? 'person' : 'people'})`}
          {isRSVPWaitlisted && `⏱️ You're on the waitlist (${event.userRsvpStatus?.guestCount} ${event.userRsvpStatus?.guestCount === 1 ? 'person' : 'people'})`}
        </div>
      )}
      
      {/* Event Header */}
      <div className="p-6 pb-4 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-theme-primary mb-1">{event.title}</h3>
            <p className="text-sm text-theme-muted">by {event.chefName}</p>
          </div>
          {event.chefPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={event.chefPhoto} 
              alt={event.chefName}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
        </div>

        {/* Cuisine Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {event.cuisineType.map((cuisine) => (
            <span 
              key={cuisine}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {cuisine}
            </span>
          ))}
        </div>

        {/* Event Details */}
        <div className="space-y-2 text-sm text-theme-muted">
          <div className="flex items-center gap-2">
            <span className="font-medium">📅</span>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">⏱️</span>
            <span>{formatDuration(event.estimatedDuration)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <span className="font-medium">📍</span>
              <span>{event.location.neighborhood}, {event.location.city}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-theme-subtle text-sm mt-3 line-clamp-2">
            {event.description}
          </p>
        )}
      </div>

      {/* Capacity and Price Section */}
      <div className="px-6 py-4 bg-theme-secondary border-t border-theme-primary">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-theme-primary">
                {formatCurrency(event.estimatedCostPerPerson)}
              </span>
              <span className="text-sm text-theme-muted">per person</span>
            </div>
            <p className="text-xs text-theme-subtle">Estimated cost</p>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                'text-sm font-medium',
                isFull ? 'text-red-600' : isAlmostFull ? 'text-orange-600' : 'text-green-600'
              )}>
                {event.currentReservations}/{event.maxCapacity} spots
              </span>
            </div>
            <p className="text-xs text-theme-subtle">
              {isFull ? 'Full' : `${spotsAvailable} available`}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-theme-primary rounded-full h-2 mb-4 opacity-20">
          <div 
            className={cn(
              'h-2 rounded-full transition-all',
              isFull ? 'bg-red-500' : isAlmostFull ? 'bg-orange-500' : 'bg-green-500'
            )}
            style={{ width: `${(event.currentReservations / event.maxCapacity) * 100}%` }}
          />
        </div>

        {/* Action Button */}
        <button
          onClick={() => !hasRSVP && onReserve(event.id)}
          disabled={isFull || hasRSVP}
          className={cn(
            'w-full py-3 px-4 rounded-lg font-medium transition-colors text-sm',
            isFull
              ? 'bg-theme-secondary text-theme-subtle cursor-not-allowed'
              : hasRSVP
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          )}
        >
          {isFull ? 'Dinner Full' : hasRSVP ? (isRSVPConfirmed ? 'Already Reserved' : 'On Waitlist') : isAlmostFull ? 'Reserve Now - Almost Full!' : 'Reserve Your Spot'}
        </button>

        {/* Dietary Accommodations */}
        {event.dietaryAccommodations.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-theme-subtle mb-1">Dietary accommodations:</p>
            <div className="flex flex-wrap gap-1">
              {event.dietaryAccommodations.map((accommodation) => (
                <span 
                  key={accommodation}
                  className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded"
                >
                  {accommodation}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
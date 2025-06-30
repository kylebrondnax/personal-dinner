'use client'

import Image from 'next/image'
import { EventAttendee } from '@/types'
import { cn } from '@/lib/utils'

interface EventAttendeeListProps {
  attendees: EventAttendee[]
  maxCapacity: number
  className?: string
}

interface AttendeeAvatarProps {
  name: string
  photo?: string
  className?: string
}

function AttendeeAvatar({ name, photo, className }: AttendeeAvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (photo) {
    return (
      <Image
        src={photo}
        alt={name}
        width={32}
        height={32}
        className={cn(
          "rounded-full object-cover bg-theme-secondary",
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "rounded-full bg-theme-accent-bg border border-theme-accent-border flex items-center justify-center text-sm font-medium text-theme-primary",
        className
      )}
    >
      {initials}
    </div>
  )
}

export function EventAttendeeList({ attendees, maxCapacity, className }: EventAttendeeListProps) {
  const confirmedAttendees = attendees.filter(a => a.status === 'CONFIRMED')
  const waitlistAttendees = attendees.filter(a => a.status === 'WAITLIST')
  
  const totalConfirmedGuests = confirmedAttendees.reduce((sum, a) => sum + a.guestCount, 0)
  const totalWaitlistGuests = waitlistAttendees.reduce((sum, a) => sum + a.guestCount, 0)

  if (attendees.length === 0) {
    return (
      <div className={cn("bg-theme-secondary rounded-lg p-6 text-center", className)}>
        <div className="text-theme-muted">
          <div className="text-2xl mb-2">🍽️</div>
          <p className="font-medium">No reservations yet</p>
          <p className="text-sm mt-1">Be the first to RSVP!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-theme-secondary rounded-lg p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-theme-primary">
          Who&apos;s Coming
        </h3>
        <div className="text-sm text-theme-muted">
          {totalConfirmedGuests}/{maxCapacity} confirmed
        </div>
      </div>

      {/* Confirmed Attendees */}
      {confirmedAttendees.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-theme-primary">
              Confirmed ({confirmedAttendees.length})
            </span>
          </div>
          
          <div className="space-y-3">
            {confirmedAttendees.map((attendee) => (
              <div key={attendee.id} className="flex items-center gap-3">
                <AttendeeAvatar 
                  name={attendee.name} 
                  photo={attendee.userPhoto}
                  className="w-8 h-8"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-theme-primary truncate">
                      {attendee.name}
                    </span>
                    {attendee.guestCount > 1 && (
                      <span className="text-xs bg-theme-accent-bg text-theme-subtle px-2 py-1 rounded-full">
                        +{attendee.guestCount - 1} guest{attendee.guestCount - 1 === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                  {attendee.dietaryRestrictions && (
                    <div className="text-xs text-theme-muted mt-1 truncate">
                      Dietary: {attendee.dietaryRestrictions}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Waitlist Attendees */}
      {waitlistAttendees.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium text-theme-primary">
              Waitlist ({waitlistAttendees.length})
            </span>
          </div>
          
          <div className="space-y-3">
            {waitlistAttendees.map((attendee) => (
              <div key={attendee.id} className="flex items-center gap-3 opacity-70">
                <AttendeeAvatar 
                  name={attendee.name} 
                  photo={attendee.userPhoto}
                  className="w-8 h-8"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-theme-primary truncate">
                      {attendee.name}
                    </span>
                    {attendee.guestCount > 1 && (
                      <span className="text-xs bg-theme-accent-bg text-theme-subtle px-2 py-1 rounded-full">
                        +{attendee.guestCount - 1} guest{attendee.guestCount - 1 === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                  {attendee.dietaryRestrictions && (
                    <div className="text-xs text-theme-muted mt-1 truncate">
                      Dietary: {attendee.dietaryRestrictions}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {(totalConfirmedGuests > 0 || totalWaitlistGuests > 0) && (
        <div className="mt-4 pt-4 border-t border-theme-primary text-xs text-theme-muted">
          <div className="flex justify-between">
            <span>Total guests: {totalConfirmedGuests + totalWaitlistGuests}</span>
            <span>
              {maxCapacity - totalConfirmedGuests > 0 
                ? `${maxCapacity - totalConfirmedGuests} spots left`
                : 'Event full'
              }
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
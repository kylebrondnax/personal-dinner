'use client'

import { useState, useCallback, useRef } from 'react'
import { ProposedDateTime } from '@/types'

interface CalendarTimeSelectorProps {
  proposedDates: ProposedDateTime[]
  onChange: (dates: ProposedDateTime[]) => void
}

// interface TimeSlot {
//   date: string
//   hour: number
//   minute: number
//   selected: boolean
// }

export function CalendarTimeSelector({ proposedDates, onChange }: CalendarTimeSelectorProps) {
  // Generate a week starting from today
  const today = new Date()
  const [startDate, setStartDate] = useState(() => {
    // Start from today instead of Sunday
    return new Date(today)
  })

  // Time slots: 6 AM to 11:30 PM in 30-minute intervals
  const timeSlots = []
  for (let hour = 6; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 23 && minute > 30) break // Stop at 11:30 PM
      timeSlots.push({ hour, minute })
    }
  }

  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionMode, setSelectionMode] = useState<'select' | 'deselect'>('select')
  const gridRef = useRef<HTMLDivElement>(null)

  // Get 7 days starting from startDate
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    return date
  })

  // Check if a time slot is selected
  const isTimeSlotSelected = useCallback((date: Date, hour: number, minute: number) => {
    // Use local date string to avoid timezone issues
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    return proposedDates.some(pd => pd.date === dateStr && pd.time === timeStr)
  }, [proposedDates])

  // Toggle time slot selection
  const toggleTimeSlot = useCallback((date: Date, hour: number, minute: number, forceMode?: 'select' | 'deselect') => {
    // Use local date string to avoid timezone issues
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    
    const isCurrentlySelected = isTimeSlotSelected(date, hour, minute)
    const shouldSelect = forceMode ? forceMode === 'select' : !isCurrentlySelected

    if (shouldSelect && !isCurrentlySelected) {
      // Add the time slot
      onChange([...proposedDates, { date: dateStr, time: timeStr }])
    } else if (!shouldSelect && isCurrentlySelected) {
      // Remove the time slot
      onChange(proposedDates.filter(pd => !(pd.date === dateStr && pd.time === timeStr)))
    }
  }, [proposedDates, onChange, isTimeSlotSelected])

  // Handle mouse events for drag selection
  const handleMouseDown = (date: Date, hour: number, minute: number) => {
    setIsSelecting(true)
    const isSelected = isTimeSlotSelected(date, hour, minute)
    setSelectionMode(isSelected ? 'deselect' : 'select')
    toggleTimeSlot(date, hour, minute, isSelected ? 'deselect' : 'select')
  }

  const handleMouseEnter = (date: Date, hour: number, minute: number) => {
    if (isSelecting) {
      toggleTimeSlot(date, hour, minute, selectionMode)
    }
  }

  const handleMouseUp = () => {
    setIsSelecting(false)
  }

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newStart = new Date(startDate)
    newStart.setDate(startDate.getDate() - 7)
    // Don't allow going to weeks that start before today
    const todayStart = new Date(today)
    if (newStart >= todayStart) {
      setStartDate(newStart)
    }
  }

  const goToNextWeek = () => {
    const newStart = new Date(startDate)
    newStart.setDate(startDate.getDate() + 7)
    setStartDate(newStart)
  }

  const formatTime = (hour: number, minute: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="poll-section p-4">
        <h3 className="font-semibold text-theme-primary mb-2">
          📅 Select your available times
        </h3>
        <p className="text-sm text-theme-muted">
          Click and drag to select time slots when you&apos;re available to host. 
          Selected times (in blue) will be offered as options for your guests to vote on.
        </p>
      </div>

      {/* Week Navigation */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={goToPreviousWeek}
          disabled={startDate <= today}
          className="px-3 py-1 text-sm btn-cancel rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous Week
        </button>
        
        <span className="text-sm font-medium text-theme-primary">
          {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
        </span>
        
        <button
          type="button"
          onClick={goToNextWeek}
          className="px-3 py-1 text-sm btn-cancel rounded transition-colors"
        >
          Next Week →
        </button>
      </div>

      {/* Calendar Grid */}
      <div 
        ref={gridRef}
        className="border border-theme-primary rounded-lg overflow-hidden"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Header with days */}
        <div className="grid grid-cols-8 bg-theme-secondary">
          <div className="p-3 text-xs font-medium text-theme-subtle border-r border-theme-primary">
            Time
          </div>
          {weekDays.map((day, index) => (
            <div key={index} className="p-3 text-center text-xs font-medium text-theme-primary border-r border-theme-primary last:border-r-0">
              <div>{formatDate(day)}</div>
              <div className="text-theme-subtle mt-1">
                {day.toLocaleDateString() === today.toLocaleDateString() ? 'Today' : 
                 day < today ? 'Past' : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="max-h-96 overflow-y-auto">
          {timeSlots.map(({ hour, minute }, timeIndex) => (
            <div key={`${hour}-${minute}`} className="grid grid-cols-8 border-t border-theme-primary">
              {/* Time label */}
              <div className="p-2 text-xs text-theme-muted border-r border-theme-primary bg-theme-secondary">
                {formatTime(hour, minute)}
              </div>
              
              {/* Time slots for each day */}
              {weekDays.map((day, dayIndex) => {
                const isSelected = isTimeSlotSelected(day, hour, minute)
                
                // Check if this time slot is in the past
                const slotDateTime = new Date(day)
                slotDateTime.setHours(hour, minute, 0, 0)
                const isPastTime = slotDateTime < today
                
                return (
                  <div
                    key={`${dayIndex}-${timeIndex}`}
                    className={`
                      p-1 border-r border-theme-primary last:border-r-0
                      transition-colors duration-75 select-none
                      ${isSelected 
                        ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer' 
                        : isPastTime
                          ? 'bg-theme-secondary cursor-not-allowed opacity-30'
                          : 'bg-theme-primary calendar-hover cursor-pointer'
                      }
                    `}
                    onMouseDown={isPastTime ? undefined : () => handleMouseDown(day, hour, minute)}
                    onMouseEnter={isPastTime ? undefined : () => handleMouseEnter(day, hour, minute)}
                    title={isPastTime ? 'Past time - cannot select' : ''}
                  >
                    <div className="h-6 w-full rounded-sm flex items-center justify-center">
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      <div className="bg-theme-secondary rounded-lg p-4">
        <h4 className="font-medium text-theme-primary mb-2">
          Selected Times ({proposedDates.length})
        </h4>
        {proposedDates.length === 0 ? (
          <p className="text-sm text-theme-muted">
            No times selected yet. Click and drag on the calendar above to select available times.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {proposedDates
              .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
              .map((slot, index) => {
                const date = new Date(`${slot.date}T${slot.time}`)
                const displayDate = new Intl.DateTimeFormat('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                }).format(date)
                
                return (
                  <div key={index} className="text-sm text-theme-secondary flex items-center justify-between bg-theme-card px-3 py-2 rounded">
                    <span>{displayDate}</span>
                    <button
                      type="button"
                      onClick={() => toggleTimeSlot(date, date.getHours(), date.getMinutes(), 'deselect')}
                      className="text-red-500 hover:text-red-700 ml-2"
                      title="Remove this time slot"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Validation */}
      {proposedDates.length < 2 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-sm text-orange-800">
            ⚠️ Please select at least 2 time slots to create a meaningful poll for your guests.
          </p>
        </div>
      )}
    </div>
  )
}
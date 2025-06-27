'use client'

import { useState } from 'react'
import { ProposedDateTime } from '@/types'
import { CalendarTimeSelector } from './CalendarTimeSelector'

interface AvailabilityPollSectionProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  pollDeadline: string
  onDeadlineChange: (deadline: string) => void
  pollDateRange: { startDate: string; endDate: string }
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void
  chefAvailability: ProposedDateTime[]
  onChefAvailabilityChange: (availability: ProposedDateTime[]) => void
}

export function AvailabilityPollSection({
  enabled,
  onToggle,
  pollDeadline,
  onDeadlineChange,
  pollDateRange,
  onDateRangeChange,
  chefAvailability,
  onChefAvailabilityChange
}: AvailabilityPollSectionProps) {
  const [isExpanded, setIsExpanded] = useState(enabled)

  const handleToggle = (checked: boolean) => {
    onToggle(checked)
    setIsExpanded(checked)
    
    // Set default poll deadline (5 days from now) when enabling
    if (checked && !pollDeadline) {
      const defaultDeadline = new Date()
      defaultDeadline.setDate(defaultDeadline.getDate() + 5)
      onDeadlineChange(defaultDeadline.toISOString().split('T')[0])
    }
    
    // Set default date range (today + 2 weeks) when enabling
    if (checked && !pollDateRange.startDate) {
      const startDate = new Date() // Today
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 14) // 2 weeks from today
      
      onDateRangeChange({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Toggle Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="useAvailabilityPoll"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <label htmlFor="useAvailabilityPoll" className="block text-lg font-semibold text-gray-900 dark:text-white cursor-pointer">
              📊 Poll for availability first
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Survey your guests about when they&apos;re available, and mark your own availability too.
              Great for coordinating with busy schedules!
            </p>
          </div>
        </div>
      </div>

      {/* Poll Configuration */}
      {isExpanded && (
        <div className="space-y-6 pl-6 border-l-2 border-blue-200 dark:border-blue-700">
          
          {/* Date Range for Polling */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Poll Date Range
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Set the range of dates your guests can choose from when marking their availability.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
              <div>
                <label htmlFor="pollStartDate" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="pollStartDate"
                  value={pollDateRange.startDate}
                  onChange={(e) => onDateRangeChange({ ...pollDateRange, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label htmlFor="pollEndDate" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="pollEndDate"
                  value={pollDateRange.endDate}
                  onChange={(e) => onDateRangeChange({ ...pollDateRange, endDate: e.target.value })}
                  min={pollDateRange.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Guests will see a calendar covering this date range and can mark their available times.
            </p>
          </div>

          {/* Chef Availability */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Availability
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Mark when you&apos;re available to host. Guests will see your availability and can choose times that work for both of you.
            </p>
            <CalendarTimeSelector
              proposedDates={chefAvailability}
              onChange={onChefAvailabilityChange}
            />
          </div>

          {/* Poll Deadline */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Poll Deadline
            </h3>
            <div className="max-w-md">
              <label htmlFor="pollDeadline" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Responses needed by
              </label>
              <input
                type="date"
                id="pollDeadline"
                value={pollDeadline}
                onChange={(e) => onDeadlineChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Guests must respond by this date. You&apos;ll choose the final date/time based on responses.
              </p>
            </div>
          </div>


          {/* Info Box */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              How it works:
            </h4>
            <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-decimal list-inside">
              <li>Mark your own availability using the calendar above</li>
              <li>Create your event and share the link with your friends</li>
              <li>Friends visit the link and mark their availability on the same calendar</li>
              <li>You review all responses and pick the time that works for everyone</li>
              <li>Finalize the event and friends can RSVP for the chosen time</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
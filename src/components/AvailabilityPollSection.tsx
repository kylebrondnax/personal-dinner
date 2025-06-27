'use client'

import { useState } from 'react'
import { ProposedDateTime, PollRecipient } from '@/types'
import { ProposedDateSelector } from './ProposedDateSelector'
import { PollRecipientManager } from './PollRecipientManager'

interface AvailabilityPollSectionProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  proposedDates: ProposedDateTime[]
  onDatesChange: (dates: ProposedDateTime[]) => void
  pollDeadline: string
  onDeadlineChange: (deadline: string) => void
  pollRecipients: PollRecipient[]
  onRecipientsChange: (recipients: PollRecipient[]) => void
}

export function AvailabilityPollSection({
  enabled,
  onToggle,
  proposedDates,
  onDatesChange,
  pollDeadline,
  onDeadlineChange,
  pollRecipients,
  onRecipientsChange
}: AvailabilityPollSectionProps) {
  const [isExpanded, setIsExpanded] = useState(enabled)

  const handleToggle = (checked: boolean) => {
    onToggle(checked)
    setIsExpanded(checked)
    
    // Set default poll deadline (3 days from now) when enabling
    if (checked && !pollDeadline) {
      const defaultDeadline = new Date()
      defaultDeadline.setDate(defaultDeadline.getDate() + 3)
      onDeadlineChange(defaultDeadline.toISOString().split('T')[0])
    }
    
    // Add default proposed dates if none exist
    if (checked && proposedDates.length === 0) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dayAfter = new Date()
      dayAfter.setDate(dayAfter.getDate() + 2)
      
      onDatesChange([
        { date: tomorrow.toISOString().split('T')[0], time: '18:00' },
        { date: dayAfter.toISOString().split('T')[0], time: '18:00' }
      ])
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
              Survey your friends about when they&apos;re available before setting a final date and time.
              Great for coordinating with busy schedules!
            </p>
          </div>
        </div>
      </div>

      {/* Poll Configuration */}
      {isExpanded && (
        <div className="space-y-6 pl-6 border-l-2 border-blue-200 dark:border-blue-700">
          
          {/* Proposed Dates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Proposed Dates & Times
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Add 2-5 date and time options for your friends to choose from.
            </p>
            <ProposedDateSelector
              proposedDates={proposedDates}
              onChange={onDatesChange}
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
                You&apos;ll be able to finalize the date after this deadline
              </p>
            </div>
          </div>

          {/* Poll Recipients */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Who to Poll
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Add email addresses of friends you want to survey about availability.
            </p>
            <PollRecipientManager
              recipients={pollRecipients}
              onChange={onRecipientsChange}
            />
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              How it works:
            </h4>
            <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-decimal list-inside">
              <li>Your friends will receive an email with the poll</li>
              <li>They can respond with their availability (no account required)</li>
              <li>You&apos;ll see responses in your dashboard</li>
              <li>Pick the best date and finalize your dinner</li>
              <li>Friends get notified of the final date and can RSVP</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
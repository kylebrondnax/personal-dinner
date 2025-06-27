'use client'

import { useState } from 'react'
import { ProposedDateTime } from '@/types'

interface ProposedDateSelectorProps {
  proposedDates: ProposedDateTime[]
  onChange: (dates: ProposedDateTime[]) => void
}

export function ProposedDateSelector({ proposedDates, onChange }: ProposedDateSelectorProps) {
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('18:00')

  const addProposedDate = () => {
    if (!newDate) return

    const newProposedDate: ProposedDateTime = {
      date: newDate,
      time: newTime
    }

    onChange([...proposedDates, newProposedDate])
    setNewDate('')
    setNewTime('18:00')
  }

  const removeProposedDate = (index: number) => {
    const updated = proposedDates.filter((_, i) => i !== index)
    onChange(updated)
  }

  const updateProposedDate = (index: number, field: 'date' | 'time', value: string) => {
    const updated = proposedDates.map((date, i) => 
      i === index ? { ...date, [field]: value } : date
    )
    onChange(updated)
  }

  const formatDisplayDate = (date: string, time: string) => {
    try {
      const dateTime = new Date(`${date}T${time}`)
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }).format(dateTime)
    } catch {
      return `${date} at ${time}`
    }
  }

  const canAddMore = proposedDates.length < 5

  return (
    <div className="space-y-4">
      {/* Existing Proposed Dates */}
      {proposedDates.length > 0 && (
        <div className="space-y-3">
          {proposedDates.map((proposedDate, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={proposedDate.date}
                      onChange={(e) => updateProposedDate(index, 'date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={proposedDate.time}
                      onChange={(e) => updateProposedDate(index, 'time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeProposedDate(index)}
                  className="ml-4 p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  title="Remove this date option"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              {/* Preview */}
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Preview:</span> {formatDisplayDate(proposedDate.date, proposedDate.time)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Date */}
      {canAddMore && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Add Date Option
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  placeholder="Select date"
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addProposedDate}
              disabled={!newDate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Option
            </button>
          </div>
        </div>
      )}

      {/* Validation Messages */}
      {proposedDates.length < 2 && (
        <p className="text-sm text-orange-600 dark:text-orange-400">
          Add at least 2 date options for polling
        </p>
      )}

      {!canAddMore && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Maximum of 5 date options allowed
        </p>
      )}

      {/* Helper Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>Tip:</strong> Choose dates that work for you first. Your friends will see these options and can mark their availability.
        </p>
      </div>
    </div>
  )
}
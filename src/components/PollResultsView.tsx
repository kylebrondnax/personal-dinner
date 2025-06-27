'use client'

import { useState } from 'react'
import { AvailabilityPollData } from '@/types'

interface PollResultsViewProps {
  pollData: AvailabilityPollData
  onFinalizePoll: (selectedProposedDateId: string) => Promise<void>
  onSendReminders?: () => Promise<void>
  isSubmitting?: boolean
}

export function PollResultsView({ 
  pollData, 
  onFinalizePoll, 
  onSendReminders,
  isSubmitting = false 
}: PollResultsViewProps) {
  const [selectedDateId, setSelectedDateId] = useState<string>('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const formatDateTime = (date: string, time: string) => {
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

  const getDateStats = (proposedDate: typeof pollData.proposedDates[0]) => {
    const available = proposedDate.responses.filter(r => r.available && !r.tentative).length
    const tentative = proposedDate.responses.filter(r => r.tentative).length
    const unavailable = proposedDate.responses.filter(r => !r.available).length
    const total = proposedDate.responses.length

    return { available, tentative, unavailable, total }
  }

  const getTotalResponses = () => {
    const uniqueResponders = new Set()
    pollData.proposedDates.forEach(date => {
      date.responses.forEach(response => {
        const identifier = response.userId || response.guestEmail
        if (identifier) uniqueResponders.add(identifier)
      })
    })
    return uniqueResponders.size
  }

  const getBestDate = () => {
    return pollData.proposedDates.reduce((best, current) => {
      const currentStats = getDateStats(current)
      const bestStats = getDateStats(best)
      
      // Prioritize by available count, then by total responses
      if (currentStats.available > bestStats.available) return current
      if (currentStats.available === bestStats.available && currentStats.total > bestStats.total) return current
      return best
    })
  }

  const handleFinalize = async () => {
    if (!selectedDateId) return
    
    try {
      await onFinalizePoll(selectedDateId)
      setShowConfirmModal(false)
    } catch (error) {
      console.error('Failed to finalize poll:', error)
    }
  }

  const isDeadlinePassed = pollData.pollDeadline && new Date() > pollData.pollDeadline
  const canFinalize = pollData.status === 'ACTIVE' && getTotalResponses() > 0

  return (
    <div className="space-y-6">
      {/* Poll Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              📊 Availability Poll Results
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {pollData.eventTitle}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {getTotalResponses()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              responses
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-4 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            pollData.status === 'ACTIVE' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
              : pollData.status === 'FINALIZED'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200'
          }`}>
            {pollData.status === 'ACTIVE' ? '🟢 Active' : 
             pollData.status === 'FINALIZED' ? '✅ Finalized' : 
             '⏸️ Closed'}
          </span>
          
          {pollData.pollDeadline && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Deadline: {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              }).format(pollData.pollDeadline)}
              {isDeadlinePassed && <span className="text-red-600 dark:text-red-400 ml-1">(Passed)</span>}
            </span>
          )}
        </div>

        {/* Actions */}
        {pollData.status === 'ACTIVE' && (
          <div className="flex flex-wrap gap-3">
            {canFinalize && (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Finalize Date
              </button>
            )}
            {onSendReminders && (
              <button
                onClick={onSendReminders}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Send Reminders
              </button>
            )}
          </div>
        )}
      </div>

      {/* Date Options Results */}
      <div className="space-y-4">
        {pollData.proposedDates
          .sort((a, b) => {
            const aStats = getDateStats(a)
            const bStats = getDateStats(b)
            return bStats.available - aStats.available || bStats.total - aStats.total
          })
          .map((proposedDate, index) => {
            const stats = getDateStats(proposedDate)
            const isRecommended = proposedDate.id === getBestDate().id
            
            return (
              <div 
                key={proposedDate.id}
                className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-6 ${
                  isRecommended 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatDateTime(proposedDate.date, proposedDate.time)}
                      </h3>
                      {isRecommended && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 text-xs rounded-full font-medium">
                          🌟 Best Option
                        </span>
                      )}
                      {index === 0 && stats.available > 0 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 text-xs rounded-full font-medium">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="text-green-600 dark:text-green-400">
                        ✅ {stats.available} available
                      </span>
                      {stats.tentative > 0 && (
                        <span className="text-yellow-600 dark:text-yellow-400">
                          ⚠️ {stats.tentative} tentative
                        </span>
                      )}
                      {stats.unavailable > 0 && (
                        <span className="text-red-600 dark:text-red-400">
                          ❌ {stats.unavailable} unavailable
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {canFinalize && (
                    <button
                      onClick={() => {
                        setSelectedDateId(proposedDate.id!)
                        setShowConfirmModal(true)
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Select This Date
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                {stats.total > 0 && (
                  <div className="mb-4">
                    <div className="flex h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500 h-full" 
                        style={{ width: `${(stats.available / stats.total) * 100}%` }}
                      />
                      <div 
                        className="bg-yellow-500 h-full" 
                        style={{ width: `${(stats.tentative / stats.total) * 100}%` }}
                      />
                      <div 
                        className="bg-red-500 h-full" 
                        style={{ width: `${(stats.unavailable / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Individual Responses */}
                {proposedDate.responses.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Responses:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {proposedDate.responses.map((response, idx) => (
                        <div
                          key={idx}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            response.available && !response.tentative
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                              : response.tentative
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                          }`}
                        >
                          {response.available && !response.tentative ? '✅' : 
                           response.tentative ? '⚠️' : '❌'} {' '}
                          {response.guestName || response.guestEmail?.split('@')[0] || 'Anonymous'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {proposedDate.responses.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No responses yet for this date
                  </p>
                )}
              </div>
            )
          })}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Finalize This Date?
            </h3>
            {selectedDateId && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You&apos;re about to finalize:{' '}
                <strong>
                  {formatDateTime(
                    pollData.proposedDates.find(d => d.id === selectedDateId)?.date || '',
                    pollData.proposedDates.find(d => d.id === selectedDateId)?.time || ''
                  )}
                </strong>
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              This will close the poll and notify all participants of the final date. 
              Your event will then be open for RSVPs.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleFinalize}
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Finalizing...' : 'Yes, Finalize'}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'

interface EventShareButtonProps {
  eventId: string
  eventTitle: string
  isPollEvent: boolean
}

export function EventShareButton({ eventId, eventTitle, isPollEvent }: EventShareButtonProps) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shareUrl = isPollEvent 
    ? `${baseUrl}/poll/${eventId}`
    : `${baseUrl}/events/${eventId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Join me for: ${eventTitle}`)
    const body = encodeURIComponent(
      isPollEvent 
        ? `Hi! I'm planning a dinner and would love for you to join. Please let me know your availability by visiting:\n\n${shareUrl}\n\nLooking forward to seeing you!`
        : `Hi! I'm hosting a dinner and would love for you to join. Check out the details and RSVP here:\n\n${shareUrl}\n\nHope to see you there!`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const shareViaText = () => {
    const message = encodeURIComponent(
      isPollEvent
        ? `Join me for "${eventTitle}"! Let me know your availability: ${shareUrl}`
        : `Join me for "${eventTitle}"! RSVP here: ${shareUrl}`
    )
    window.open(`sms:?body=${message}`)
  }

  if (!showShareModal) {
    return (
      <button
        onClick={() => setShowShareModal(true)}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-theme-accent hover:text-theme-accent-hover transition-colors"
        title={isPollEvent ? "Share poll with friends" : "Share event"}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
        Share
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-theme-overlay z-40"
        onClick={() => setShowShareModal(false)}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-theme-card rounded-xl shadow-xl border border-theme-primary w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-theme-primary">
              <h3 className="text-lg font-semibold text-theme-primary">
                {isPollEvent ? '📊 Share Availability Poll' : '🎉 Share Event'}
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-theme-muted hover:text-theme-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-medium text-theme-primary mb-2">{eventTitle}</h4>
                <p className="text-sm text-theme-muted">
                  {isPollEvent 
                    ? "Share this link so friends can mark their availability:"
                    : "Share this link so friends can view and RSVP to your event:"
                  }
                </p>
              </div>

              {/* URL Display */}
              <div className="bg-theme-secondary rounded-lg p-3 border border-theme-primary">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-subtle font-mono break-all mr-2">
                    {shareUrl}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      copied 
                        ? 'badge-success'
                        : 'badge-info hover:bg-opacity-80'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Quick Share Options */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-theme-primary">Quick share:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={shareViaEmail}
                    className="flex items-center justify-center px-4 py-2 badge-info rounded-lg hover:bg-opacity-80 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                  </button>
                  <button
                    onClick={shareViaText}
                    className="flex items-center justify-center px-4 py-2 badge-success rounded-lg hover:bg-opacity-80 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.72-.424l-5.45 1.45L6.28 16.44A8 8 0 1721 12z" />
                    </svg>
                    Text
                  </button>
                </div>
              </div>

              {isPollEvent && (
                <div className="bg-theme-accent-bg border border-theme-accent-border rounded-lg p-3">
                  <p className="text-xs text-theme-accent">
                    💡 <strong>Tip:</strong> Friends can respond without creating an account. You&apos;ll see all responses in your dashboard.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-theme-primary">
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full px-4 py-2 btn-secondary rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
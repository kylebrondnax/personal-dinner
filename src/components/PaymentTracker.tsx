'use client'

import { AttendeePayment } from '@/types'
import { cn, formatCurrency, generateVenmoUrl } from '@/lib/utils'

interface PaymentTrackerProps {
  attendeePayments: AttendeePayment[]
  chefVenmoUsername?: string
  eventTitle: string
  onPaymentStatusChange: (email: string, paid: boolean) => void
  className?: string
}

export function PaymentTracker({
  attendeePayments,
  chefVenmoUsername,
  eventTitle,
  onPaymentStatusChange,
  className
}: PaymentTrackerProps) {
  const totalPaid = attendeePayments.filter(p => p.paid).length
  const totalAttendees = attendeePayments.length
  const totalAmount = attendeePayments.reduce((sum, p) => sum + p.amount, 0)
  const amountCollected = attendeePayments
    .filter(p => p.paid)
    .reduce((sum, p) => sum + p.amount, 0)

  const copyPaymentRequest = async (payment: AttendeePayment) => {
    if (!chefVenmoUsername) return

    const venmoUrl = generateVenmoUrl(
      chefVenmoUsername,
      payment.amount,
      `${eventTitle} - Your share`
    )

    try {
      await navigator.clipboard.writeText(venmoUrl)
      // You might want to show a toast notification here
      console.log('Payment request copied to clipboard')
    } catch (err) {
      console.error('Failed to copy payment request:', err)
    }
  }

  const generateAllPaymentRequests = () => {
    if (!chefVenmoUsername) return

    const unpaidPayments = attendeePayments.filter(p => !p.paid)
    const requests = unpaidPayments.map(payment => {
      const venmoUrl = generateVenmoUrl(
        chefVenmoUsername,
        payment.amount,
        `${eventTitle} - Your share`
      )
      return `${payment.name}: ${venmoUrl}`
    }).join('\n\n')

    navigator.clipboard.writeText(requests)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Payment Tracking</h3>
        {chefVenmoUsername && attendeePayments.some(p => !p.paid) && (
          <button
            onClick={generateAllPaymentRequests}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm"
          >
            Copy All Payment Requests
          </button>
        )}
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Payments</p>
            <p className="text-lg font-semibold">
              {totalPaid} / {totalAttendees}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Collected</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(amountCollected)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Remaining</p>
            <p className="text-lg font-semibold text-orange-600">
              {formatCurrency(totalAmount - amountCollected)}
            </p>
          </div>
        </div>
        
        {totalPaid === totalAttendees && totalAttendees > 0 && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-center">
            🎉 All payments received!
          </div>
        )}
      </div>

      {/* Individual Payments */}
      <div className="space-y-3">
        {attendeePayments.map((payment) => (
          <div
            key={payment.email}
            className={cn(
              'flex items-center justify-between p-4 rounded-lg border-2 transition-colors',
              payment.paid 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-white'
            )}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={payment.paid}
                onChange={(e) => onPaymentStatusChange(payment.email, e.target.checked)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <div>
                <p className="font-medium text-gray-900">{payment.name}</p>
                <p className="text-sm text-gray-600">{payment.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={cn(
                'font-semibold',
                payment.paid ? 'text-green-600' : 'text-gray-900'
              )}>
                {formatCurrency(payment.amount)}
              </span>
              
              {!payment.paid && chefVenmoUsername && (
                <button
                  onClick={() => copyPaymentRequest(payment)}
                  className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Copy Request
                </button>
              )}
              
              {payment.paid && (
                <span className="text-green-600 text-sm">✓ Paid</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {!chefVenmoUsername && attendeePayments.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            💡 Add your Venmo username to generate payment requests automatically
          </p>
        </div>
      )}
    </div>
  )
}
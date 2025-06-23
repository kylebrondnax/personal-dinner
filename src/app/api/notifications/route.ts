// Notifications API endpoint for sending various email types
import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'

// POST /api/notifications - Send various types of notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    // Validate notification type
    const validTypes = [
      'welcome',
      'reservation_confirmation',
      'event_reminder',
      'payment_request',
      'event_update',
      'event_cancellation'
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid notification type',
          message: `Type must be one of: ${validTypes.join(', ')}`
        },
        { status: 400 }
      )
    }

    let success = false
    let message = ''

    switch (type) {
      case 'welcome':
        const { userEmail, userName, userRole } = data
        success = await emailService.sendWelcomeEmail(userEmail, userName, userRole)
        message = 'Welcome email sent'
        break

      case 'reservation_confirmation':
        const { userEmail: confirmEmail, userName: confirmName, eventTitle: confirmEvent, eventDate: confirmDate, eventLocation: confirmLocation, guestCount } = data
        success = await emailService.sendReservationConfirmation(
          confirmEmail,
          confirmName,
          confirmEvent,
          new Date(confirmDate),
          confirmLocation,
          guestCount
        )
        message = 'Reservation confirmation sent'
        break

      case 'event_reminder':
        const { userEmail: reminderEmail, userName: reminderName, eventTitle: reminderEvent, eventDate: reminderDate, eventLocation: reminderLocation, hoursUntilEvent } = data
        success = await emailService.sendEventReminder(
          reminderEmail,
          reminderName,
          reminderEvent,
          new Date(reminderDate),
          reminderLocation,
          hoursUntilEvent
        )
        message = 'Event reminder sent'
        break

      case 'payment_request':
        const { userEmail: paymentEmail, userName: paymentName, eventTitle: paymentEvent, amount, venmoUrl, chefName } = data
        success = await emailService.sendPaymentRequest(
          paymentEmail,
          paymentName,
          paymentEvent,
          amount,
          venmoUrl,
          chefName
        )
        message = 'Payment request sent'
        break

      case 'event_update':
        const { userEmail: updateEmail, userName: updateName, eventTitle: updateEvent, updateMessage, eventDate: updateDate } = data
        success = await emailService.sendEventUpdate(
          updateEmail,
          updateName,
          updateEvent,
          updateMessage,
          new Date(updateDate)
        )
        message = 'Event update sent'
        break

      case 'event_cancellation':
        const { userEmail: cancelEmail, userName: cancelName, eventTitle: cancelEvent, reason, eventDate: cancelDate } = data
        success = await emailService.sendEventCancellation(
          cancelEmail,
          cancelName,
          cancelEvent,
          reason,
          new Date(cancelDate)
        )
        message = 'Event cancellation sent'
        break

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Unknown notification type',
            message: 'This notification type is not implemented'
          },
          { status: 400 }
        )
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Email delivery failed',
          message: 'Failed to send notification email'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error sending notification:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send notification',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/notifications/test - Test endpoint for development
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testType = searchParams.get('type') || 'welcome'

  try {
    let success = false
    const testEmail = 'test@example.com'
    const testName = 'Test User'

    switch (testType) {
      case 'welcome':
        success = await emailService.sendWelcomeEmail(testEmail, testName, 'ATTENDEE')
        break
      
      case 'reservation':
        success = await emailService.sendReservationConfirmation(
          testEmail,
          testName,
          'Test Dinner Event',
          new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          'Test Location',
          2
        )
        break

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid test type',
            message: 'Use ?type=welcome or ?type=reservation'
          },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success,
      message: success ? 'Test email sent successfully' : 'Failed to send test email',
      testType,
      sentTo: testEmail
    })

  } catch (error) {
    console.error('Error sending test notification:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
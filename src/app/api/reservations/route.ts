// Reservations API endpoint (like Laravel ReservationController)
import { NextRequest, NextResponse } from 'next/server'
import { ReservationService } from '@/services/ReservationService'
import { emailService } from '@/lib/email'
import { getAuth } from '@clerk/nextjs/server'

// POST /api/reservations - Create new reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get authenticated user from Clerk
    const { userId: clerkUserId } = getAuth(request)
    
    if (!clerkUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in to make a reservation'
        },
        { status: 401 }
      )
    }
    
    // Validation (like Laravel FormRequest)
    const requiredFields = ['eventId', 'guestCount']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: `Missing required fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      )
    }

    // Guest count validation
    if (body.guestCount < 1 || body.guestCount > 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Guest count must be between 1 and 10'
        },
        { status: 400 }
      )
    }

    // Create reservation using Clerk user ID directly
    const reservation = await ReservationService.createReservation({
      eventId: body.eventId,
      userId: clerkUserId, // Use Clerk user ID directly
      guestCount: Number(body.guestCount),
      dietaryRestrictions: body.dietaryRestrictions || undefined,
      specialRequests: body.specialRequests || undefined
    })

    // Send confirmation email if reservation was successful (not waitlisted)
    if (reservation.status === 'CONFIRMED') {
      try {
        // Get user info from Clerk and event details for the email
        const { clerkClient } = await import('@clerk/nextjs/server')
        const { EventService } = await import('@/services/EventService')
        
        const client = await clerkClient()
        const [clerkUser, event] = await Promise.all([
          client.users.getUser(clerkUserId),
          EventService.getEventDetails(body.eventId)
        ])
        
        if (event && clerkUser) {
          const location = event.location 
            ? `${event.location.neighborhood}, ${event.location.city}` 
            : 'Location TBD'
          
          const userEmail = clerkUser.emailAddresses.find(email => email.id === clerkUser.primaryEmailAddressId)?.emailAddress
          const userName = clerkUser.fullName || clerkUser.firstName || 'User'
          
          if (userEmail) {
            await emailService.sendReservationConfirmation(
              userEmail,
              userName,
              event.title,
              new Date(event.date),
              location,
              Number(body.guestCount)
            )
          }
        }
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the reservation if email fails
      }
    }

    return NextResponse.json({
      success: true,
      data: reservation,
      message: reservation.message || 'Reservation created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating reservation:', error)
    
    // Handle specific business logic errors
    if (error instanceof Error) {
      const knownErrors = [
        'already have a reservation',
        'Event is full',
        'does not allow waitlist'
      ]
      
      const isKnownError = knownErrors.some(msg => error.message.includes(msg))
      
      if (isKnownError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Reservation failed',
            message: error.message
          },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create reservation',
        message: 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

// GET /api/reservations - Get user's reservations (requires auth)
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId: clerkUserId } = getAuth(request)
    
    if (!clerkUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in to view reservations'
        },
        { status: 401 }
      )
    }

    const reservations = await ReservationService.getUserReservations(clerkUserId)

    return NextResponse.json({
      success: true,
      data: reservations,
      meta: {
        total: reservations.length
      }
    })

  } catch (error) {
    console.error('Error fetching reservations:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reservations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


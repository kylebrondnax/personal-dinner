// Reservations API endpoint (like Laravel ReservationController)
import { NextRequest, NextResponse } from 'next/server'
import { ReservationService } from '@/services/ReservationService'
import { UserService } from '@/services/UserService'
import { emailService } from '@/lib/email'
import { getAuth } from '@clerk/nextjs/server'

// POST /api/reservations - Create new reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get authenticated user from Clerk (optional for guest reservations)
    const { userId: clerkUserId } = getAuth(request)
    
    // Check if this is a guest reservation
    const isGuestReservation = !clerkUserId && body.guestName && body.guestEmail
    
    if (!clerkUserId && !isGuestReservation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication or guest info required',
          message: 'You must be logged in or provide guest information to make a reservation'
        },
        { status: 401 }
      )
    }
    
    // Validation (like Laravel FormRequest)
    let requiredFields = ['eventId', 'guestCount']
    
    // Add guest-specific validation
    if (isGuestReservation) {
      requiredFields = [...requiredFields, 'guestName', 'guestEmail']
    }
    
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

    // Email validation for guests
    if (isGuestReservation) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.guestEmail)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            message: 'Please provide a valid email address'
          },
          { status: 400 }
        )
      }
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

    // Ensure authenticated user exists in database
    if (clerkUserId) {
      await UserService.ensureUserExists(clerkUserId)
    }

    // Create reservation for authenticated user or guest
    const reservation = await ReservationService.createReservation({
      eventId: body.eventId,
      userId: clerkUserId || null, // null for guest reservations
      guestCount: Number(body.guestCount),
      dietaryRestrictions: body.dietaryRestrictions || undefined,
      specialRequests: body.specialRequests || undefined,
      // Guest-specific fields
      ...(isGuestReservation ? {
        guestName: body.guestName,
        guestEmail: body.guestEmail,
        phoneNumber: body.phoneNumber || undefined
      } : {})
    })

    // Send confirmation email if reservation was successful (not waitlisted)
    if (reservation.status === 'CONFIRMED') {
      try {
        const { EventService } = await import('@/services/EventService')
        const event = await EventService.getEventDetails(body.eventId)
        
        if (event) {
          const location = event.location 
            ? `${event.location.neighborhood}, ${event.location.city}` 
            : 'Location TBD'
          
          let userEmail: string | undefined
          let userName: string
          
          if (isGuestReservation) {
            // Use guest information
            userEmail = body.guestEmail
            userName = body.guestName
          } else if (clerkUserId) {
            // Get user info from Clerk
            const { clerkClient } = await import('@clerk/nextjs/server')
            const client = await clerkClient()
            const clerkUser = await client.users.getUser(clerkUserId)
            
            userEmail = clerkUser.emailAddresses.find(email => email.id === clerkUser.primaryEmailAddressId)?.emailAddress
            userName = clerkUser.fullName || clerkUser.firstName || 'User'
          }
          
          if (userEmail && userName) {
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


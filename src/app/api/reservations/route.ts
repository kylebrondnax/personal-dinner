// Reservations API endpoint (like Laravel ReservationController)
import { NextRequest, NextResponse } from 'next/server'
import { ReservationService } from '@/services/ReservationService'

// POST /api/reservations - Create new reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation (like Laravel FormRequest)
    const requiredFields = ['eventId', 'attendeeName', 'attendeeEmail', 'guestCount']
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.attendeeEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Please provide a valid email address'
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

    // TODO: For now, we'll create a temporary user or find existing one
    // In a real app, this would come from authentication
    const userData = await createOrFindUser({
      name: body.attendeeName,
      email: body.attendeeEmail,
      phoneNumber: body.phoneNumber
    })

    // Create reservation using service layer
    const reservation = await ReservationService.createReservation({
      eventId: body.eventId,
      userId: userData.id,
      guestCount: Number(body.guestCount),
      dietaryRestrictions: body.dietaryRestrictions || undefined,
      specialRequests: body.specialRequests || undefined
    })

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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'User ID is required'
        },
        { status: 401 }
      )
    }

    const reservations = await ReservationService.getUserReservations(userId)

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

// Helper function to create or find user (temporary until we add auth)
async function createOrFindUser(userData: {
  name: string
  email: string
  phoneNumber?: string
}) {
  const { prisma } = await import('@/lib/prisma')
  
  // Try to find existing user by email
  let user = await prisma.user.findUnique({
    where: { email: userData.email }
  })

  if (!user) {
    // Create new user with profile
    user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        role: 'ATTENDEE',
        profile: {
          create: {
            phoneNumber: userData.phoneNumber
          }
        }
      }
    })
  }

  return user
}
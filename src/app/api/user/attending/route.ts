// User Attending Events API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { ReservationService } from '@/services/ReservationService'

// GET /api/user/attending - Get events user is attending
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in to access this resource'
        },
        { status: 401 }
      )
    }

    // Get reservations for this user
    const reservations = await ReservationService.getUserReservations(userId)

    // Transform for dashboard display
    const attendingEvents = reservations.map(reservation => ({
      id: reservation.event.id,
      title: reservation.event.title,
      description: reservation.event.description || 'Event details',
      date: reservation.event.date.toISOString(),
      time: reservation.event.date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      }),
      location: reservation.event.location?.neighborhood && reservation.event.location?.city 
        ? `${reservation.event.location.neighborhood}, ${reservation.event.location.city}`
        : 'Location TBD',
      maxGuests: reservation.event.maxCapacity,
      currentGuests: reservation.event.reservations?.reduce((sum: number, res: { guestCount: number }) => sum + res.guestCount, 0) || 0,
      estimatedCost: reservation.event.estimatedCostPerPerson,
      actualCost: reservation.event.actualCostPerPerson,
      imageUrl: undefined, // Not available in current schema
      chefId: reservation.event.chefId,
      chefName: reservation.event.chef?.name || 'Unknown Chef',
      reservationId: reservation.id,
      reservationStatus: reservation.status,
      guestCount: reservation.guestCount,
      canCancel: reservation.canCancel
    }))

    return NextResponse.json({
      success: true,
      data: attendingEvents,
      meta: {
        total: attendingEvents.length,
        userId: userId
      }
    })

  } catch (error) {
    console.error('Error fetching user attending events:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch attending events',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
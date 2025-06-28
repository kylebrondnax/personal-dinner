// API endpoint to check user's RSVP status across events
import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET /api/events/rsvp-status - Get user's RSVP status for all events
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId: clerkUserId } = getAuth(request)
    
    if (!clerkUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'You must be logged in to check RSVP status'
        },
        { status: 401 }
      )
    }

    // Get all reservations for the user
    const reservations = await prisma.reservation.findMany({
      where: {
        userId: clerkUserId
      },
      select: {
        eventId: true,
        status: true,
        guestCount: true,
        createdAt: true
      }
    })

    // Create a map of eventId to reservation status
    const rsvpStatusMap = reservations.reduce((map, reservation) => {
      map[reservation.eventId] = {
        status: reservation.status,
        guestCount: reservation.guestCount,
        rsvpedAt: reservation.createdAt
      }
      return map
    }, {} as Record<string, { status: string; guestCount: number; rsvpedAt: Date }>)

    return NextResponse.json({
      success: true,
      data: rsvpStatusMap
    })

  } catch (error) {
    console.error('Error fetching RSVP status:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch RSVP status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
// Chef Events API endpoint
import { NextRequest, NextResponse } from 'next/server'
import { EventService } from '@/services/EventService'

// GET /api/chef/events - Get chef's events for dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // TODO: Get chefId from authentication middleware
    // For now, get it from query params
    const chefId = searchParams.get('chefId')
    
    if (!chefId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'Chef ID is required'
        },
        { status: 401 }
      )
    }

    // Get events for this chef
    const events = await EventService.getEventsByChef(chefId)

    // Transform for dashboard display
    const dashboardEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date,
      maxCapacity: event.maxCapacity,
      currentReservations: event.reservations?.reduce((sum, res) => sum + res.guestCount, 0) || 0,
      status: event.status,
      estimatedCostPerPerson: event.estimatedCostPerPerson,
      actualCostPerPerson: event.actualCostPerPerson,
      // Include polling fields
      useAvailabilityPoll: event.useAvailabilityPoll,
      pollStatus: event.pollStatus,
      pollDeadline: event.pollDeadline,
      location: event.location ? {
        neighborhood: event.location.neighborhood,
        city: event.location.city
      } : undefined,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }))

    return NextResponse.json({
      success: true,
      data: dashboardEvents,
      meta: {
        total: dashboardEvents.length,
        chefId: chefId
      }
    })

  } catch (error) {
    console.error('Error fetching chef events:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch events',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { EventService } from '@/services/EventService'

// GET /api/events/[id] - Get individual event details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event ID is required'
        },
        { status: 400 }
      )
    }

    // Get event details
    const event = await EventService.getEventById(eventId)

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: event
    })

  } catch (error) {
    console.error('Error fetching event:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch event',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PATCH /api/events/[id] - Update event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event ID is required'
        },
        { status: 400 }
      )
    }

    // Handle simple status updates (like cancellation)
    if (body.status && Object.keys(body).length === 1) {
      const updatedEvent = await EventService.updateEventStatus(eventId, body.status)
      
      return NextResponse.json({
        success: true,
        data: updatedEvent,
        message: `Event ${body.status.toLowerCase()} successfully`
      })
    }

    // Handle full event updates
    const updatedEvent = await EventService.updateEvent(eventId, {
      title: body.title,
      description: body.description,
      date: body.date ? new Date(body.date) : undefined,
      time: body.time,
      duration: body.duration ? Number(body.duration) : undefined,
      maxCapacity: body.maxCapacity ? Number(body.maxCapacity) : undefined,
      estimatedCostPerPerson: body.estimatedCostPerPerson ? Number(body.estimatedCostPerPerson) : undefined,
      location: body.location,
      cuisineTypes: body.cuisineTypes,
      dietaryAccommodations: body.dietaryAccommodations,
      useAvailabilityPoll: body.useAvailabilityPoll,
      pollDeadline: body.pollDeadline ? new Date(body.pollDeadline) : undefined,
      pollDateRange: body.pollDateRange,
      chefAvailability: body.chefAvailability
    })

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: 'Event updated successfully'
    })

  } catch (error) {
    console.error('Error updating event:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update event',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event ID is required'
        },
        { status: 400 }
      )
    }

    await EventService.deleteEvent(eventId)

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting event:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete event',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
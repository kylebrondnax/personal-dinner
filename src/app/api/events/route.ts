// Events API endpoint (like Laravel EventController)
import { NextRequest, NextResponse } from 'next/server'
import { EventService } from '@/services/EventService'
import { EventFilters } from '@/repositories/EventRepository'

// GET /api/events - List events with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters (like Laravel Request validation)
    const filters: EventFilters = {
      search: searchParams.get('search') || undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      city: searchParams.get('city') || undefined,
      cuisineTypes: searchParams.get('cuisineTypes')?.split(',') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    }

    // Use service layer (like calling a Laravel Service)
    const events = await EventService.getPublicEvents(filters)

    // Return standardized API response
    return NextResponse.json({
      success: true,
      data: events,
      meta: {
        total: events.length,
        filters: filters
      }
    })

  } catch (error) {
    console.error('Error fetching events:', error)
    
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

// POST /api/events - Create new event (chef only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // TODO: Add authentication middleware to get current user
    // For now, we'll require chefId in the request body
    
    // Check if this is a poll-enabled event
    const useAvailabilityPoll = body.useAvailabilityPoll || false
    
    // Validation (like Laravel FormRequest)
    let requiredFields = ['title', 'duration', 'maxCapacity', 'estimatedCostPerPerson', 'chefId']
    
    if (useAvailabilityPoll) {
      // For polls, we need chef availability and poll settings
      requiredFields = [...requiredFields, 'chefAvailability', 'pollDeadline', 'pollDateRange']
      
      if (!body.chefAvailability || body.chefAvailability.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            message: 'Please mark your availability on the calendar before creating the poll'
          },
          { status: 400 }
        )
      }
    } else {
      // For regular events, we need a single date
      requiredFields = [...requiredFields, 'date']
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

    // Business logic validation
    if (!useAvailabilityPoll && new Date(body.date) <= new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Event date must be in the future'
        },
        { status: 400 }
      )
    }

    if (useAvailabilityPoll && new Date(body.pollDeadline) <= new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Poll deadline must be in the future'
        },
        { status: 400 }
      )
    }

    if (useAvailabilityPoll) {
      // Create event with polling
      const event = await EventService.createEventWithPoll({
        title: body.title,
        description: body.description,
        duration: Number(body.duration),
        maxCapacity: Number(body.maxCapacity),
        estimatedCostPerPerson: Number(body.estimatedCostPerPerson),
        chefId: body.chefId,
        cuisineTypes: body.cuisineTypes || [],
        dietaryAccommodations: body.dietaryAccommodations || [],
        location: body.location,
        chefAvailability: body.chefAvailability,
        pollDeadline: new Date(body.pollDeadline),
        pollDateRange: body.pollDateRange
      })

      return NextResponse.json({
        success: true,
        data: event,
        message: 'Event with availability poll created successfully'
      }, { status: 201 })
    } else {
      // Create regular event using existing service layer
      const event = await EventService.createEvent({
        title: body.title,
        description: body.description,
        date: new Date(body.date),
        duration: Number(body.duration),
        maxCapacity: Number(body.maxCapacity),
        estimatedCostPerPerson: Number(body.estimatedCostPerPerson),
        chefId: body.chefId,
        cuisineTypes: body.cuisineTypes || [],
        dietaryAccommodations: body.dietaryAccommodations || [],
        reservationDeadline: new Date(body.reservationDeadline || body.date),
        location: body.location
      })

      return NextResponse.json({
        success: true,
        data: event,
        message: 'Event created successfully'
      }, { status: 201 })
    }

  } catch (error) {
    console.error('Error creating event:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create event',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
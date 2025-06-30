import { NextRequest, NextResponse } from 'next/server'
import { EventService } from '@/services/EventService'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Get event attendees from the service
    const attendees = await EventService.getEventAttendees(eventId)

    return NextResponse.json({
      success: true,
      data: attendees
    })

  } catch (error) {
    console.error('❌ [ATTENDEES API] Error:', error)
    
    if (error instanceof Error && error.message === 'Event not found') {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Failed to fetch attendees' },
      { status: 500 }
    )
  }
}
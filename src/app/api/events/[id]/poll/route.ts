import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProposedDateTime, PollRecipient } from '@/types'

// GET /api/events/[id]/poll - Get poll details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params

    // Find the event with poll data
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        chef: {
          include: {
            profile: true
          }
        },
        proposedDates: {
          include: {
            responses: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          },
          orderBy: {
            date: 'asc'
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      )
    }

    if (!event.useAvailabilityPoll) {
      return NextResponse.json(
        { success: false, message: 'Event does not use availability polling' },
        { status: 400 }
      )
    }

    // Format the response
    const pollData = {
      id: event.id,
      eventTitle: event.title,
      description: event.description,
      chefName: event.chef.name,
      pollStatus: event.pollStatus,
      pollDeadline: event.pollDeadline,
      proposedDates: event.proposedDates.map(proposedDate => ({
        id: proposedDate.id,
        date: proposedDate.date.toISOString().split('T')[0],
        time: proposedDate.time,
        responses: proposedDate.responses.map(response => ({
          id: response.id,
          proposedDateId: response.proposedDateId,
          userId: response.userId,
          guestEmail: response.guestEmail,
          guestName: response.guestName || response.user?.name,
          available: response.available,
          tentative: response.tentative,
          respondedAt: response.createdAt
        }))
      }))
    }

    return NextResponse.json({
      success: true,
      data: pollData
    })

  } catch (error) {
    console.error('Error fetching poll data:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/events/[id]/poll - Create availability poll
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()
    
    const { 
      proposedDates, 
      pollDeadline, 
      pollRecipients 
    }: {
      proposedDates: ProposedDateTime[]
      pollDeadline: string
      pollRecipients: PollRecipient[]
    } = body

    // Validate input
    if (!proposedDates || proposedDates.length < 2) {
      return NextResponse.json(
        { success: false, message: 'At least 2 date options are required for polling' },
        { status: 400 }
      )
    }

    if (!pollDeadline) {
      return NextResponse.json(
        { success: false, message: 'Poll deadline is required' },
        { status: 400 }
      )
    }

    // Check if event exists and can be converted to poll
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.useAvailabilityPoll) {
      return NextResponse.json(
        { success: false, message: 'Event already has availability polling enabled' },
        { status: 400 }
      )
    }

    // Update event to enable polling and create proposed dates
    const updatedEvent = await prisma.$transaction(async (tx) => {
      // Update the event
      const updated = await tx.event.update({
        where: { id: eventId },
        data: {
          useAvailabilityPoll: true,
          pollStatus: 'ACTIVE',
          pollDeadline: new Date(pollDeadline),
          status: 'POLL_ACTIVE'
        }
      })

      // Create proposed dates
      const proposedDateRecords = await Promise.all(
        proposedDates.map(proposedDate => 
          tx.proposedDate.create({
            data: {
              eventId,
              date: new Date(`${proposedDate.date}T${proposedDate.time}`),
              time: proposedDate.time
            }
          })
        )
      )

      return { updated, proposedDateRecords }
    })

    // TODO: Send poll invitation emails to recipients
    // This would integrate with your existing email service
    console.log(`Poll created with ${pollRecipients.length} recipients to notify`)
    
    return NextResponse.json({
      success: true,
      message: 'Availability poll created successfully',
      data: {
        eventId: updatedEvent.updated.id,
        pollStatus: updatedEvent.updated.pollStatus,
        proposedDatesCount: updatedEvent.proposedDateRecords.length
      }
    })

  } catch (error) {
    console.error('Error creating poll:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
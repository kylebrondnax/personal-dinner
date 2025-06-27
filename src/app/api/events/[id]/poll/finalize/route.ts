import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/events/[id]/poll/finalize - Finalize date from poll results
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()
    
    const { 
      selectedProposedDateId,
      chefId 
    }: {
      selectedProposedDateId: string
      chefId: string
    } = body

    // Validate input
    if (!selectedProposedDateId) {
      return NextResponse.json(
        { success: false, message: 'Selected proposed date ID is required' },
        { status: 400 }
      )
    }

    if (!chefId) {
      return NextResponse.json(
        { success: false, message: 'Chef ID is required' },
        { status: 400 }
      )
    }

    // Check if event exists and chef owns it
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        proposedDates: true,
        chef: true
      }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.chefId !== chefId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Only the chef can finalize the poll' },
        { status: 403 }
      )
    }

    if (!event.useAvailabilityPoll) {
      return NextResponse.json(
        { success: false, message: 'Event does not use availability polling' },
        { status: 400 }
      )
    }

    if (event.pollStatus === 'FINALIZED') {
      return NextResponse.json(
        { success: false, message: 'Poll has already been finalized' },
        { status: 400 }
      )
    }

    // Find the selected proposed date
    const selectedProposedDate = event.proposedDates.find(pd => pd.id === selectedProposedDateId)
    
    if (!selectedProposedDate) {
      return NextResponse.json(
        { success: false, message: 'Selected proposed date not found' },
        { status: 404 }
      )
    }

    // Get response counts for the selected date
    const responseCounts = await prisma.availabilityResponse.groupBy({
      by: ['available', 'tentative'],
      where: {
        proposedDateId: selectedProposedDateId
      },
      _count: {
        id: true
      }
    })

    const availableCount = responseCounts
      .filter(r => r.available && !r.tentative)
      .reduce((sum, r) => sum + r._count.id, 0)
    
    const tentativeCount = responseCounts
      .filter(r => r.available && r.tentative)
      .reduce((sum, r) => sum + r._count.id, 0)

    // Finalize the event
    const finalizedEvent = await prisma.$transaction(async (tx) => {
      // Update the event with finalized date and status
      const updated = await tx.event.update({
        where: { id: eventId },
        data: {
          date: selectedProposedDate.date,
          finalizedDate: selectedProposedDate.date,
          pollStatus: 'FINALIZED',
          status: 'OPEN', // Event is now open for regular RSVPs
          updatedAt: new Date()
        }
      })

      // Optional: Clean up poll data or keep for historical purposes
      // For now, we'll keep the poll data for analytics and transparency

      return updated
    })

    // TODO: Send date finalization emails to all poll participants
    // TODO: Send RSVP invitation emails with the final date

    return NextResponse.json({
      success: true,
      message: 'Poll finalized successfully',
      data: {
        eventId: finalizedEvent.id,
        finalizedDate: finalizedEvent.finalizedDate,
        selectedDateTime: `${selectedProposedDate.date.toISOString().split('T')[0]} ${selectedProposedDate.time}`,
        responseStats: {
          available: availableCount,
          tentative: tentativeCount,
          total: availableCount + tentativeCount
        }
      }
    })

  } catch (error) {
    console.error('Error finalizing poll:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
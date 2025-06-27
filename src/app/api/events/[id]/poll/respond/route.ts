import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/events/[id]/poll/respond - Submit availability response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()
    
    const { 
      responses,
      guestEmail,
      guestName,
      userId
    }: {
      responses: Array<{
        proposedDateId: string
        available: boolean
        tentative?: boolean
      }>
      guestEmail?: string
      guestName?: string
      userId?: string
    } = body

    // Validate input
    if (!responses || responses.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one response is required' },
        { status: 400 }
      )
    }

    if (!userId && !guestEmail) {
      return NextResponse.json(
        { success: false, message: 'Either userId or guestEmail is required' },
        { status: 400 }
      )
    }

    // Check if event exists and poll is active
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        proposedDates: true
      }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      )
    }

    if (!event.useAvailabilityPoll || event.pollStatus !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: 'Poll is not active' },
        { status: 400 }
      )
    }

    // Check if poll deadline has passed
    if (event.pollDeadline && new Date() > event.pollDeadline) {
      return NextResponse.json(
        { success: false, message: 'Poll deadline has passed' },
        { status: 400 }
      )
    }

    // Validate proposed date IDs
    const validProposedDateIds = event.proposedDates.map(pd => pd.id)
    const invalidResponses = responses.filter(r => !validProposedDateIds.includes(r.proposedDateId))
    
    if (invalidResponses.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid proposed date ID(s)' },
        { status: 400 }
      )
    }

    // Check for existing responses from this user/email
    const existingResponses = await prisma.availabilityResponse.findMany({
      where: {
        eventId,
        OR: [
          userId ? { userId } : {},
          guestEmail ? { guestEmail } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      }
    })

    // Create or update responses
    const responseRecords = await prisma.$transaction(async (tx) => {
      // Delete existing responses from this user/email
      if (existingResponses.length > 0) {
        await tx.availabilityResponse.deleteMany({
          where: {
            id: {
              in: existingResponses.map(r => r.id)
            }
          }
        })
      }

      // Create new responses
      const records = await Promise.all(
        responses.map(response => 
          tx.availabilityResponse.create({
            data: {
              eventId,
              proposedDateId: response.proposedDateId,
              userId,
              guestEmail,
              guestName,
              available: response.available,
              tentative: response.tentative || false
            }
          })
        )
      )

      return records
    })

    // TODO: Send confirmation email to respondent
    // TODO: Notify chef of new response

    return NextResponse.json({
      success: true,
      message: 'Availability responses submitted successfully',
      data: {
        responsesCount: responseRecords.length,
        eventId
      }
    })

  } catch (error) {
    console.error('Error submitting poll responses:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
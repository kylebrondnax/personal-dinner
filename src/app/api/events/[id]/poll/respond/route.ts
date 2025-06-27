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
      guestInfo
    }: {
      responses: Array<{
        proposedDateId: string
        available: boolean
        tentative?: boolean
      }>
      guestInfo: {
        email: string
        name?: string
      }
    } = body

    // Validate input
    if (!responses || responses.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one response is required' },
        { status: 400 }
      )
    }

    if (!guestInfo.email || !guestInfo.email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid email address is required' },
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

    // Check for existing responses from this email
    const existingResponses = await prisma.availabilityResponse.findMany({
      where: {
        proposedDate: {
          eventId: eventId
        },
        guestEmail: guestInfo.email
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
              eventId: eventId,
              proposedDateId: response.proposedDateId,
              guestEmail: guestInfo.email,
              guestName: guestInfo.name,
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
      message: 'Your availability has been recorded successfully',
      data: {
        responseCount: responseRecords.length,
        guestEmail: guestInfo.email,
        guestName: guestInfo.name
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
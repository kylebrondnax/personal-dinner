// Reservation Repository (easily extractable to microservice)
import { prisma } from '@/lib/prisma'
import { ReservationStatus } from '@prisma/client'

export interface CreateReservationData {
  eventId: string
  userId: string | null // null for guest reservations
  guestCount: number
  dietaryRestrictions?: string
  specialRequests?: string
  // Guest-specific fields
  guestName?: string
  guestEmail?: string
  phoneNumber?: string
}

export class ReservationRepository {
  // Create new reservation
  static async create(data: CreateReservationData) {
    return await prisma.reservation.create({
      data: {
        eventId: data.eventId,
        userId: data.userId, // null for guest reservations
        guestCount: data.guestCount,
        dietaryRestrictions: data.dietaryRestrictions,
        specialRequests: data.specialRequests,
        status: 'CONFIRMED',
        // Guest-specific fields
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        phoneNumber: data.phoneNumber
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            chef: {
              select: { name: true }
            }
          }
        },
        user: data.userId ? {
          select: {
            id: true,
            name: true,
            email: true
          }
        } : undefined
      }
    })
  }

  // Get user's reservations
  static async findByUserId(userId: string) {
    return await prisma.reservation.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            chef: {
              select: { name: true }
            },
            location: true,
            reservations: {
              select: {
                guestCount: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Get event's reservations (for chef view)
  static async findByEventId(eventId: string) {
    return await prisma.reservation.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                phoneNumber: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // CONFIRMED first, then WAITLIST
        { createdAt: 'asc' }
      ]
    })
  }

  // Update reservation status
  static async updateStatus(id: string, status: ReservationStatus) {
    return await prisma.reservation.update({
      where: { id },
      data: { status }
    })
  }

  // Cancel reservation
  static async cancel(id: string) {
    return await prisma.reservation.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    })
  }

  // Check if user already has reservation for event
  static async existsForUserAndEvent(userId: string, eventId: string) {
    const reservation = await prisma.reservation.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    })
    
    return !!reservation
  }

  // Move waitlist to confirmed (when spots open up)
  static async promoteFromWaitlist(eventId: string, availableSpots: number) {
    const waitlistReservations = await prisma.reservation.findMany({
      where: {
        eventId,
        status: 'WAITLIST'
      },
      orderBy: { createdAt: 'asc' },
      take: availableSpots
    })

    const promotedIds = waitlistReservations.map(r => r.id)
    
    if (promotedIds.length > 0) {
      await prisma.reservation.updateMany({
        where: {
          id: { in: promotedIds }
        },
        data: {
          status: 'CONFIRMED'
        }
      })
    }

    return waitlistReservations
  }
}
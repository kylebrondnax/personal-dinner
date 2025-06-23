// Reservation business logic (easily extractable to microservice)
import { ReservationRepository, CreateReservationData } from '@/repositories/ReservationRepository'
import { EventRepository } from '@/repositories/EventRepository'
import { EventService } from './EventService'

export class ReservationService {
  // Create new reservation with business logic
  static async createReservation(data: CreateReservationData) {
    // Business validation
    const existingReservation = await ReservationRepository.existsForUserAndEvent(
      data.userId, 
      data.eventId
    )
    
    if (existingReservation) {
      throw new Error('You already have a reservation for this event')
    }

    // Check capacity
    const availability = await EventService.checkAvailability(data.eventId, data.guestCount)
    
    if (!availability.available) {
      // Add to waitlist if event allows it
      const event = await EventRepository.findById(data.eventId)
      if (event?.allowWaitlist) {
        const reservation = await ReservationRepository.create({
          ...data,
          // Override status in repository for waitlist
        })
        
        // Update the status after creation (since we can't pass status to create)
        await ReservationRepository.updateStatus(reservation.id, 'WAITLIST')
        
        return {
          ...reservation,
          status: 'WAITLIST' as const,
          message: 'Added to waitlist. You\'ll be notified if spots become available.'
        }
      } else {
        throw new Error('Event is full and does not allow waitlist')
      }
    }

    // Create confirmed reservation
    const reservation = await ReservationRepository.create(data)

    // Update event status (might change from OPEN to FULL)
    await EventService.updateEventStatus(data.eventId)

    return {
      ...reservation,
      message: 'Reservation confirmed!'
    }
  }

  // Cancel reservation
  static async cancelReservation(reservationId: string, userId: string) {
    // Verify ownership
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { event: true }
    })

    if (!reservation) {
      throw new Error('Reservation not found')
    }

    if (reservation.userId !== userId) {
      throw new Error('You can only cancel your own reservations')
    }

    // Check cancellation deadline
    const hoursUntilEvent = Math.abs(reservation.event.date.getTime() - new Date().getTime()) / 36e5
    if (hoursUntilEvent < 24) {
      throw new Error('Cannot cancel within 24 hours of the event')
    }

    // Cancel the reservation
    await ReservationRepository.cancel(reservationId)

    // Promote waitlist if spots opened up
    const spotsFreed = reservation.guestCount
    const promoted = await ReservationRepository.promoteFromWaitlist(
      reservation.eventId, 
      spotsFreed
    )

    // Update event status
    await EventService.updateEventStatus(reservation.eventId)

    return {
      cancelled: true,
      promotedFromWaitlist: promoted.length,
      message: `Reservation cancelled. ${promoted.length} people promoted from waitlist.`
    }
  }

  // Get user's reservations
  static async getUserReservations(userId: string) {
    const reservations = await ReservationRepository.findByUserId(userId)
    
    return reservations.map(reservation => ({
      ...reservation,
      canCancel: this.canCancelReservation(reservation.event.date),
      event: {
        ...reservation.event,
        timeUntilEvent: this.getTimeUntilEvent(reservation.event.date)
      }
    }))
  }

  // Business logic helpers
  private static canCancelReservation(eventDate: Date): boolean {
    const hoursUntilEvent = Math.abs(eventDate.getTime() - new Date().getTime()) / 36e5
    return hoursUntilEvent >= 24
  }

  private static getTimeUntilEvent(eventDate: Date): string {
    const now = new Date()
    const diffMs = eventDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `${diffDays} days`
    return `${Math.ceil(diffDays / 7)} weeks`
  }
}

// Import prisma for the cancel method
import { prisma } from '@/lib/prisma'
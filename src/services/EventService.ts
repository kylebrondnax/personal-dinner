// Business logic layer (like Laravel Services)
// This contains the domain logic that would be the same in any framework

import { EventRepository, EventFilters, CreateEventData } from '@/repositories/EventRepository'
import { ReservationRepository } from '@/repositories/ReservationRepository'

export class EventService {
  // Get public events for browse page
  static async getPublicEvents(filters: EventFilters = {}) {
    const events = await EventRepository.findMany({
      ...filters,
      status: 'OPEN' // Only show open events to public
    })

    // Transform data for frontend (JSON parsing, calculations, etc.)
    return events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      chefId: event.chefId,
      chefName: event.chef.name,
      chefPhoto: event.chef.profile?.avatarUrl,
      date: event.date, // Keep as Date object - Next.js will serialize properly
      estimatedDuration: event.duration,
      maxCapacity: event.maxCapacity,
      currentReservations: event.reservations.reduce((sum, res) => sum + res.guestCount, 0),
      estimatedCostPerPerson: event.estimatedCostPerPerson,
      cuisineType: event.cuisineTypes ? JSON.parse(event.cuisineTypes) : [],
      dietaryAccommodations: event.dietaryAccommodations ? JSON.parse(event.dietaryAccommodations) : [],
      status: event.status as any, // Type assertion for enum
      reservationDeadline: event.reservationDeadline,
      location: event.location ? {
        address: event.location.showFullAddress ? event.location.address : undefined,
        neighborhood: event.location.neighborhood,
        city: event.location.city
      } : undefined,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }))
  }

  // Get single event with full details
  static async getEventDetails(id: string) {
    const event = await EventRepository.findById(id)
    if (!event) return null

    return {
      ...event,
      cuisineType: event.cuisineTypes ? JSON.parse(event.cuisineTypes) : [],
      dietaryAccommodations: event.dietaryAccommodations ? JSON.parse(event.dietaryAccommodations) : [],
      currentReservations: event.reservations
        .filter(r => r.status === 'CONFIRMED')
        .reduce((sum, res) => sum + res.guestCount, 0),
      reservations: event.reservations.map(res => ({
        ...res,
        user: {
          ...res.user,
          // Hide sensitive info for privacy
          email: res.user.id // Only show email to chef
        }
      }))
    }
  }

  // Create new event (chef only)
  static async createEvent(data: CreateEventData) {
    // Business logic validation
    if (data.date <= new Date()) {
      throw new Error('Event date must be in the future')
    }

    if (data.reservationDeadline >= data.date) {
      throw new Error('Reservation deadline must be before event date')
    }

    if (data.maxCapacity < 1 || data.maxCapacity > 50) {
      throw new Error('Event capacity must be between 1 and 50')
    }

    return await EventRepository.create(data)
  }

  // Check event availability
  static async checkAvailability(eventId: string, requestedSpots: number) {
    const hasSpots = await EventRepository.hasAvailableSpots(eventId, requestedSpots)
    const currentCount = await EventRepository.getReservationCount(eventId)
    
    return {
      available: hasSpots,
      currentReservations: currentCount,
      spotsRequested: requestedSpots
    }
  }

  // Get events by chef
  static async getEventsByChef(chefId: string) {
    return await EventRepository.findMany({
      // No status filter - chef sees all their events
    })
  }

  // Update event capacity when reservation changes
  static async updateEventStatus(eventId: string) {
    const event = await EventRepository.findById(eventId)
    if (!event) return

    const confirmedReservations = event.reservations
      .filter(r => r.status === 'CONFIRMED')
      .reduce((sum, res) => sum + res.guestCount, 0)

    // Auto-update status based on capacity
    if (confirmedReservations >= event.maxCapacity && event.status === 'OPEN') {
      await EventRepository.update(eventId, { status: 'FULL' } as any)
    } else if (confirmedReservations < event.maxCapacity && event.status === 'FULL') {
      await EventRepository.update(eventId, { status: 'OPEN' } as any)
    }

    return { currentReservations: confirmedReservations, maxCapacity: event.maxCapacity }
  }
}
// Business logic layer (like Laravel Services)
// This contains the domain logic that would be the same in any framework

import { EventRepository, EventFilters, CreateEventData } from '@/repositories/EventRepository'
import { ProposedDateTime, PollRecipient } from '@/types'
import { prisma } from '@/lib/prisma'

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
      status: event.status, // EventStatus enum
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

    // Ensure the chef user exists in our database
    await prisma.user.upsert({
      where: { id: data.chefId },
      update: {}, // Don't update existing users
      create: {
        id: data.chefId,
        email: `chef-${data.chefId}@temp.com`, // Temporary email, should be updated with real Clerk data
        name: 'Chef User', // Temporary name, should be updated with real Clerk data
        role: 'CHEF'
      }
    })

    return await EventRepository.create(data)
  }

  // Create new event with availability polling
  static async createEventWithPoll(data: {
    title: string
    description?: string
    duration: number
    maxCapacity: number
    estimatedCostPerPerson: number
    chefId: string
    cuisineTypes: string[]
    dietaryAccommodations: string[]
    location?: {
      address: string
      neighborhood: string
      city: string
      showFullAddress: boolean
    }
    chefAvailability: ProposedDateTime[]
    pollDeadline: Date
    pollDateRange: {
      startDate: string
      endDate: string
    }
  }) {
    // Business logic validation
    if (data.chefAvailability.length === 0) {
      throw new Error('Please mark your availability on the calendar before creating the poll')
    }

    if (data.pollDeadline <= new Date()) {
      throw new Error('Poll deadline must be in the future')
    }

    if (data.maxCapacity < 1 || data.maxCapacity > 50) {
      throw new Error('Event capacity must be between 1 and 50')
    }

    // Validate chef availability dates are in the future
    const now = new Date()
    for (const availability of data.chefAvailability) {
      const dateTime = new Date(`${availability.date}T${availability.time}`)
      if (dateTime <= now) {
        throw new Error('All availability slots must be in the future')
      }
    }

    // Validate poll date range
    const startDate = new Date(data.pollDateRange.startDate)
    const endDate = new Date(data.pollDateRange.endDate)
    if (startDate >= endDate) {
      throw new Error('Poll end date must be after start date')
    }

    return await prisma.$transaction(async (tx) => {
      // Ensure the chef user exists in our database
      await tx.user.upsert({
        where: { id: data.chefId },
        update: {}, // Don't update existing users
        create: {
          id: data.chefId,
          email: `chef-${data.chefId}@temp.com`, // Temporary email, should be updated with real Clerk data
          name: 'Chef User', // Temporary name, should be updated with real Clerk data
          role: 'CHEF'
        }
      })

      // Create the event with polling enabled
      const event = await tx.event.create({
        data: {
          title: data.title,
          description: data.description,
          date: new Date(`${data.chefAvailability[0].date}T${data.chefAvailability[0].time}`), // Temporary date
          duration: data.duration,
          maxCapacity: data.maxCapacity,
          estimatedCostPerPerson: data.estimatedCostPerPerson,
          chefId: data.chefId,
          cuisineTypes: JSON.stringify(data.cuisineTypes),
          dietaryAccommodations: JSON.stringify(data.dietaryAccommodations),
          reservationDeadline: data.pollDeadline, // Will be updated when poll is finalized
          useAvailabilityPoll: true,
          pollStatus: 'ACTIVE',
          pollDeadline: data.pollDeadline,
          status: 'POLL_ACTIVE',
          location: data.location ? {
            create: {
              address: data.location.address,
              neighborhood: data.location.neighborhood,
              city: data.location.city,
              showFullAddress: data.location.showFullAddress
            }
          } : undefined
        },
        include: {
          chef: {
            include: {
              profile: true
            }
          },
          location: true
        }
      })

      // Create chef availability slots (which serve as the poll options)
      const chefAvailabilityRecords = await Promise.all(
        data.chefAvailability.map(availability => 
          tx.proposedDate.create({
            data: {
              eventId: event.id,
              date: new Date(`${availability.date}T${availability.time}`),
              time: availability.time
            }
          })
        )
      )

      // TODO: Send poll invitation emails to recipients
      // This would be handled here or in a separate email service

      return {
        ...event,
        chefAvailability: chefAvailabilityRecords,
        pollDateRange: data.pollDateRange
      }
    })
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
      chefId: chefId
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
      await EventRepository.update(eventId, { status: 'FULL' })
    } else if (confirmedReservations < event.maxCapacity && event.status === 'FULL') {
      await EventRepository.update(eventId, { status: 'OPEN' })
    }

    return { currentReservations: confirmedReservations, maxCapacity: event.maxCapacity }
  }
}
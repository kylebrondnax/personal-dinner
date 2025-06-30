// Business logic layer (like Laravel Services)
// This contains the domain logic that would be the same in any framework

import { EventRepository, EventFilters, CreateEventData } from '@/repositories/EventRepository'
import { ProposedDateTime } from '@/types'
import { prisma } from '@/lib/prisma'
import { EventStatus } from '@prisma/client'

export class EventService {
  // Get public events for browse page
  static async getPublicEvents(filters: EventFilters = {}) {
    const events = await EventRepository.findMany({
      ...filters,
      status: ['OPEN', 'POLL_ACTIVE'] // Show both open events and active polls to public
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
  static async createEvent(data: CreateEventData & { chefName?: string; chefEmail?: string }) {
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

    // Ensure the chef user exists in our database using provided chef data
    try {
      await prisma.user.upsert({
        where: { id: data.chefId },
        update: data.chefName || data.chefEmail ? {
          ...(data.chefEmail && { email: data.chefEmail }),
          ...(data.chefName && { name: data.chefName })
        } : {}, // Don't update if no chef data provided
        create: {
          id: data.chefId,
          email: data.chefEmail || `chef-${data.chefId}@temp.com`,
          name: data.chefName || 'Chef User',
          role: 'CHEF'
        }
      })
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002' && 'meta' in error && error.meta && typeof error.meta === 'object' && 'target' in error.meta && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
        // Email already exists, try without updating email
        await prisma.user.upsert({
          where: { id: data.chefId },
          update: data.chefName ? { name: data.chefName } : {},
          create: {
            id: data.chefId,
            email: data.chefEmail || `chef-${data.chefId}@temp.com`,
            name: data.chefName || 'Chef User',
            role: 'CHEF'
          }
        })
      } else {
        throw error
      }
    }

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
    chefName?: string
    chefEmail?: string
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
      // Ensure the chef user exists in our database using provided chef data
      try {
        await tx.user.upsert({
          where: { id: data.chefId },
          update: data.chefName || data.chefEmail ? {
            ...(data.chefEmail && { email: data.chefEmail }),
            ...(data.chefName && { name: data.chefName })
          } : {}, // Don't update if no chef data provided
          create: {
            id: data.chefId,
            email: data.chefEmail || `chef-${data.chefId}@temp.com`,
            name: data.chefName || 'Chef User',
            role: 'CHEF'
          }
        })
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002' && 'meta' in error && error.meta && typeof error.meta === 'object' && 'target' in error.meta && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
          // Email already exists, try without updating email
          await tx.user.upsert({
            where: { id: data.chefId },
            update: data.chefName ? { name: data.chefName } : {},
            create: {
              id: data.chefId,
              email: data.chefEmail || `chef-${data.chefId}@temp.com`,
              name: data.chefName || 'Chef User',
              role: 'CHEF'
            }
          })
        } else {
          throw error
        }
      }

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

  // Get event by ID for editing
  static async getEventById(eventId: string) {
    const event = await EventRepository.findById(eventId)
    if (!event) return null

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.date.toTimeString().slice(0, 5), // Convert to HH:MM format
      estimatedDuration: event.duration,
      maxCapacity: event.maxCapacity,
      estimatedCostPerPerson: event.estimatedCostPerPerson,
      actualCostPerPerson: event.actualCostPerPerson,
      chefId: event.chefId,
      chefName: event.chef.name,
      chefPhoto: event.chef.profile?.avatarUrl,
      status: event.status,
      location: event.location ? {
        neighborhood: event.location.neighborhood,
        city: event.location.city,
        address: event.location.address,
        showFullAddress: event.location.showFullAddress
      } : null,
      cuisineTypes: event.cuisineTypes ? JSON.parse(event.cuisineTypes) : [],
      dietaryAccommodations: event.dietaryAccommodations ? JSON.parse(event.dietaryAccommodations) : [],
      useAvailabilityPoll: event.useAvailabilityPoll,
      pollStatus: event.pollStatus,
      pollDeadline: event.pollDeadline,
      pollDateRange: event.useAvailabilityPoll ? {
        startDate: new Date(event.date.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default: week before
        endDate: new Date(event.date.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]  // Default: 2 weeks after
      } : null,
      chefAvailability: event.proposedDates?.map(pd => ({
        date: pd.date.toISOString().split('T')[0],
        time: pd.time
      })) || [],
      currentReservations: event.reservations
        .filter(r => r.status === 'CONFIRMED')
        .reduce((sum, res) => sum + res.guestCount, 0),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }
  }

  // Update event
  static async updateEvent(eventId: string, data: Partial<{
    title: string
    description: string
    date: Date
    time: string
    duration: number
    maxCapacity: number
    estimatedCostPerPerson: number
    location: {
      neighborhood: string
      city: string
      address?: string
      showFullAddress?: boolean
    }
    cuisineTypes: string[]
    dietaryAccommodations: string[]
    useAvailabilityPoll: boolean
    pollDeadline: Date
    pollDateRange: {
      startDate: string
      endDate: string
    }
    chefAvailability: ProposedDateTime[]
  }>) {
    // Business logic validation
    if (data.date && data.date <= new Date()) {
      throw new Error('Event date must be in the future')
    }

    if (data.maxCapacity && (data.maxCapacity < 1 || data.maxCapacity > 50)) {
      throw new Error('Event capacity must be between 1 and 50')
    }

    return await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: Record<string, unknown> = {}
      
      if (data.title) updateData.title = data.title
      if (data.description !== undefined) updateData.description = data.description
      if (data.date && data.time) {
        const [hours, minutes] = data.time.split(':').map(Number)
        const eventDate = new Date(data.date)
        eventDate.setHours(hours, minutes, 0, 0)
        updateData.date = eventDate
      }
      if (data.duration) updateData.duration = data.duration
      if (data.maxCapacity) updateData.maxCapacity = data.maxCapacity
      if (data.estimatedCostPerPerson) updateData.estimatedCostPerPerson = data.estimatedCostPerPerson
      if (data.cuisineTypes) updateData.cuisineTypes = JSON.stringify(data.cuisineTypes)
      if (data.dietaryAccommodations) updateData.dietaryAccommodations = JSON.stringify(data.dietaryAccommodations)
      if (data.useAvailabilityPoll !== undefined) updateData.useAvailabilityPoll = data.useAvailabilityPoll
      if (data.pollDeadline) updateData.pollDeadline = data.pollDeadline

      // Update the event
      const event = await tx.event.update({
        where: { id: eventId },
        data: updateData,
        include: {
          chef: {
            include: {
              profile: true
            }
          },
          location: true,
          proposedDates: true
        }
      })

      // Update location if provided
      if (data.location) {
        if (event.location) {
          await tx.eventLocation.update({
            where: { eventId: eventId },
            data: {
              neighborhood: data.location.neighborhood,
              city: data.location.city,
              address: data.location.address,
              showFullAddress: data.location.showFullAddress
            }
          })
        } else {
          await tx.eventLocation.create({
            data: {
              eventId: eventId,
              neighborhood: data.location.neighborhood,
              city: data.location.city,
              address: data.location.address,
              showFullAddress: data.location.showFullAddress
            }
          })
        }
      }

      // Update chef availability for poll events
      if (data.chefAvailability && data.useAvailabilityPoll) {
        // Delete existing proposed dates
        await tx.proposedDate.deleteMany({
          where: { eventId: eventId }
        })

        // Create new proposed dates
        await Promise.all(
          data.chefAvailability.map(availability => 
            tx.proposedDate.create({
              data: {
                eventId: eventId,
                date: new Date(`${availability.date}T${availability.time}`),
                time: availability.time
              }
            })
          )
        )
      }

      return event
    })
  }

  // Update event status (simple status changes like cancellation)
  static async updateEventStatus(eventId: string, status?: EventStatus) {
    if (status) {
      // Simple status update
      return await EventRepository.update(eventId, { status })
    }

    // Auto-update status based on capacity (existing logic)
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

  // Get event attendees list
  static async getEventAttendees(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        reservations: {
          where: {
            status: {
              in: ['CONFIRMED', 'WAITLIST']
            }
          },
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    })

    if (!event) {
      throw new Error('Event not found')
    }

    // Transform reservations to EventAttendee format
    return event.reservations.map(reservation => ({
      id: reservation.id,
      name: reservation.user?.name || reservation.guestName || 'Guest',
      email: reservation.user?.email || reservation.guestEmail || '',
      guestCount: reservation.guestCount,
      status: reservation.status as 'CONFIRMED' | 'WAITLIST',
      dietaryRestrictions: reservation.dietaryRestrictions || undefined,
      userPhoto: reservation.user?.profile?.avatarUrl || undefined
    }))
  }

  // Delete event
  static async deleteEvent(eventId: string) {
    const event = await EventRepository.findById(eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    // If event has confirmed reservations, notify guests before deletion
    const confirmedReservations = event.reservations.filter(r => r.status === 'CONFIRMED')
    if (confirmedReservations.length > 0) {
      // TODO: Send cancellation/deletion notifications to guests
      // This would typically involve sending emails/SMS to guests
      // For now, we'll log the notification requirement
      console.log(`Event ${eventId} with ${confirmedReservations.length} confirmed reservations is being deleted. Guests should be notified.`)
      
      // In a production system, you would:
      // 1. Send email notifications to all confirmed guests
      // 2. Send SMS notifications if phone numbers are available
      // 3. Create notification records in the database
      // 4. Possibly create a cancellation reason/message
    }

    // Delete the event (cascade will handle related data)
    return await prisma.event.delete({
      where: { id: eventId }
    })
  }
}
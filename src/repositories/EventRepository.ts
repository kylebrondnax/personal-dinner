// Repository pattern (like Laravel Repositories)
// This layer can easily be extracted to a separate microservice

import { prisma } from '@/lib/prisma'
import { Event, EventStatus, Prisma } from '@prisma/client'

export interface EventFilters {
  search?: string
  cuisineTypes?: string[]
  maxPrice?: number
  city?: string
  status?: EventStatus
  dateFrom?: Date
  dateTo?: Date
}

export interface CreateEventData {
  title: string
  description?: string
  date: Date
  duration: number
  maxCapacity: number
  estimatedCostPerPerson: number
  chefId: string
  cuisineTypes?: string[]
  dietaryAccommodations?: string[]
  reservationDeadline: Date
  location?: {
    neighborhood: string
    city: string
    state?: string
    address?: string
    showFullAddress?: boolean
  }
}

export class EventRepository {
  // Get events with filters (like Laravel Eloquent scopes)
  static async findMany(filters: EventFilters = {}) {
    const where: Prisma.EventWhereInput = {
      status: filters.status || 'OPEN',
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { chef: { name: { contains: filters.search, mode: 'insensitive' } } }
        ]
      }),
      ...(filters.maxPrice && {
        estimatedCostPerPerson: { lte: filters.maxPrice }
      }),
      ...(filters.city && {
        location: { city: { equals: filters.city, mode: 'insensitive' } }
      }),
      ...(filters.dateFrom && { date: { gte: filters.dateFrom } }),
      ...(filters.dateTo && { date: { lte: filters.dateTo } })
    }

    return await prisma.event.findMany({
      where,
      include: {
        chef: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                avatarUrl: true,
                bio: true,
                cookingStyle: true
              }
            }
          }
        },
        location: true,
        reservations: {
          where: { status: 'CONFIRMED' },
          select: { id: true, guestCount: true }
        },
        _count: {
          select: {
            reservations: {
              where: { status: 'CONFIRMED' }
            }
          }
        }
      },
      orderBy: { date: 'asc' }
    })
  }

  // Get single event with full details
  static async findById(id: string) {
    return await prisma.event.findUnique({
      where: { id },
      include: {
        chef: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                avatarUrl: true,
                bio: true,
                cookingStyle: true,
                venmoUsername: true
              }
            }
          }
        },
        location: true,
        ingredients: {
          orderBy: { category: 'asc' }
        },
        reservations: {
          where: { status: { in: ['CONFIRMED', 'WAITLIST'] } },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile: {
                  select: { avatarUrl: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        reviews: {
          where: { approved: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile: {
                  select: { avatarUrl: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  // Create new event
  static async create(data: CreateEventData) {
    return await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        duration: data.duration,
        maxCapacity: data.maxCapacity,
        estimatedCostPerPerson: data.estimatedCostPerPerson,
        chefId: data.chefId,
        cuisineTypes: data.cuisineTypes ? JSON.stringify(data.cuisineTypes) : null,
        dietaryAccommodations: data.dietaryAccommodations ? JSON.stringify(data.dietaryAccommodations) : null,
        reservationDeadline: data.reservationDeadline,
        ...(data.location && {
          location: {
            create: data.location
          }
        })
      },
      include: {
        chef: {
          select: { id: true, name: true }
        },
        location: true
      }
    })
  }

  // Update event
  static async update(id: string, data: Partial<CreateEventData>) {
    return await prisma.event.update({
      where: { id },
      data: {
        ...data,
        ...(data.cuisineTypes && {
          cuisineTypes: JSON.stringify(data.cuisineTypes)
        }),
        ...(data.dietaryAccommodations && {
          dietaryAccommodations: JSON.stringify(data.dietaryAccommodations)
        })
      }
    })
  }

  // Delete event
  static async delete(id: string) {
    return await prisma.event.delete({
      where: { id }
    })
  }

  // Get current reservation count
  static async getReservationCount(eventId: string) {
    const result = await prisma.reservation.aggregate({
      where: {
        eventId,
        status: 'CONFIRMED'
      },
      _sum: {
        guestCount: true
      }
    })
    
    return result._sum.guestCount || 0
  }

  // Check if event has available spots
  static async hasAvailableSpots(eventId: string, requestedSpots: number = 1) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { maxCapacity: true }
    })

    if (!event) return false

    const currentReservations = await this.getReservationCount(eventId)
    return (currentReservations + requestedSpots) <= event.maxCapacity
  }
}
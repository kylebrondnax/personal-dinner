// Script to remove seed data from the database
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanup() {
  console.log('🧹 Cleaning up seed data...')

  try {
    // Delete seed events by their titles (these are the only ones with these exact titles)
    const seedEventTitles = [
      'Prime Rib Dinner',
      'Italian Night - Homemade Pasta', 
      'Korean BBQ & Banchan'
    ]

    // Delete reservations for seed events first (foreign key constraint)
    const seedEvents = await prisma.event.findMany({
      where: {
        title: {
          in: seedEventTitles
        }
      }
    })

    if (seedEvents.length > 0) {
      console.log(`Found ${seedEvents.length} seed events to clean up`)
      
      for (const event of seedEvents) {
        // Delete reservations
        const deletedReservations = await prisma.reservation.deleteMany({
          where: {
            eventId: event.id
          }
        })
        console.log(`Deleted ${deletedReservations.count} reservations for "${event.title}"`)

        // Delete ingredients
        const deletedIngredients = await prisma.ingredient.deleteMany({
          where: {
            eventId: event.id
          }
        })
        console.log(`Deleted ${deletedIngredients.count} ingredients for "${event.title}"`)

        // Delete location
        if (event.locationId) {
          await prisma.location.delete({
            where: {
              id: event.locationId
            }
          })
          console.log(`Deleted location for "${event.title}"`)
        }
      }

      // Delete events
      const deletedEvents = await prisma.event.deleteMany({
        where: {
          title: {
            in: seedEventTitles
          }
        }
      })
      console.log(`Deleted ${deletedEvents.count} seed events`)
    }

    // Delete seed users by their email domains (they all use @example.com)
    const seedUsers = await prisma.user.findMany({
      where: {
        email: {
          endsWith: '@example.com'
        }
      }
    })

    if (seedUsers.length > 0) {
      console.log(`Found ${seedUsers.length} seed users to clean up`)

      for (const user of seedUsers) {
        // Delete user profile
        if (user.profileId) {
          await prisma.userProfile.delete({
            where: {
              id: user.profileId
            }
          })
          console.log(`Deleted profile for "${user.name}"`)
        }
      }

      // Delete users
      const deletedUsers = await prisma.user.deleteMany({
        where: {
          email: {
            endsWith: '@example.com'
          }
        }
      })
      console.log(`Deleted ${deletedUsers.count} seed users`)
    }

    console.log('✅ Seed data cleanup completed!')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  }
}

cleanup()
  .catch((e) => {
    console.error('❌ Cleanup failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
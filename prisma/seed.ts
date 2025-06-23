// Database seeding (like Laravel seeders)
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create chef users
  const chef1 = await prisma.user.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'CHEF',
      profile: {
        create: {
          venmoUsername: 'sarah-chef',
          venmoLink: 'https://venmo.com/sarah-chef',
          bio: 'Passionate home chef specializing in comfort food and seasonal ingredients.',
          cookingStyle: 'Comfort Food, Seasonal',
          city: 'Seattle',
          neighborhood: 'Capitol Hill'
        }
      }
    }
  })

  const chef2 = await prisma.user.create({
    data: {
      name: 'Marco Rossi',
      email: 'marco@example.com',
      role: 'CHEF',
      profile: {
        create: {
          venmoUsername: 'marco-italian',
          venmoLink: 'https://venmo.com/marco-italian',
          bio: 'Third-generation Italian chef bringing authentic family recipes to life.',
          cookingStyle: 'Italian, Traditional',
          city: 'Seattle',
          neighborhood: 'Fremont'
        }
      }
    }
  })

  const chef3 = await prisma.user.create({
    data: {
      name: 'David Kim',
      email: 'david@example.com',
      role: 'CHEF',
      profile: {
        create: {
          venmoUsername: 'david-korean',
          venmoLink: 'https://venmo.com/david-korean',
          bio: 'Korean cuisine enthusiast focusing on modern interpretations of traditional dishes.',
          cookingStyle: 'Korean, BBQ',
          city: 'Seattle',
          neighborhood: 'Ballard'
        }
      }
    }
  })

  // Create events
  const primeRibEvent = await prisma.event.create({
    data: {
      title: 'Prime Rib Dinner',
      description: 'A classic prime rib dinner with Yorkshire pudding, roasted vegetables, and red wine reduction. Perfect for a special evening with friends.',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      duration: 180,
      maxCapacity: 8,
      estimatedCostPerPerson: 65.00,
      chefId: chef1.id,
      cuisineTypes: JSON.stringify(['American', 'Comfort Food']),
      dietaryAccommodations: JSON.stringify(['Gluten-free options']),
      reservationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      location: {
        create: {
          neighborhood: 'Capitol Hill',
          city: 'Seattle',
          state: 'WA',
          showFullAddress: false
        }
      },
      ingredients: {
        create: [
          { name: 'Prime Rib Roast', estimatedCost: 120.00, category: 'protein' },
          { name: 'Yorkshire Pudding Mix', estimatedCost: 15.00, category: 'sides' },
          { name: 'Root Vegetables', estimatedCost: 25.00, category: 'vegetables' },
          { name: 'Red Wine', estimatedCost: 35.00, category: 'beverages' },
          { name: 'Herbs & Seasonings', estimatedCost: 10.00, category: 'seasonings' }
        ]
      }
    }
  })

  const italianEvent = await prisma.event.create({
    data: {
      title: 'Italian Night - Homemade Pasta',
      description: 'Fresh handmade pasta with authentic Italian sauces. Multiple courses including antipasti, pasta course, and tiramisu for dessert.',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      duration: 150,
      maxCapacity: 6,
      estimatedCostPerPerson: 45.00,
      chefId: chef2.id,
      cuisineTypes: JSON.stringify(['Italian']),
      dietaryAccommodations: JSON.stringify(['Vegetarian', 'Vegan options']),
      reservationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      location: {
        create: {
          neighborhood: 'Fremont',
          city: 'Seattle',
          state: 'WA',
          showFullAddress: false
        }
      },
      ingredients: {
        create: [
          { name: 'Semolina Flour', estimatedCost: 12.00, category: 'pasta' },
          { name: 'San Marzano Tomatoes', estimatedCost: 18.00, category: 'sauce' },
          { name: 'Parmigiano Reggiano', estimatedCost: 35.00, category: 'cheese' },
          { name: 'Fresh Herbs', estimatedCost: 15.00, category: 'herbs' },
          { name: 'Chianti Wine', estimatedCost: 25.00, category: 'beverages' }
        ]
      }
    }
  })

  const koreanEvent = await prisma.event.create({
    data: {
      title: 'Korean BBQ & Banchan',
      description: 'Traditional Korean BBQ with house-made banchan (side dishes). Interactive cooking experience with premium wagyu beef.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      duration: 120,
      maxCapacity: 4,
      estimatedCostPerPerson: 75.00,
      chefId: chef3.id,
      cuisineTypes: JSON.stringify(['Korean', 'BBQ']),
      dietaryAccommodations: JSON.stringify(['Vegetarian options']),
      reservationDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      status: 'FULL', // This one is full to test the UI
      location: {
        create: {
          neighborhood: 'Ballard',
          city: 'Seattle',
          state: 'WA',
          showFullAddress: false
        }
      },
      ingredients: {
        create: [
          { name: 'Wagyu Beef', estimatedCost: 180.00, category: 'protein' },
          { name: 'Banchan Ingredients', estimatedCost: 45.00, category: 'sides' },
          { name: 'Korean Pear', estimatedCost: 8.00, category: 'fruit' },
          { name: 'Soju', estimatedCost: 25.00, category: 'beverages' },
          { name: 'Gochujang & Sauces', estimatedCost: 22.00, category: 'condiments' }
        ]
      }
    }
  })

  // Create some attendee users and reservations
  const attendee1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'ATTENDEE',
      profile: {
        create: {
          phoneNumber: '(555) 123-4567',
          dietaryRestrictions: JSON.stringify(['Gluten-free']),
          preferredCuisines: JSON.stringify(['Italian', 'American']),
          city: 'Seattle',
          neighborhood: 'Capitol Hill'
        }
      }
    }
  })

  const attendee2 = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'ATTENDEE',
      profile: {
        create: {
          phoneNumber: '(555) 987-6543',
          city: 'Seattle',
          neighborhood: 'Fremont'
        }
      }
    }
  })

  // Create reservations
  await prisma.reservation.create({
    data: {
      eventId: primeRibEvent.id,
      userId: attendee1.id,
      guestCount: 2,
      dietaryRestrictions: 'Gluten-free for both guests',
      status: 'CONFIRMED'
    }
  })

  await prisma.reservation.create({
    data: {
      eventId: primeRibEvent.id,
      userId: attendee2.id,
      guestCount: 3,
      status: 'CONFIRMED'
    }
  })

  await prisma.reservation.create({
    data: {
      eventId: italianEvent.id,
      userId: attendee2.id,
      guestCount: 2,
      status: 'CONFIRMED'
    }
  })

  // Fill up the Korean BBQ event
  const attendee3 = await prisma.user.create({
    data: {
      name: 'Carol Davis',
      email: 'carol@example.com',
      role: 'ATTENDEE'
    }
  })

  const attendee4 = await prisma.user.create({
    data: {
      name: 'David Wilson',
      email: 'david.w@example.com',
      role: 'ATTENDEE'
    }
  })

  await prisma.reservation.create({
    data: {
      eventId: koreanEvent.id,
      userId: attendee3.id,
      guestCount: 2,
      status: 'CONFIRMED'
    }
  })

  await prisma.reservation.create({
    data: {
      eventId: koreanEvent.id,
      userId: attendee4.id,
      guestCount: 2,
      status: 'CONFIRMED'
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log(`📅 Created ${3} events`)
  console.log(`👥 Created ${6} users (3 chefs, 3 attendees)`)
  console.log(`🎫 Created ${4} reservations`)
  console.log(`🏠 Prime Rib dinner: ${5}/8 spots filled`)
  console.log(`🍝 Italian dinner: ${2}/6 spots filled`)
  console.log(`🥩 Korean BBQ: ${4}/4 spots filled (FULL)`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
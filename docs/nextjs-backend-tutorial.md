# Next.js Backend & Data Persistence Tutorial

## Coming from WAMP Stack? Here's What's Different

If you're familiar with **WAMP (Windows, Apache, MySQL, PHP)**, Next.js + database persistence works quite differently. Let me explain the key differences and how to implement backend functionality.

---

## WAMP vs Next.js Architecture Comparison

### WAMP Stack (Traditional)
```
Frontend (HTML/JS) → Apache Server → PHP Scripts → MySQL Database
```
- **Separate files**: `index.php`, `login.php`, `api/users.php`
- **Direct DB queries**: `mysqli_query()` or PDO in PHP files
- **File-based routing**: Each `.php` file is an endpoint
- **Session management**: PHP sessions, cookies

### Next.js Stack (Modern)
```
Frontend (React) → Next.js API Routes → Database (via ORM) → PostgreSQL/MySQL
```
- **API Routes**: `app/api/users/route.ts` (file-based routing)
- **ORM/Database Layer**: Prisma, Drizzle, or raw SQL
- **TypeScript**: Type-safe throughout the stack
- **Authentication**: JWT tokens, NextAuth.js, or third-party

---

## Setting Up Database Persistence in Next.js

### Step 1: Choose Your Database & ORM

**Popular Options:**
- **Prisma** (Recommended) - Type-safe ORM with great DX
- **Drizzle** - Lightweight, SQL-like syntax
- **Raw SQL** - Direct database queries (like PHP)

**Database Options:**
- **PostgreSQL** (Recommended for production)
- **MySQL** (If you prefer staying with MySQL)
- **SQLite** (Perfect for development)

### Step 2: Install Dependencies

```bash
# For Prisma + PostgreSQL
npm install prisma @prisma/client
npm install -D prisma

# Initialize Prisma
npx prisma init
```

### Step 3: Define Your Database Schema

Create `prisma/schema.prisma` (similar to creating MySQL tables):

```prisma
// This is like your MySQL CREATE TABLE statements
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(ATTENDEE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relationships (like foreign keys)
  events       Event[]       @relation("ChefEvents")
  reservations Reservation[]
}

model Event {
  id          String   @id @default(cuid())
  title       String
  description String?
  date        DateTime
  maxCapacity Int
  chefId      String
  
  // Relationships
  chef         User          @relation("ChefEvents", fields: [chefId], references: [id])
  reservations Reservation[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Reservation {
  id        String   @id @default(cuid())
  eventId   String
  userId    String
  status    ReservationStatus @default(CONFIRMED)
  
  // Relationships
  event User @relation(fields: [eventId], references: [id])
  user  User @relation(fields: [userId], references: [id])
  
  createdAt DateTime @default(now())
}

enum Role {
  CHEF
  ATTENDEE
}

enum ReservationStatus {
  CONFIRMED
  WAITLIST
  CANCELLED
}
```

### Step 4: Create API Routes (Like PHP Endpoints)

In Next.js, API routes go in `app/api/` directory:

#### `app/api/events/route.ts` (GET all events)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This is like your PHP GET endpoint
export async function GET(request: NextRequest) {
  try {
    // This is like: SELECT * FROM events WHERE status = 'open'
    const events = await prisma.event.findMany({
      where: {
        status: 'OPEN'
      },
      include: {
        chef: true,           // JOIN with users table
        reservations: true    // JOIN with reservations table
      },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: events
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// This is like your PHP POST endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation (like PHP input validation)
    if (!body.title || !body.date || !body.maxCapacity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // This is like: INSERT INTO events (title, date, ...) VALUES (?, ?, ...)
    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        date: new Date(body.date),
        maxCapacity: body.maxCapacity,
        chefId: body.chefId, // From authentication
        estimatedCostPerPerson: body.estimatedCostPerPerson
      }
    })

    return NextResponse.json({
      success: true,
      data: event
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
```

#### `app/api/events/[id]/route.ts` (GET single event)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Dynamic route - [id] gets passed as params
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // This is like: SELECT * FROM events WHERE id = ? LIMIT 1
    const event = await prisma.event.findUnique({
      where: {
        id: params.id
      },
      include: {
        chef: {
          select: {
            name: true,
            email: true
            // Don't expose sensitive data
          }
        },
        reservations: {
          select: {
            id: true,
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: event
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}
```

#### `app/api/reservations/route.ts` (Create reservation)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check if event has capacity (like checking in PHP)
    const event = await prisma.event.findUnique({
      where: { id: body.eventId },
      include: {
        reservations: {
          where: {
            status: 'CONFIRMED'
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    const currentReservations = event.reservations.length
    if (currentReservations >= event.maxCapacity) {
      return NextResponse.json(
        { success: false, error: 'Event is full' },
        { status: 400 }
      )
    }

    // Create reservation (like INSERT in PHP)
    const reservation = await prisma.reservation.create({
      data: {
        eventId: body.eventId,
        userId: body.userId,
        status: 'CONFIRMED'
      }
    })

    return NextResponse.json({
      success: true,
      data: reservation
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create reservation' },
      { status: 500 }
    )
  }
}
```

### Step 5: Call APIs from Frontend (React Components)

Unlike PHP where you redirect or refresh pages, React uses fetch() to call APIs:

```typescript
// In your React component
const handleCreateReservation = async (formData: any) => {
  try {
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId: selectedEvent.id,
        userId: currentUser.id,
        ...formData
      })
    })

    const result = await response.json()
    
    if (result.success) {
      // Update UI without page refresh
      setReservationCreated(true)
      setShowSuccessMessage(true)
    } else {
      setError(result.error)
    }
  } catch (error) {
    setError('Network error occurred')
  }
}
```

---

## Key Differences Summary

| Aspect | WAMP/PHP | Next.js |
|--------|----------|---------|
| **Routing** | File-based PHP files | API routes in `app/api/` |
| **Database** | Direct MySQL queries | ORM (Prisma) with type safety |
| **Data Flow** | Page refreshes, forms | JSON APIs, no page refresh |
| **Type Safety** | None (PHP is dynamic) | Full TypeScript support |
| **Authentication** | PHP sessions | JWT tokens, NextAuth.js |
| **File Structure** | `login.php`, `users.php` | `app/api/auth/route.ts` |

---

## Environment Setup

Create `.env.local` (like PHP's config file):

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/familydinner"

# Authentication (if using NextAuth.js)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# API Keys
STRIPE_SECRET_KEY="sk_test_..."
```

---

## Database Migration (Like MySQL Schema Updates)

```bash
# Create and apply migrations
npx prisma migrate dev --name init

# Generate TypeScript types from schema
npx prisma generate

# View database in browser (like phpMyAdmin)
npx prisma studio
```

---

## Next Steps for Our Family Dinner App

1. **Set up Prisma** with our event/reservation schema
2. **Replace mock data** with real database calls
3. **Add authentication** for users/chefs
4. **Implement file uploads** for receipts
5. **Add payment processing** with Stripe/Venmo

Would you like me to implement any of these next steps, or do you have questions about the differences between WAMP and Next.js architecture?
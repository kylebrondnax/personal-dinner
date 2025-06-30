# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Family Dinner planning App - a sophisticated event management platform designed to help chefs host dinner events and manage cost-splitting with attendees. The application has evolved significantly beyond the initial MVP and now includes comprehensive event management, availability polling, reservation systems, and user authentication.

## Core Problem & Solution

- **Problem**: Hosts want to organize dinner events without handling complex logistics alone
- **Solution**: Full-featured event management platform with RSVP system, availability polling, cost tracking, and integrated payment coordination

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:seed` - Seed database with sample data
- `npm run prepare` - Setup Husky git hooks

## Current Implementation Status - FULLY FUNCTIONAL APPLICATION

**✅ COMPLETE: Authentication System**:
- Clerk.js integration with custom context provider
- Multi-role authentication (Chef/Attendee/Admin)
- Protected routes and middleware
- SSO callback handling and profile management

**✅ COMPLETE: Event Management System**:
- Full CRUD operations for events
- Advanced filtering and search capabilities
- Event creation with comprehensive validation
- Event status management (DRAFT, OPEN, FULL, CANCELLED, COMPLETED)
- Event sharing and attendee management

**✅ COMPLETE: Availability Polling System**:
- Calendar-based time slot selection
- Guest and authenticated user responses
- Poll deadline management
- Poll finalization and event scheduling
- Real-time response tracking

**✅ COMPLETE: Reservation System**:
- RSVP flow for both authenticated users and guests
- Waitlist management with automatic promotion
- Guest count tracking and dietary restrictions
- Reservation cancellation with business rules
- Email confirmation system integration

**✅ COMPLETE: Database Architecture**:
- PostgreSQL with Prisma ORM
- Comprehensive schema with 10+ models
- Advanced relationships and constraints
- Migration system with versioning

**✅ COMPLETE: API Architecture**:
- 11+ REST endpoints across 5 functional areas
- Standardized response format
- Comprehensive error handling
- Transaction management for complex operations

**✅ COMPLETE: UI/UX System**:
- Custom theme system with warm color palette
- Full dark/light mode support
- Mobile-first responsive design
- Component library with reusable elements
- Advanced form handling and validation

## Architecture

### Data Models (Database Schema)

**Core Models:**
```typescript
// User Management
User (id, email, name, role, profile)
UserProfile (venmoUsername, dietaryRestrictions, bio, city, etc.)

// Event Management  
Event (id, title, date, status, capacity, polling, chef)
EventLocation (address, neighborhood, city, privacy)
EventIngredient (name, estimatedCost, actualCost)

// Reservation System
Reservation (id, userId, eventId, status, guestCount, payments)

// Polling System
ProposedDate (id, eventId, date, time)
AvailabilityResponse (userId, proposedDateId, available, tentative)

// Content & Reviews
Receipt (id, eventId, fileUrl, ocrText, parsedItems)
Review (id, eventId, userId, ratings, content)
```

**Enums:**
- UserRole: CHEF | ATTENDEE | ADMIN  
- EventStatus: DRAFT | POLL_ACTIVE | OPEN | FULL | CANCELLED | COMPLETED
- ReservationStatus: CONFIRMED | WAITLIST | CANCELLED
- PollStatus: ACTIVE | CLOSED | FINALIZED

### System Architecture

**Layered Architecture Pattern:**
```
API Layer (Next.js Route Handlers)
    ↓
Service Layer (Business Logic)
    ↓  
Repository Layer (Data Access)
    ↓
Database Layer (Prisma ORM + PostgreSQL)
```

### Technology Stack

**Backend:**
- Next.js 15 with App Router and Server Components
- TypeScript for comprehensive type safety
- Prisma ORM with PostgreSQL database
- Clerk.js for authentication and user management
- Resend for email notifications

**Frontend:**
- React 19 with modern hooks and patterns
- Tailwind CSS with custom theme system
- Mobile-first responsive design
- Advanced form handling and validation
- Context-based state management

**Infrastructure:**
- PostgreSQL database (local + cloud)
- Prisma Accelerate for connection pooling
- Git hooks with Husky and lint-staged
- ESLint with Next.js configuration

## Key Implementation Features

### Frontend Architecture
- **Component System**: 15+ reusable React components with TypeScript interfaces
- **Theme System**: Custom warm color palette with full dark/light mode support
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Form Management**: Advanced validation with real-time feedback
- **Authentication UI**: Integrated Clerk components with custom styling

### Backend Architecture  
- **API Design**: 11 REST endpoints with standardized response format
- **Business Logic**: Service layer with complex workflow orchestration
- **Data Access**: Repository pattern with Prisma type-safe queries
- **Transaction Management**: Multi-table operations with ACID compliance
- **Error Handling**: Layered error propagation with user-friendly messages

### Advanced Features
- **Availability Polling**: Calendar-based scheduling with real-time responses
- **Guest Support**: Full reservation system for non-registered users
- **Waitlist Management**: Automatic promotion when spots become available
- **Email Integration**: Automated confirmations and notifications
- **File Upload**: Receipt management with OCR text extraction support

### Security & Performance
- **Authentication**: Clerk.js with middleware-based route protection
- **Validation**: Comprehensive input validation on all endpoints
- **Type Safety**: End-to-end TypeScript from frontend to database
- **Responsive Performance**: Server/client component optimization

## Development Status: PRODUCTION READY

**✅ PHASE 1 COMPLETE**: Core event management and authentication
**✅ PHASE 2 COMPLETE**: Advanced polling system and reservations  
**✅ PHASE 3 COMPLETE**: Full backend integration and database architecture
**🔄 PHASE 4 IN PROGRESS**: Payment processing, advanced notifications, analytics

## API Endpoints Reference

### Event Management
- `GET/POST /api/events` - List/create events with filtering
- `GET/PATCH/DELETE /api/events/[id]` - Individual event operations
- `GET /api/events/[id]/attendees` - Event attendee management
- `GET /api/chef/events` - Chef dashboard events
- `GET /api/events/rsvp-status` - User RSVP status across events

### Availability Polling  
- `GET/POST /api/events/[id]/poll` - Poll creation and data retrieval
- `POST /api/events/[id]/poll/respond` - Submit availability responses
- `POST /api/events/[id]/poll/finalize` - Finalize event from poll results

### Reservation System
- `GET/POST /api/reservations` - Reservation management
- `GET /api/user/attending` - User's upcoming events

### Notifications
- `GET/POST /api/notifications` - Email notification system

## Component Library Reference

### Core Components
- **EventCard**: Comprehensive event display with RSVP status
- **RSVPFlow**: Multi-step reservation wizard (3 steps)
- **Navigation**: Responsive header with authentication integration
- **EventAttendeeList**: Visual attendee management
- **ThemeToggle/ThemeWrapper**: Dark/light mode system

### Polling Components
- **AvailabilityPollSection**: Poll creation interface
- **CalendarTimeSelector**: Interactive time slot selection
- **AvailabilityPollResponse**: Guest response forms
- **PollResultsView**: Response visualization

### Form Components
- **ProposedDateSelector**: Date/time selection for polls
- **PollRecipientManager**: Guest list management
- **EventShareButton**: Social sharing functionality

## Database Operations Guide

### Common Queries
```typescript
// Get events with filtering
EventRepository.findMany({ search, maxPrice, city, cuisineTypes })

// Create reservation with validation
ReservationService.createReservation({ eventId, userId, guestCount })

// Poll operations
EventService.createEventWithPoll({ chefAvailability, pollDeadline })
```

### Migration Management
- `npx prisma migrate dev` - Create and apply new migration
- `npx prisma db push` - Push schema changes without migration
- `npx prisma studio` - Visual database browser
- `npm run db:seed` - Populate with sample data

## Business Logic Notes

### Event Lifecycle
1. **DRAFT** → **POLL_ACTIVE** (if using polling)
2. **POLL_ACTIVE** → **OPEN** (after poll finalization)
3. **OPEN** → **FULL** (when capacity reached)
4. **FULL** → **OPEN** (when reservations cancelled)
5. **Any Status** → **CANCELLED** (chef cancellation)
6. **OPEN/FULL** → **COMPLETED** (after event date)

### Reservation Business Rules
- Maximum 10 guests per reservation
- Waitlist automatic promotion (FIFO)
- 24-hour cancellation policy (configurable)
- Guest reservations require email validation
- Duplicate reservation prevention per user/event

### Polling System Rules
- Minimum 2 proposed dates required
- Poll deadline must be before earliest proposed date
- Chef must mark availability before creating poll
- Responses locked after poll deadline
- Email notifications sent to all participants (integration ready)

## Development Workflow

### Git Workflow
- Husky pre-commit hooks run ESLint
- Conventional commit messages recommended
- Feature branch workflow with PR reviews

### Database Workflow
1. Update `schema.prisma` with changes
2. Run `npx prisma migrate dev --name description`
3. Update TypeScript types if needed
4. Test with `npm run db:seed`

### API Development
1. Define TypeScript interfaces in `/types`
2. Create repository methods for data access
3. Implement business logic in service layer
4. Create API route handlers with validation
5. Update frontend components to consume API

## Testing Strategy

### Recommended Testing Approach
- **Unit Tests**: Service layer business logic
- **Integration Tests**: API endpoints with test database
- **Component Tests**: React components with React Testing Library
- **E2E Tests**: Critical user flows with Playwright

### Test Data Management
- Use `prisma/seed.ts` for consistent test data
- Separate test database for integration tests
- Mock external services (email, file uploads)

## Deployment Considerations

### Environment Variables Required
```bash
DATABASE_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
RESEND_API_KEY=re_...
```

### Production Readiness Checklist
- ✅ Database migrations and connection pooling
- ✅ Authentication and authorization
- ✅ Error handling and logging
- ✅ Input validation and sanitization
- ✅ Responsive design and accessibility
- 🔄 Rate limiting and security headers
- 🔄 Performance monitoring and analytics
- 🔄 Automated testing and CI/CD pipeline

# Attendee Browse Page - Implementation Todo List

## Overview

Create an attendee-facing page where users can browse available family dinners that are still accepting reservations. Focus on clear communication of dinner details, capacity, and easy RSVP flow.

## Example Use Case
**Chef Sarah** is hosting a **Prime Rib Dinner for 8 people** on Saturday evening. The browse page should clearly show:
- What's being served (Prime Rib Dinner)
- Capacity (8 total spots)
- Current reservations (e.g., "5/8 spots filled")
- Estimated cost per person
- Date, time, location
- Easy reservation button

---

## Phase 1: Core Browse Page (High Priority)

### 1. Event Discovery & Listing
- [ ] **Event Cards Component** - Design card layout for dinner listings
  - Show dinner title, cuisine type, chef name
  - Display date, time, estimated duration
  - Show capacity: "X/Y spots available" with visual indicator
  - Estimated cost per person prominently displayed
  - Chef profile photo and rating/reviews (future)
  - "Reserve Spot" CTA button

- [ ] **Event List Page** (`/browse` or `/dinners`)
  - Grid layout of available dinner events
  - Filter by: date range, cuisine type, price range, location
  - Sort by: date, price, availability, popularity
  - Search functionality by chef name or dinner title
  - "No events found" empty state with suggestion to create one

- [ ] **Event Detail Modal/Page**
  - Full dinner description and menu details
  - Chef bio and cooking style
  - Complete ingredient list with estimated costs
  - Location details (if shared)
  - Guest list (names only, privacy-first)
  - Reviews from previous dinners (future feature)

### 2. Reservation System
- [ ] **RSVP Flow Component**
  - Guest information form (name, email, dietary restrictions)
  - Confirmation of estimated cost commitment
  - Payment method selection/setup (future: integrate with Venmo)
  - Reservation confirmation with calendar integration
  - Cancellation policy and deadline

- [ ] **Capacity Management**
  - Real-time availability updates
  - Waitlist functionality when dinner is full
  - Automatic notifications when spots open up
  - Chef control over reservation deadline (e.g., 48 hours before)

### 3. User Authentication (Simple)
- [ ] **Guest Registration**
  - Basic profile: name, email, dietary restrictions
  - Reservation history and preferences
  - Notification settings for new dinners
  - Optional: food preferences and allergens

---

## Phase 2: Enhanced Features (Medium Priority)

### 4. Advanced Filtering & Discovery
- [ ] **Smart Filters**
  - Distance/location-based filtering
  - Dietary restriction compatibility
  - Price range with dynamic pricing
  - Cuisine preferences and chef styles
  - Available dates with calendar picker

- [ ] **Recommendation Engine**
  - "Dinners you might like" based on past RSVPs
  - Similar dinners to ones you've attended
  - Popular dinners in your area
  - Chef recommendations based on your taste profile

### 5. Social Features
- [ ] **Community Aspects**
  - See which friends are attending (with privacy controls)
  - Group reservation functionality for couples/families
  - Share dinner events with friends
  - Create dinner request/suggestion system

### 6. Communication & Updates
- [ ] **Event Updates System**
  - Chef can post updates about menu changes
  - Automated reminders (48 hours, 24 hours, day of)
  - Recipe sharing post-dinner
  - Thank you messages and photo sharing

---

## Phase 3: Advanced Features (Lower Priority)

### 7. Reviews & Trust System
- [ ] **Post-Dinner Reviews**
  - Rate the dinner experience, food quality, chef
  - Written reviews with photo uploads
  - Chef response system
  - Aggregate ratings for chef profiles

### 8. Payment Integration
- [ ] **Advanced Payment Features**
  - Secure payment processing (Stripe integration)
  - Split billing for couples/groups
  - Automatic refunds for cancellations
  - Tip/gratuity system for exceptional dinners

### 9. Analytics & Insights
- [ ] **Attendee Dashboard**
  - Personal dining history and spending
  - Favorite chefs and cuisine preferences
  - Upcoming reservations calendar
  - Dietary tracking and nutrition insights

---

## Technical Implementation Notes

### Data Models Needed
```typescript
interface DinnerEvent {
  id: string
  title: string
  description: string
  chefId: string
  chefName: string
  chefPhoto?: string
  date: Date
  estimatedDuration: number // minutes
  maxCapacity: number
  currentReservations: number
  estimatedCostPerPerson: number
  cuisineType: string[]
  dietaryAccommodations: string[]
  status: 'open' | 'full' | 'cancelled' | 'completed'
  reservationDeadline: Date
  location?: {
    address?: string
    neighborhood: string
    city: string
  }
}

interface Reservation {
  id: string
  eventId: string
  attendeeId: string
  attendeeName: string
  attendeeEmail: string
  dietaryRestrictions?: string
  reservedAt: Date
  status: 'confirmed' | 'waitlist' | 'cancelled'
  guestCount: number // for couples/families
}
```

### Key Components to Build
1. **EventCard** - Reusable card for event listings
2. **EventFilter** - Filter and search controls
3. **RSVPForm** - Reservation form with validation
4. **AttendeeProfile** - User profile and preferences
5. **EventDetail** - Detailed event view with full information

### API Endpoints Needed
- `GET /api/events` - List available events with filters
- `GET /api/events/[id]` - Get event details
- `POST /api/reservations` - Create new reservation
- `PUT /api/reservations/[id]` - Update/cancel reservation
- `GET /api/attendees/[id]/reservations` - User's reservation history

---

## Priority Implementation Order

**Week 1-2**: Event listing page with basic cards and filtering
**Week 3**: RSVP flow and reservation system
**Week 4**: User authentication and profile management
**Week 5+**: Enhanced features and social aspects

## Success Metrics
- Number of successful reservations made
- Time from browse to reservation completion
- User return rate for booking additional dinners
- Chef satisfaction with attendee quality and engagement
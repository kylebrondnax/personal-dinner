# Availability Polling Feature Planning

## Overview
Add availability polling functionality to the Family Dinner app, allowing hosts to survey potential attendees about their availability before committing to a specific date and time.

## Problem Statement
Currently, hosts must manually coordinate with friends via text/email to find a date that works for everyone before creating an event. This creates friction and delays in the event planning process.

## Solution
Integrate availability polling directly into the event creation flow, allowing hosts to:
1. Propose multiple potential dates/times
2. Send polls to their friend group
3. Collect responses automatically
4. Finalize the event based on poll results

## Feature Architecture

### Database Schema Extensions

```prisma
model Event {
  // ... existing fields
  useAvailabilityPoll Boolean @default(false)
  pollStatus         PollStatus? 
  pollDeadline       DateTime?
  finalizedDate      DateTime? // Different from original date during polling
  
  // Relations
  proposedDates      ProposedDate[]
  availabilityResponses AvailabilityResponse[]
}

model ProposedDate {
  id       String   @id @default(cuid())
  eventId  String
  date     DateTime
  time     String   // e.g., "18:00"
  
  event    Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  responses AvailabilityResponse[]
  
  createdAt DateTime @default(now())
  
  @@map("proposed_dates")
}

model AvailabilityResponse {
  id              String  @id @default(cuid())
  eventId         String
  proposedDateId  String
  userId          String?  // Optional for guest responses
  guestEmail      String?  // For non-registered users
  guestName       String?
  available       Boolean
  tentative       Boolean @default(false)
  
  event           Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  proposedDate    ProposedDate @relation(fields: [proposedDateId], references: [id], onDelete: Cascade)
  user            User? @relation(fields: [userId], references: [id])
  
  createdAt       DateTime @default(now())
  
  @@unique([proposedDateId, userId])
  @@unique([proposedDateId, guestEmail])
  @@map("availability_responses")
}

enum PollStatus {
  ACTIVE
  CLOSED
  FINALIZED
}
```

### Extended Type Definitions

```typescript
// Extend existing EventFormData interface
interface EventFormData {
  // ... existing fields
  useAvailabilityPoll: boolean
  proposedDates: ProposedDateTime[]
  pollDeadline: Date
  pollRecipients: PollRecipient[]
}

interface ProposedDateTime {
  id?: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
}

interface PollRecipient {
  email: string
  name?: string
  userId?: string
}

interface AvailabilityPollData {
  id: string
  eventTitle: string
  proposedDates: ProposedDateTime[]
  pollDeadline: Date
  responses: AvailabilityResponse[]
  status: 'ACTIVE' | 'CLOSED' | 'FINALIZED'
}

interface AvailabilityResponse {
  id: string
  proposedDateId: string
  userId?: string
  guestEmail?: string
  guestName?: string
  available: boolean
  tentative: boolean
  respondedAt: Date
}
```

## Implementation Plan

### Phase 1: Core Infrastructure
1. **Database Schema Updates**
   - Add new tables: `ProposedDate`, `AvailabilityResponse`
   - Extend `Event` table with polling fields
   - Create migration scripts

2. **API Endpoints**
   - `POST /api/events/[id]/poll` - Create availability poll
   - `GET /api/events/[id]/poll` - Get poll details
   - `POST /api/events/[id]/poll/respond` - Submit availability response
   - `POST /api/events/[id]/poll/finalize` - Finalize date from poll results

### Phase 2: UI Components
1. **AvailabilityPollSection.tsx** - Added to event creation form
2. **ProposedDateSelector.tsx** - Date/time picker for multiple options
3. **PollRecipientManager.tsx** - Manage who receives the poll
4. **AvailabilityPollResponse.tsx** - Guest response interface
5. **PollResultsView.tsx** - Chef dashboard poll results

### Phase 3: Integration Points
1. **Update Event Creation Flow** - Add poll option toggle
2. **Extend Chef Dashboard** - Show poll status and results
3. **Email Integration** - Send poll invitations and reminders
4. **Notification System** - Notify chef when responses come in

## User Flows

### Host Flow
1. **Event Creation with Poll**
   - Toggle "Poll for availability first" 
   - Add 2-5 proposed dates/times
   - Set poll deadline (default: 3 days)
   - Add recipient emails
   - Submit to create poll (not full event yet)

2. **Poll Management**
   - View responses in dashboard
   - Send reminders to non-responders
   - Finalize date when ready
   - System converts poll to bookable event

### Guest Flow
1. **Receive Poll Invitation**
   - Email with poll link and proposed dates
   - Click link to respond (no account required)

2. **Submit Availability**
   - View proposed dates
   - Mark as "Available", "Maybe", or "Can't make it"
   - Optionally leave comment
   - Submit response

3. **Get Final Confirmation**
   - Receive email when date is finalized
   - Link to RSVP for the actual event

## Technical Considerations

### Event Status Flow
```
DRAFT → POLL_ACTIVE → POLL_CLOSED → OPEN → FULL/COMPLETED/CANCELLED
```

- **POLL_ACTIVE**: Poll is live, collecting responses
- **POLL_CLOSED**: Poll deadline passed, chef can finalize
- **OPEN**: Date finalized, event open for regular RSVPs

### Email Templates
1. **Poll Invitation**: "Help [Chef] pick a date for [Event]"
2. **Poll Reminder**: "Don't forget to respond to [Event] availability poll"  
3. **Date Finalized**: "[Event] is confirmed for [Date] - RSVP now!"

### Security & Privacy
- Poll responses don't require user accounts
- Guest emails only used for polling, not stored permanently
- Poll links include secure tokens to prevent spam
- Respect unsubscribe preferences

## Success Metrics
- Reduction in event creation time
- Higher event attendance rates
- Fewer cancelled events due to scheduling conflicts
- User satisfaction scores for event planning experience

## Future Enhancements
- Recurring event polls
- Integration with calendar services
- SMS polling option
- Advanced scheduling algorithms
- Waitlist management for finalized events

## Migration Strategy
1. Deploy database changes with feature flag disabled
2. Test polling functionality with internal users
3. Gradual rollout to beta users
4. Full release with documentation and support materials

This feature aligns perfectly with the existing Family Dinner app architecture and solves a real pain point in the event planning process while maintaining the trusted circle approach.
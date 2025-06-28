# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Family Dinner planning App designed to help hosts split costs for expensive meals with friends/family. The project is currently in development using Next.js 15, TypeScript, and Tailwind CSS v4.

## Core Problem & Solution

- **Problem**: Hosts want to cook expensive meals without footing the entire bill
- **Solution**: Cost-splitting tool for trusted circles with transparent payment tracking via Venmo integration

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Current Implementation Status

**Phase 1 MVP Components Implemented**:

- ✅ `VenmoSetup` - Venmo username/link configuration
- ✅ `CostEditor` - Estimated vs actual cost management with inline editing
- ✅ `PaymentTracker` - Payment status tracking with Venmo request generation
- ✅ `ReceiptUpload` - PDF upload component (parsing simulation ready)
- ✅ Core types and utilities for cost calculations
- ✅ Mobile-first responsive design with Tailwind CSS

**Authentication & Hosting Flow Implemented**:

- ✅ AuthContext for chef/guest authentication (localStorage-based demo)
- ✅ Chef registration/login page (`/chef/auth`)
- ✅ Chef dashboard with event management (`/chef/dashboard`)
- ✅ Event creation form with full validation (`/chef/create-event`)
- ✅ Theme toggle and dark mode support across all pages

**Next Steps for Full MVP**:

- PDF parsing integration (`pdf-parse` library)
- Connect event creation form to actual API endpoints
- Implement real user authentication with backend
- Receipt management and cost splitting after events

## Architecture

### Data Models

```typescript
// Enhanced event object
{
  id: string,
  title: string,
  costStatus: 'estimated' | 'actual',
  estimatedIngredients: Ingredient[],
  actualIngredients?: Ingredient[],
  attendeePayments: AttendeePayment[],
  receipts?: Receipt[]
}

// Enhanced user profile
{
  venmoUsername?: string,
  venmoLink?: string
}
```

### Key Components

- **VenmoSetup**: Username validation and link generation
- **CostEditor**: Toggle between estimated/actual costs with inline editing
- **PaymentTracker**: Individual payment status with Venmo request generation
- **ReceiptUpload**: Drag/drop PDF upload with parsing simulation

### Technology Stack

- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS v4 for mobile-first responsive design
- React hooks for state management
- Utility functions for cost calculations and Venmo URL generation

## Implementation Notes

- Mobile-first responsive design throughout
- Component-based architecture with TypeScript interfaces
- Simulation ready for PDF parsing integration
- Venmo payment URL generation implemented
- State management handles cost updates and payment tracking
- All components are client-side rendered for interactivity

## Development Priorities

1. **Phase 1**: ✅ Core MVP components with mock data
2. **Phase 2**: ✅ Authentication system, chef hosting flow, event management
3. **Phase 3**: PDF receipt parsing, payment processing, backend integration
4. **Phase 4**: Enhanced UX, payment reminders, receipt history

## Future Features - User Account Benefits

### For Guests (Optional Accounts)

- **Dining History**: Track past family dinners attended
- **Preferences**: Save dietary restrictions and cuisine preferences
- **Quick RSVP**: Faster booking with saved payment info
- **Reviews**: Leave reviews for chefs and dinners
- **Favorites**: Save favorite chefs and get notified of their events
- **Social Features**: Connect with other food lovers in the community

### For Hosts (Required Accounts)

- **Event Management**: Create, edit, and manage dinner events
- **Guest Communications**: Send updates and messages to attendees
- **Payment Tracking**: Monitor who has paid and send payment reminders
- **Receipt Management**: Upload receipts and calculate actual costs
- **Analytics**: View hosting statistics and guest feedback
- **Profile**: Build chef reputation with bio, photos, and reviews

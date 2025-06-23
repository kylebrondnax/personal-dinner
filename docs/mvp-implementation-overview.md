# Family Dinner Planning App - MVP Implementation Overview

## Core Problem

Host wants to cook expensive meals for friends/family without footing the entire bill. Need a tool to split costs transparently with trusted circle.

## Key MVP Features to Implement

### 1. Chef Profile Enhancement

**Current**: Basic profile with name, email, invite code
**Add**:

-   Venmo username/link field during chef setup
-   Profile edit functionality to update Venmo info
-   Display Venmo info in chef dashboard

### 2. Cost Management System

**Current**: Static estimated costs displayed
**Add**:

-   "Estimated" vs "Actual" cost states for events
-   Edit mode for updating costs after shopping
-   PDF receipt upload and parsing functionality
-   Visual indicator showing estimated vs actual costs
-   Cost difference calculation and display

### 3. Payment Integration

**Add**:

-   Venmo payment request generation using chef's stored link
-   Individual payment amount calculation per attendee
-   Payment status tracking (paid/unpaid checkboxes)
-   One-click payment request sharing
-   Payment summary view for chef

### 4. Receipt Processing

**Add**:

-   PDF file upload component
-   Receipt parsing using OCR/text extraction
-   Line item extraction and cost mapping
-   Manual edit capability for parsed results
-   Receipt storage and viewing

### 5. Mobile Optimization

**Current**: Desktop-focused design
**Improve**:

-   Mobile-first responsive design
-   Touch-friendly UI elements
-   Optimized forms for mobile input
-   Better navigation for small screens

## Technical Implementation Details

### State Management Updates

```javascript
// Enhanced event object structure
{
  id: number,
  title: string,
  // ... existing fields
  costStatus: 'estimated' | 'actual',
  actualIngredients?: Array<{name: string, cost: number}>,
  attendeePayments: Array<{name: string, email: string, paid: boolean, amount: number}>,
  receipts?: Array<{filename: string, data: string}>
}

// Enhanced user profile
{
  // ... existing fields
  venmoUsername: string,
  venmoLink: string
}
```

### New Components Needed

#### 1. VenmoSetup Component

-   Input field for Venmo username
-   Auto-generate Venmo payment link
-   Validation for Venmo username format

#### 2. ReceiptUpload Component

-   PDF file upload with drag/drop
-   Progress indicator for processing
-   Parsed results display with edit capability
-   Integration with PDF parsing library

#### 3. CostEditor Component

-   Toggle between estimated and actual costs
-   Inline editing for ingredient costs
-   Bulk update from receipt parsing
-   Cost comparison view

#### 4. PaymentTracker Component

-   Attendee list with payment status
-   Individual payment amount calculation
-   Venmo payment request generation
-   Payment status checkboxes

#### 5. PaymentRequestGenerator

-   Calculate individual amounts based on actual costs
-   Generate Venmo payment URLs with amounts
-   Copy/share functionality for payment requests

### Required Libraries/APIs

#### PDF Processing

-   `pdf-parse` or `pdf2pic` + OCR library
-   Alternative: `@pdftron/webviewer` for client-side processing
-   Fallback: Manual entry if parsing fails

#### Mobile Optimization

-   Enhanced Tailwind responsive utilities
-   Touch gesture handling
-   Mobile-specific form components

### Data Flow Updates

#### Cost Update Flow

1. Chef creates event with estimated costs
2. Attendees see estimated amounts and can commit
3. Chef shops and uploads receipt
4. System parses receipt and updates actual costs
5. Chef reviews/edits parsed costs
6. System calculates final per-person amounts
7. Chef generates Venmo payment requests
8. Attendees pay and chef marks as paid

#### Payment Flow

1. Final costs calculated after shopping
2. Amount per person = total actual cost / attendees
3. Generate Venmo payment URLs with specific amounts
4. Share payment requests via copy/paste or direct links
5. Track payment status in chef dashboard

## Implementation Priority

### Phase 1 (Core MVP)

1. Add Venmo link to chef profile
2. Implement cost editing functionality
3. Add payment status tracking
4. Mobile responsive improvements

### Phase 2 (Enhanced MVP)

1. PDF receipt upload component
2. Receipt parsing integration
3. Automated cost updating from receipts
4. Payment request generation

### Phase 3 (Polish)

1. Enhanced mobile UX
2. Cost comparison visualizations
3. Payment reminder functionality
4. Receipt storage and history

## Notes for Implementation

-   Keep mobile-first approach throughout
-   Ensure graceful fallbacks if PDF parsing fails
-   Focus on simple, intuitive UX for non-technical users
-   Maintain existing component structure where possible
-   Add proper error handling for file uploads and parsing

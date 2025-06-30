// Core types for the Family Dinner App

export interface User {
	id: string;
	name: string;
	email: string;
	venmoUsername?: string;
	venmoLink?: string;
	inviteCode?: string;
}

export interface Ingredient {
	name: string;
	cost: number;
}

export interface AttendeePayment {
	name: string;
	email: string;
	paid: boolean;
	amount: number;
}

export interface Receipt {
	filename: string;
	data: string; // base64 or file path
	uploadedAt: Date;
}

export interface DinnerEvent {
	id: string;
	title: string;
	description?: string;
	date: Date;
	chefId: string;
	costStatus: 'estimated' | 'actual';
	estimatedIngredients: Ingredient[];
	actualIngredients?: Ingredient[];
	attendeePayments: AttendeePayment[];
	receipts?: Receipt[];
	createdAt: Date;
	updatedAt: Date;
}

export type CostStatus = 'estimated' | 'actual';

// Attendee-facing event types
export interface PublicDinnerEvent {
	id: string;
	title: string;
	description: string;
	chefId: string;
	chefName: string;
	chefPhoto?: string;
	date: Date;
	estimatedDuration: number; // minutes
	maxCapacity: number;
	currentReservations: number;
	estimatedCostPerPerson: number;
	cuisineType: string[];
	dietaryAccommodations: string[];
	status: 'open' | 'full' | 'cancelled' | 'completed';
	reservationDeadline: Date;
	location?: {
		address?: string;
		neighborhood: string;
		city: string;
	};
	createdAt: Date;
	updatedAt: Date;
	// User's RSVP status (populated when fetching with user context)
	userRsvpStatus?: RSVPStatus;
	// Polling-related fields
	useAvailabilityPoll?: boolean;
	pollStatus?: 'ACTIVE' | 'CLOSED' | 'FINALIZED';
	pollDeadline?: Date;
	proposedDates?: ProposedDateTime[];
}

export interface RSVPStatus {
	status: 'CONFIRMED' | 'WAITLIST' | 'CANCELLED';
	guestCount: number;
	rsvpedAt: Date;
}

export interface Reservation {
	id: string;
	eventId: string;
	attendeeId: string;
	attendeeName: string;
	attendeeEmail: string;
	dietaryRestrictions?: string;
	reservedAt: Date;
	status: 'confirmed' | 'waitlist' | 'cancelled';
	guestCount: number;
}

export interface EventAttendee {
	id: string;
	name: string;
	email: string;
	guestCount: number;
	status: 'CONFIRMED' | 'WAITLIST';
	dietaryRestrictions?: string;
	userPhoto?: string;
}

export interface Attendee {
	id: string;
	name: string;
	email: string;
	dietaryRestrictions?: string[];
	preferences?: {
		cuisineTypes: string[];
		maxBudget?: number;
		preferredDays: string[];
	};
	createdAt: Date;
}

// ================================
// AVAILABILITY POLLING TYPES
// ================================

export interface ProposedDateTime {
	id?: string;
	date: string; // YYYY-MM-DD
	time: string; // HH:MM
}

export interface PollRecipient {
	email: string;
	name?: string;
	userId?: string;
}

export interface AvailabilityResponse {
	id: string;
	proposedDateId: string;
	userId?: string;
	guestEmail?: string;
	guestName?: string;
	available: boolean;
	tentative: boolean;
	respondedAt: Date;
}

export interface AvailabilityPollData {
	id: string;
	eventTitle: string;
	description?: string;
	proposedDates: (ProposedDateTime & { responses: AvailabilityResponse[] })[];
	pollDeadline: Date | string;
	responses: AvailabilityResponse[];
	status: 'ACTIVE' | 'CLOSED' | 'FINALIZED';
	chefName: string;
}

// Extended event form data for creation with polling
export interface EventFormDataWithPolling {
	// Basic event fields
	title: string;
	description: string;
	date: string;
	time: string;
	duration: number;
	maxCapacity: number;
	estimatedCostPerPerson: number;
	cuisineTypes: string[];
	dietaryAccommodations: string[];
	location: {
		address: string;
		neighborhood: string;
		city: string;
		showFullAddress: boolean;
	};
	reservationDeadline: string;

	// Polling fields
	useAvailabilityPoll: boolean;
	pollDeadline: string;
	pollDateRange: {
		startDate: string;
		endDate: string;
	};
	chefAvailability: ProposedDateTime[];
}

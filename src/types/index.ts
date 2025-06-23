// Core types for the Family Dinner Planning App

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
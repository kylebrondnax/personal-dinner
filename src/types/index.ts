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
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateTotalCost(ingredients: { cost: number }[]): number {
  return ingredients.reduce((total, ingredient) => total + ingredient.cost, 0)
}

export function calculatePerPersonCost(totalCost: number, attendeeCount: number): number {
  return attendeeCount > 0 ? totalCost / attendeeCount : 0
}

export function generateVenmoUrl(username: string, amount: number, note: string): string {
  const encodedNote = encodeURIComponent(note)
  return `https://venmo.com/${username}?txn=pay&amount=${amount}&note=${encodedNote}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}
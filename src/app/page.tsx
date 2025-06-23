'use client'

import { useState } from 'react'
import { VenmoSetup } from '@/components/VenmoSetup'
import { CostEditor } from '@/components/CostEditor'
import { PaymentTracker } from '@/components/PaymentTracker'
import { ReceiptUpload } from '@/components/ReceiptUpload'
import { DinnerEvent, Ingredient, AttendeePayment, Receipt, CostStatus } from '@/types'
import { calculatePerPersonCost, calculateTotalCost } from '@/lib/utils'

export default function Home() {
  const [chefVenmoUsername, setChefVenmoUsername] = useState('')
  const [chefVenmoLink, setChefVenmoLink] = useState('')
  
  // Mock event data
  const [event, setEvent] = useState<DinnerEvent>({
    id: '1',
    title: 'Italian Night Dinner',
    date: new Date(),
    chefId: 'chef1',
    costStatus: 'estimated' as CostStatus,
    estimatedIngredients: [
      { name: 'Pasta', cost: 12.99 },
      { name: 'Tomatoes', cost: 8.50 },
      { name: 'Cheese', cost: 15.25 },
      { name: 'Wine', cost: 25.00 }
    ],
    actualIngredients: [],
    attendeePayments: [
      { name: 'Alice Johnson', email: 'alice@example.com', paid: false, amount: 15.44 },
      { name: 'Bob Smith', email: 'bob@example.com', paid: true, amount: 15.44 },
      { name: 'Carol Davis', email: 'carol@example.com', paid: false, amount: 15.44 },
      { name: 'David Wilson', email: 'david@example.com', paid: false, amount: 15.44 }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  })

  const handleVenmoSave = (username: string, link: string) => {
    setChefVenmoUsername(username)
    setChefVenmoLink(link)
  }

  const handleCostStatusChange = (status: CostStatus) => {
    setEvent(prev => ({ ...prev, costStatus: status }))
  }

  const handleIngredientsUpdate = (ingredients: Ingredient[], isActual: boolean) => {
    const newTotal = calculateTotalCost(ingredients)
    const perPersonAmount = calculatePerPersonCost(newTotal, event.attendeePayments.length)
    
    const updatedPayments = event.attendeePayments.map(payment => ({
      ...payment,
      amount: perPersonAmount
    }))

    setEvent(prev => ({
      ...prev,
      [isActual ? 'actualIngredients' : 'estimatedIngredients']: ingredients,
      attendeePayments: updatedPayments
    }))
  }

  const handlePaymentStatusChange = (email: string, paid: boolean) => {
    setEvent(prev => ({
      ...prev,
      attendeePayments: prev.attendeePayments.map(payment =>
        payment.email === email ? { ...payment, paid } : payment
      )
    }))
  }

  const handleReceiptUpload = (receipt: Receipt) => {
    console.log('Receipt uploaded:', receipt.filename)
  }

  const handleReceiptParsed = (parsedIngredients: Ingredient[]) => {
    handleIngredientsUpdate(parsedIngredients, true)
    setEvent(prev => ({ ...prev, costStatus: 'actual' }))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Family Dinner Planning
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Split costs transparently with your trusted circle
          </p>
        </header>

        <div className="grid gap-6">
          {/* Venmo Setup Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <VenmoSetup
              initialUsername={chefVenmoUsername}
              onSave={handleVenmoSave}
            />
          </div>

          {/* Cost Management Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <CostEditor
              costStatus={event.costStatus}
              estimatedIngredients={event.estimatedIngredients}
              actualIngredients={event.actualIngredients}
              onCostStatusChange={handleCostStatusChange}
              onIngredientsUpdate={handleIngredientsUpdate}
            />
          </div>

          {/* Receipt Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <ReceiptUpload
              onReceiptUpload={handleReceiptUpload}
              onReceiptParsed={handleReceiptParsed}
            />
          </div>

          {/* Payment Tracking Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <PaymentTracker
              attendeePayments={event.attendeePayments}
              chefVenmoUsername={chefVenmoUsername}
              eventTitle={event.title}
              onPaymentStatusChange={handlePaymentStatusChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Ingredient, CostStatus } from '@/types'
import { cn, calculateTotalCost, formatCurrency } from '@/lib/utils'

interface CostEditorProps {
  costStatus: CostStatus
  estimatedIngredients: Ingredient[]
  actualIngredients?: Ingredient[]
  onCostStatusChange: (status: CostStatus) => void
  onIngredientsUpdate: (ingredients: Ingredient[], isActual: boolean) => void
  className?: string
}

export function CostEditor({
  costStatus,
  estimatedIngredients,
  actualIngredients = [],
  onCostStatusChange,
  onIngredientsUpdate,
  className
}: CostEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingIngredients, setEditingIngredients] = useState<Ingredient[]>([])

  const currentIngredients = costStatus === 'actual' && actualIngredients.length > 0 
    ? actualIngredients 
    : estimatedIngredients

  const estimatedTotal = calculateTotalCost(estimatedIngredients)
  const actualTotal = calculateTotalCost(actualIngredients)
  const currentTotal = calculateTotalCost(currentIngredients)

  const startEditing = () => {
    setEditingIngredients([...currentIngredients])
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setEditingIngredients([])
    setIsEditing(false)
  }

  const saveEditing = () => {
    const isActual = costStatus === 'actual'
    onIngredientsUpdate(editingIngredients, isActual)
    setIsEditing(false)
  }

  const updateIngredient = (index: number, field: 'name' | 'cost', value: string | number) => {
    const updated = [...editingIngredients]
    if (field === 'cost') {
      updated[index] = { ...updated[index], cost: Number(value) }
    } else {
      updated[index] = { ...updated[index], name: value as string }
    }
    setEditingIngredients(updated)
  }

  const addIngredient = () => {
    setEditingIngredients([...editingIngredients, { name: '', cost: 0 }])
  }

  const removeIngredient = (index: number) => {
    setEditingIngredients(editingIngredients.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Cost Status Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Cost Management</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onCostStatusChange('estimated')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              costStatus === 'estimated'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            )}
          >
            Estimated
          </button>
          <button
            onClick={() => onCostStatusChange('actual')}
            className={cn(
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              costStatus === 'actual'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            )}
          >
            Actual
          </button>
        </div>
      </div>

      {/* Cost Comparison */}
      {actualIngredients.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Estimated</p>
              <p className="text-lg font-semibold text-blue-600">{formatCurrency(estimatedTotal)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Actual</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(actualTotal)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Difference</p>
              <p className={cn(
                'text-lg font-semibold',
                actualTotal > estimatedTotal ? 'text-red-600' : 'text-green-600'
              )}>
                {actualTotal > estimatedTotal ? '+' : ''}{formatCurrency(actualTotal - estimatedTotal)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ingredients List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">
            {costStatus === 'actual' ? 'Actual' : 'Estimated'} Ingredients
          </h4>
          {!isEditing && (
            <button
              onClick={startEditing}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            {editingIngredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  placeholder="Ingredient name"
                  className="flex-1 px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                />
                <input
                  type="number"
                  value={ingredient.cost}
                  onChange={(e) => updateIngredient(index, 'cost', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-24 px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                />
                <button
                  onClick={() => removeIngredient(index)}
                  className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            
            <button
              onClick={addIngredient}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100"
            >
              + Add Ingredient
            </button>

            <div className="flex gap-2 pt-2">
              <button
                onClick={saveEditing}
                className="flex-1 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
              >
                Save Changes
              </button>
              <button
                onClick={cancelEditing}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {currentIngredients.map((ingredient, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md">
                <span>{ingredient.name}</span>
                <span className="font-medium">{formatCurrency(ingredient.cost)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2 px-3 bg-gray-100 rounded-md font-semibold">
              <span>Total</span>
              <span>{formatCurrency(currentTotal)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { createItem } from '@/lib/api'
import type { Item } from '@auction-kit/drizzle'

interface CreateItemFormProps {
  auctionId: string
  onItemCreated: (item: Item) => void
}

export function CreateItemForm({ auctionId, onItemCreated }: CreateItemFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    try {
      const item = await createItem(auctionId, {
        name: name.trim(),
        description: description.trim() || undefined,
        quantity: quantity > 0 ? quantity : undefined,
      })
      setName('')
      setDescription('')
      setQuantity(1)
      onItemCreated(item)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Item Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter item name"
          className="w-full px-3 py-2 border rounded-md"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description (optional)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter item description"
          className="w-full px-3 py-2 border rounded-md"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Quantity (optional)</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          min="1"
          className="w-full px-3 py-2 border rounded-md"
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">Leave empty or set to 1 for single-item auctions</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating...' : 'Create Item'}
      </button>
    </form>
  )
}


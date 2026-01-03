'use client'

import { useState } from 'react'
import { createBidder } from '@/lib/api'
import type { Bidder } from '@auction-kit/drizzle'

interface CreateBidderFormProps {
  auctionId: string
  onBidderCreated: (bidder: Bidder) => void
}

export function CreateBidderForm({ auctionId, onBidderCreated }: CreateBidderFormProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    try {
      const bidder = await createBidder(auctionId, name.trim())
      setName('')
      onBidderCreated(bidder)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bidder')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Bidder Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter bidder name"
          className="w-full px-3 py-2 border rounded-md"
          required
          disabled={loading}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating...' : 'Create Bidder'}
      </button>
    </form>
  )
}


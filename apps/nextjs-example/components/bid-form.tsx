'use client'

import { useState } from 'react'
import { placeBid, getBids } from '@/lib/api'
import type { BidInput, AuctionState } from '@/lib/api'

interface BidFormProps {
  auctionId: string
  state: AuctionState
  onBidPlaced: () => void
}

export function BidForm({ auctionId, state, onBidPlaced }: BidFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bid, setBid] = useState<BidInput>({
    bidderId: '',
    itemId: state.items[0]?.id || '',
    amount: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await placeBid(auctionId, bid)
      setBid({ ...bid, amount: 0 })
      onBidPlaced()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bid')
    } finally {
      setLoading(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
        No items available for bidding. Items must be created via the database.
      </div>
    )
  }

  if (state.bidders.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
        No bidders registered. Bidders must be created via the database.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Bidder</label>
        <select
          value={bid.bidderId}
          onChange={(e) => setBid({ ...bid, bidderId: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          required
          disabled={loading}
        >
          <option value="">Select a bidder</option>
          {state.bidders.map((bidder) => (
            <option key={bidder.id} value={bidder.id}>
              {bidder.name} ({bidder.id.slice(0, 8)}...)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Item</label>
        <select
          value={bid.itemId}
          onChange={(e) => setBid({ ...bid, itemId: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          required
          disabled={loading}
        >
          {state.items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} {item.description && `- ${item.description}`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Bid Amount</label>
        <input
          type="number"
          value={bid.amount || ''}
          onChange={(e) => setBid({ ...bid, amount: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border rounded-md"
          min="1"
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
        disabled={loading || !bid.bidderId || !bid.itemId || bid.amount <= 0}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Placing Bid...' : 'Place Bid'}
      </button>
    </form>
  )
}


'use client'

import { useState } from 'react'
import { resolveAuction } from '@/lib/api'

interface ResolveButtonProps {
  auctionId: string
  onResolved: () => void
}

export function ResolveButton({ auctionId, onResolved }: ResolveButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [seed, setSeed] = useState<string>('')

  const handleResolve = async () => {
    setLoading(true)
    setError(null)

    try {
      const seedNum = seed ? parseInt(seed, 10) : undefined
      if (seed && isNaN(seedNum!)) {
        setError('Seed must be a number')
        setLoading(false)
        return
      }

      await resolveAuction(auctionId, seedNum)
      onResolved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve auction')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Random Seed (optional, for reproducible random tie-breaking)
        </label>
        <input
          type="number"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="Leave empty for timestamp-based tie-breaking"
          className="w-full px-3 py-2 border rounded-md"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleResolve}
        disabled={loading}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Resolving...' : 'Resolve Auction'}
      </button>
    </div>
  )
}


'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAuction } from '@/lib/api'
import type { AuctionConfig } from '@auction-kit/core'

export function CreateAuctionForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<AuctionConfig>({
    type: 'second-price',
    tieBreak: 'timestamp',
    multiUnit: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const auction = await createAuction(config)
      router.push(`/auction/${auction.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create auction')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Auction Type</label>
        <select
          value={config.type}
          onChange={(e) =>
            setConfig({ ...config, type: e.target.value as 'first-price' | 'second-price' })
          }
          className="w-full px-3 py-2 border rounded-md"
          disabled={loading}
        >
          <option value="first-price">First-Price (Pay your bid)</option>
          <option value="second-price">Second-Price (Vickrey - Pay second-highest)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tie-Breaking</label>
        <select
          value={config.tieBreak}
          onChange={(e) =>
            setConfig({ ...config, tieBreak: e.target.value as 'timestamp' | 'random' })
          }
          className="w-full px-3 py-2 border rounded-md"
          disabled={loading}
        >
          <option value="timestamp">Timestamp (Earliest bid wins)</option>
          <option value="random">Random (Seeded for reproducibility)</option>
        </select>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.multiUnit}
            onChange={(e) => setConfig({ ...config, multiUnit: e.target.checked })}
            className="rounded"
            disabled={loading}
          />
          <span className="text-sm font-medium">Multi-Unit (Multiple winners per item)</span>
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating...' : 'Create Auction'}
      </button>
    </form>
  )
}


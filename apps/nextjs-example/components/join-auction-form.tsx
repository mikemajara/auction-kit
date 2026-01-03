'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function JoinAuctionForm() {
  const router = useRouter()
  const [auctionId, setAuctionId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (auctionId.trim()) {
      router.push(`/auction/${auctionId.trim()}`)
    }
  }

  return (
    <div className="border-t pt-8">
      <h2 className="text-xl font-semibold mb-4">Join Existing Auction</h2>
      <p className="text-gray-600 mb-4">
        Enter an auction ID to view and place bids
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={auctionId}
          onChange={(e) => setAuctionId(e.target.value)}
          placeholder="Enter auction ID"
          className="flex-1 px-3 py-2 border rounded-md"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go
        </button>
      </form>
    </div>
  )
}


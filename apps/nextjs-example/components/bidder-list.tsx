'use client'

import type { Bidder } from '@auction-kit/drizzle'

interface BidderListProps {
  bidders: Bidder[]
}

export function BidderList({ bidders }: BidderListProps) {
  if (bidders.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-600 text-center">
        No bidders yet. Create one to get started!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold mb-3">Bidders ({bidders.length})</h3>
      <div className="space-y-2">
        {bidders.map((bidder) => (
          <div
            key={bidder.id}
            className="p-3 bg-white border border-gray-200 rounded-md flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{bidder.name}</div>
              <div className="text-xs text-gray-500">
                ID: {bidder.id.slice(0, 8)}...
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {bidder.createdAt && new Date(bidder.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


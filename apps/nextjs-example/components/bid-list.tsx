'use client'

import type { Bid, Bidder, Item } from '@auction-kit/drizzle'

interface BidListProps {
  bids: Bid[]
  bidders: Bidder[]
  items: Item[]
}

export function BidList({ bids, bidders, items }: BidListProps) {
  const getBidderName = (bidderId: string) => {
    const bidder = bidders.find((b) => b.id === bidderId)
    return bidder?.name || bidderId.slice(0, 8)
  }

  const getItemName = (itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    return item?.name || itemId.slice(0, 8)
  }

  if (bids.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-600 text-center">
        No bids yet
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold mb-3">Bids ({bids.length})</h3>
      <div className="space-y-2">
        {bids
          .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
          .map((bid) => (
            <div
              key={bid.id}
              className="p-3 bg-white border border-gray-200 rounded-md flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{getBidderName(bid.bidderId)}</div>
                <div className="text-sm text-gray-600">{getItemName(bid.itemId)}</div>
                <div className="text-xs text-gray-500">
                  {new Date(bid.placedAt).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">${bid.amount}</div>
                <div className="text-xs text-gray-500 capitalize">{bid.status}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}


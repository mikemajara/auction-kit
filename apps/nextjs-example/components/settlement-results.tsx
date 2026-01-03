'use client'

import type { ResolutionResult } from '@auction-kit/core'
import type { Bidder, Item } from '@auction-kit/drizzle'

interface SettlementResultsProps {
  result: ResolutionResult
  bidders: Bidder[]
  items: Item[]
}

export function SettlementResults({
  result,
  bidders,
  items,
}: SettlementResultsProps) {
  const getBidderName = (bidderId: string) => {
    const bidder = bidders.find((b) => b.id === bidderId)
    return bidder?.name || bidderId.slice(0, 8)
  }

  const getItemName = (itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    return item?.name || itemId.slice(0, 8)
  }

  if (result.errors.length > 0) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="font-semibold text-yellow-800 mb-2">Resolution Warnings</h3>
          <ul className="list-disc list-inside text-yellow-700 space-y-1">
            {result.errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>

        {result.settlements.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Settlements ({result.settlements.length})
            </h3>
            <div className="space-y-2">
              {result.settlements.map((settlement, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-green-50 border border-green-200 rounded-md"
                >
                  <div className="font-medium text-green-800">
                    {getBidderName(settlement.bidderId)} won{' '}
                    {getItemName(settlement.itemId)}
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    Pays ${settlement.wonAmount} (original bid: ${settlement.bidAmount})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (result.settlements.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-600 text-center">
        No winners. No bids were placed or all bids were invalid.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <h3 className="font-semibold text-green-800 mb-2">
          Auction Resolved Successfully
        </h3>
        <p className="text-green-700 text-sm">
          Resolved at {new Date(result.resolvedAt).toLocaleString()}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">
          Winners ({result.settlements.length})
        </h3>
        <div className="space-y-2">
          {result.settlements.map((settlement, idx) => (
            <div
              key={idx}
              className="p-4 bg-white border border-gray-200 rounded-md shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-lg">
                    {getBidderName(settlement.bidderId)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Won: {getItemName(settlement.itemId)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">
                    ${settlement.wonAmount}
                  </div>
                  <div className="text-xs text-gray-500">
                    Bid: ${settlement.bidAmount}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAuctionState, resolveAuction } from '@/lib/api'
import type { AuctionState } from '@/lib/api'
import type { ResolutionResult } from '@auction-kit/core'
import { ResolveButton } from '@/components/resolve-button'
import { SettlementResults } from '@/components/settlement-results'
import Link from 'next/link'

export default function ResolvePage() {
  const params = useParams()
  const router = useRouter()
  const auctionId = params.id as string

  const [state, setState] = useState<AuctionState | null>(null)
  const [resolution, setResolution] = useState<ResolutionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadState = async () => {
    try {
      setLoading(true)
      const data = await getAuctionState(auctionId)
      setState(data)
      setError(null)

      // If auction is already resolved, load settlements
      if (data.auction.status === 'resolved' && data.settlements.length > 0) {
        // Reconstruct resolution result from settlements
        setResolution({
          settlements: data.settlements.map((s) => ({
            bidderId: s.bidderId,
            itemId: s.itemId,
            wonAmount: s.wonAmount,
            bidAmount: s.bidAmount,
            settledAt: s.settledAt,
          })),
          errors: [],
          resolvedAt: data.auction.resolvedAt || new Date(),
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load auction')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (auctionId) {
      loadState()
    }
  }, [auctionId])

  const handleResolved = async () => {
    // Reload state to get updated auction status and settlements
    await loadState()
    // Redirect back to auction page
    router.push(`/auction/${auctionId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Loading...</div>
        </div>
      </div>
    )
  }

  if (error || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2 text-red-600">Error</div>
          <div className="text-gray-600 mb-4">{error || 'Auction not found'}</div>
          <Link href={`/auction/${auctionId}`} className="text-blue-600 hover:underline">
            ← Back to auction
          </Link>
        </div>
      </div>
    )
  }

  const { auction, bids, bidders, items } = state
  const isResolved = auction.status === 'resolved'

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Link href={`/auction/${auctionId}`} className="text-blue-600 hover:underline">
            ← Back to auction
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">Resolve Auction</h1>
          <p className="text-gray-600 mb-6">
            Auction {auction.id.slice(0, 8)} • {bids.length} bids •{' '}
            {auction.config.type} • {auction.config.tieBreak} tie-break
          </p>

          {isResolved ? (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 font-medium">
                  This auction has already been resolved.
                </p>
              </div>
              {resolution && (
                <SettlementResults
                  result={resolution}
                  bidders={bidders}
                  items={items}
                />
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {bids.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800">
                    No bids have been placed yet. You cannot resolve an auction without bids.
                  </p>
                </div>
              ) : (
                <>
                  <ResolveButton auctionId={auctionId} onResolved={handleResolved} />
                  {resolution && (
                    <SettlementResults
                      result={resolution}
                      bidders={bidders}
                      items={items}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


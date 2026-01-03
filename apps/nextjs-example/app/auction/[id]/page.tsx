'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAuctionState } from '@/lib/api'
import type { AuctionState } from '@/lib/api'
import { BidForm } from '@/components/bid-form'
import { BidList } from '@/components/bid-list'
import { CreateBidderForm } from '@/components/create-bidder-form'
import { BidderList } from '@/components/bidder-list'
import { CreateItemForm } from '@/components/create-item-form'
import { ItemList } from '@/components/item-list'
import type { Bidder, Item } from '@auction-kit/drizzle'
import Link from 'next/link'

export default function AuctionPage() {
  const params = useParams()
  const router = useRouter()
  const auctionId = params.id as string

  const [state, setState] = useState<AuctionState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'bidding' | 'bidders' | 'items'>('bidding')

  const loadState = async () => {
    try {
      setLoading(true)
      const data = await getAuctionState(auctionId)
      setState(data)
      setError(null)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Loading auction...</div>
          <div className="text-gray-600">Fetching auction state</div>
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
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    )
  }

  const { auction, bids, bidders, items, settlements } = state
  const isResolved = auction.status === 'resolved'

  const handleBidderCreated = (bidder: Bidder) => {
    loadState()
  }

  const handleItemCreated = (item: Item) => {
    loadState()
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Auction {auction.id.slice(0, 8)}</h1>
              <div className="flex gap-2 items-center">
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    auction.status === 'open'
                      ? 'bg-green-100 text-green-800'
                      : auction.status === 'closed'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {auction.status}
                </span>
                <span className="text-sm text-gray-600">
                  {auction.config.type} • {auction.config.tieBreak} tie-break
                  {auction.config.multiUnit && ' • Multi-unit'}
                </span>
              </div>
            </div>
            {!isResolved && (
              <Link
                href={`/auction/${auctionId}/resolve`}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Resolve Auction
              </Link>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
            <div>
              <div className="text-gray-600">Bidders</div>
              <div className="text-xl font-semibold">{bidders.length}</div>
            </div>
            <div>
              <div className="text-gray-600">Items</div>
              <div className="text-xl font-semibold">{items.length}</div>
            </div>
            <div>
              <div className="text-gray-600">Bids</div>
              <div className="text-xl font-semibold">{bids.length}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('bidding')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'bidding'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bidding
              </button>
              <button
                onClick={() => setActiveTab('bidders')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'bidders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Bidders
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'items'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Items
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'bidding' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Place Bid</h2>
              {isResolved ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                  This auction has been resolved. No new bids can be placed.
                </div>
              ) : (
                <BidForm auctionId={auctionId} state={state} onBidPlaced={loadState} />
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <BidList bids={bids} bidders={bidders} items={items} />
            </div>
          </div>
        )}

        {activeTab === 'bidders' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Create Bidder</h2>
              {isResolved ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                  This auction has been resolved. No new bidders can be added.
                </div>
              ) : (
                <CreateBidderForm
                  auctionId={auctionId}
                  onBidderCreated={handleBidderCreated}
                />
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <BidderList bidders={bidders} />
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Create Item</h2>
              {isResolved ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                  This auction has been resolved. No new items can be added.
                </div>
              ) : (
                <CreateItemForm
                  auctionId={auctionId}
                  onItemCreated={handleItemCreated}
                />
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <ItemList items={items} />
            </div>
          </div>
        )}

        {isResolved && settlements.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Settlements</h2>
            <div className="space-y-2">
              {settlements.map((settlement, idx) => {
                const bidder = bidders.find((b) => b.id === settlement.bidderId)
                const item = items.find((i) => i.id === settlement.itemId)
                return (
                  <div
                    key={idx}
                    className="p-3 bg-green-50 border border-green-200 rounded-md"
                  >
                    <div className="font-medium">
                      {bidder?.name || settlement.bidderId.slice(0, 8)} won{' '}
                      {item?.name || settlement.itemId.slice(0, 8)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Pays ${settlement.wonAmount} (bid: ${settlement.bidAmount})
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


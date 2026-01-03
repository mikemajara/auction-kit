/**
 * Tests for bid routes
 */

import { describe, it, expect, vi } from 'vitest'
import { Hono } from 'hono'
import bids from '../../routes/bids'
import { dbMiddleware } from '../../middleware/db'
import * as drizzleQueries from '@auction-kit/drizzle'
import type { Bid } from '@auction-kit/drizzle'

// Mock drizzle queries
vi.mock('@auction-kit/drizzle', () => ({
  placeBid: vi.fn(),
  getBidsByAuction: vi.fn(),
}))

describe('POST /auctions/:id/bids', () => {
  it('should place a bid', async () => {
    const mockBid: Bid = {
      id: 'bid-1',
      auctionId: 'auction-1',
      bidderId: 'bidder-1',
      itemId: 'item-1',
      amount: 100,
      placedAt: new Date(),
      status: 'active',
    }

    vi.mocked(drizzleQueries.placeBid).mockResolvedValue(mockBid)

    const app = new Hono()
    app.use('*', dbMiddleware)
    app.route('/auctions', bids)

    const bidData = {
      bidderId: 'bidder-1',
      itemId: 'item-1',
      amount: 100,
    }

    const res = await app.request('/auctions/auction-1/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bidData),
    })

    expect(res.status).toBe(201)
    const data = await res.json() as { success: boolean; data: Bid }
    expect(data.success).toBe(true)
    expect(data.data.id).toBe('bid-1')
    expect(drizzleQueries.placeBid).toHaveBeenCalledWith(
      expect.anything(),
      {
        auctionId: 'auction-1',
        ...bidData,
      }
    )
  })

  it('should handle invalid bid', async () => {
    vi.mocked(drizzleQueries.placeBid).mockRejectedValue(
      new Error('Invalid bid: amount must be positive')
    )

    const app = new Hono()
    app.use('*', dbMiddleware)
    app.route('/auctions', bids)

    const res = await app.request('/auctions/auction-1/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bidderId: 'bidder-1',
        itemId: 'item-1',
        amount: -10,
      }),
    })

    expect(res.status).toBe(400)
    const data = await res.json() as { success: boolean; error: string }
    expect(data.success).toBe(false)
    expect(data.error).toContain('Invalid')
  })
})

describe('GET /auctions/:id/bids', () => {
  it('should list bids for an auction', async () => {
    const mockBids: Bid[] = [
      {
        id: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'bidder-1',
        itemId: 'item-1',
        amount: 100,
        placedAt: new Date(),
        status: 'active',
      },
      {
        id: 'bid-2',
        auctionId: 'auction-1',
        bidderId: 'bidder-2',
        itemId: 'item-1',
        amount: 150,
        placedAt: new Date(),
        status: 'active',
      },
    ]

    vi.mocked(drizzleQueries.getBidsByAuction).mockResolvedValue(mockBids)

    const app = new Hono()
    app.use('*', dbMiddleware)
    app.route('/auctions', bids)

    const res = await app.request('/auctions/auction-1/bids', {
      method: 'GET',
    })

    expect(res.status).toBe(200)
    const data = await res.json() as { success: boolean; data: Bid[] }
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(2)
    expect(drizzleQueries.getBidsByAuction).toHaveBeenCalledWith(
      expect.anything(),
      'auction-1'
    )
  })
})


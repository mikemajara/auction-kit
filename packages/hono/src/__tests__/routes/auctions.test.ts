/**
 * Tests for auction routes
 */

import { describe, it, expect, vi } from 'vitest'
import { Hono } from 'hono'
import auctions from '../../routes/auctions'
import { dbMiddleware } from '../../middleware/db'
import * as drizzleQueries from '@auction-kit/drizzle'
import type { AuctionConfig } from '@auction-kit/core'
import type { Auction } from '@auction-kit/drizzle'

// Mock drizzle queries
vi.mock('@auction-kit/drizzle', () => ({
  createAuction: vi.fn(),
  getAuction: vi.fn(),
  getAuctionState: vi.fn(),
}))

describe('POST /auctions', () => {
  it('should create a new auction', async () => {
    const mockAuction: Auction = {
      id: 'auction-1',
      status: 'open',
      config: {
        type: 'first-price',
        tieBreak: 'timestamp',
        multiUnit: false,
      },
      createdAt: new Date(),
      resolvedAt: null,
    }

    vi.mocked(drizzleQueries.createAuction).mockResolvedValue(mockAuction)

    const app = new Hono()
    app.use('*', dbMiddleware)
    app.route('/auctions', auctions)

    const config: AuctionConfig = {
      type: 'first-price',
      tieBreak: 'timestamp',
      multiUnit: false,
    }

    const res = await app.request('/auctions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })

    expect(res.status).toBe(201)
    const data = await res.json() as { success: boolean; data: Auction }
    expect(data.success).toBe(true)
    expect(data.data.id).toBe('auction-1')
    expect(drizzleQueries.createAuction).toHaveBeenCalledWith(
      expect.anything(),
      config
    )
  })

  it('should handle invalid config', async () => {
    const app = new Hono()
    app.use('*', dbMiddleware)
    app.route('/auctions', auctions)

    const res = await app.request('/auctions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 'config' }),
    })

    // Should still return 201 but might fail validation
    expect(res.status).toBeGreaterThanOrEqual(400)
  })
})

describe('GET /auctions/:id', () => {
  it('should get auction state', async () => {
    const mockState = {
      auction: {
        id: 'auction-1',
        status: 'open' as const,
        config: {
          type: 'first-price' as const,
          tieBreak: 'timestamp' as const,
          multiUnit: false,
        },
        createdAt: new Date(),
        resolvedAt: null,
      },
      bidders: [],
      bids: [],
      items: [],
      settlements: [],
    }

    vi.mocked(drizzleQueries.getAuctionState).mockResolvedValue(mockState)

    const app = new Hono()
    app.use('*', dbMiddleware)
    app.route('/auctions', auctions)

    const res = await app.request('/auctions/auction-1', {
      method: 'GET',
    })

    expect(res.status).toBe(200)
    const data = await res.json() as { success: boolean; data: typeof mockState }
    expect(data.success).toBe(true)
    expect(data.data.auction.id).toBe('auction-1')
    expect(drizzleQueries.getAuctionState).toHaveBeenCalledWith(
      expect.anything(),
      'auction-1'
    )
  })

  it('should handle auction not found', async () => {
    vi.mocked(drizzleQueries.getAuctionState).mockRejectedValue(
      new Error('Auction auction-999 not found')
    )

    const app = new Hono()
    app.use('*', dbMiddleware)
    app.route('/auctions', auctions)

    const res = await app.request('/auctions/auction-999', {
      method: 'GET',
    })

    expect(res.status).toBe(400)
    const data = await res.json() as { success: boolean; error: string }
    expect(data.success).toBe(false)
    expect(data.error).toContain('not found')
  })
})


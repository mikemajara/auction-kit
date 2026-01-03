/**
 * Tests for resolve routes
 */

import { describe, it, expect, vi } from 'vitest'
import { Hono } from 'hono'
import resolve from '../../routes/resolve'
import { dbMiddleware } from '../../middleware/db'
import * as drizzleQueries from '@auction-kit/drizzle'
import type { ResolutionResult } from '@auction-kit/core'

// Mock drizzle queries
vi.mock('@auction-kit/drizzle', () => ({
  resolveAuction: vi.fn(),
}))

describe('POST /auctions/:id/resolve', () => {
  it('should resolve an auction', async () => {
    const mockResult: ResolutionResult = {
      settlements: [
        {
          bidderId: 'bidder-1',
          itemId: 'item-1',
          wonAmount: 100,
          bidAmount: 150,
        },
      ],
      errors: [],
      resolvedAt: new Date(),
    }

    vi.mocked(drizzleQueries.resolveAuction).mockResolvedValue(mockResult)

    const app = new Hono()
    app.use('*', dbMiddleware)
    app.route('/auctions', resolve)

    const res = await app.request('/auctions/auction-1/resolve', {
      method: 'POST',
    })

    expect(res.status).toBe(200)
    const data = await res.json() as { success: boolean; data: ResolutionResult }
    expect(data.success).toBe(true)
    expect(data.data.settlements).toHaveLength(1)
    expect(drizzleQueries.resolveAuction).toHaveBeenCalledWith(
      expect.anything(),
      'auction-1',
      undefined
    )
  })

  it('should accept random seed parameter', async () => {
    const mockResult: ResolutionResult = {
      settlements: [],
      errors: [],
      resolvedAt: new Date(),
    }

    vi.mocked(drizzleQueries.resolveAuction).mockResolvedValue(mockResult)

    const app = new Hono()
    app.use('*', dbMiddleware)
    app.route('/auctions', resolve)

    const res = await app.request('/auctions/auction-1/resolve?seed=12345', {
      method: 'POST',
    })

    expect(res.status).toBe(200)
    expect(drizzleQueries.resolveAuction).toHaveBeenCalledWith(
      expect.anything(),
      'auction-1',
      12345
    )
  })

  it('should handle resolution errors', async () => {
    vi.mocked(drizzleQueries.resolveAuction).mockRejectedValue(
      new Error('Auction is already resolved')
    )

    const app = new Hono()
    app.use('*', dbMiddleware)
    app.route('/auctions', resolve)

    const res = await app.request('/auctions/auction-1/resolve', {
      method: 'POST',
    })

    expect(res.status).toBe(400)
    const data = await res.json() as { success: boolean; error: string }
    expect(data.success).toBe(false)
    expect(data.error).toContain('resolved')
  })
})


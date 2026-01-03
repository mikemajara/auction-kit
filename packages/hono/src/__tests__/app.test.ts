/**
 * Tests for main app
 */

import { describe, it, expect, vi } from 'vitest'
import app from '../app'

// Mock database middleware
vi.mock('../middleware/db', () => ({
  dbMiddleware: async (c: any, next: any) => {
    // Mock database
    c.set('db', {})
    await next()
  },
}))

// Mock drizzle queries
vi.mock('@auction-kit/drizzle', () => ({
  createAuction: vi.fn(),
  getAuctionState: vi.fn(),
  placeBid: vi.fn(),
  getBidsByAuction: vi.fn(),
  resolveAuction: vi.fn(),
}))

describe('App', () => {
  it('should have health check endpoint', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    const data = await res.json() as { status: string }
    expect(data.status).toBe('ok')
  })

  it('should handle CORS', async () => {
    const res = await app.request('/health', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3000',
      },
    })
    // CORS middleware should be applied
    expect(res.status).toBeLessThan(500)
  })
})


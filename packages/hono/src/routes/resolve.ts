/**
 * Resolution routes
 * 
 * Handles auction resolution/settlement
 */

import { Hono } from 'hono'
import { resolveAuction } from '@auction-kit/drizzle'
import type { HonoContext } from '../middleware/db'
import type { ApiResponse } from '../middleware/error-handler'

const resolve = new Hono<HonoContext>()

/**
 * POST /:id/resolve
 * Resolve an auction (trigger settlement)
 */
resolve.post('/:id/resolve', async (c) => {
  const auctionId = c.req.param('id')
  const db = c.get('db')
  
  // Optional random seed from query params or body
  const seedParam = c.req.query('seed')
  const randomSeed = seedParam ? parseInt(seedParam, 10) : undefined
  
  const result = await resolveAuction(db, auctionId, randomSeed)
  
  return c.json<ApiResponse>({
    success: true,
    data: result,
  })
})

export default resolve


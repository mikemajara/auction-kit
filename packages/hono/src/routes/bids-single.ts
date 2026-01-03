/**
 * Single bid routes
 * 
 * Handles operations on individual bids (mounted at /bids)
 */

import { Hono } from 'hono'
import { getBid, updateBid, cancelBid } from '@auction-kit/drizzle'
import type { HonoContext } from '../middleware/db'
import type { ApiResponse } from '../middleware/error-handler'

const bidsSingle = new Hono<HonoContext>()

/**
 * GET /bids/:id
 * Get a single bid by ID
 */
bidsSingle.get('/:id', async (c) => {
  const bidId = c.req.param('id')
  const db = c.get('db')
  
  const bid = await getBid(db, bidId)
  
  if (!bid) {
    return c.json<ApiResponse>({
      success: false,
      error: `Bid ${bidId} not found`,
    }, 404)
  }
  
  return c.json<ApiResponse>({
    success: true,
    data: bid,
  })
})

/**
 * PATCH /bids/:id
 * Update a bid (amount, status)
 */
bidsSingle.patch('/:id', async (c) => {
  const bidId = c.req.param('id')
  const db = c.get('db')
  
  const body = await c.req.json<{
    amount?: number
    status?: 'active' | 'won' | 'lost' | 'cancelled'
  }>()
  
  const updatedBid = await updateBid(db, bidId, body)
  
  return c.json<ApiResponse>({
    success: true,
    data: updatedBid,
  })
})

/**
 * DELETE /bids/:id
 * Cancel a bid
 */
bidsSingle.delete('/:id', async (c) => {
  const bidId = c.req.param('id')
  const db = c.get('db')
  
  const cancelledBid = await cancelBid(db, bidId)
  
  return c.json<ApiResponse>({
    success: true,
    data: cancelledBid,
  })
})

export default bidsSingle





/**
 * Bidder routes
 * 
 * Handles bidder creation, retrieval, and updates
 */

import { Hono } from 'hono'
import {
  createBidder,
  getBiddersByAuction,
  getBidder,
  updateBidder,
} from '@auction-kit/drizzle'
import type { HonoContext } from '../middleware/db'
import type { ApiResponse } from '../middleware/error-handler'

const bidders = new Hono<HonoContext>()

/**
 * POST /auctions/:id/bidders
 * Create a new bidder for an auction
 */
bidders.post('/:id/bidders', async (c) => {
  const auctionId = c.req.param('id')
  const db = c.get('db')
  
  const body = await c.req.json<{
    name: string
  }>()
  
  const bidder = await createBidder(db, auctionId, body.name)
  
  return c.json<ApiResponse>({
    success: true,
    data: bidder,
  }, 201)
})

/**
 * GET /auctions/:id/bidders
 * List all bidders for an auction
 */
bidders.get('/:id/bidders', async (c) => {
  const auctionId = c.req.param('id')
  const db = c.get('db')
  
  const biddersList = await getBiddersByAuction(db, auctionId)
  
  return c.json<ApiResponse>({
    success: true,
    data: biddersList,
  })
})

/**
 * GET /bidders/:id
 * Get a single bidder by ID
 */
bidders.get('/:id', async (c) => {
  const bidderId = c.req.param('id')
  const db = c.get('db')
  
  const bidder = await getBidder(db, bidderId)
  
  if (!bidder) {
    return c.json<ApiResponse>({
      success: false,
      error: `Bidder ${bidderId} not found`,
    }, 404)
  }
  
  return c.json<ApiResponse>({
    success: true,
    data: bidder,
  })
})

/**
 * PATCH /bidders/:id
 * Update a bidder (name)
 */
bidders.patch('/:id', async (c) => {
  const bidderId = c.req.param('id')
  const db = c.get('db')
  
  const body = await c.req.json<{
    name?: string
  }>()
  
  const updatedBidder = await updateBidder(db, bidderId, body)
  
  return c.json<ApiResponse>({
    success: true,
    data: updatedBidder,
  })
})

export default bidders


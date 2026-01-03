/**
 * Auction routes
 * 
 * Handles auction creation and retrieval
 */

import { Hono } from 'hono'
import { 
  createAuction, 
  getAuctionState, 
  getAllAuctions,
  getAuction,
  updateAuctionStatus 
} from '@auction-kit/drizzle'
import type { AuctionConfig } from '@auction-kit/core'
import type { HonoContext } from '../middleware/db'
import type { ApiResponse } from '../middleware/error-handler'

const auctions = new Hono<HonoContext>()

/**
 * GET /auctions
 * List all auctions with optional filtering
 */
auctions.get('/', async (c) => {
  const db = c.get('db')
  
  const status = c.req.query('status') as 'open' | 'closed' | 'resolved' | undefined
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : undefined
  const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!, 10) : undefined
  
  const auctionsList = await getAllAuctions(db, {
    status,
    limit,
    offset,
  })
  
  return c.json<ApiResponse>({
    success: true,
    data: auctionsList,
  })
})

/**
 * POST /auctions
 * Create a new auction
 */
auctions.post('/', async (c) => {
  const config = await c.req.json<AuctionConfig>()
  const db = c.get('db')
  
  const auction = await createAuction(db, config)
  
  return c.json<ApiResponse>({
    success: true,
    data: auction,
  }, 201)
})

/**
 * GET /auctions/:id
 * Get auction state (includes bids, bidders, settlements)
 */
auctions.get('/:id', async (c) => {
  const auctionId = c.req.param('id')
  const db = c.get('db')
  
  const state = await getAuctionState(db, auctionId)
  
  return c.json<ApiResponse>({
    success: true,
    data: state,
  })
})

/**
 * PATCH /auctions/:id
 * Update auction (status, config)
 */
auctions.patch('/:id', async (c) => {
  const auctionId = c.req.param('id')
  const db = c.get('db')
  
  const body = await c.req.json<{
    status?: 'open' | 'closed' | 'resolved'
    config?: AuctionConfig
  }>()
  
  // Check if auction exists
  const existingAuction = await getAuction(db, auctionId)
  if (!existingAuction) {
    return c.json<ApiResponse>({
      success: false,
      error: `Auction ${auctionId} not found`,
    }, 404)
  }
  
  // Prevent updating resolved auctions
  if (existingAuction.status === 'resolved' && body.status && body.status !== 'resolved') {
    return c.json<ApiResponse>({
      success: false,
      error: 'Cannot update a resolved auction',
    }, 409)
  }
  
  // Update status if provided
  if (body.status) {
    const updated = await updateAuctionStatus(db, auctionId, body.status)
    return c.json<ApiResponse>({
      success: true,
      data: updated,
    })
  }
  
  // Update config if provided (would need a new query function)
  // For now, return the existing auction
  return c.json<ApiResponse>({
    success: true,
    data: existingAuction,
  })
})

export default auctions


/**
 * Bid routes
 * 
 * Handles bid placement and listing
 */

import { Hono } from 'hono'
import { 
  placeBid, 
  getBidsByAuction
} from '@auction-kit/drizzle'
import type { HonoContext } from '../middleware/db'
import type { ApiResponse } from '../middleware/error-handler'

const bids = new Hono<HonoContext>()

/**
 * POST /auctions/:id/bids
 * Place a bid on an auction
 */
bids.post('/:id/bids', async (c) => {
  const auctionId = c.req.param('id')
  const db = c.get('db')
  
  const body = await c.req.json<{
    bidderId: string
    itemId: string
    amount: number
  }>()
  
  const bid = await placeBid(db, {
    auctionId,
    bidderId: body.bidderId,
    itemId: body.itemId,
    amount: body.amount,
  })
  
  return c.json<ApiResponse>({
    success: true,
    data: bid,
  }, 201)
})

/**
 * GET /auctions/:id/bids
 * List all bids for an auction
 */
bids.get('/:id/bids', async (c) => {
  const auctionId = c.req.param('id')
  const db = c.get('db')
  
  const bidsList = await getBidsByAuction(db, auctionId)
  
  return c.json<ApiResponse>({
    success: true,
    data: bidsList,
  })
})


export default bids


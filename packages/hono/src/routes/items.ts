/**
 * Item routes
 * 
 * Handles item creation, retrieval, and updates
 */

import { Hono } from 'hono'
import {
  createItem,
  getItemsByAuction,
  getItem,
  updateItem,
} from '@auction-kit/drizzle'
import type { HonoContext } from '../middleware/db'
import type { ApiResponse } from '../middleware/error-handler'

const items = new Hono<HonoContext>()

/**
 * POST /auctions/:id/items
 * Create a new item for an auction
 */
items.post('/:id/items', async (c) => {
  const auctionId = c.req.param('id')
  const db = c.get('db')
  
  const body = await c.req.json<{
    name: string
    description?: string
    quantity?: number
  }>()
  
  const item = await createItem(db, {
    auctionId,
    name: body.name,
    description: body.description,
    quantity: body.quantity,
  })
  
  return c.json<ApiResponse>({
    success: true,
    data: item,
  }, 201)
})

/**
 * GET /auctions/:id/items
 * List all items for an auction
 */
items.get('/:id/items', async (c) => {
  const auctionId = c.req.param('id')
  const db = c.get('db')
  
  const itemsList = await getItemsByAuction(db, auctionId)
  
  return c.json<ApiResponse>({
    success: true,
    data: itemsList,
  })
})

/**
 * GET /items/:id
 * Get a single item by ID
 */
items.get('/:id', async (c) => {
  const itemId = c.req.param('id')
  const db = c.get('db')
  
  const item = await getItem(db, itemId)
  
  if (!item) {
    return c.json<ApiResponse>({
      success: false,
      error: `Item ${itemId} not found`,
    }, 404)
  }
  
  return c.json<ApiResponse>({
    success: true,
    data: item,
  })
})

/**
 * PATCH /items/:id
 * Update an item (name, description, quantity)
 */
items.patch('/:id', async (c) => {
  const itemId = c.req.param('id')
  const db = c.get('db')
  
  const body = await c.req.json<{
    name?: string
    description?: string | null
    quantity?: number
  }>()
  
  const updatedItem = await updateItem(db, itemId, body)
  
  return c.json<ApiResponse>({
    success: true,
    data: updatedItem,
  })
})

export default items


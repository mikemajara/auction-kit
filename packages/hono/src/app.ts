/**
 * Main Hono application
 * 
 * Sets up routes, middleware, and error handling
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { errorHandler } from './middleware/error-handler'
import { dbMiddleware } from './middleware/db'
import auctions from './routes/auctions'
import bids from './routes/bids'
import bidsSingle from './routes/bids-single'
import resolve from './routes/resolve'
import bidders from './routes/bidders'
import items from './routes/items'

const app = new Hono()

// Global middleware
app.use('*', logger())
app.use('*', cors())
app.use('*', errorHandler)
app.use('*', dbMiddleware)

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

// Mount routes
// Auction-specific routes (mounted under /auctions)
app.route('/auctions', auctions)
app.route('/auctions', bids)
app.route('/auctions', resolve)
app.route('/auctions', bidders)
app.route('/auctions', items)

// Resource-specific routes (mounted at root)
app.route('/bidders', bidders)
app.route('/items', items)
app.route('/bids', bidsSingle)

export default app


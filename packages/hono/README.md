# @auction-kit/hono

Reference API implementation with Hono framework.

## Status: Coming in Week 2

This package will provide:

- REST API routes for auctions
- `POST /auctions` - Create auction
- `POST /auctions/:id/bids` - Place bid
- `POST /auctions/:id/resolve` - Resolve auction
- `GET /auctions/:id` - Get auction state
- Ready to deploy to Cloudflare Workers

## Planned Usage

```typescript
import { Hono } from 'hono'
import auctionRoutes from '@auction-kit/hono'

const app = new Hono()
app.route('/api', auctionRoutes)

export default app
```


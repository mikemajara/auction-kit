# @auction-kit/drizzle

Database layer with Drizzle ORM for Postgres.

## Status: Coming in Week 1

This package will provide:

- Drizzle schema for auctions, bidders, bids, settlements
- Query functions: `placeBid()`, `resolveBids()`, `getAuctionState()`
- Transaction support for atomic resolution
- Postgres adapter

## Planned Usage

```typescript
import { placeBid, resolveBids } from '@auction-kit/drizzle'

// Place a bid
await placeBid(db, {
  auctionId: 'auction-123',
  bidderId: 'alice',
  itemId: 'seat1',
  amount: 100,
})

// Resolve auction
const result = await resolveBids(db, 'auction-123')
```


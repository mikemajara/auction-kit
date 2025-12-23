# Auction-Kit Library - Path B Plan

## Overview

Extract the core auction mechanics from seating-royale into a standalone, reusable library aligned with auction theory literature. Ship with Postgres/Drizzle schemas + Hono API as reference implementation, while keeping the core logic framework-agnostic.

## Why This Approach?

### State Must Persist

Auctions are inherently stateful multi-participant systems requiring database persistence. Pure in-memory logic doesn't work for real-world scenarios with:

- Multiple concurrent participants
- Asynchronous bid placement
- Need to query auction state at any time
- Settlement resolution requiring atomic transactions

### Framework-Agnostic Core

While we ship with Hono as the reference implementation, the architecture separates:

- **Core logic** (pure TypeScript functions)
- **Database layer** (Drizzle ORM)
- **API layer** (Hono example)

Users can adopt the full stack or just use core + db layers with their own framework (Next.js, Express, Fastify).

### Real-time Not Included

Real-time updates are application-specific. Users can implement via:

- Simple polling (every 2-5 seconds)
- Supabase real-time subscriptions
- Socket.io
- Server-sent events (SSE)

The DB schema supports real-time with timestamps and status fields.

## What's "Core" Auction Logic?

Based on auction theory literature, specifically first-price sealed-bid auctions:

### ✅ Core Features (Included)

| Feature                         | Standard? | Notes                                   |
| ------------------------------- | --------- | --------------------------------------- |
| **Multi-item/multi-unit**       | YES       | Standard in combinatorial auctions      |
| **First-price vs second-price** | YES       | Core pricing rule variants              |
| **Tie-breaking**                | YES       | Timestamp, random, or custom strategies |

### ❌ Not Core (User-Implemented)

| Feature               | Why Excluded                        |
| --------------------- | ----------------------------------- |
| **Timing/deadlines**  | User calls `/resolve` when ready    |
| **Rounds**            | Just running auction multiple times |
| **Seat reassignment** | Game-specific logic                 |
| **Real-time sync**    | Application transport layer concern |

## Architecture

```
auction-kit/ (monorepo)
├── packages/
│   ├── core/               # Pure TypeScript logic
│   │   ├── types.ts        # AuctionConfig, Bid, Settlement
│   │   ├── validator.ts    # validateBid(bid, auction, balance?)
│   │   ├── ranker.ts       # rankBids(bids[], tieBreakRule)
│   │   └── settler.ts      # settleBids(rankedBids, pricingRule)
│   │
│   ├── drizzle/            # Database layer
│   │   ├── schema.ts       # Tables: auctions, bidders, bids, settlements
│   │   ├── queries.ts      # insertBid(), resolveBids(), getAuctionState()
│   │   └── adapters/
│   │       ├── postgres.ts
│   │       └── sqlite.ts
│   │
│   └── hono/               # Reference API implementation
│       └── routes.ts       # POST /auctions, /bids, /resolve
│
└── examples/
    ├── hono-cloudflare/    # Full working deployment
    ├── nextjs-supabase/    # Adaptation example
    └── express-postgres/   # Another framework example
```

## Core Types

```typescript
// packages/core/types.ts

export type AuctionConfig = {
  type: "first-price" | "second-price"
  tieBreak: "timestamp" | "random"
  multiUnit: boolean // Can multiple bidders win the same item?
}

export type Auction = {
  id: string
  status: "open" | "closed" | "resolved"
  config: AuctionConfig
  createdAt: Date
}

export type Bidder = {
  id: string
  auctionId: string
  name: string
}

export type Bid = {
  id: string
  auctionId: string
  bidderId: string
  itemId: string
  amount: number
  placedAt: Date
  status: "active" | "won" | "lost" | "cancelled"
}

export type Settlement = {
  bidderId: string
  itemId: string
  wonAmount: number // First-price: bid amount, Second-price: second-highest
}

export type ResolutionResult = {
  settlements: Settlement[]
  errors: string[]
}
```

## Database Schema (Drizzle + Postgres)

```typescript
// packages/drizzle/schema.ts

export const auctions = pgTable("auctions", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: text("status")
    .$type<"open" | "closed" | "resolved">()
    .default("open"),
  config: json("config").$type<AuctionConfig>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})

export const bidders = pgTable("bidders", {
  id: uuid("id").primaryKey().defaultRandom(),
  auctionId: uuid("auction_id")
    .references(() => auctions.id)
    .notNull(),
  name: text("name").notNull(),
})

export const bids = pgTable("bids", {
  id: uuid("id").primaryKey().defaultRandom(),
  auctionId: uuid("auction_id")
    .references(() => auctions.id)
    .notNull(),
  bidderId: uuid("bidder_id")
    .references(() => bidders.id)
    .notNull(),
  itemId: text("item_id").notNull(),
  amount: integer("amount").notNull(),
  placedAt: timestamp("placed_at").defaultNow(),
  status: text("status")
    .$type<"active" | "won" | "lost" | "cancelled">()
    .default("active"),
})

export const settlements = pgTable("settlements", {
  id: uuid("id").primaryKey().defaultRandom(),
  auctionId: uuid("auction_id")
    .references(() => auctions.id)
    .notNull(),
  bidderId: uuid("bidder_id")
    .references(() => bidders.id)
    .notNull(),
  itemId: text("item_id").notNull(),
  wonAmount: integer("won_amount").notNull(),
  settledAt: timestamp("settled_at").defaultNow(),
})
```

## Core Logic Example

```typescript
// packages/core/settler.ts

export function settleBids(
  bids: Bid[],
  config: AuctionConfig
): ResolutionResult {
  const settlements: Settlement[] = []
  const errors: string[] = []

  // 1. Group bids by item
  const bidsByItem = groupBy(bids, (bid) => bid.itemId)

  // 2. Process each item
  for (const [itemId, itemBids] of Object.entries(bidsByItem)) {
    // 3. Rank bids (amount DESC, then timestamp ASC for ties)
    const ranked = rankBids(itemBids, config.tieBreak)

    // 4. Determine winner(s)
    const winners = config.multiUnit ? ranked : [ranked[0]]

    // 5. Calculate payment
    for (const winningBid of winners) {
      const payment =
        config.type === "first-price"
          ? winningBid.amount
          : ranked[1]?.amount ?? winningBid.amount // Second-price

      settlements.push({
        bidderId: winningBid.bidderId,
        itemId,
        wonAmount: payment,
      })
    }
  }

  return { settlements, errors }
}
```

## API Layer (Hono Reference)

```typescript
// packages/hono/routes.ts

import { Hono } from "hono"
import {
  placeBid,
  resolveBids,
  getAuctionState,
} from "@auction-kit/drizzle/queries"

const app = new Hono()

// Create auction
app.post("/auctions", async (c) => {
  const config: AuctionConfig = await c.req.json()
  const auction = await createAuction(c.env.DB, config)
  return c.json(auction)
})

// Place bid
app.post("/auctions/:id/bids", async (c) => {
  const { bidderId, itemId, amount } = await c.req.json()
  const bid = await placeBid(c.env.DB, {
    auctionId: c.req.param("id"),
    bidderId,
    itemId,
    amount,
  })
  return c.json(bid)
})

// Resolve auction (user calls when ready)
app.post("/auctions/:id/resolve", async (c) => {
  const result = await resolveBids(c.env.DB, c.req.param("id"))
  return c.json(result)
})

// Get current state (for polling)
app.get("/auctions/:id", async (c) => {
  const state = await getAuctionState(c.env.DB, c.req.param("id"))
  return c.json(state)
})

export default app
```

## How Users Adapt to Other Frameworks

### Next.js API Routes

```typescript
// app/api/auctions/[id]/resolve/route.ts
import { resolveBids } from "@auction-kit/drizzle/queries"
import { db } from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const result = await resolveBids(db, params.id)
  return Response.json(result)
}
```

### Express

```typescript
import express from "express"
import { resolveBids } from "@auction-kit/drizzle/queries"

app.post("/auctions/:id/resolve", async (req, res) => {
  const result = await resolveBids(db, req.params.id)
  res.json(result)
})
```

**Key Point**: They use the same `resolveBids()` function; only the HTTP wrapper changes.

## Installation Options

```bash
# Full stack (Hono + Drizzle + Core)
npm install @auction-kit/hono

# Drizzle + Core (bring your own framework)
npm install @auction-kit/drizzle

# Just core logic (bring your own everything)
npm install @auction-kit/core
```

## Implementation Plan (3 Weeks)

### Week 0.5: Proof of Concept (2-3 days)

- [ ] Create minimal POC in single file
- [ ] Prove core settlement algorithm works
- [ ] Test first-price, single winner, timestamp tie-break
- [ ] Validate approach before building infrastructure

### Week 1: Core + Drizzle

- [ ] Set up monorepo structure (pnpm workspaces)
- [ ] Define types in `packages/core/types.ts` aligned with auction theory
- [ ] Implement `settleBids()` with:
  - [ ] First-price and second-price pricing
  - [ ] Timestamp and random tie-breaking
  - [ ] Multi-unit support
- [ ] Write Drizzle schema for Postgres
- [ ] Implement queries: `placeBid()`, `resolveBids()`, `getAuctionState()`
- [ ] Unit tests for core logic (100+ test cases)
- [ ] Integration tests with test Postgres database

### Week 2: Hono API + Examples

- [ ] Build Hono app with routes:
  - [ ] `POST /auctions` - Create auction
  - [ ] `POST /auctions/:id/bids` - Place bid
  - [ ] `POST /auctions/:id/resolve` - Trigger resolution
  - [ ] `GET /auctions/:id` - Get state (for polling)
  - [ ] `GET /auctions/:id/bids` - List bids
- [ ] Deploy example to Cloudflare Workers
- [ ] Connect to Neon Postgres or Supabase
- [ ] Write Next.js example showing adaptation
- [ ] Document real-time patterns:
  - [ ] Polling example
  - [ ] Supabase subscription example
  - [ ] Socket.io adapter skeleton

### Week 3: Polish + Validation

- [ ] Create comprehensive documentation:
  - [ ] Quick start guide
  - [ ] API reference
  - [ ] Examples for each framework
  - [ ] Auction theory background
- [ ] Publish to npm as scoped packages:
  - [ ] `@auction-kit/core@0.1.0`
  - [ ] `@auction-kit/drizzle@0.1.0`
  - [ ] `@auction-kit/hono@0.1.0`
- [ ] **Validation**: Refactor seating-royale to use the library
  - [ ] Replace custom resolution logic with `@auction-kit/core`
  - [ ] Adapt Drizzle schemas
  - [ ] Confirm it works end-to-end

## Success Criteria

- ✅ Supports first-price sealed-bid auctions (literature-aligned)
- ✅ Works with Postgres and SQLite
- ✅ Can be used in Hono, Next.js, and Express
- ✅ Pure core logic has 100% test coverage
- ✅ Seating-royale successfully uses the library
- ✅ Published to npm with clear documentation
- ✅ Examples deploy successfully to Cloudflare Workers and Vercel

## Future Enhancements (Post-MVP)

### Additional Auction Types

- [ ] Vickrey (second-price sealed-bid)
- [ ] English (ascending price)
- [ ] Dutch (descending price)
- [ ] Combinatorial (bid on bundles)

### Real-time Adapters

- [ ] `@auction-kit/realtime-supabase`
- [ ] `@auction-kit/realtime-socketio`
- [ ] `@auction-kit/realtime-sse`

### Additional Features

- [ ] Bid retraction windows
- [ ] Reserve prices
- [ ] Bidder reputation/history
- [ ] Auction analytics/reporting

## Notes

- Keep the library small and focused on core auction mechanics
- Defer game-specific logic (rounds, seat reassignment, etc.) to consuming apps
- Prioritize correctness and test coverage over feature breadth
- Documentation should reference auction theory literature
- Seating-royale becomes the first customer, validating the design

## References

- **Auction Theory**: Klemperer, P. (2004). "Auctions: Theory and Practice"
- **First-Price Sealed-Bid**: Krishna, V. (2009). "Auction Theory"
- **Multi-Unit Auctions**: Cramton, P. (2006). "Simultaneous Ascending Auctions"

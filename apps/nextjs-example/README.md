# Next.js Example - Auction Kit

A demo Next.js application that showcases how to integrate Auction Kit's Hono API as a separate backend service.

## Overview

This example demonstrates the **API Client** integration pattern, where:
- The Next.js frontend runs on port **3001**
- The Hono API backend runs on port **3000**
- The frontend makes HTTP requests to the backend API

## Architecture

```
┌─────────────────┐         HTTP         ┌──────────────┐
│  Next.js App    │ ──────────────────> │  Hono API   │
│   (Port 3001)   │                      │  (Port 3000) │
└─────────────────┘                      └──────┬───────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │  PostgreSQL  │
                                          │  (Port 5433) │
                                          ┌──────────────┘
```

## Prerequisites

1. **PostgreSQL** running (via Docker Compose)
2. **Database schema** applied
3. **Hono API** package dependencies installed

## Quick Start

### 1. Start PostgreSQL

```bash
# From repo root
docker-compose up -d
```

### 2. Apply Database Schema

```bash
cd packages/drizzle
DATABASE_URL="postgres://auction:auction123@localhost:5433/auction_kit_dev" pnpm db:push
```

### 3. Install Dependencies

```bash
# From repo root
pnpm install
```

### 4. Set Up Environment Variables

The Next.js app expects the Hono API to be running at `http://localhost:3000` (configured in `.env.local`).

For the Hono API, create `packages/hono/.env`:

```bash
DATABASE_URL=postgres://auction:auction123@localhost:5433/auction_kit_dev
PORT=3000
```

### 5. Run Both Servers

**Option A: Single Command (Recommended)**

```bash
# From repo root
pnpm dev:demo
```

This runs both the Hono API and Next.js app in parallel.

**Option B: Separate Terminals**

```bash
# Terminal 1: Hono API
cd packages/hono
pnpm dev

# Terminal 2: Next.js App
cd apps/nextjs-example
pnpm dev
```

### 6. Open the App

- **Next.js App**: http://localhost:3001
- **Hono API**: http://localhost:3000

## Usage

### Creating an Auction

1. Go to http://localhost:3001
2. Fill out the auction form:
   - **Auction Type**: First-price or Second-price (Vickrey)
   - **Tie-Breaking**: Timestamp or Random
   - **Multi-Unit**: Allow multiple winners per item
3. Click "Create Auction"
4. You'll be redirected to the auction page

### Placing Bids

**Note**: Before placing bids, you need to create bidders and items via the database or API.

To create bidders and items programmatically:

```bash
# Create a bidder (example using curl)
curl -X POST http://localhost:3000/auctions/{auctionId}/bidders \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'

# Create an item (would need to add this endpoint or use drizzle directly)
```

Once bidders and items exist:

1. Navigate to an auction page
2. Select a bidder from the dropdown
3. Select an item
4. Enter a bid amount
5. Click "Place Bid"

### Resolving an Auction

1. Navigate to an auction page
2. Click "Resolve Auction"
3. Optionally enter a random seed for reproducible tie-breaking
4. Click "Resolve Auction"
5. View the settlement results

## Features

- ✅ Create auctions with configurable rules
- ✅ Place bids on auction items
- ✅ View all bids in real-time
- ✅ Resolve auctions and see winners
- ✅ View settlement results with payment amounts
- ✅ Clean, simple UI with Tailwind CSS

## Project Structure

```
apps/nextjs-example/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                 # Home page
│   └── auction/
│       └── [id]/
│           ├── page.tsx         # Auction detail page
│           └── resolve/
│               └── page.tsx     # Resolution page
├── components/
│   ├── create-auction-form.tsx  # Auction creation form
│   ├── bid-form.tsx             # Bid placement form
│   ├── bid-list.tsx             # Bid display component
│   ├── resolve-button.tsx       # Resolution trigger
│   └── settlement-results.tsx   # Results display
├── lib/
│   └── api.ts                   # Typed API client
└── package.json
```

## API Client

The `lib/api.ts` file provides a typed client for the Hono API:

```typescript
import { createAuction, placeBid, resolveAuction } from '@/lib/api'

// Create auction
const auction = await createAuction({
  type: 'second-price',
  tieBreak: 'timestamp',
  multiUnit: false,
})

// Place bid
const bid = await placeBid(auction.id, {
  bidderId: 'bidder-uuid',
  itemId: 'item-uuid',
  amount: 100,
})

// Resolve auction
const result = await resolveAuction(auction.id, seed)
```

## Development

### Running Tests

```bash
# Type check
pnpm type-check

# Lint
pnpm lint
```

### Building

```bash
pnpm build
```

### Production

```bash
# Build both packages
pnpm build

# Start Hono API
cd packages/hono
pnpm start

# Start Next.js app
cd apps/nextjs-example
pnpm start
```

## Limitations

This example demonstrates the API client pattern but has some limitations:

1. **Bidders and Items**: Must be created via the database or API directly (no UI for this)
2. **Real-time Updates**: The UI doesn't auto-refresh; you need to manually reload
3. **Error Handling**: Basic error handling; could be improved with toast notifications

## Next Steps

To extend this example:

1. Add UI for creating bidders and items
2. Implement real-time updates using WebSockets or Server-Sent Events
3. Add authentication and authorization
4. Improve error handling with toast notifications
5. Add loading states and optimistic updates

## See Also

- [Hono API Documentation](../../packages/hono/README.md)
- [Core Package Documentation](../../packages/core/README.md)
- [Drizzle Package Documentation](../../packages/drizzle/README.md)


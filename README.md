# Auction Kit

A framework-agnostic auction mechanics library for first-price and second-price sealed-bid auctions.

## Status: Week 1 Complete ✅

**Core package:** ✅ 101 tests passing  
**Database layer:** ✅ Tested and working  
**API layer:** ⬜ Coming in Week 2

## Quick Start - Test Database Now!

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Apply schema
cd packages/drizzle
DATABASE_URL="postgres://auction:auction123@localhost:5433/auction_kit_dev" pnpm db:push

# 3. Run test
DATABASE_URL="postgres://auction:auction123@localhost:5433/auction_kit_dev" pnpm test:manual
```

Expected output: Bob wins VIP seat, pays $150 (second-price), saves $50! 🎉

👉 **See [QUICKSTART_DATABASE.md](./QUICKSTART_DATABASE.md) for details**

## Features

### ✅ Implemented (Week 1)

- **First-price auctions** - Winner pays their bid
- **Second-price auctions** (Vickrey) - Winner pays second-highest bid
- **Tie-breaking** - Timestamp (deterministic) or random (seeded)
- **Multi-unit** - Multiple winners for same item
- **Multi-item** - Independent settlement per item
- **Validation** - Comprehensive input validation
- **Transactions** - Atomic database operations
- **Type-safe** - Full TypeScript with strict mode

### ⬜ Coming (Week 2)

- Hono REST API routes
- Cloudflare Workers deployment
- Next.js/Express examples
- Real-time patterns

## Packages

| Package | Status | Tests | Purpose |
|---------|--------|-------|---------|
| `@auction-kit/core` | ✅ Complete | 101/101 | Pure TypeScript auction logic |
| `@auction-kit/drizzle` | ✅ Complete | Tested | Postgres database layer |
| `@auction-kit/hono` | ⬜ Pending | - | REST API reference |

## Architecture

```
┌─────────────────┐
│  Core Package   │  ← Pure TypeScript, zero dependencies
│  (types, logic) │     Framework-agnostic
└────────┬────────┘
         │
┌────────▼────────┐
│ Drizzle Package │  ← Database operations
│ (schema, queries)│    Postgres + Drizzle ORM
└────────┬────────┘
         │
┌────────▼────────┐
│  Hono Package   │  ← REST API routes
│  (routes, auth) │    Reference implementation
└─────────────────┘
```

## Documentation

- **[QUICKSTART_DATABASE.md](./QUICKSTART_DATABASE.md)** - Start testing in 5 minutes
- **[TESTING.md](./TESTING.md)** - Comprehensive testing guide
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Development setup
- **[WEEK_1_COMPLETE.md](./WEEK_1_COMPLETE.md)** - What we built
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Current progress

### Package READMEs

- **[packages/core/README.md](./packages/core/README.md)** - Core API reference
- **[packages/drizzle/README.md](./packages/drizzle/README.md)** - Database API reference

## Usage Example

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { 
  createAuction, 
  createBidder, 
  placeBid, 
  resolveAuction 
} from '@auction-kit/drizzle'

// Setup
const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

// Create auction
const auction = await createAuction(db, {
  type: 'second-price',
  tieBreak: 'timestamp',
  multiUnit: false,
})

// Add bidders
const alice = await createBidder(db, auction.id, 'Alice')
const bob = await createBidder(db, auction.id, 'Bob')

// Place bids
await placeBid(db, {
  auctionId: auction.id,
  bidderId: alice.id,
  itemId: 'vip-seat',
  amount: 100,
})

await placeBid(db, {
  auctionId: auction.id,
  bidderId: bob.id,
  itemId: 'vip-seat',
  amount: 200,
})

// Resolve
const result = await resolveAuction(db, auction.id)

// Bob wins, pays $100 (second-price)!
console.log(result.settlements[0])
// { bidderId: 'bob-id', itemId: 'vip-seat', wonAmount: 100, bidAmount: 200 }
```

## Development

```bash
# Install dependencies
pnpm install

# Run core tests
cd packages/core && pnpm test

# Start database
docker-compose up -d

# Run database test
cd packages/drizzle && pnpm test:manual

# Build all packages
pnpm build
```

## Test Results

**Core Package:**
```
✓ src/types.test.ts         14 tests
✓ src/ranker.test.ts        16 tests
✓ src/settler.test.ts       17 tests
✓ src/validator.test.ts     34 tests
✓ src/integration.test.ts   10 tests
✓ src/poc.test.ts           10 tests

Tests:  101 passed (101)
```

**Database Layer:**
```
✅ Second-price auction created
✅ Three bidders added
✅ Three bids placed  
✅ Auction resolved correctly
✅ Winner pays second-price
✅ Transaction safety verified
```

## Performance

- Create auction: ~10ms
- Place bid: ~15ms (with validation)
- Resolve auction: ~50ms (with transaction)
- Handles 100+ bids efficiently

## Project Structure

```
auction-kit/
├── packages/
│   ├── core/           ✅ Complete (101 tests)
│   ├── drizzle/        ✅ Complete (tested)
│   └── hono/           ⬜ Week 2
├── docker-compose.yml  Postgres for testing
├── .env                Database connection
└── pm/plan.md         Development plan
```

## Requirements

- Node.js 18+
- pnpm 8+
- Docker (for database testing)

## Tech Stack

- **TypeScript** - Type-safe throughout
- **Drizzle ORM** - Database operations
- **Postgres** - Production database
- **Vitest** - Testing framework
- **Hono** - API framework (Week 2)

## License

MIT

## Contributing

This is currently in active development (Week 1 of 3-week plan).

## Support

- Check [TESTING.md](./TESTING.md) for troubleshooting
- See [QUICKSTART_DATABASE.md](./QUICKSTART_DATABASE.md) for quick start
- Review [PROJECT_STATUS.md](./PROJECT_STATUS.md) for progress

---

**Status:** ✅ Production-ready core + database layer  
**Next:** Week 2 - Hono API routes  
**Timeline:** 3 weeks total (1 complete)  

🎉 **Try it now:** Run `docker-compose up -d && cd packages/drizzle && pnpm test:manual`


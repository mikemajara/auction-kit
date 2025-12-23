# Getting Started - Week 0.5

Welcome to the Auction Kit POC! This guide will help you validate the core settlement algorithm.

## Prerequisites

- Node.js 18+ 
- pnpm 8+

## Setup

```bash
# Navigate to project root
cd auction-kit

# Install dependencies
pnpm install

# Run POC tests
cd packages/core
pnpm test
```

## What's Implemented (Week 0.5)

The POC validates the core auction settlement algorithm:

### Features ✅

- **First-price sealed-bid**: Winner pays their bid amount
- **Highest bid wins**: Simple ranking by amount
- **Timestamp tie-breaking**: Earlier bid wins if amounts are equal
- **Multi-item support**: Each item settles independently
- **Single winner per item**: One winner per auction item

### Test Coverage

Run the tests to see:

```bash
pnpm test

# Or watch mode during development
pnpm test:watch
```

The test suite covers:
- Empty auctions
- Single bidder scenarios
- Multiple bidders
- Tie-breaking logic
- Multi-item auctions
- First-price payment verification

## POC Code

The core logic is in `packages/core/src/poc.ts`:

- `settleBidsSimple()` - Main settlement function
- `rankBids()` - Bid ranking logic
- `getWinner()` - Winner determination

## Next Steps

Once POC tests pass, we'll move to Week 1:

1. **Expand types** to full auction theory spec
2. **Add second-price** pricing support
3. **Add random tie-breaking**
4. **Add multi-unit** auctions (multiple winners)
5. **Add validation** layer
6. **100+ test cases** for edge cases

## Project Structure

```
auction-kit/
├── packages/
│   ├── core/           ← YOU ARE HERE (Week 0.5)
│   │   ├── src/
│   │   │   ├── poc.ts       # POC implementation
│   │   │   └── poc.test.ts  # POC tests
│   │   └── package.json
│   ├── drizzle/        ← Coming in Week 1
│   └── hono/           ← Coming in Week 2
└── package.json
```

## Questions?

Check the main plan: `pm/plan.md`



# @auction-kit/core

Core auction logic - pure TypeScript functions with zero dependencies.

## Status: Week 0.5 - Proof of Concept

Currently implementing minimal POC to validate the core settlement algorithm.

## POC Features

- ✅ First-price sealed-bid settlement
- ✅ Timestamp-based tie-breaking
- ✅ Single winner per item
- ✅ Multiple items

## Installation

```bash
pnpm add @auction-kit/core
```

## Usage (POC)

```typescript
import { settleBidsSimple } from '@auction-kit/core'

const bids = [
  {
    id: '1',
    bidderId: 'alice',
    itemId: 'seat1',
    amount: 100,
    timestamp: Date.now(),
  },
  {
    id: '2',
    bidderId: 'bob',
    itemId: 'seat1',
    amount: 150,
    timestamp: Date.now() + 1000,
  },
]

const settlements = settleBidsSimple(bids)
// [{ bidderId: 'bob', itemId: 'seat1', wonAmount: 150 }]
```

## Development

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Build
pnpm build
```

## What's Next (Week 1)

- Full type system aligned with auction theory
- Second-price pricing support
- Random tie-breaking
- Multi-unit auctions
- Comprehensive validation









# Auction Kit

A framework-agnostic auction mechanics library for first-price and second-price sealed-bid auctions.

## Status: Week 0.5 - Proof of Concept

Currently implementing minimal POC to validate the core settlement algorithm.

## Packages

- `@auction-kit/core` - Core auction logic (pure TypeScript)
- `@auction-kit/drizzle` - Database layer with Drizzle ORM
- `@auction-kit/hono` - Reference API implementation with Hono

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build all packages
pnpm build
```

## License

MIT


# @auction-kit/hono

Reference API implementation with Hono framework for Node.js.

## Features

- REST API routes for auction management
- Type-safe handlers using Drizzle queries
- Consistent error handling
- CORS support
- Simple Node.js deployment

## Installation

```bash
pnpm add @auction-kit/hono
```

## Usage

### Development

1. Create a `.env` file in the package root:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/auction_kit_dev
PORT=3000
```

2. Start the development server:

```bash
pnpm dev
```

Server runs on http://localhost:3000

### Production

1. Build the project:

```bash
pnpm build
```

2. Set environment variables:

```bash
export DATABASE_URL="postgres://user:pass@host:5432/db"
export PORT=3000
```

3. Start the server:

```bash
pnpm start
```

## API Endpoints

### Create Auction

```bash
POST /auctions
Content-Type: application/json

{
  "type": "second-price",
  "tieBreak": "timestamp",
  "multiUnit": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "auction-uuid",
    "status": "open",
    "config": { ... },
    "createdAt": "2025-12-23T..."
  }
}
```

### Place Bid

```bash
POST /auctions/:id/bids
Content-Type: application/json

{
  "bidderId": "bidder-uuid",
  "itemId": "item-uuid",
  "amount": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "bid-uuid",
    "auctionId": "auction-uuid",
    "bidderId": "bidder-uuid",
    "itemId": "item-uuid",
    "amount": 100,
    "placedAt": "2025-12-23T...",
    "status": "active"
  }
}
```

### Resolve Auction

```bash
POST /auctions/:id/resolve?seed=12345
```

**Response:**
```json
{
  "success": true,
  "data": {
    "settlements": [
      {
        "bidderId": "bidder-uuid",
        "itemId": "item-uuid",
        "wonAmount": 100,
        "bidAmount": 150
      }
    ],
    "errors": [],
    "resolvedAt": "2025-12-23T..."
  }
}
```

### Get Auction State

```bash
GET /auctions/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "auction": { ... },
    "bidders": [ ... ],
    "bids": [ ... ],
    "items": [ ... ],
    "settlements": [ ... ]
  }
}
```

### List Bids

```bash
GET /auctions/:id/bids
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "bid-uuid",
      "auctionId": "auction-uuid",
      "bidderId": "bidder-uuid",
      "itemId": "item-uuid",
      "amount": 100,
      "placedAt": "2025-12-23T...",
      "status": "active"
    }
  ]
}
```

## Development

### Local Development

```bash
# Set DATABASE_URL in .env file
echo "DATABASE_URL=postgres://postgres:postgres@localhost:5432/auction_kit_dev" > .env

# Run dev server
pnpm dev
```

### Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch
```

## Example Flow

```bash
# 1. Create auction
curl -X POST http://localhost:3000/auctions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "second-price",
    "tieBreak": "timestamp",
    "multiUnit": false
  }'

# Response: { "success": true, "data": { "id": "auction-123", ... } }

# 2. Create bidder (using drizzle directly or add endpoint)
# ... create bidder via drizzle queries ...

# 3. Place bid
curl -X POST http://localhost:3000/auctions/auction-123/bids \
  -H "Content-Type: application/json" \
  -d '{
    "bidderId": "bidder-456",
    "itemId": "item-789",
    "amount": 100
  }'

# 4. Resolve auction
curl -X POST http://localhost:3000/auctions/auction-123/resolve

# 5. Get results
curl http://localhost:3000/auctions/auction-123
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)
- `PORT` - Server port (default: 3000)

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }  // Only in development
}
```

HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `500` - Internal Server Error

## Health Check

```bash
GET /health
```

Returns: `{ "status": "ok" }`

## License

MIT

import { describe, test, expect } from 'vitest'
import {
  validateBid,
  validateBids,
  filterValidBids,
  validateAuctionResolution,
  isValidBidAmount,
  isValidItemId,
  isValidBidderId,
} from './validator'
import type { Bid, Auction } from './types'

describe('validateBid', () => {
  const auction: Auction = {
    id: 'auction-1',
    status: 'open',
    config: {
      type: 'first-price',
      tieBreak: 'timestamp',
      multiUnit: false,
    },
    createdAt: new Date(),
  }

  test('validates correct bid', () => {
    const bid: Bid = {
      id: 'bid-1',
      auctionId: 'auction-1',
      bidderId: 'alice',
      itemId: 'seat1',
      amount: 100,
      placedAt: new Date(),
      status: 'active',
    }

    const result = validateBid(bid, auction)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('rejects bid with wrong auction ID', () => {
    const bid: Bid = {
      id: 'bid-1',
      auctionId: 'wrong-auction',
      bidderId: 'alice',
      itemId: 'seat1',
      amount: 100,
      placedAt: new Date(),
      status: 'active',
    }

    const result = validateBid(bid, auction)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Bid does not belong to this auction')
  })

  test('rejects zero amount bid', () => {
    const bid: Bid = {
      id: 'bid-1',
      auctionId: 'auction-1',
      bidderId: 'alice',
      itemId: 'seat1',
      amount: 0,
      placedAt: new Date(),
      status: 'active',
    }

    const result = validateBid(bid, auction)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Bid amount must be positive')
  })

  test('rejects negative amount bid', () => {
    const bid: Bid = {
      id: 'bid-1',
      auctionId: 'auction-1',
      bidderId: 'alice',
      itemId: 'seat1',
      amount: -100,
      placedAt: new Date(),
      status: 'active',
    }

    const result = validateBid(bid, auction)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Bid amount must be positive')
  })

  test('rejects bid below minimum amount', () => {
    const bid: Bid = {
      id: 'bid-1',
      auctionId: 'auction-1',
      bidderId: 'alice',
      itemId: 'seat1',
      amount: 5,
      placedAt: new Date(),
      status: 'active',
    }

    const result = validateBid(bid, auction, { minBidAmount: 10 })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Bid amount must be at least 10')
  })

  test('rejects bid above maximum amount', () => {
    const bid: Bid = {
      id: 'bid-1',
      auctionId: 'auction-1',
      bidderId: 'alice',
      itemId: 'seat1',
      amount: 1000,
      placedAt: new Date(),
      status: 'active',
    }

    const result = validateBid(bid, auction, { maxBidAmount: 500 })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Bid amount must not exceed 500')
  })

  test('rejects bid on closed auction by default', () => {
    const closedAuction: Auction = {
      ...auction,
      status: 'closed',
    }

    const bid: Bid = {
      id: 'bid-1',
      auctionId: 'auction-1',
      bidderId: 'alice',
      itemId: 'seat1',
      amount: 100,
      placedAt: new Date(),
      status: 'active',
    }

    const result = validateBid(bid, closedAuction)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Cannot bid on closed auction')
  })

  test('accepts bid on closed auction when allowed', () => {
    const closedAuction: Auction = {
      ...auction,
      status: 'closed',
    }

    const bid: Bid = {
      id: 'bid-1',
      auctionId: 'auction-1',
      bidderId: 'alice',
      itemId: 'seat1',
      amount: 100,
      placedAt: new Date(),
      status: 'active',
    }

    const result = validateBid(bid, closedAuction, { allowClosedAuction: true })

    expect(result.valid).toBe(true)
  })

  test('rejects bid on resolved auction', () => {
    const resolvedAuction: Auction = {
      ...auction,
      status: 'resolved',
    }

    const bid: Bid = {
      id: 'bid-1',
      auctionId: 'auction-1',
      bidderId: 'alice',
      itemId: 'seat1',
      amount: 100,
      placedAt: new Date(),
      status: 'active',
    }

    const result = validateBid(bid, resolvedAuction)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Cannot bid on resolved auction')
  })

  test('rejects bid with empty item ID', () => {
    const bid: Bid = {
      id: 'bid-1',
      auctionId: 'auction-1',
      bidderId: 'alice',
      itemId: '',
      amount: 100,
      placedAt: new Date(),
      status: 'active',
    }

    const result = validateBid(bid, auction)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Item ID cannot be empty')
  })

  test('rejects bid with whitespace-only item ID', () => {
    const bid: Bid = {
      id: 'bid-1',
      auctionId: 'auction-1',
      bidderId: 'alice',
      itemId: '   ',
      amount: 100,
      placedAt: new Date(),
      status: 'active',
    }

    const result = validateBid(bid, auction)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Item ID cannot be empty')
  })

  test('rejects bid with empty bidder ID', () => {
    const bid: Bid = {
      id: 'bid-1',
      auctionId: 'auction-1',
      bidderId: '',
      itemId: 'seat1',
      amount: 100,
      placedAt: new Date(),
      status: 'active',
    }

    const result = validateBid(bid, auction)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Bidder ID cannot be empty')
  })

  test('accumulates multiple errors', () => {
    const bid: Bid = {
      id: 'bid-1',
      auctionId: 'wrong-auction',
      bidderId: '',
      itemId: '',
      amount: -100,
      placedAt: new Date(),
      status: 'active',
    }

    const result = validateBid(bid, auction)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(1)
  })
})

describe('validateBids', () => {
  const auction: Auction = {
    id: 'auction-1',
    status: 'open',
    config: {
      type: 'first-price',
      tieBreak: 'timestamp',
      multiUnit: false,
    },
    createdAt: new Date(),
  }

  test('validates multiple bids', () => {
    const bids: Bid[] = [
      {
        id: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'alice',
        itemId: 'seat1',
        amount: 100,
        placedAt: new Date(),
        status: 'active',
      },
      {
        id: 'bid-2',
        auctionId: 'auction-1',
        bidderId: 'bob',
        itemId: 'seat1',
        amount: -50,
        placedAt: new Date(),
        status: 'active',
      },
    ]

    const results = validateBids(bids, auction)

    expect(results.size).toBe(2)
    expect(results.get('bid-1')?.valid).toBe(true)
    expect(results.get('bid-2')?.valid).toBe(false)
  })

  test('returns empty map for empty bids', () => {
    const results = validateBids([], auction)
    expect(results.size).toBe(0)
  })
})

describe('filterValidBids', () => {
  const auction: Auction = {
    id: 'auction-1',
    status: 'open',
    config: {
      type: 'first-price',
      tieBreak: 'timestamp',
      multiUnit: false,
    },
    createdAt: new Date(),
  }

  test('filters out invalid bids', () => {
    const bids: Bid[] = [
      {
        id: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'alice',
        itemId: 'seat1',
        amount: 100,
        placedAt: new Date(),
        status: 'active',
      },
      {
        id: 'bid-2',
        auctionId: 'auction-1',
        bidderId: 'bob',
        itemId: 'seat1',
        amount: -50,
        placedAt: new Date(),
        status: 'active',
      },
      {
        id: 'bid-3',
        auctionId: 'auction-1',
        bidderId: 'charlie',
        itemId: 'seat1',
        amount: 150,
        placedAt: new Date(),
        status: 'active',
      },
    ]

    const validBids = filterValidBids(bids, auction)

    expect(validBids).toHaveLength(2)
    expect(validBids.map(b => b.id)).toEqual(['bid-1', 'bid-3'])
  })

  test('returns empty array when all bids invalid', () => {
    const bids: Bid[] = [
      {
        id: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'alice',
        itemId: 'seat1',
        amount: -100,
        placedAt: new Date(),
        status: 'active',
      },
    ]

    const validBids = filterValidBids(bids, auction)
    expect(validBids).toHaveLength(0)
  })

  test('returns all bids when all valid', () => {
    const bids: Bid[] = [
      {
        id: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'alice',
        itemId: 'seat1',
        amount: 100,
        placedAt: new Date(),
        status: 'active',
      },
      {
        id: 'bid-2',
        auctionId: 'auction-1',
        bidderId: 'bob',
        itemId: 'seat1',
        amount: 150,
        placedAt: new Date(),
        status: 'active',
      },
    ]

    const validBids = filterValidBids(bids, auction)
    expect(validBids).toHaveLength(2)
  })
})

describe('validateAuctionResolution', () => {
  const auction: Auction = {
    id: 'auction-1',
    status: 'closed',
    config: {
      type: 'first-price',
      tieBreak: 'timestamp',
      multiUnit: false,
    },
    createdAt: new Date(),
  }

  test('validates auction ready for resolution', () => {
    const bids: Bid[] = [
      {
        id: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'alice',
        itemId: 'seat1',
        amount: 100,
        placedAt: new Date(),
        status: 'active',
      },
    ]

    const result = validateAuctionResolution(auction, bids)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('rejects already resolved auction', () => {
    const resolvedAuction: Auction = {
      ...auction,
      status: 'resolved',
    }

    const bids: Bid[] = [
      {
        id: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'alice',
        itemId: 'seat1',
        amount: 100,
        placedAt: new Date(),
        status: 'active',
      },
    ]

    const result = validateAuctionResolution(resolvedAuction, bids)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Auction is already resolved')
  })

  test('rejects auction with no active bids', () => {
    const bids: Bid[] = [
      {
        id: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'alice',
        itemId: 'seat1',
        amount: 100,
        placedAt: new Date(),
        status: 'cancelled',
      },
    ]

    const result = validateAuctionResolution(auction, bids)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('No active bids to resolve')
  })

  test('rejects auction with empty bids', () => {
    const result = validateAuctionResolution(auction, [])

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('No active bids to resolve')
  })

  test('reports invalid bids', () => {
    const bids: Bid[] = [
      {
        id: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'alice',
        itemId: 'seat1',
        amount: -100,
        placedAt: new Date(),
        status: 'active',
      },
    ]

    const result = validateAuctionResolution(auction, bids)

    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('Invalid bid bid-1'))).toBe(true)
  })
})

describe('isValidBidAmount', () => {
  test('accepts positive amounts', () => {
    expect(isValidBidAmount(1)).toBe(true)
    expect(isValidBidAmount(100)).toBe(true)
    expect(isValidBidAmount(0.01)).toBe(true)
  })

  test('rejects zero', () => {
    expect(isValidBidAmount(0)).toBe(false)
  })

  test('rejects negative amounts', () => {
    expect(isValidBidAmount(-1)).toBe(false)
    expect(isValidBidAmount(-100)).toBe(false)
  })

  test('rejects infinity', () => {
    expect(isValidBidAmount(Infinity)).toBe(false)
    expect(isValidBidAmount(-Infinity)).toBe(false)
  })

  test('rejects NaN', () => {
    expect(isValidBidAmount(NaN)).toBe(false)
  })
})

describe('isValidItemId', () => {
  test('accepts non-empty strings', () => {
    expect(isValidItemId('seat1')).toBe(true)
    expect(isValidItemId('item-123')).toBe(true)
  })

  test('rejects empty string', () => {
    expect(isValidItemId('')).toBe(false)
  })

  test('rejects whitespace-only string', () => {
    expect(isValidItemId('   ')).toBe(false)
    expect(isValidItemId('\t\n')).toBe(false)
  })
})

describe('isValidBidderId', () => {
  test('accepts non-empty strings', () => {
    expect(isValidBidderId('alice')).toBe(true)
    expect(isValidBidderId('user-123')).toBe(true)
  })

  test('rejects empty string', () => {
    expect(isValidBidderId('')).toBe(false)
  })

  test('rejects whitespace-only string', () => {
    expect(isValidBidderId('   ')).toBe(false)
    expect(isValidBidderId('\t\n')).toBe(false)
  })
})



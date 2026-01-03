import { describe, test, expect } from 'vitest'
import {
  settleBids,
  determineWinners,
  calculatePayments,
  groupSettlementsByBidder,
} from './settler'
import type { Bid, AuctionConfig } from './types'

describe('settleBids', () => {
  describe('first-price auctions', () => {
    const config: AuctionConfig = {
      type: 'first-price',
      tieBreak: 'timestamp',
      multiUnit: false,
    }

    test('single bid wins at their bid amount', () => {
      const bids: Bid[] = [
        {
          id: 'bid-1',
          auctionId: 'auction-1',
          bidderId: 'alice',
          itemId: 'seat1',
          amount: 100,
          placedAt: new Date(1000),
          status: 'active',
        },
      ]

      const result = settleBids(bids, config)

      expect(result.settlements).toHaveLength(1)
      expect(result.settlements[0]).toMatchObject({
        bidderId: 'alice',
        itemId: 'seat1',
        wonAmount: 100,
        bidAmount: 100,
      })
      expect(result.errors).toHaveLength(0)
    })

    test('highest bid wins and pays their bid amount', () => {
      const bids: Bid[] = [
        {
          id: 'bid-1',
          auctionId: 'auction-1',
          bidderId: 'alice',
          itemId: 'seat1',
          amount: 100,
          placedAt: new Date(1000),
          status: 'active',
        },
        {
          id: 'bid-2',
          auctionId: 'auction-1',
          bidderId: 'bob',
          itemId: 'seat1',
          amount: 150,
          placedAt: new Date(2000),
          status: 'active',
        },
      ]

      const result = settleBids(bids, config)

      expect(result.settlements).toHaveLength(1)
      expect(result.settlements[0]).toMatchObject({
        bidderId: 'bob',
        wonAmount: 150, // Pays their bid in first-price
      })
    })

    test('tie broken by timestamp', () => {
      const bids: Bid[] = [
        {
          id: 'bid-1',
          auctionId: 'auction-1',
          bidderId: 'alice',
          itemId: 'seat1',
          amount: 100,
          placedAt: new Date(2000), // Later
          status: 'active',
        },
        {
          id: 'bid-2',
          auctionId: 'auction-1',
          bidderId: 'bob',
          itemId: 'seat1',
          amount: 100,
          placedAt: new Date(1000), // Earlier - should win
          status: 'active',
        },
      ]

      const result = settleBids(bids, config)

      expect(result.settlements).toHaveLength(1)
      expect(result.settlements[0]?.bidderId).toBe('bob')
    })

    test('multiple items settle independently', () => {
      const bids: Bid[] = [
        {
          id: 'bid-1',
          auctionId: 'auction-1',
          bidderId: 'alice',
          itemId: 'seat1',
          amount: 100,
          placedAt: new Date(1000),
          status: 'active',
        },
        {
          id: 'bid-2',
          auctionId: 'auction-1',
          bidderId: 'bob',
          itemId: 'seat1',
          amount: 150,
          placedAt: new Date(2000),
          status: 'active',
        },
        {
          id: 'bid-3',
          auctionId: 'auction-1',
          bidderId: 'charlie',
          itemId: 'seat2',
          amount: 200,
          placedAt: new Date(3000),
          status: 'active',
        },
        {
          id: 'bid-4',
          auctionId: 'auction-1',
          bidderId: 'david',
          itemId: 'seat2',
          amount: 175,
          placedAt: new Date(4000),
          status: 'active',
        },
      ]

      const result = settleBids(bids, config)

      expect(result.settlements).toHaveLength(2)
      
      const seat1Winner = result.settlements.find(s => s.itemId === 'seat1')
      expect(seat1Winner?.bidderId).toBe('bob')
      expect(seat1Winner?.wonAmount).toBe(150)
      
      const seat2Winner = result.settlements.find(s => s.itemId === 'seat2')
      expect(seat2Winner?.bidderId).toBe('charlie')
      expect(seat2Winner?.wonAmount).toBe(200)
    })
  })

  describe('second-price auctions', () => {
    const config: AuctionConfig = {
      type: 'second-price',
      tieBreak: 'timestamp',
      multiUnit: false,
    }

    test('winner pays second-highest bid', () => {
      const bids: Bid[] = [
        {
          id: 'bid-1',
          auctionId: 'auction-1',
          bidderId: 'alice',
          itemId: 'seat1',
          amount: 100,
          placedAt: new Date(1000),
          status: 'active',
        },
        {
          id: 'bid-2',
          auctionId: 'auction-1',
          bidderId: 'bob',
          itemId: 'seat1',
          amount: 150,
          placedAt: new Date(2000),
          status: 'active',
        },
      ]

      const result = settleBids(bids, config)

      expect(result.settlements).toHaveLength(1)
      expect(result.settlements[0]).toMatchObject({
        bidderId: 'bob',
        wonAmount: 100, // Pays second-highest (Alice's bid)
        bidAmount: 150, // Original bid
      })
    })

    test('single bid pays their own amount', () => {
      const bids: Bid[] = [
        {
          id: 'bid-1',
          auctionId: 'auction-1',
          bidderId: 'alice',
          itemId: 'seat1',
          amount: 100,
          placedAt: new Date(1000),
          status: 'active',
        },
      ]

      const result = settleBids(bids, config)

      expect(result.settlements).toHaveLength(1)
      expect(result.settlements[0]?.wonAmount).toBe(100) // No second bid, pays their own
    })

    test('winner pays correct second-price with multiple bids', () => {
      const bids: Bid[] = [
        {
          id: 'bid-1',
          auctionId: 'auction-1',
          bidderId: 'alice',
          itemId: 'seat1',
          amount: 50,
          placedAt: new Date(1000),
          status: 'active',
        },
        {
          id: 'bid-2',
          auctionId: 'auction-1',
          bidderId: 'bob',
          itemId: 'seat1',
          amount: 100,
          placedAt: new Date(2000),
          status: 'active',
        },
        {
          id: 'bid-3',
          auctionId: 'auction-1',
          bidderId: 'charlie',
          itemId: 'seat1',
          amount: 200,
          placedAt: new Date(3000),
          status: 'active',
        },
      ]

      const result = settleBids(bids, config)

      expect(result.settlements).toHaveLength(1)
      expect(result.settlements[0]).toMatchObject({
        bidderId: 'charlie',
        wonAmount: 100, // Pays Bob's bid (second-highest)
        bidAmount: 200,
      })
    })
  })

  describe('multi-unit auctions', () => {
    test('all highest bidders win in first-price', () => {
      const config: AuctionConfig = {
        type: 'first-price',
        tieBreak: 'timestamp',
        multiUnit: true,
      }

      const bids: Bid[] = [
        {
          id: 'bid-1',
          auctionId: 'auction-1',
          bidderId: 'alice',
          itemId: 'seat1',
          amount: 100,
          placedAt: new Date(1000),
          status: 'active',
        },
        {
          id: 'bid-2',
          auctionId: 'auction-1',
          bidderId: 'bob',
          itemId: 'seat1',
          amount: 100,
          placedAt: new Date(2000),
          status: 'active',
        },
        {
          id: 'bid-3',
          auctionId: 'auction-1',
          bidderId: 'charlie',
          itemId: 'seat1',
          amount: 50,
          placedAt: new Date(3000),
          status: 'active',
        },
      ]

      const result = settleBids(bids, config)

      expect(result.settlements).toHaveLength(2) // Alice and Bob both win
      expect(result.settlements.map(s => s.bidderId).sort()).toEqual(['alice', 'bob'])
      expect(result.settlements.every(s => s.wonAmount === 100)).toBe(true)
    })

    test('single highest bidder wins even with multiUnit', () => {
      const config: AuctionConfig = {
        type: 'first-price',
        tieBreak: 'timestamp',
        multiUnit: true,
      }

      const bids: Bid[] = [
        {
          id: 'bid-1',
          auctionId: 'auction-1',
          bidderId: 'alice',
          itemId: 'seat1',
          amount: 100,
          placedAt: new Date(1000),
          status: 'active',
        },
        {
          id: 'bid-2',
          auctionId: 'auction-1',
          bidderId: 'bob',
          itemId: 'seat1',
          amount: 150,
          placedAt: new Date(2000),
          status: 'active',
        },
      ]

      const result = settleBids(bids, config)

      expect(result.settlements).toHaveLength(1) // Only Bob wins (highest)
      expect(result.settlements[0]?.bidderId).toBe('bob')
    })
  })

  describe('random tie-breaking', () => {
    test('produces consistent results with same seed', () => {
      const config: AuctionConfig = {
        type: 'first-price',
        tieBreak: 'random',
        multiUnit: false,
      }

      const bids: Bid[] = [
        {
          id: 'bid-1',
          auctionId: 'auction-1',
          bidderId: 'alice',
          itemId: 'seat1',
          amount: 100,
          placedAt: new Date(1000),
          status: 'active',
        },
        {
          id: 'bid-2',
          auctionId: 'auction-1',
          bidderId: 'bob',
          itemId: 'seat1',
          amount: 100,
          placedAt: new Date(2000),
          status: 'active',
        },
      ]

      const result1 = settleBids(bids, config, 12345)
      const result2 = settleBids(bids, config, 12345)

      expect(result1.settlements[0]?.bidderId).toBe(result2.settlements[0]?.bidderId)
    })
  })

  describe('edge cases', () => {
    test('handles empty bids array', () => {
      const config: AuctionConfig = {
        type: 'first-price',
        tieBreak: 'timestamp',
        multiUnit: false,
      }

      const result = settleBids([], config)

      expect(result.settlements).toHaveLength(0)
      expect(result.errors).toContain('No bids to settle')
    })

    test('includes resolvedAt timestamp', () => {
      const config: AuctionConfig = {
        type: 'first-price',
        tieBreak: 'timestamp',
        multiUnit: false,
      }

      const bids: Bid[] = [
        {
          id: 'bid-1',
          auctionId: 'auction-1',
          bidderId: 'alice',
          itemId: 'seat1',
          amount: 100,
          placedAt: new Date(1000),
          status: 'active',
        },
      ]

      const before = Date.now()
      const result = settleBids(bids, config)
      const after = Date.now()

      expect(result.resolvedAt.getTime()).toBeGreaterThanOrEqual(before)
      expect(result.resolvedAt.getTime()).toBeLessThanOrEqual(after)
    })
  })
})

describe('determineWinners', () => {
  test('returns winning bid IDs by item', () => {
    const config: AuctionConfig = {
      type: 'first-price',
      tieBreak: 'timestamp',
      multiUnit: false,
    }

    const bids: Bid[] = [
      {
        id: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'alice',
        itemId: 'seat1',
        amount: 100,
        placedAt: new Date(1000),
        status: 'active',
      },
      {
        id: 'bid-2',
        auctionId: 'auction-1',
        bidderId: 'bob',
        itemId: 'seat1',
        amount: 150,
        placedAt: new Date(2000),
        status: 'active',
      },
    ]

    const winners = determineWinners(bids, config)

    expect(winners.get('seat1')).toEqual(['bid-2'])
  })

  test('returns multiple winners in multi-unit', () => {
    const config: AuctionConfig = {
      type: 'first-price',
      tieBreak: 'timestamp',
      multiUnit: true,
    }

    const bids: Bid[] = [
      {
        id: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'alice',
        itemId: 'seat1',
        amount: 100,
        placedAt: new Date(1000),
        status: 'active',
      },
      {
        id: 'bid-2',
        auctionId: 'auction-1',
        bidderId: 'bob',
        itemId: 'seat1',
        amount: 100,
        placedAt: new Date(2000),
        status: 'active',
      },
    ]

    const winners = determineWinners(bids, config)

    expect(winners.get('seat1')?.sort()).toEqual(['bid-1', 'bid-2'])
  })
})

describe('calculatePayments', () => {
  test('sums payments by bidder', () => {
    const settlements = [
      {
        bidderId: 'alice',
        itemId: 'seat1',
        wonAmount: 100,
        bidAmount: 100,
      },
      {
        bidderId: 'alice',
        itemId: 'seat2',
        wonAmount: 150,
        bidAmount: 150,
      },
      {
        bidderId: 'bob',
        itemId: 'seat3',
        wonAmount: 200,
        bidAmount: 200,
      },
    ]

    const payments = calculatePayments(settlements)

    expect(payments.get('alice')).toBe(250)
    expect(payments.get('bob')).toBe(200)
  })

  test('handles empty settlements', () => {
    const payments = calculatePayments([])
    expect(payments.size).toBe(0)
  })
})

describe('groupSettlementsByBidder', () => {
  test('groups settlements by bidder ID', () => {
    const settlements = [
      {
        bidderId: 'alice',
        itemId: 'seat1',
        wonAmount: 100,
        bidAmount: 100,
      },
      {
        bidderId: 'alice',
        itemId: 'seat2',
        wonAmount: 150,
        bidAmount: 150,
      },
      {
        bidderId: 'bob',
        itemId: 'seat3',
        wonAmount: 200,
        bidAmount: 200,
      },
    ]

    const grouped = groupSettlementsByBidder(settlements)

    expect(grouped.get('alice')).toHaveLength(2)
    expect(grouped.get('bob')).toHaveLength(1)
  })
})









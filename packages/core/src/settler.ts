/**
 * Auction settlement logic for first-price and second-price sealed-bid auctions
 */

import type { Bid, AuctionConfig, Settlement, ResolutionResult } from './types'
import { rankBids, getSecondPrice } from './ranker'

/**
 * Group bids by item ID
 */
function groupBidsByItem(bids: Bid[]): Map<string, Bid[]> {
  const grouped = new Map<string, Bid[]>()
  
  for (const bid of bids) {
    const itemBids = grouped.get(bid.itemId) ?? []
    itemBids.push(bid)
    grouped.set(bid.itemId, itemBids)
  }
  
  return grouped
}

/**
 * Settle bids according to auction configuration
 * 
 * This is the core auction settlement algorithm that:
 * 1. Groups bids by item
 * 2. Ranks bids using configured tie-breaking
 * 3. Determines winner(s) based on multiUnit setting
 * 4. Calculates payment based on pricing rule (first-price or second-price)
 * 
 * @param bids - All active bids to settle
 * @param config - Auction configuration
 * @param randomSeed - Optional seed for reproducible random tie-breaking
 * @returns Resolution result with settlements and any errors
 */
export function settleBids(
  bids: Bid[],
  config: AuctionConfig,
  randomSeed?: number
): ResolutionResult {
  const settlements: Settlement[] = []
  const errors: string[] = []
  const resolvedAt = new Date()

  // Handle empty bids
  if (bids.length === 0) {
    return {
      settlements: [],
      errors: ['No bids to settle'],
      resolvedAt,
    }
  }

  // Group bids by item
  const bidsByItem = groupBidsByItem(bids)

  // Process each item independently
  for (const [itemId, itemBids] of bidsByItem.entries()) {
    try {
      // Rank bids for this item
      const ranked = rankBids(itemBids, {
        tieBreak: config.tieBreak,
        randomSeed,
      })

      if (ranked.length === 0) {
        errors.push(`No valid bids for item ${itemId}`)
        continue
      }

      // Determine winners based on multiUnit setting
      let winners = ranked.slice(0, 1) // Default: single winner

      if (config.multiUnit) {
        // Multi-unit: all bids with the highest amount win
        const topAmount = ranked[0]!.amount
        winners = ranked.filter(bid => bid.amount === topAmount)
      }

      // Calculate payment based on pricing rule
      for (const winner of winners) {
        let wonAmount: number

        if (config.type === 'first-price') {
          // First-price: winner pays their bid
          wonAmount = winner.amount
        } else {
          // Second-price: winner pays second-highest bid
          const secondPrice = getSecondPrice(ranked)
          
          if (secondPrice === undefined) {
            // Only one bid: winner pays their own bid
            wonAmount = winner.amount
          } else {
            // Winner pays second-highest bid
            wonAmount = secondPrice
          }
        }

        settlements.push({
          bidderId: winner.bidderId,
          itemId,
          wonAmount,
          bidAmount: winner.amount,
          settledAt: resolvedAt,
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`Error settling item ${itemId}: ${errorMessage}`)
    }
  }

  return {
    settlements,
    errors,
    resolvedAt,
  }
}

/**
 * Determine winners without calculating payments
 * Useful for previewing auction results before final settlement
 * 
 * @param bids - All active bids
 * @param config - Auction configuration  
 * @param randomSeed - Optional seed for reproducible random tie-breaking
 * @returns Map of itemId to winning bid IDs
 */
export function determineWinners(
  bids: Bid[],
  config: AuctionConfig,
  randomSeed?: number
): Map<string, string[]> {
  const winners = new Map<string, string[]>()
  const bidsByItem = groupBidsByItem(bids)

  for (const [itemId, itemBids] of bidsByItem.entries()) {
    const ranked = rankBids(itemBids, {
      tieBreak: config.tieBreak,
      randomSeed,
    })

    if (ranked.length === 0) {
      continue
    }

    let winningBids = ranked.slice(0, 1)

    if (config.multiUnit) {
      const topAmount = ranked[0]!.amount
      winningBids = ranked.filter(bid => bid.amount === topAmount)
    }

    winners.set(itemId, winningBids.map(bid => bid.id))
  }

  return winners
}

/**
 * Calculate total payments for all settlements
 * 
 * @param settlements - Settlement results
 * @returns Map of bidderId to total amount owed
 */
export function calculatePayments(settlements: Settlement[]): Map<string, number> {
  const payments = new Map<string, number>()

  for (const settlement of settlements) {
    const current = payments.get(settlement.bidderId) ?? 0
    payments.set(settlement.bidderId, current + settlement.wonAmount)
  }

  return payments
}

/**
 * Group settlements by bidder
 * 
 * @param settlements - Settlement results
 * @returns Map of bidderId to their settlements
 */
export function groupSettlementsByBidder(
  settlements: Settlement[]
): Map<string, Settlement[]> {
  const grouped = new Map<string, Settlement[]>()

  for (const settlement of settlements) {
    const bidderSettlements = grouped.get(settlement.bidderId) ?? []
    bidderSettlements.push(settlement)
    grouped.set(settlement.bidderId, bidderSettlements)
  }

  return grouped
}



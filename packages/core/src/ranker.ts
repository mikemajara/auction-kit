/**
 * Bid ranking logic with configurable tie-breaking strategies
 */

import type { Bid, RankedBid, RankingOptions } from './types'

/**
 * Simple seeded random number generator for reproducible randomness
 * Based on mulberry32 algorithm
 */
function createSeededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6D2B79F5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Rank bids for a single item using specified tie-breaking strategy
 * 
 * @param bids - Bids to rank (should all be for the same item)
 * @param options - Ranking options including tie-break strategy
 * @returns Bids sorted by rank (index 0 = winner)
 */
export function rankBids(bids: Bid[], options: RankingOptions): RankedBid[] {
  if (bids.length === 0) {
    return []
  }

  const { tieBreak, randomSeed } = options

  // Create a copy to avoid mutating input
  let sortedBids = [...bids]

  if (tieBreak === 'timestamp') {
    // Sort by amount DESC, then by timestamp ASC (earlier wins ties)
    sortedBids.sort((a, b) => {
      if (b.amount !== a.amount) {
        return b.amount - a.amount
      }
      return a.placedAt.getTime() - b.placedAt.getTime()
    })
  } else if (tieBreak === 'random') {
    // First sort by amount DESC
    sortedBids.sort((a, b) => b.amount - a.amount)

    // Then shuffle tied bids randomly
    const rng = createSeededRandom(randomSeed ?? Date.now())
    
    // Group by amount and shuffle each group
    let i = 0
    while (i < sortedBids.length) {
      const currentAmount = sortedBids[i]!.amount
      let j = i + 1
      
      // Find all bids with the same amount
      while (j < sortedBids.length && sortedBids[j]!.amount === currentAmount) {
        j++
      }
      
      // If there are ties (j > i + 1), shuffle that group
      if (j > i + 1) {
        const group = sortedBids.slice(i, j)
        
        // Fisher-Yates shuffle with seeded random
        for (let k = group.length - 1; k > 0; k--) {
          const randomIndex = Math.floor(rng() * (k + 1))
          ;[group[k], group[randomIndex]] = [group[randomIndex]!, group[k]!]
        }
        
        // Replace the sorted segment with shuffled group
        sortedBids.splice(i, j - i, ...group)
      }
      
      i = j
    }
  }

  // Add rank to each bid
  return sortedBids.map((bid, index) => ({
    ...bid,
    rank: index,
  }))
}

/**
 * Get the winning bid(s) for a single item
 * 
 * @param bids - Bids for a single item
 * @param options - Ranking options
 * @param multiUnit - Whether to return all top-ranked bids (true) or just one (false)
 * @returns Array of winning bids
 */
export function getWinners(
  bids: Bid[],
  options: RankingOptions,
  multiUnit: boolean = false
): RankedBid[] {
  const ranked = rankBids(bids, options)
  
  if (ranked.length === 0) {
    return []
  }

  if (!multiUnit) {
    // Single winner: return only rank 0
    return ranked.slice(0, 1)
  }

  // Multi-unit: return all bids with rank 0 (top amount)
  // This handles the case where multiple bids have the same highest amount
  // but we still want just the winners based on tie-breaking
  const topAmount = ranked[0]!.amount
  return ranked.filter(bid => bid.amount === topAmount)
}

/**
 * Get the second-highest bid for second-price calculation
 * 
 * @param rankedBids - Already ranked bids (from rankBids)
 * @returns Second-highest bid amount, or undefined if not enough bids
 */
export function getSecondPrice(rankedBids: RankedBid[]): number | undefined {
  if (rankedBids.length < 2) {
    return undefined
  }
  
  // Second price is the amount of the second-ranked bid
  return rankedBids[1]?.amount
}





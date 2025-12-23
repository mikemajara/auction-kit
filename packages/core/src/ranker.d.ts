/**
 * Bid ranking logic with configurable tie-breaking strategies
 */
import type { Bid, RankedBid, RankingOptions } from './types';
/**
 * Rank bids for a single item using specified tie-breaking strategy
 *
 * @param bids - Bids to rank (should all be for the same item)
 * @param options - Ranking options including tie-break strategy
 * @returns Bids sorted by rank (index 0 = winner)
 */
export declare function rankBids(bids: Bid[], options: RankingOptions): RankedBid[];
/**
 * Get the winning bid(s) for a single item
 *
 * @param bids - Bids for a single item
 * @param options - Ranking options
 * @param multiUnit - Whether to return all top-ranked bids (true) or just one (false)
 * @returns Array of winning bids
 */
export declare function getWinners(bids: Bid[], options: RankingOptions, multiUnit?: boolean): RankedBid[];
/**
 * Get the second-highest bid for second-price calculation
 *
 * @param rankedBids - Already ranked bids (from rankBids)
 * @returns Second-highest bid amount, or undefined if not enough bids
 */
export declare function getSecondPrice(rankedBids: RankedBid[]): number | undefined;
//# sourceMappingURL=ranker.d.ts.map
/**
 * Auction settlement logic for first-price and second-price sealed-bid auctions
 */
import type { Bid, AuctionConfig, Settlement, ResolutionResult } from './types';
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
export declare function settleBids(bids: Bid[], config: AuctionConfig, randomSeed?: number): ResolutionResult;
/**
 * Determine winners without calculating payments
 * Useful for previewing auction results before final settlement
 *
 * @param bids - All active bids
 * @param config - Auction configuration
 * @param randomSeed - Optional seed for reproducible random tie-breaking
 * @returns Map of itemId to winning bid IDs
 */
export declare function determineWinners(bids: Bid[], config: AuctionConfig, randomSeed?: number): Map<string, string[]>;
/**
 * Calculate total payments for all settlements
 *
 * @param settlements - Settlement results
 * @returns Map of bidderId to total amount owed
 */
export declare function calculatePayments(settlements: Settlement[]): Map<string, number>;
/**
 * Group settlements by bidder
 *
 * @param settlements - Settlement results
 * @returns Map of bidderId to their settlements
 */
export declare function groupSettlementsByBidder(settlements: Settlement[]): Map<string, Settlement[]>;
//# sourceMappingURL=settler.d.ts.map
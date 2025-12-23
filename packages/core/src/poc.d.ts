/**
 * Week 0.5: Proof of Concept
 *
 * Minimal implementation to validate the core settlement algorithm
 * before building the full infrastructure.
 *
 * Goal: Prove that first-price sealed-bid auction with timestamp
 * tie-breaking works correctly with zero dependencies.
 */
export type SimpleBid = {
    id: string;
    bidderId: string;
    itemId: string;
    amount: number;
    timestamp: number;
};
export type SimpleSettlement = {
    bidderId: string;
    itemId: string;
    wonAmount: number;
};
/**
 * Settle bids using first-price sealed-bid rules
 * - Highest bid wins
 * - Ties broken by earliest timestamp
 * - Single winner per item
 */
export declare function settleBidsSimple(bids: SimpleBid[]): SimpleSettlement[];
/**
 * Rank bids for a single item
 * Returns bids sorted by winner-first order
 */
export declare function rankBids(bids: SimpleBid[]): SimpleBid[];
/**
 * Get the winning bid for a single item
 */
export declare function getWinner(bids: SimpleBid[]): SimpleBid | null;
//# sourceMappingURL=poc.d.ts.map
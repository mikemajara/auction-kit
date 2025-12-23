/**
 * Core auction types aligned with auction theory literature
 *
 * References:
 * - Klemperer, P. (2004). "Auctions: Theory and Practice"
 * - Krishna, V. (2009). "Auction Theory"
 */
/**
 * Auction configuration defining the rules and mechanics
 */
export type AuctionConfig = {
    /** Pricing rule: first-price (pay your bid) or second-price (pay second-highest) */
    type: "first-price" | "second-price";
    /** Tie-breaking strategy when bids are equal */
    tieBreak: "timestamp" | "random";
    /** Can multiple bidders win the same item? */
    multiUnit: boolean;
};
/**
 * Auction state and metadata
 */
export type Auction = {
    /** Unique auction identifier */
    id: string;
    /** Current auction status */
    status: "open" | "closed" | "resolved";
    /** Auction configuration */
    config: AuctionConfig;
    /** When the auction was created */
    createdAt: Date;
    /** When the auction was resolved (if resolved) */
    resolvedAt?: Date;
};
/**
 * Bidder participating in an auction
 */
export type Bidder = {
    /** Unique bidder identifier */
    id: string;
    /** Auction this bidder is participating in */
    auctionId: string;
    /** Bidder display name */
    name: string;
    /** When the bidder joined */
    createdAt?: Date;
};
/**
 * A bid placed by a bidder on an item
 */
export type Bid = {
    /** Unique bid identifier */
    id: string;
    /** Auction this bid belongs to */
    auctionId: string;
    /** Bidder who placed this bid */
    bidderId: string;
    /** Item being bid on */
    itemId: string;
    /** Bid amount (must be positive) */
    amount: number;
    /** When the bid was placed */
    placedAt: Date;
    /** Current bid status */
    status: "active" | "won" | "lost" | "cancelled";
};
/**
 * Settlement result for a winning bid
 */
export type Settlement = {
    /** Winning bidder */
    bidderId: string;
    /** Item won */
    itemId: string;
    /** Amount to pay (first-price: bid amount, second-price: second-highest bid) */
    wonAmount: number;
    /** Original bid amount (for reference) */
    bidAmount: number;
    /** When the settlement was created */
    settledAt?: Date;
};
/**
 * Result of auction resolution
 */
export type ResolutionResult = {
    /** Successful settlements */
    settlements: Settlement[];
    /** Any errors encountered during resolution */
    errors: string[];
    /** When the resolution occurred */
    resolvedAt: Date;
};
/**
 * Options for bid validation
 */
export type ValidationOptions = {
    /** Minimum allowed bid amount */
    minBidAmount?: number;
    /** Maximum allowed bid amount */
    maxBidAmount?: number;
    /** Whether to allow bids on closed auctions */
    allowClosedAuction?: boolean;
};
/**
 * Validation result
 */
export type ValidationResult = {
    /** Whether the validation passed */
    valid: boolean;
    /** Validation error messages (empty if valid) */
    errors: string[];
};
/**
 * Ranked bid with additional metadata for settlement
 */
export type RankedBid = Bid & {
    /** Rank position (0 = winner, 1 = second place, etc.) */
    rank: number;
};
/**
 * Options for ranking bids
 */
export type RankingOptions = {
    /** Tie-breaking strategy */
    tieBreak: "timestamp" | "random";
    /** Random seed for reproducible random tie-breaking */
    randomSeed?: number;
};
//# sourceMappingURL=types.d.ts.map
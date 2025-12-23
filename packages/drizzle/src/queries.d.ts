/**
 * Database query functions
 *
 * Provides high-level functions for auction operations:
 * - Creating auctions and bidders
 * - Placing bids
 * - Resolving auctions
 * - Querying auction state
 */
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { Auction, Bidder, Bid } from './schema';
import type { AuctionConfig, ResolutionResult } from '@auction-kit/core';
/**
 * Database type
 */
export type Database = PostgresJsDatabase<Record<string, never>>;
/**
 * Create a new auction
 */
export declare function createAuction(db: Database, config: AuctionConfig): Promise<Auction>;
/**
 * Get auction by ID
 */
export declare function getAuction(db: Database, auctionId: string): Promise<Auction | null>;
/**
 * Update auction status
 */
export declare function updateAuctionStatus(db: Database, auctionId: string, status: 'open' | 'closed' | 'resolved'): Promise<Auction>;
/**
 * Create a new bidder
 */
export declare function createBidder(db: Database, auctionId: string, name: string): Promise<Bidder>;
/**
 * Get bidder by ID
 */
export declare function getBidder(db: Database, bidderId: string): Promise<Bidder | null>;
/**
 * Get all bidders for an auction
 */
export declare function getBiddersByAuction(db: Database, auctionId: string): Promise<Bidder[]>;
/**
 * Place a new bid
 *
 * Validates the bid before inserting
 */
export declare function placeBid(db: Database, input: {
    auctionId: string;
    bidderId: string;
    itemId: string;
    amount: number;
}): Promise<Bid>;
/**
 * Get all bids for an auction
 */
export declare function getBidsByAuction(db: Database, auctionId: string): Promise<Bid[]>;
/**
 * Get all active bids for an auction
 */
export declare function getActiveBidsByAuction(db: Database, auctionId: string): Promise<Bid[]>;
/**
 * Resolve an auction
 *
 * Performs settlement in a transaction:
 * 1. Fetches all active bids
 * 2. Runs core settlement logic
 * 3. Updates bid statuses
 * 4. Creates settlement records
 * 5. Updates auction status to resolved
 */
export declare function resolveAuction(db: Database, auctionId: string, randomSeed?: number): Promise<ResolutionResult>;
/**
 * Get auction state
 *
 * Returns complete auction information including bids and settlements
 */
export declare function getAuctionState(db: Database, auctionId: string): Promise<{
    auction: {
        id: string;
        status: "open" | "closed" | "resolved";
        config: AuctionConfig;
        createdAt: Date;
        resolvedAt: Date | null;
    };
    bidders: {
        id: string;
        name: string;
        createdAt: Date;
        auctionId: string;
    }[];
    bids: {
        id: string;
        status: "active" | "won" | "lost" | "cancelled";
        itemId: string;
        bidderId: string;
        auctionId: string;
        amount: number;
        placedAt: Date;
    }[];
    settlements: {
        id: string;
        itemId: string;
        bidderId: string;
        wonAmount: number;
        bidAmount: number;
        auctionId: string;
        settledAt: Date;
    }[];
}>;
/**
 * Cancel a bid
 */
export declare function cancelBid(db: Database, bidId: string): Promise<Bid>;
//# sourceMappingURL=queries.d.ts.map
/**
 * Bid validation logic
 */
import type { Bid, Auction, ValidationResult, ValidationOptions } from './types';
/**
 * Validate a single bid
 *
 * @param bid - The bid to validate
 * @param auction - The auction context
 * @param options - Optional validation settings
 * @returns Validation result with any errors
 */
export declare function validateBid(bid: Bid, auction: Auction, options?: ValidationOptions): ValidationResult;
/**
 * Validate multiple bids at once
 *
 * @param bids - Bids to validate
 * @param auction - Auction context
 * @param options - Optional validation settings
 * @returns Map of bid ID to validation result
 */
export declare function validateBids(bids: Bid[], auction: Auction, options?: ValidationOptions): Map<string, ValidationResult>;
/**
 * Filter out invalid bids and return only valid ones
 *
 * @param bids - Bids to filter
 * @param auction - Auction context
 * @param options - Optional validation settings
 * @returns Array of valid bids
 */
export declare function filterValidBids(bids: Bid[], auction: Auction, options?: ValidationOptions): Bid[];
/**
 * Check if auction can be resolved
 *
 * @param auction - Auction to check
 * @param bids - Bids in the auction
 * @returns Validation result
 */
export declare function validateAuctionResolution(auction: Auction, bids: Bid[]): ValidationResult;
/**
 * Validate bid amount is not negative or zero
 * Simple utility for quick amount checks
 *
 * @param amount - Amount to validate
 * @returns True if valid
 */
export declare function isValidBidAmount(amount: number): boolean;
/**
 * Validate item ID format
 * Simple utility for quick item ID checks
 *
 * @param itemId - Item ID to validate
 * @returns True if valid
 */
export declare function isValidItemId(itemId: string): boolean;
/**
 * Validate bidder ID format
 * Simple utility for quick bidder ID checks
 *
 * @param bidderId - Bidder ID to validate
 * @returns True if valid
 */
export declare function isValidBidderId(bidderId: string): boolean;
//# sourceMappingURL=validator.d.ts.map
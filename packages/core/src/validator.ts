/**
 * Bid validation logic
 */

import type { Bid, Auction, ValidationResult, ValidationOptions } from './types'

/**
 * Default validation options
 */
const DEFAULT_OPTIONS: ValidationOptions = {
  minBidAmount: 1,
  allowClosedAuction: false,
}

/**
 * Validate a single bid
 * 
 * @param bid - The bid to validate
 * @param auction - The auction context
 * @param options - Optional validation settings
 * @returns Validation result with any errors
 */
export function validateBid(
  bid: Bid,
  auction: Auction,
  options: ValidationOptions = {}
): ValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const errors: string[] = []

  // Validate bid belongs to auction
  if (bid.auctionId !== auction.id) {
    errors.push('Bid does not belong to this auction')
  }

  // Validate bid amount is positive
  if (bid.amount <= 0) {
    errors.push('Bid amount must be positive')
  }

  // Validate against minimum bid amount
  if (opts.minBidAmount !== undefined && bid.amount < opts.minBidAmount) {
    errors.push(`Bid amount must be at least ${opts.minBidAmount}`)
  }

  // Validate against maximum bid amount
  if (opts.maxBidAmount !== undefined && bid.amount > opts.maxBidAmount) {
    errors.push(`Bid amount must not exceed ${opts.maxBidAmount}`)
  }

  // Validate auction status
  if (!opts.allowClosedAuction && auction.status !== 'open') {
    errors.push(`Cannot bid on ${auction.status} auction`)
  }

  // Validate item ID is not empty
  if (!bid.itemId || bid.itemId.trim() === '') {
    errors.push('Item ID cannot be empty')
  }

  // Validate bidder ID is not empty
  if (!bid.bidderId || bid.bidderId.trim() === '') {
    errors.push('Bidder ID cannot be empty')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate multiple bids at once
 * 
 * @param bids - Bids to validate
 * @param auction - Auction context
 * @param options - Optional validation settings
 * @returns Map of bid ID to validation result
 */
export function validateBids(
  bids: Bid[],
  auction: Auction,
  options: ValidationOptions = {}
): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>()

  for (const bid of bids) {
    results.set(bid.id, validateBid(bid, auction, options))
  }

  return results
}

/**
 * Filter out invalid bids and return only valid ones
 * 
 * @param bids - Bids to filter
 * @param auction - Auction context
 * @param options - Optional validation settings
 * @returns Array of valid bids
 */
export function filterValidBids(
  bids: Bid[],
  auction: Auction,
  options: ValidationOptions = {}
): Bid[] {
  return bids.filter(bid => {
    const result = validateBid(bid, auction, options)
    return result.valid
  })
}

/**
 * Check if auction can be resolved
 * 
 * @param auction - Auction to check
 * @param bids - Bids in the auction
 * @returns Validation result
 */
export function validateAuctionResolution(
  auction: Auction,
  bids: Bid[]
): ValidationResult {
  const errors: string[] = []

  // Check auction status
  if (auction.status === 'resolved') {
    errors.push('Auction is already resolved')
  }

  // Check for active bids
  const activeBids = bids.filter(bid => bid.status === 'active')
  if (activeBids.length === 0) {
    errors.push('No active bids to resolve')
  }

  // Validate all active bids
  for (const bid of activeBids) {
    const bidValidation = validateBid(bid, auction, { allowClosedAuction: true })
    if (!bidValidation.valid) {
      errors.push(`Invalid bid ${bid.id}: ${bidValidation.errors.join(', ')}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate bid amount is not negative or zero
 * Simple utility for quick amount checks
 * 
 * @param amount - Amount to validate
 * @returns True if valid
 */
export function isValidBidAmount(amount: number): boolean {
  return amount > 0 && Number.isFinite(amount)
}

/**
 * Validate item ID format
 * Simple utility for quick item ID checks
 * 
 * @param itemId - Item ID to validate
 * @returns True if valid
 */
export function isValidItemId(itemId: string): boolean {
  return itemId.trim().length > 0
}

/**
 * Validate bidder ID format
 * Simple utility for quick bidder ID checks
 * 
 * @param bidderId - Bidder ID to validate
 * @returns True if valid
 */
export function isValidBidderId(bidderId: string): boolean {
  return bidderId.trim().length > 0
}



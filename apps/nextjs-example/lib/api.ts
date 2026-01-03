/**
 * Typed API client for Hono backend
 * 
 * Provides type-safe functions to interact with the auction API
 */

import type { AuctionConfig, ResolutionResult } from '@auction-kit/core'
import type { Auction, Bid, Bidder, Item, Settlement } from '@auction-kit/drizzle'

// Re-export for convenience
export type { ResolutionResult } from '@auction-kit/core'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

/**
 * API response wrapper
 */
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown }

/**
 * Auction state returned by GET /auctions/:id
 */
export type AuctionState = {
  auction: Auction
  bidders: Bidder[]
  bids: Bid[]
  items: Item[]
  settlements: Settlement[]
}

/**
 * Input for placing a bid
 */
export type BidInput = {
  bidderId: string
  itemId: string
  amount: number
}

/**
 * Type guard for API error responses
 */
function isErrorResponse<T>(
  response: ApiResponse<T>
): response is { success: false; error: string; details?: unknown } {
  return !response.success
}

/**
 * Fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  const data: ApiResponse<T> = await response.json()

  if (isErrorResponse(data)) {
    throw new Error(data.error || 'API request failed')
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Request failed`)
  }

  return data.data
}

/**
 * Create a new auction
 */
export async function createAuction(config: AuctionConfig): Promise<Auction> {
  return fetchApi<Auction>('/auctions', {
    method: 'POST',
    body: JSON.stringify(config),
  })
}

/**
 * Get auction state (includes bids, bidders, settlements)
 */
export async function getAuctionState(auctionId: string): Promise<AuctionState> {
  return fetchApi<AuctionState>(`/auctions/${auctionId}`)
}

/**
 * Place a bid on an auction
 */
export async function placeBid(
  auctionId: string,
  bid: BidInput
): Promise<Bid> {
  return fetchApi<Bid>(`/auctions/${auctionId}/bids`, {
    method: 'POST',
    body: JSON.stringify(bid),
  })
}

/**
 * List all bids for an auction
 */
export async function getBids(auctionId: string): Promise<Bid[]> {
  return fetchApi<Bid[]>(`/auctions/${auctionId}/bids`)
}

/**
 * Resolve an auction (trigger settlement)
 */
export async function resolveAuction(
  auctionId: string,
  seed?: number
): Promise<ResolutionResult> {
  const query = seed ? `?seed=${seed}` : ''
  return fetchApi<ResolutionResult>(`/auctions/${auctionId}/resolve${query}`, {
    method: 'POST',
  })
}

/**
 * Create a new bidder for an auction
 */
export async function createBidder(
  auctionId: string,
  name: string
): Promise<Bidder> {
  return fetchApi<Bidder>(`/auctions/${auctionId}/bidders`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

/**
 * Create a new item for an auction
 */
export async function createItem(
  auctionId: string,
  item: {
    name: string
    description?: string
    quantity?: number
  }
): Promise<Item> {
  return fetchApi<Item>(`/auctions/${auctionId}/items`, {
    method: 'POST',
    body: JSON.stringify(item),
  })
}


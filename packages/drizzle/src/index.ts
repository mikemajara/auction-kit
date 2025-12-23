/**
 * @auction-kit/drizzle
 * 
 * Database layer with Drizzle ORM for Postgres
 * Connects core auction logic to persistent storage
 */

// Schema exports
export * from './schema'

// Query exports
export * from './queries'

// Re-export core types for convenience
export type {
  AuctionConfig,
  ResolutionResult,
  Settlement as CoreSettlement,
} from '@auction-kit/core'



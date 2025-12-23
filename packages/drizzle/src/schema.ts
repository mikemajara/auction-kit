/**
 * Drizzle ORM schema for Postgres
 * 
 * Database schema for auction system supporting:
 * - Multiple concurrent auctions
 * - Bidders with multiple bids
 * - Settlement tracking
 * - Audit trail with timestamps
 */

import { pgTable, uuid, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core'
import type { AuctionConfig } from '@auction-kit/core'

/**
 * Auctions table
 * Stores auction configuration and status
 */
export const auctions = pgTable('auctions', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  status: text('status', { 
    enum: ['open', 'closed', 'resolved'] 
  }).notNull().default('open'),
  
  config: jsonb('config').$type<AuctionConfig>().notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
})

/**
 * Bidders table
 * Stores participants in auctions
 */
export const bidders = pgTable('bidders', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  auctionId: uuid('auction_id')
    .notNull()
    .references(() => auctions.id, { onDelete: 'cascade' }),
  
  name: text('name').notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

/**
 * Bids table
 * Stores all bids placed in auctions
 */
export const bids = pgTable('bids', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  auctionId: uuid('auction_id')
    .notNull()
    .references(() => auctions.id, { onDelete: 'cascade' }),
  
  bidderId: uuid('bidder_id')
    .notNull()
    .references(() => bidders.id, { onDelete: 'cascade' }),
  
  itemId: text('item_id').notNull(),
  
  amount: integer('amount').notNull(),
  
  placedAt: timestamp('placed_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  
  status: text('status', {
    enum: ['active', 'won', 'lost', 'cancelled']
  }).notNull().default('active'),
})

/**
 * Settlements table
 * Stores final auction results and payments
 */
export const settlements = pgTable('settlements', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  auctionId: uuid('auction_id')
    .notNull()
    .references(() => auctions.id, { onDelete: 'cascade' }),
  
  bidderId: uuid('bidder_id')
    .notNull()
    .references(() => bidders.id, { onDelete: 'cascade' }),
  
  itemId: text('item_id').notNull(),
  
  wonAmount: integer('won_amount').notNull(),
  
  bidAmount: integer('bid_amount').notNull(),
  
  settledAt: timestamp('settled_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

/**
 * Type exports for use in queries
 */
export type Auction = typeof auctions.$inferSelect
export type NewAuction = typeof auctions.$inferInsert

export type Bidder = typeof bidders.$inferSelect
export type NewBidder = typeof bidders.$inferInsert

export type Bid = typeof bids.$inferSelect
export type NewBid = typeof bids.$inferInsert

export type Settlement = typeof settlements.$inferSelect
export type NewSettlement = typeof settlements.$inferInsert


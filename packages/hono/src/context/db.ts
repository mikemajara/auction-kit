/**
 * Database context for Hono handlers
 * 
 * Creates a database connection from environment variables
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import type { Database } from '@auction-kit/drizzle'

/**
 * Create database connection from DATABASE_URL
 */
export function createDatabase(databaseUrl: string): Database {
  const client = postgres(databaseUrl)
  
  return drizzle(client) as unknown as Database
}

/**
 * Get database from process.env
 */
export function getDatabaseFromEnv(): Database {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  
  return createDatabase(databaseUrl)
}


/**
 * Database middleware for Hono
 *
 * Injects database connection into context
 */

import type { Context, Next } from "hono"
import { getDatabaseFromEnv } from "../context/db"
import type { Database } from "@auction-kit/drizzle"

/**
 * Hono context with database
 */
export type HonoContext = {
  Variables: {
    db: Database
  }
}

/**
 * Database middleware
 *
 * Creates database connection from process.env and attaches to context
 */
export async function dbMiddleware(c: Context<HonoContext>, next: Next) {
  const db = getDatabaseFromEnv()
  c.set("db", db)

  await next()
}

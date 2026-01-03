/**
 * @auction-kit/hono
 * 
 * Reference API implementation with Hono framework for Node.js
 */

export { default } from './app'
export { default as app } from './app'

// Re-export types for convenience
export type { ApiResponse } from './middleware/error-handler'
export type { HonoContext } from './middleware/db'


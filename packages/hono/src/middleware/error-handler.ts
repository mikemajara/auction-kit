/**
 * Error handling middleware for Hono
 * 
 * Provides consistent error response format
 */

import type { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'

/**
 * Standard API response format
 */
export type ApiResponse<T = unknown> = 
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown }

/**
 * Error handler middleware
 * 
 * Catches errors and formats them consistently
 */
export async function errorHandler(c: Context, next: Next): Promise<Response | void> {
  try {
    await next()
    return
  } catch (error) {
    if (error instanceof HTTPException) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: error.message,
          details: error.cause,
        },
        error.status
      )
    }

    // Handle known error types
    if (error instanceof Error) {
      const message = error.message
      
      // Validation errors (4xx)
      if (message.includes('not found') || message.includes('Invalid')) {
        return c.json<ApiResponse>(
          {
            success: false,
            error: message,
          },
          400
        )
      }

      // Database/transaction errors (5xx)
      return c.json<ApiResponse>(
        {
          success: false,
          error: 'Internal server error',
          details: process.env.NODE_ENV === 'development' ? message : undefined,
        },
        500
      )
    }

    // Unknown error
    return c.json<ApiResponse>(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      500
    )
  }
}


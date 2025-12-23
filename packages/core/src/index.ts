/**
 * @auction-kit/core
 * 
 * Core auction logic - pure TypeScript functions
 * Framework-agnostic, zero dependencies
 */

// Week 1: Full implementation (primary exports)
export * from './types'
export * from './validator'
export * from './ranker'
export * from './settler'

// Week 0.5: POC exports (namespaced to avoid conflicts)
export {
  settleBidsSimple,
  rankBids as rankBidsSimple,
  getWinner as getWinnerSimple,
} from './poc'
export type { SimpleBid, SimpleSettlement } from './poc'


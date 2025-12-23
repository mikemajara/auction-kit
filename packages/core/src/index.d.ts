/**
 * @auction-kit/core
 *
 * Core auction logic - pure TypeScript functions
 * Framework-agnostic, zero dependencies
 */
export * from './types';
export * from './validator';
export * from './ranker';
export * from './settler';
export { settleBidsSimple, rankBids as rankBidsSimple, getWinner as getWinnerSimple, } from './poc';
export type { SimpleBid, SimpleSettlement } from './poc';
//# sourceMappingURL=index.d.ts.map
/**
 * Auction settlement logic for first-price and second-price sealed-bid auctions
 */
import { rankBids, getSecondPrice } from './ranker';
/**
 * Group bids by item ID
 */
function groupBidsByItem(bids) {
    const grouped = new Map();
    for (const bid of bids) {
        const itemBids = grouped.get(bid.itemId) ?? [];
        itemBids.push(bid);
        grouped.set(bid.itemId, itemBids);
    }
    return grouped;
}
/**
 * Settle bids according to auction configuration
 *
 * This is the core auction settlement algorithm that:
 * 1. Groups bids by item
 * 2. Ranks bids using configured tie-breaking
 * 3. Determines winner(s) based on multiUnit setting
 * 4. Calculates payment based on pricing rule (first-price or second-price)
 *
 * @param bids - All active bids to settle
 * @param config - Auction configuration
 * @param randomSeed - Optional seed for reproducible random tie-breaking
 * @returns Resolution result with settlements and any errors
 */
export function settleBids(bids, config, randomSeed) {
    const settlements = [];
    const errors = [];
    const resolvedAt = new Date();
    // Handle empty bids
    if (bids.length === 0) {
        return {
            settlements: [],
            errors: ['No bids to settle'],
            resolvedAt,
        };
    }
    // Group bids by item
    const bidsByItem = groupBidsByItem(bids);
    // Process each item independently
    for (const [itemId, itemBids] of bidsByItem.entries()) {
        try {
            // Rank bids for this item
            const ranked = rankBids(itemBids, {
                tieBreak: config.tieBreak,
                randomSeed,
            });
            if (ranked.length === 0) {
                errors.push(`No valid bids for item ${itemId}`);
                continue;
            }
            // Determine winners based on multiUnit setting
            let winners = ranked.slice(0, 1); // Default: single winner
            if (config.multiUnit) {
                // Multi-unit: all bids with the highest amount win
                const topAmount = ranked[0].amount;
                winners = ranked.filter(bid => bid.amount === topAmount);
            }
            // Calculate payment based on pricing rule
            for (const winner of winners) {
                let wonAmount;
                if (config.type === 'first-price') {
                    // First-price: winner pays their bid
                    wonAmount = winner.amount;
                }
                else {
                    // Second-price: winner pays second-highest bid
                    const secondPrice = getSecondPrice(ranked);
                    if (secondPrice === undefined) {
                        // Only one bid: winner pays their own bid
                        wonAmount = winner.amount;
                    }
                    else {
                        // Winner pays second-highest bid
                        wonAmount = secondPrice;
                    }
                }
                settlements.push({
                    bidderId: winner.bidderId,
                    itemId,
                    wonAmount,
                    bidAmount: winner.amount,
                    settledAt: resolvedAt,
                });
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Error settling item ${itemId}: ${errorMessage}`);
        }
    }
    return {
        settlements,
        errors,
        resolvedAt,
    };
}
/**
 * Determine winners without calculating payments
 * Useful for previewing auction results before final settlement
 *
 * @param bids - All active bids
 * @param config - Auction configuration
 * @param randomSeed - Optional seed for reproducible random tie-breaking
 * @returns Map of itemId to winning bid IDs
 */
export function determineWinners(bids, config, randomSeed) {
    const winners = new Map();
    const bidsByItem = groupBidsByItem(bids);
    for (const [itemId, itemBids] of bidsByItem.entries()) {
        const ranked = rankBids(itemBids, {
            tieBreak: config.tieBreak,
            randomSeed,
        });
        if (ranked.length === 0) {
            continue;
        }
        let winningBids = ranked.slice(0, 1);
        if (config.multiUnit) {
            const topAmount = ranked[0].amount;
            winningBids = ranked.filter(bid => bid.amount === topAmount);
        }
        winners.set(itemId, winningBids.map(bid => bid.id));
    }
    return winners;
}
/**
 * Calculate total payments for all settlements
 *
 * @param settlements - Settlement results
 * @returns Map of bidderId to total amount owed
 */
export function calculatePayments(settlements) {
    const payments = new Map();
    for (const settlement of settlements) {
        const current = payments.get(settlement.bidderId) ?? 0;
        payments.set(settlement.bidderId, current + settlement.wonAmount);
    }
    return payments;
}
/**
 * Group settlements by bidder
 *
 * @param settlements - Settlement results
 * @returns Map of bidderId to their settlements
 */
export function groupSettlementsByBidder(settlements) {
    const grouped = new Map();
    for (const settlement of settlements) {
        const bidderSettlements = grouped.get(settlement.bidderId) ?? [];
        bidderSettlements.push(settlement);
        grouped.set(settlement.bidderId, bidderSettlements);
    }
    return grouped;
}
//# sourceMappingURL=settler.js.map
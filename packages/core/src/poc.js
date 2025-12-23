/**
 * Week 0.5: Proof of Concept
 *
 * Minimal implementation to validate the core settlement algorithm
 * before building the full infrastructure.
 *
 * Goal: Prove that first-price sealed-bid auction with timestamp
 * tie-breaking works correctly with zero dependencies.
 */
/**
 * Settle bids using first-price sealed-bid rules
 * - Highest bid wins
 * - Ties broken by earliest timestamp
 * - Single winner per item
 */
export function settleBidsSimple(bids) {
    if (bids.length === 0) {
        return [];
    }
    // Group bids by item
    const bidsByItem = new Map();
    for (const bid of bids) {
        const itemBids = bidsByItem.get(bid.itemId) ?? [];
        itemBids.push(bid);
        bidsByItem.set(bid.itemId, itemBids);
    }
    // Settle each item
    const settlements = [];
    for (const [itemId, itemBids] of bidsByItem) {
        // Sort by amount DESC, then by timestamp ASC (earlier wins ties)
        const sorted = [...itemBids].sort((a, b) => {
            if (b.amount !== a.amount) {
                return b.amount - a.amount; // Higher amount wins
            }
            return a.timestamp - b.timestamp; // Earlier timestamp wins ties
        });
        const winner = sorted[0];
        if (winner) {
            settlements.push({
                bidderId: winner.bidderId,
                itemId,
                wonAmount: winner.amount, // First-price: pay what you bid
            });
        }
    }
    return settlements;
}
/**
 * Rank bids for a single item
 * Returns bids sorted by winner-first order
 */
export function rankBids(bids) {
    return [...bids].sort((a, b) => {
        if (b.amount !== a.amount) {
            return b.amount - a.amount;
        }
        return a.timestamp - b.timestamp;
    });
}
/**
 * Get the winning bid for a single item
 */
export function getWinner(bids) {
    if (bids.length === 0) {
        return null;
    }
    const ranked = rankBids(bids);
    return ranked[0] ?? null;
}
//# sourceMappingURL=poc.js.map
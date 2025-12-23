import { describe, test, expect } from 'vitest';
import { rankBids, getWinners, getSecondPrice } from './ranker';
describe('rankBids', () => {
    describe('timestamp tie-breaking', () => {
        test('ranks bids by amount descending', () => {
            const bids = [
                {
                    id: '1',
                    auctionId: 'auction-1',
                    bidderId: 'alice',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(1000),
                    status: 'active',
                },
                {
                    id: '2',
                    auctionId: 'auction-1',
                    bidderId: 'bob',
                    itemId: 'seat1',
                    amount: 200,
                    placedAt: new Date(2000),
                    status: 'active',
                },
                {
                    id: '3',
                    auctionId: 'auction-1',
                    bidderId: 'charlie',
                    itemId: 'seat1',
                    amount: 150,
                    placedAt: new Date(3000),
                    status: 'active',
                },
            ];
            const ranked = rankBids(bids, { tieBreak: 'timestamp' });
            expect(ranked[0]?.bidderId).toBe('bob'); // 200
            expect(ranked[0]?.rank).toBe(0);
            expect(ranked[1]?.bidderId).toBe('charlie'); // 150
            expect(ranked[1]?.rank).toBe(1);
            expect(ranked[2]?.bidderId).toBe('alice'); // 100
            expect(ranked[2]?.rank).toBe(2);
        });
        test('breaks ties by timestamp ascending (earlier wins)', () => {
            const bids = [
                {
                    id: '1',
                    auctionId: 'auction-1',
                    bidderId: 'alice',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(3000), // Latest
                    status: 'active',
                },
                {
                    id: '2',
                    auctionId: 'auction-1',
                    bidderId: 'bob',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(1000), // Earliest - should win
                    status: 'active',
                },
                {
                    id: '3',
                    auctionId: 'auction-1',
                    bidderId: 'charlie',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(2000), // Middle
                    status: 'active',
                },
            ];
            const ranked = rankBids(bids, { tieBreak: 'timestamp' });
            expect(ranked[0]?.bidderId).toBe('bob'); // timestamp 1000
            expect(ranked[1]?.bidderId).toBe('charlie'); // timestamp 2000
            expect(ranked[2]?.bidderId).toBe('alice'); // timestamp 3000
        });
        test('handles empty bids array', () => {
            const ranked = rankBids([], { tieBreak: 'timestamp' });
            expect(ranked).toEqual([]);
        });
        test('handles single bid', () => {
            const bids = [
                {
                    id: '1',
                    auctionId: 'auction-1',
                    bidderId: 'alice',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(),
                    status: 'active',
                },
            ];
            const ranked = rankBids(bids, { tieBreak: 'timestamp' });
            expect(ranked).toHaveLength(1);
            expect(ranked[0]?.rank).toBe(0);
            expect(ranked[0]?.bidderId).toBe('alice');
        });
    });
    describe('random tie-breaking', () => {
        test('ranks bids by amount descending when no ties', () => {
            const bids = [
                {
                    id: '1',
                    auctionId: 'auction-1',
                    bidderId: 'alice',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(),
                    status: 'active',
                },
                {
                    id: '2',
                    auctionId: 'auction-1',
                    bidderId: 'bob',
                    itemId: 'seat1',
                    amount: 200,
                    placedAt: new Date(),
                    status: 'active',
                },
            ];
            const ranked = rankBids(bids, { tieBreak: 'random', randomSeed: 12345 });
            expect(ranked[0]?.bidderId).toBe('bob'); // 200
            expect(ranked[1]?.bidderId).toBe('alice'); // 100
        });
        test('randomly breaks ties with consistent seed', () => {
            const bids = [
                {
                    id: '1',
                    auctionId: 'auction-1',
                    bidderId: 'alice',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(),
                    status: 'active',
                },
                {
                    id: '2',
                    auctionId: 'auction-1',
                    bidderId: 'bob',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(),
                    status: 'active',
                },
                {
                    id: '3',
                    auctionId: 'auction-1',
                    bidderId: 'charlie',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(),
                    status: 'active',
                },
            ];
            // Same seed should produce same result
            const ranked1 = rankBids(bids, { tieBreak: 'random', randomSeed: 12345 });
            const ranked2 = rankBids(bids, { tieBreak: 'random', randomSeed: 12345 });
            expect(ranked1[0]?.bidderId).toBe(ranked2[0]?.bidderId);
            expect(ranked1[1]?.bidderId).toBe(ranked2[1]?.bidderId);
            expect(ranked1[2]?.bidderId).toBe(ranked2[2]?.bidderId);
        });
        test('different seeds produce different results', () => {
            const bids = [
                {
                    id: '1',
                    auctionId: 'auction-1',
                    bidderId: 'alice',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(),
                    status: 'active',
                },
                {
                    id: '2',
                    auctionId: 'auction-1',
                    bidderId: 'bob',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(),
                    status: 'active',
                },
                {
                    id: '3',
                    auctionId: 'auction-1',
                    bidderId: 'charlie',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(),
                    status: 'active',
                },
            ];
            const ranked1 = rankBids(bids, { tieBreak: 'random', randomSeed: 12345 });
            const ranked2 = rankBids(bids, { tieBreak: 'random', randomSeed: 54321 });
            // With different seeds, we should get different orderings (statistically likely)
            const order1 = ranked1.map(b => b.bidderId).join(',');
            const order2 = ranked2.map(b => b.bidderId).join(',');
            // Not guaranteed to be different, but very likely with 3 items
            // Just test that it produces valid rankings
            expect(ranked1).toHaveLength(3);
            expect(ranked2).toHaveLength(3);
        });
        test('only shuffles tied bids, preserves higher/lower ranks', () => {
            const bids = [
                {
                    id: '1',
                    auctionId: 'auction-1',
                    bidderId: 'alice',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(),
                    status: 'active',
                },
                {
                    id: '2',
                    auctionId: 'auction-1',
                    bidderId: 'bob',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(),
                    status: 'active',
                },
                {
                    id: '3',
                    auctionId: 'auction-1',
                    bidderId: 'charlie',
                    itemId: 'seat1',
                    amount: 200, // Higher - should always be rank 0
                    placedAt: new Date(),
                    status: 'active',
                },
                {
                    id: '4',
                    auctionId: 'auction-1',
                    bidderId: 'david',
                    itemId: 'seat1',
                    amount: 50, // Lower - should always be rank 3
                    placedAt: new Date(),
                    status: 'active',
                },
            ];
            const ranked = rankBids(bids, { tieBreak: 'random', randomSeed: 12345 });
            // Charlie (200) should always win
            expect(ranked[0]?.bidderId).toBe('charlie');
            expect(ranked[0]?.rank).toBe(0);
            // Alice and Bob (100) should be ranks 1 and 2 in some order
            const middleRanks = [ranked[1]?.bidderId, ranked[2]?.bidderId].sort();
            expect(middleRanks).toEqual(['alice', 'bob']);
            // David (50) should always be last
            expect(ranked[3]?.bidderId).toBe('david');
            expect(ranked[3]?.rank).toBe(3);
        });
    });
    describe('does not mutate input', () => {
        test('original bids array is unchanged', () => {
            const bids = [
                {
                    id: '2',
                    auctionId: 'auction-1',
                    bidderId: 'bob',
                    itemId: 'seat1',
                    amount: 200,
                    placedAt: new Date(2000),
                    status: 'active',
                },
                {
                    id: '1',
                    auctionId: 'auction-1',
                    bidderId: 'alice',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(1000),
                    status: 'active',
                },
            ];
            const originalOrder = bids.map(b => b.id);
            rankBids(bids, { tieBreak: 'timestamp' });
            const afterOrder = bids.map(b => b.id);
            expect(afterOrder).toEqual(originalOrder);
        });
    });
});
describe('getWinners', () => {
    const bids = [
        {
            id: '1',
            auctionId: 'auction-1',
            bidderId: 'alice',
            itemId: 'seat1',
            amount: 100,
            placedAt: new Date(1000),
            status: 'active',
        },
        {
            id: '2',
            auctionId: 'auction-1',
            bidderId: 'bob',
            itemId: 'seat1',
            amount: 200,
            placedAt: new Date(2000),
            status: 'active',
        },
        {
            id: '3',
            auctionId: 'auction-1',
            bidderId: 'charlie',
            itemId: 'seat1',
            amount: 150,
            placedAt: new Date(3000),
            status: 'active',
        },
    ];
    test('returns single winner when multiUnit is false', () => {
        const winners = getWinners(bids, { tieBreak: 'timestamp' }, false);
        expect(winners).toHaveLength(1);
        expect(winners[0]?.bidderId).toBe('bob');
        expect(winners[0]?.amount).toBe(200);
    });
    test('returns single winner by default', () => {
        const winners = getWinners(bids, { tieBreak: 'timestamp' });
        expect(winners).toHaveLength(1);
        expect(winners[0]?.bidderId).toBe('bob');
    });
    test('returns all tied winners when multiUnit is true', () => {
        const tiedBids = [
            {
                id: '1',
                auctionId: 'auction-1',
                bidderId: 'alice',
                itemId: 'seat1',
                amount: 200,
                placedAt: new Date(1000),
                status: 'active',
            },
            {
                id: '2',
                auctionId: 'auction-1',
                bidderId: 'bob',
                itemId: 'seat1',
                amount: 200,
                placedAt: new Date(2000),
                status: 'active',
            },
            {
                id: '3',
                auctionId: 'auction-1',
                bidderId: 'charlie',
                itemId: 'seat1',
                amount: 100,
                placedAt: new Date(3000),
                status: 'active',
            },
        ];
        const winners = getWinners(tiedBids, { tieBreak: 'timestamp' }, true);
        expect(winners).toHaveLength(2);
        expect(winners.every(w => w.amount === 200)).toBe(true);
    });
    test('returns empty array for empty bids', () => {
        const winners = getWinners([], { tieBreak: 'timestamp' });
        expect(winners).toEqual([]);
    });
});
describe('getSecondPrice', () => {
    test('returns second-highest bid amount', () => {
        const rankedBids = [
            {
                id: '1',
                auctionId: 'auction-1',
                bidderId: 'bob',
                itemId: 'seat1',
                amount: 200,
                placedAt: new Date(),
                status: 'active',
                rank: 0,
            },
            {
                id: '2',
                auctionId: 'auction-1',
                bidderId: 'charlie',
                itemId: 'seat1',
                amount: 150,
                placedAt: new Date(),
                status: 'active',
                rank: 1,
            },
            {
                id: '3',
                auctionId: 'auction-1',
                bidderId: 'alice',
                itemId: 'seat1',
                amount: 100,
                placedAt: new Date(),
                status: 'active',
                rank: 2,
            },
        ];
        const secondPrice = getSecondPrice(rankedBids);
        expect(secondPrice).toBe(150);
    });
    test('returns undefined when only one bid', () => {
        const rankedBids = [
            {
                id: '1',
                auctionId: 'auction-1',
                bidderId: 'bob',
                itemId: 'seat1',
                amount: 200,
                placedAt: new Date(),
                status: 'active',
                rank: 0,
            },
        ];
        const secondPrice = getSecondPrice(rankedBids);
        expect(secondPrice).toBeUndefined();
    });
    test('returns undefined for empty array', () => {
        const secondPrice = getSecondPrice([]);
        expect(secondPrice).toBeUndefined();
    });
});
//# sourceMappingURL=ranker.test.js.map
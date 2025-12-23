import { describe, test, expect } from 'vitest';
import { settleBidsSimple, rankBids, getWinner } from './poc';
describe('POC: Simple Bid Settlement', () => {
    test('empty bids array returns empty settlements', () => {
        const result = settleBidsSimple([]);
        expect(result).toEqual([]);
    });
    test('single bid wins automatically', () => {
        const bids = [
            {
                id: '1',
                bidderId: 'alice',
                itemId: 'seat1',
                amount: 100,
                timestamp: 1000,
            },
        ];
        const result = settleBidsSimple(bids);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            bidderId: 'alice',
            itemId: 'seat1',
            wonAmount: 100,
        });
    });
    test('highest bid wins', () => {
        const bids = [
            {
                id: '1',
                bidderId: 'alice',
                itemId: 'seat1',
                amount: 100,
                timestamp: 1000,
            },
            {
                id: '2',
                bidderId: 'bob',
                itemId: 'seat1',
                amount: 150,
                timestamp: 2000,
            },
            {
                id: '3',
                bidderId: 'charlie',
                itemId: 'seat1',
                amount: 75,
                timestamp: 3000,
            },
        ];
        const result = settleBidsSimple(bids);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            bidderId: 'bob',
            itemId: 'seat1',
            wonAmount: 150,
        });
    });
    test('tie-breaking: earlier timestamp wins', () => {
        const bids = [
            {
                id: '1',
                bidderId: 'alice',
                itemId: 'seat1',
                amount: 100,
                timestamp: 2000, // Later
            },
            {
                id: '2',
                bidderId: 'bob',
                itemId: 'seat1',
                amount: 100,
                timestamp: 1000, // Earlier - should win
            },
        ];
        const result = settleBidsSimple(bids);
        expect(result).toHaveLength(1);
        expect(result[0]?.bidderId).toBe('bob');
    });
    test('multiple items settle independently', () => {
        const bids = [
            {
                id: '1',
                bidderId: 'alice',
                itemId: 'seat1',
                amount: 100,
                timestamp: 1000,
            },
            {
                id: '2',
                bidderId: 'bob',
                itemId: 'seat1',
                amount: 150,
                timestamp: 2000,
            },
            {
                id: '3',
                bidderId: 'charlie',
                itemId: 'seat2',
                amount: 200,
                timestamp: 3000,
            },
            {
                id: '4',
                bidderId: 'david',
                itemId: 'seat2',
                amount: 175,
                timestamp: 4000,
            },
        ];
        const result = settleBidsSimple(bids);
        expect(result).toHaveLength(2);
        const seat1Winner = result.find(s => s.itemId === 'seat1');
        expect(seat1Winner?.bidderId).toBe('bob');
        expect(seat1Winner?.wonAmount).toBe(150);
        const seat2Winner = result.find(s => s.itemId === 'seat2');
        expect(seat2Winner?.bidderId).toBe('charlie');
        expect(seat2Winner?.wonAmount).toBe(200);
    });
    test('first-price: winner pays their bid amount', () => {
        const bids = [
            {
                id: '1',
                bidderId: 'alice',
                itemId: 'seat1',
                amount: 100,
                timestamp: 1000,
            },
            {
                id: '2',
                bidderId: 'bob',
                itemId: 'seat1',
                amount: 200,
                timestamp: 2000,
            },
        ];
        const result = settleBidsSimple(bids);
        // In first-price auction, winner pays exactly what they bid
        expect(result[0]?.wonAmount).toBe(200); // Not 100 (second price)
    });
});
describe('POC: Bid Ranking', () => {
    test('ranks bids by amount descending', () => {
        const bids = [
            { id: '1', bidderId: 'alice', itemId: 'seat1', amount: 100, timestamp: 1000 },
            { id: '2', bidderId: 'bob', itemId: 'seat1', amount: 200, timestamp: 2000 },
            { id: '3', bidderId: 'charlie', itemId: 'seat1', amount: 150, timestamp: 3000 },
        ];
        const ranked = rankBids(bids);
        expect(ranked[0]?.bidderId).toBe('bob'); // 200
        expect(ranked[1]?.bidderId).toBe('charlie'); // 150
        expect(ranked[2]?.bidderId).toBe('alice'); // 100
    });
    test('ranks equal bids by timestamp ascending', () => {
        const bids = [
            { id: '1', bidderId: 'alice', itemId: 'seat1', amount: 100, timestamp: 3000 },
            { id: '2', bidderId: 'bob', itemId: 'seat1', amount: 100, timestamp: 1000 },
            { id: '3', bidderId: 'charlie', itemId: 'seat1', amount: 100, timestamp: 2000 },
        ];
        const ranked = rankBids(bids);
        expect(ranked[0]?.bidderId).toBe('bob'); // timestamp 1000
        expect(ranked[1]?.bidderId).toBe('charlie'); // timestamp 2000
        expect(ranked[2]?.bidderId).toBe('alice'); // timestamp 3000
    });
});
describe('POC: Get Winner', () => {
    test('returns null for empty bids', () => {
        const winner = getWinner([]);
        expect(winner).toBeNull();
    });
    test('returns the highest bidder', () => {
        const bids = [
            { id: '1', bidderId: 'alice', itemId: 'seat1', amount: 100, timestamp: 1000 },
            { id: '2', bidderId: 'bob', itemId: 'seat1', amount: 200, timestamp: 2000 },
        ];
        const winner = getWinner(bids);
        expect(winner?.bidderId).toBe('bob');
        expect(winner?.amount).toBe(200);
    });
});
//# sourceMappingURL=poc.test.js.map
/**
 * Integration tests - End-to-end scenarios combining all modules
 */
import { describe, test, expect } from 'vitest';
import { settleBids, calculatePayments } from './settler';
import { validateBid, filterValidBids } from './validator';
describe('Integration: Complete Auction Flow', () => {
    describe('Single-item first-price auction', () => {
        const auction = {
            id: 'auction-1',
            status: 'open',
            config: {
                type: 'first-price',
                tieBreak: 'timestamp',
                multiUnit: false,
            },
            createdAt: new Date(),
        };
        test('complete flow: place bids, validate, and settle', () => {
            const bids = [
                {
                    id: 'bid-1',
                    auctionId: 'auction-1',
                    bidderId: 'alice',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(1000),
                    status: 'active',
                },
                {
                    id: 'bid-2',
                    auctionId: 'auction-1',
                    bidderId: 'bob',
                    itemId: 'seat1',
                    amount: 150,
                    placedAt: new Date(2000),
                    status: 'active',
                },
                {
                    id: 'bid-3',
                    auctionId: 'auction-1',
                    bidderId: 'charlie',
                    itemId: 'seat1',
                    amount: -50, // Invalid
                    placedAt: new Date(3000),
                    status: 'active',
                },
            ];
            // Validate and filter bids
            const validBids = filterValidBids(bids, auction);
            expect(validBids).toHaveLength(2);
            // Settle auction
            const result = settleBids(validBids, auction.config);
            expect(result.settlements).toHaveLength(1);
            expect(result.settlements[0]?.bidderId).toBe('bob');
            expect(result.settlements[0]?.wonAmount).toBe(150);
            // Calculate payments
            const payments = calculatePayments(result.settlements);
            expect(payments.get('bob')).toBe(150);
        });
    });
    describe('Multi-item second-price auction', () => {
        const config = {
            type: 'second-price',
            tieBreak: 'timestamp',
            multiUnit: false,
        };
        const auction = {
            id: 'auction-2',
            status: 'closed',
            config,
            createdAt: new Date(),
        };
        test('multiple items with second-price settlement', () => {
            const bids = [
                // Seat 1 bids
                {
                    id: 'bid-1',
                    auctionId: 'auction-2',
                    bidderId: 'alice',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(1000),
                    status: 'active',
                },
                {
                    id: 'bid-2',
                    auctionId: 'auction-2',
                    bidderId: 'bob',
                    itemId: 'seat1',
                    amount: 200,
                    placedAt: new Date(2000),
                    status: 'active',
                },
                // Seat 2 bids
                {
                    id: 'bid-3',
                    auctionId: 'auction-2',
                    bidderId: 'charlie',
                    itemId: 'seat2',
                    amount: 150,
                    placedAt: new Date(3000),
                    status: 'active',
                },
                {
                    id: 'bid-4',
                    auctionId: 'auction-2',
                    bidderId: 'david',
                    itemId: 'seat2',
                    amount: 175,
                    placedAt: new Date(4000),
                    status: 'active',
                },
            ];
            const result = settleBids(bids, config);
            expect(result.settlements).toHaveLength(2);
            // Bob wins seat1, pays Alice's bid (100)
            const seat1Settlement = result.settlements.find(s => s.itemId === 'seat1');
            expect(seat1Settlement?.bidderId).toBe('bob');
            expect(seat1Settlement?.wonAmount).toBe(100);
            expect(seat1Settlement?.bidAmount).toBe(200);
            // David wins seat2, pays Charlie's bid (150)
            const seat2Settlement = result.settlements.find(s => s.itemId === 'seat2');
            expect(seat2Settlement?.bidderId).toBe('david');
            expect(seat2Settlement?.wonAmount).toBe(150);
            expect(seat2Settlement?.bidAmount).toBe(175);
            // Calculate total payments
            const payments = calculatePayments(result.settlements);
            expect(payments.get('bob')).toBe(100);
            expect(payments.get('david')).toBe(150);
        });
    });
    describe('Multi-unit auction with ties', () => {
        const config = {
            type: 'first-price',
            tieBreak: 'timestamp',
            multiUnit: true,
        };
        test('multiple winners with same high bid', () => {
            const bids = [
                {
                    id: 'bid-1',
                    auctionId: 'auction-3',
                    bidderId: 'alice',
                    itemId: 'seat1',
                    amount: 200,
                    placedAt: new Date(1000),
                    status: 'active',
                },
                {
                    id: 'bid-2',
                    auctionId: 'auction-3',
                    bidderId: 'bob',
                    itemId: 'seat1',
                    amount: 200,
                    placedAt: new Date(2000),
                    status: 'active',
                },
                {
                    id: 'bid-3',
                    auctionId: 'auction-3',
                    bidderId: 'charlie',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(3000),
                    status: 'active',
                },
            ];
            const result = settleBids(bids, config);
            // Both Alice and Bob should win (tied at 200)
            expect(result.settlements).toHaveLength(2);
            expect(result.settlements.map(s => s.bidderId).sort()).toEqual(['alice', 'bob']);
            expect(result.settlements.every(s => s.wonAmount === 200)).toBe(true);
        });
    });
    describe('Real-world scenario: Concert ticket auction', () => {
        const config = {
            type: 'second-price',
            tieBreak: 'random',
            multiUnit: false,
        };
        const auction = {
            id: 'concert-tickets',
            status: 'closed',
            config,
            createdAt: new Date('2025-01-01'),
        };
        test('10 bidders competing for 3 different seats', () => {
            const bids = [
                // VIP seat (most competitive)
                { id: 'bid-1', auctionId: 'concert-tickets', bidderId: 'user1', itemId: 'vip', amount: 500, placedAt: new Date(1000), status: 'active' },
                { id: 'bid-2', auctionId: 'concert-tickets', bidderId: 'user2', itemId: 'vip', amount: 600, placedAt: new Date(2000), status: 'active' },
                { id: 'bid-3', auctionId: 'concert-tickets', bidderId: 'user3', itemId: 'vip', amount: 550, placedAt: new Date(3000), status: 'active' },
                // Front row
                { id: 'bid-4', auctionId: 'concert-tickets', bidderId: 'user4', itemId: 'front', amount: 300, placedAt: new Date(4000), status: 'active' },
                { id: 'bid-5', auctionId: 'concert-tickets', bidderId: 'user5', itemId: 'front', amount: 350, placedAt: new Date(5000), status: 'active' },
                { id: 'bid-6', auctionId: 'concert-tickets', bidderId: 'user6', itemId: 'front', amount: 320, placedAt: new Date(6000), status: 'active' },
                // General admission
                { id: 'bid-7', auctionId: 'concert-tickets', bidderId: 'user7', itemId: 'general', amount: 100, placedAt: new Date(7000), status: 'active' },
                { id: 'bid-8', auctionId: 'concert-tickets', bidderId: 'user8', itemId: 'general', amount: 150, placedAt: new Date(8000), status: 'active' },
                { id: 'bid-9', auctionId: 'concert-tickets', bidderId: 'user9', itemId: 'general', amount: 120, placedAt: new Date(9000), status: 'active' },
                { id: 'bid-10', auctionId: 'concert-tickets', bidderId: 'user10', itemId: 'general', amount: 130, placedAt: new Date(10000), status: 'active' },
            ];
            // Validate all bids first
            const validBids = filterValidBids(bids, auction, { allowClosedAuction: true });
            expect(validBids).toHaveLength(10);
            // Settle with consistent random seed
            const result = settleBids(validBids, config, 42);
            // Should have 3 winners (one per seat type)
            expect(result.settlements).toHaveLength(3);
            expect(result.errors).toHaveLength(0);
            // VIP: user2 wins (600), pays second-price (550)
            const vipWinner = result.settlements.find(s => s.itemId === 'vip');
            expect(vipWinner?.bidderId).toBe('user2');
            expect(vipWinner?.wonAmount).toBe(550);
            expect(vipWinner?.bidAmount).toBe(600);
            // Front: user5 wins (350), pays second-price (320)
            const frontWinner = result.settlements.find(s => s.itemId === 'front');
            expect(frontWinner?.bidderId).toBe('user5');
            expect(frontWinner?.wonAmount).toBe(320);
            expect(frontWinner?.bidAmount).toBe(350);
            // General: user8 wins (150), pays second-price (130)
            const generalWinner = result.settlements.find(s => s.itemId === 'general');
            expect(generalWinner?.bidderId).toBe('user8');
            expect(generalWinner?.wonAmount).toBe(130);
            expect(generalWinner?.bidAmount).toBe(150);
            // Total revenue
            const payments = calculatePayments(result.settlements);
            const totalRevenue = Array.from(payments.values()).reduce((sum, amount) => sum + amount, 0);
            expect(totalRevenue).toBe(550 + 320 + 130); // 1000
        });
    });
    describe('Edge cases and error handling', () => {
        test('handles mixed valid and invalid bids gracefully', () => {
            const auction = {
                id: 'auction-4',
                status: 'open',
                config: {
                    type: 'first-price',
                    tieBreak: 'timestamp',
                    multiUnit: false,
                },
                createdAt: new Date(),
            };
            const bids = [
                {
                    id: 'bid-1',
                    auctionId: 'auction-4',
                    bidderId: 'alice',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(1000),
                    status: 'active',
                },
                {
                    id: 'bid-2',
                    auctionId: 'wrong-auction',
                    bidderId: 'bob',
                    itemId: 'seat1',
                    amount: 200,
                    placedAt: new Date(2000),
                    status: 'active',
                },
                {
                    id: 'bid-3',
                    auctionId: 'auction-4',
                    bidderId: 'charlie',
                    itemId: '',
                    amount: 150,
                    placedAt: new Date(3000),
                    status: 'active',
                },
            ];
            // Validate each bid
            const validationResults = bids.map(bid => ({
                bid,
                result: validateBid(bid, auction),
            }));
            expect(validationResults[0]?.result.valid).toBe(true);
            expect(validationResults[1]?.result.valid).toBe(false);
            expect(validationResults[2]?.result.valid).toBe(false);
            // Filter and settle only valid bids
            const validBids = filterValidBids(bids, auction);
            const result = settleBids(validBids, auction.config);
            expect(result.settlements).toHaveLength(1);
            expect(result.settlements[0]?.bidderId).toBe('alice');
        });
        test('handles all bids on different items', () => {
            const config = {
                type: 'first-price',
                tieBreak: 'timestamp',
                multiUnit: false,
            };
            const bids = [
                {
                    id: 'bid-1',
                    auctionId: 'auction-5',
                    bidderId: 'alice',
                    itemId: 'item1',
                    amount: 100,
                    placedAt: new Date(1000),
                    status: 'active',
                },
                {
                    id: 'bid-2',
                    auctionId: 'auction-5',
                    bidderId: 'bob',
                    itemId: 'item2',
                    amount: 200,
                    placedAt: new Date(2000),
                    status: 'active',
                },
                {
                    id: 'bid-3',
                    auctionId: 'auction-5',
                    bidderId: 'charlie',
                    itemId: 'item3',
                    amount: 300,
                    placedAt: new Date(3000),
                    status: 'active',
                },
            ];
            const result = settleBids(bids, config);
            // Each bid wins its own item
            expect(result.settlements).toHaveLength(3);
            expect(result.settlements.every(s => s.wonAmount === s.bidAmount)).toBe(true);
        });
    });
    describe('Savings in second-price auction', () => {
        const config = {
            type: 'second-price',
            tieBreak: 'timestamp',
            multiUnit: false,
        };
        test('calculates savings for winners', () => {
            const bids = [
                {
                    id: 'bid-1',
                    auctionId: 'auction-6',
                    bidderId: 'alice',
                    itemId: 'seat1',
                    amount: 100,
                    placedAt: new Date(1000),
                    status: 'active',
                },
                {
                    id: 'bid-2',
                    auctionId: 'auction-6',
                    bidderId: 'bob',
                    itemId: 'seat1',
                    amount: 500,
                    placedAt: new Date(2000),
                    status: 'active',
                },
            ];
            const result = settleBids(bids, config);
            const settlement = result.settlements[0];
            const savings = settlement.bidAmount - settlement.wonAmount;
            expect(settlement.bidderId).toBe('bob');
            expect(settlement.bidAmount).toBe(500);
            expect(settlement.wonAmount).toBe(100);
            expect(savings).toBe(400); // Bob saves 400 in second-price
        });
        test('no savings when only one bid', () => {
            const bids = [
                {
                    id: 'bid-1',
                    auctionId: 'auction-7',
                    bidderId: 'alice',
                    itemId: 'seat1',
                    amount: 200,
                    placedAt: new Date(1000),
                    status: 'active',
                },
            ];
            const result = settleBids(bids, config);
            const settlement = result.settlements[0];
            expect(settlement.wonAmount).toBe(settlement.bidAmount); // No savings
        });
    });
    describe('Performance with many bids', () => {
        const config = {
            type: 'first-price',
            tieBreak: 'timestamp',
            multiUnit: false,
        };
        test('handles 50 bids efficiently', () => {
            const bids = Array.from({ length: 50 }, (_, i) => ({
                id: `bid-${i}`,
                auctionId: 'auction-8',
                bidderId: `bidder-${i}`,
                itemId: 'seat1',
                amount: Math.floor(Math.random() * 500) + 1,
                placedAt: new Date(1000 + i),
                status: 'active',
            }));
            const start = Date.now();
            const result = settleBids(bids, config);
            const duration = Date.now() - start;
            expect(result.settlements).toHaveLength(1);
            expect(result.errors).toHaveLength(0);
            expect(duration).toBeLessThan(100); // Should be fast
        });
        test('handles 100 bids across 10 items', () => {
            const bids = Array.from({ length: 100 }, (_, i) => ({
                id: `bid-${i}`,
                auctionId: 'auction-9',
                bidderId: `bidder-${i}`,
                itemId: `item-${i % 10}`, // 10 different items
                amount: Math.floor(Math.random() * 500) + 1,
                placedAt: new Date(1000 + i),
                status: 'active',
            }));
            const result = settleBids(bids, config);
            expect(result.settlements).toHaveLength(10); // One winner per item
            expect(result.errors).toHaveLength(0);
        });
    });
});
//# sourceMappingURL=integration.test.js.map
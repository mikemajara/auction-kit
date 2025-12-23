import { describe, test, expect } from 'vitest';
describe('Types', () => {
    describe('AuctionConfig', () => {
        test('accepts valid first-price config', () => {
            const config = {
                type: 'first-price',
                tieBreak: 'timestamp',
                multiUnit: false,
            };
            expect(config.type).toBe('first-price');
            expect(config.tieBreak).toBe('timestamp');
            expect(config.multiUnit).toBe(false);
        });
        test('accepts valid second-price config', () => {
            const config = {
                type: 'second-price',
                tieBreak: 'random',
                multiUnit: true,
            };
            expect(config.type).toBe('second-price');
            expect(config.tieBreak).toBe('random');
            expect(config.multiUnit).toBe(true);
        });
    });
    describe('Auction', () => {
        test('creates valid auction', () => {
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
            expect(auction.id).toBe('auction-1');
            expect(auction.status).toBe('open');
            expect(auction.resolvedAt).toBeUndefined();
        });
        test('accepts all status values', () => {
            const statuses = ['open', 'closed', 'resolved'];
            statuses.forEach(status => {
                const auction = {
                    id: 'test',
                    status,
                    config: { type: 'first-price', tieBreak: 'timestamp', multiUnit: false },
                    createdAt: new Date(),
                };
                expect(auction.status).toBe(status);
            });
        });
    });
    describe('Bidder', () => {
        test('creates valid bidder', () => {
            const bidder = {
                id: 'bidder-1',
                auctionId: 'auction-1',
                name: 'Alice',
            };
            expect(bidder.id).toBe('bidder-1');
            expect(bidder.name).toBe('Alice');
        });
    });
    describe('Bid', () => {
        test('creates valid bid', () => {
            const bid = {
                id: 'bid-1',
                auctionId: 'auction-1',
                bidderId: 'bidder-1',
                itemId: 'seat-1',
                amount: 100,
                placedAt: new Date(),
                status: 'active',
            };
            expect(bid.amount).toBe(100);
            expect(bid.status).toBe('active');
        });
        test('accepts all status values', () => {
            const statuses = ['active', 'won', 'lost', 'cancelled'];
            statuses.forEach(status => {
                const bid = {
                    id: 'test',
                    auctionId: 'auction-1',
                    bidderId: 'bidder-1',
                    itemId: 'seat-1',
                    amount: 100,
                    placedAt: new Date(),
                    status,
                };
                expect(bid.status).toBe(status);
            });
        });
    });
    describe('Settlement', () => {
        test('creates valid settlement', () => {
            const settlement = {
                bidderId: 'bidder-1',
                itemId: 'seat-1',
                wonAmount: 100,
                bidAmount: 100,
            };
            expect(settlement.wonAmount).toBe(100);
            expect(settlement.bidAmount).toBe(100);
        });
        test('supports second-price where wonAmount differs from bidAmount', () => {
            const settlement = {
                bidderId: 'bidder-1',
                itemId: 'seat-1',
                wonAmount: 90, // Second-highest bid
                bidAmount: 100, // Winner's original bid
            };
            expect(settlement.wonAmount).toBeLessThan(settlement.bidAmount);
        });
    });
    describe('ResolutionResult', () => {
        test('creates valid result with settlements', () => {
            const result = {
                settlements: [
                    {
                        bidderId: 'bidder-1',
                        itemId: 'seat-1',
                        wonAmount: 100,
                        bidAmount: 100,
                    },
                ],
                errors: [],
                resolvedAt: new Date(),
            };
            expect(result.settlements).toHaveLength(1);
            expect(result.errors).toHaveLength(0);
        });
        test('creates valid result with errors', () => {
            const result = {
                settlements: [],
                errors: ['No valid bids found'],
                resolvedAt: new Date(),
            };
            expect(result.settlements).toHaveLength(0);
            expect(result.errors).toHaveLength(1);
        });
    });
    describe('ValidationResult', () => {
        test('creates valid validation result', () => {
            const valid = {
                valid: true,
                errors: [],
            };
            expect(valid.valid).toBe(true);
            expect(valid.errors).toHaveLength(0);
        });
        test('creates invalid validation result', () => {
            const invalid = {
                valid: false,
                errors: ['Amount must be positive'],
            };
            expect(invalid.valid).toBe(false);
            expect(invalid.errors).toHaveLength(1);
        });
    });
    describe('RankedBid', () => {
        test('creates ranked bid', () => {
            const rankedBid = {
                id: 'bid-1',
                auctionId: 'auction-1',
                bidderId: 'bidder-1',
                itemId: 'seat-1',
                amount: 100,
                placedAt: new Date(),
                status: 'active',
                rank: 0,
            };
            expect(rankedBid.rank).toBe(0);
            expect(rankedBid.amount).toBe(100);
        });
    });
});
//# sourceMappingURL=types.test.js.map
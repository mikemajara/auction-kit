/**
 * Drizzle ORM schema for Postgres
 *
 * Database schema for auction system supporting:
 * - Multiple concurrent auctions
 * - Bidders with multiple bids
 * - Settlement tracking
 * - Audit trail with timestamps
 */
import type { AuctionConfig } from '@auction-kit/core';
/**
 * Auctions table
 * Stores auction configuration and status
 */
export declare const auctions: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "auctions";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "auctions";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "auctions";
            dataType: "string";
            columnType: "PgText";
            data: "open" | "closed" | "resolved";
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: ["open", "closed", "resolved"];
            baseColumn: never;
        }, {}, {}>;
        config: import("drizzle-orm/pg-core").PgColumn<{
            name: "config";
            tableName: "auctions";
            dataType: "json";
            columnType: "PgJsonb";
            data: AuctionConfig;
            driverParam: unknown;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "auctions";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        resolvedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "resolved_at";
            tableName: "auctions";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Bidders table
 * Stores participants in auctions
 */
export declare const bidders: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "bidders";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "bidders";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        auctionId: import("drizzle-orm/pg-core").PgColumn<{
            name: "auction_id";
            tableName: "bidders";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "bidders";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "bidders";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Bids table
 * Stores all bids placed in auctions
 */
export declare const bids: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "bids";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "bids";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        auctionId: import("drizzle-orm/pg-core").PgColumn<{
            name: "auction_id";
            tableName: "bids";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        bidderId: import("drizzle-orm/pg-core").PgColumn<{
            name: "bidder_id";
            tableName: "bids";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        itemId: import("drizzle-orm/pg-core").PgColumn<{
            name: "item_id";
            tableName: "bids";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        amount: import("drizzle-orm/pg-core").PgColumn<{
            name: "amount";
            tableName: "bids";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        placedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "placed_at";
            tableName: "bids";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "bids";
            dataType: "string";
            columnType: "PgText";
            data: "active" | "won" | "lost" | "cancelled";
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: ["active", "won", "lost", "cancelled"];
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Settlements table
 * Stores final auction results and payments
 */
export declare const settlements: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "settlements";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "settlements";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        auctionId: import("drizzle-orm/pg-core").PgColumn<{
            name: "auction_id";
            tableName: "settlements";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        bidderId: import("drizzle-orm/pg-core").PgColumn<{
            name: "bidder_id";
            tableName: "settlements";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        itemId: import("drizzle-orm/pg-core").PgColumn<{
            name: "item_id";
            tableName: "settlements";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        wonAmount: import("drizzle-orm/pg-core").PgColumn<{
            name: "won_amount";
            tableName: "settlements";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        bidAmount: import("drizzle-orm/pg-core").PgColumn<{
            name: "bid_amount";
            tableName: "settlements";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        settledAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "settled_at";
            tableName: "settlements";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Type exports for use in queries
 */
export type Auction = typeof auctions.$inferSelect;
export type NewAuction = typeof auctions.$inferInsert;
export type Bidder = typeof bidders.$inferSelect;
export type NewBidder = typeof bidders.$inferInsert;
export type Bid = typeof bids.$inferSelect;
export type NewBid = typeof bids.$inferInsert;
export type Settlement = typeof settlements.$inferSelect;
export type NewSettlement = typeof settlements.$inferInsert;
//# sourceMappingURL=schema.d.ts.map
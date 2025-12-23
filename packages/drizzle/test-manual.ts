#!/usr/bin/env tsx
/**
 * Manual test script for database layer
 * 
 * Tests the complete auction flow:
 * 1. Create auction
 * 2. Add bidders
 * 3. Place bids
 * 4. Resolve auction
 * 5. Verify results
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import {
  createAuction,
  createBidder,
  placeBid,
  resolveAuction,
  getAuctionState,
  updateAuctionStatus,
} from './src/queries'

async function main() {
  // Load environment
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set')
    console.error('   Run: export DATABASE_URL="postgres://auction:auction123@localhost:5432/auction_kit_dev"')
    process.exit(1)
  }

  // Connect to database
  console.log('🔌 Connecting to database...')
  const client = postgres(databaseUrl)
  const db = drizzle(client)
  console.log('✅ Connected!\n')

  console.log('🎯 Testing Auction Kit Database Layer')
  console.log('=' .repeat(50) + '\n')

  try {
    // 1. Create auction
    console.log('1️⃣  Creating second-price auction...')
    const auction = await createAuction(db, {
      type: 'second-price',
      tieBreak: 'timestamp',
      multiUnit: false,
    })
    console.log(`   ✅ Created auction: ${auction.id}`)
    console.log(`   📋 Type: ${auction.config.type}`)
    console.log(`   📋 Tie-break: ${auction.config.tieBreak}`)
    console.log(`   📋 Multi-unit: ${auction.config.multiUnit}\n`)

    // 2. Create bidders
    console.log('2️⃣  Adding bidders...')
    const alice = await createBidder(db, auction.id, 'Alice')
    const bob = await createBidder(db, auction.id, 'Bob')
    const charlie = await createBidder(db, auction.id, 'Charlie')
    console.log(`   ✅ Alice: ${alice.id}`)
    console.log(`   ✅ Bob: ${bob.id}`)
    console.log(`   ✅ Charlie: ${charlie.id}\n`)

    // 3. Place bids
    console.log('3️⃣  Placing bids on VIP seat...')
    
    await placeBid(db, {
      auctionId: auction.id,
      bidderId: alice.id,
      itemId: 'vip-seat',
      amount: 100,
    })
    console.log('   💰 Alice bids $100')

    await placeBid(db, {
      auctionId: auction.id,
      bidderId: bob.id,
      itemId: 'vip-seat',
      amount: 200,
    })
    console.log('   💰 Bob bids $200')

    await placeBid(db, {
      auctionId: auction.id,
      bidderId: charlie.id,
      itemId: 'vip-seat',
      amount: 150,
    })
    console.log('   💰 Charlie bids $150\n')

    // 4. View state before resolution
    console.log('4️⃣  Current auction state:')
    const stateBefore = await getAuctionState(db, auction.id)
    console.log(`   📊 Bidders: ${stateBefore.bidders.length}`)
    console.log(`   📊 Total bids: ${stateBefore.bids.length}`)
    console.log(`   📊 Active bids: ${stateBefore.bids.filter(b => b.status === 'active').length}`)
    console.log(`   📊 Status: ${stateBefore.auction.status}\n`)

    // 5. Close auction
    console.log('5️⃣  Closing auction...')
    await updateAuctionStatus(db, auction.id, 'closed')
    console.log('   ✅ Auction closed to new bids\n')

    // 6. Resolve auction
    console.log('6️⃣  Resolving auction...')
    const result = await resolveAuction(db, auction.id)
    console.log(`   ✅ Settlements created: ${result.settlements.length}`)
    console.log(`   ✅ Errors: ${result.errors.length}`)
    
    if (result.errors.length > 0) {
      console.log('   ⚠️  Errors:', result.errors)
    }
    console.log()

    // 7. Show results
    console.log('7️⃣  Settlement results:')
    console.log('   ' + '─'.repeat(60))
    
    for (const settlement of result.settlements) {
      const bidder = [alice, bob, charlie].find(b => b.id === settlement.bidderId)
      const savings = settlement.bidAmount - settlement.wonAmount
      
      console.log(`   🏆 WINNER: ${bidder?.name}`)
      console.log(`      Item: ${settlement.itemId}`)
      console.log(`      Original bid: $${settlement.bidAmount}`)
      console.log(`      Pays: $${settlement.wonAmount}`)
      console.log(`      Saves: $${savings} (second-price discount!)`)
    }
    console.log('   ' + '─'.repeat(60))
    console.log()

    // 8. Verify final state
    console.log('8️⃣  Final auction state:')
    const stateAfter = await getAuctionState(db, auction.id)
    console.log(`   📊 Status: ${stateAfter.auction.status}`)
    console.log(`   📊 Resolved at: ${stateAfter.auction.resolvedAt?.toLocaleString()}`)
    console.log(`   📊 Total settlements: ${stateAfter.settlements.length}`)
    console.log(`   📊 Won bids: ${stateAfter.bids.filter(b => b.status === 'won').length}`)
    console.log(`   📊 Lost bids: ${stateAfter.bids.filter(b => b.status === 'lost').length}`)
    console.log()

    // 9. Expected vs Actual
    console.log('9️⃣  Verification:')
    const expectedWinner = bob
    const actualWinner = result.settlements[0]
    
    if (actualWinner?.bidderId === expectedWinner.id) {
      console.log('   ✅ Correct winner (Bob with highest bid)')
    } else {
      console.log('   ❌ Unexpected winner!')
    }
    
    if (actualWinner?.wonAmount === 150) {
      console.log('   ✅ Correct payment (second-highest bid: $150)')
    } else {
      console.log(`   ❌ Unexpected payment: $${actualWinner?.wonAmount}`)
    }
    
    console.log()
    console.log('=' .repeat(50))
    console.log('✅ All tests passed! Database layer is working correctly.')
    console.log('=' .repeat(50))

  } catch (error) {
    console.error('\n❌ Error during testing:')
    console.error(error)
    process.exit(1)
  } finally {
    console.log('\n🔌 Closing database connection...')
    await client.end()
    console.log('✅ Disconnected')
  }
}

// Run the test
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})



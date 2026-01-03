#!/bin/bash
# test-api.sh

BASE_URL="http://localhost:3000"

echo "1. Health check"
curl $BASE_URL/health

echo -e "\n\n2. Create auction"
AUCTION_RESPONSE=$(curl -s -X POST $BASE_URL/auctions \
  -H "Content-Type: application/json" \
  -d '{"type":"second-price","tieBreak":"timestamp","multiUnit":false}')
AUCTION_ID=$(echo $AUCTION_RESPONSE | jq -r '.data.id')
echo "Auction ID: $AUCTION_ID"

echo -e "\n\n3. Create bidder"
BIDDER_RESPONSE=$(curl -s -X POST $BASE_URL/auctions/$AUCTION_ID/bidders \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice"}')
BIDDER_ID=$(echo $BIDDER_RESPONSE | jq -r '.data.id')
echo "Bidder ID: $BIDDER_ID"

echo -e "\n\n4. Create item"
ITEM_RESPONSE=$(curl -s -X POST $BASE_URL/auctions/$AUCTION_ID/items \
  -H "Content-Type: application/json" \
  -d '{"name":"VIP Seat"}')
ITEM_ID=$(echo $ITEM_RESPONSE | jq -r '.data.id')
echo "Item ID: $ITEM_ID"

echo -e "\n\n5. Place bid"
curl -X POST $BASE_URL/auctions/$AUCTION_ID/bids \
  -H "Content-Type: application/json" \
  -d "{\"bidderId\":\"$BIDDER_ID\",\"itemId\":\"$ITEM_ID\",\"amount\":100}"

echo -e "\n\n6. Resolve auction"
curl -X POST $BASE_URL/auctions/$AUCTION_ID/resolve

echo -e "\n\n7. Get final state"
curl $BASE_URL/auctions/$AUCTION_ID

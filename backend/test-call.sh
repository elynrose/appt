#!/bin/bash

# Test script for Twilio call webhook
# Usage: ./test-call.sh [businessId] [phoneNumber]

BUSINESS_ID=${1:-business-1}
PHONE_NUMBER=${2:-+15551234567}
PUBLIC_URL=${PUBLIC_URL:-http://localhost:5050}

echo "🧪 Testing Twilio Call Webhook"
echo "================================"
echo "Business ID: $BUSINESS_ID"
echo "Phone Number: $PHONE_NUMBER"
echo "Public URL: $PUBLIC_URL"
echo ""

# Test webhook endpoint
echo "📞 Testing /voice endpoint..."
RESPONSE=$(curl -k -s -X POST "$PUBLIC_URL/voice?businessId=$BUSINESS_ID" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=test123&To=$(echo $PHONE_NUMBER | sed 's/+/%2B/')")

echo "Response Status: $?"
echo ""
echo "Response Body:"
echo "$RESPONSE" | head -20
echo ""

# Check if response contains expected elements
if echo "$RESPONSE" | grep -q "<?xml"; then
  echo "✅ Valid TwiML response"
else
  echo "❌ Invalid response (should be TwiML)"
fi

if echo "$RESPONSE" | grep -q "<Stream"; then
  echo "✅ Contains WebSocket Stream tag"
else
  echo "❌ Missing WebSocket Stream tag"
fi

if echo "$RESPONSE" | grep -q "wss://"; then
  echo "✅ Contains WebSocket URL (wss://)"
  WS_URL=$(echo "$RESPONSE" | grep -o 'wss://[^"]*' | head -1)
  echo "   WebSocket URL: $WS_URL"
else
  echo "❌ Missing WebSocket URL"
fi

echo ""
echo "✅ Test complete!"


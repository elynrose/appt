#!/usr/bin/env node

/**
 * Test script to verify WebSocket endpoint is accessible
 * Usage: node test-websocket.js [url]
 */

import { WebSocket } from 'ws';
import https from 'https';

// Allow self-signed certificates for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = process.argv[2] || 'wss://awake-cat-production-15ef.up.railway.app/twilio-media?businessId=business-1&callSid=test123&plan=premium&to=%2B15551234567';

console.log('🧪 Testing WebSocket Connection');
console.log('================================');
console.log(`URL: ${url}`);
console.log('');

const ws = new WebSocket(url);

ws.on('open', () => {
  console.log('✅ WebSocket connection opened!');
  console.log('✅ Endpoint is accessible');
  ws.close();
});

ws.on('error', (error) => {
  console.error('❌ WebSocket connection failed:');
  console.error(`   ${error.message}`);
  if (error.code) {
    console.error(`   Code: ${error.code}`);
  }
  process.exit(1);
});

ws.on('close', (code, reason) => {
  console.log(`\n🔌 Connection closed (code: ${code})`);
  if (code === 1000) {
    console.log('✅ Normal closure - WebSocket is working!');
    process.exit(0);
  } else {
    console.log(`⚠️  Unexpected closure code: ${code}`);
    process.exit(1);
  }
});

// Timeout after 10 seconds
setTimeout(() => {
  if (ws.readyState === WebSocket.CONNECTING) {
    console.error('❌ Connection timeout');
    ws.close();
    process.exit(1);
  }
}, 10000);


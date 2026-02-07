#!/usr/bin/env node

/**
 * Helper script to encode Firebase service account JSON to base64
 * Usage: node encode-service-account.js <path-to-service-account.json>
 */

import { readFileSync } from 'fs';
import { Buffer } from 'buffer';

const serviceAccountPath = process.argv[2];

if (!serviceAccountPath) {
  console.error('Usage: node encode-service-account.js <path-to-service-account.json>');
  process.exit(1);
}

try {
  const serviceAccountJson = readFileSync(serviceAccountPath, 'utf8');
  
  // Validate it's valid JSON
  JSON.parse(serviceAccountJson);
  
  // Encode to base64
  const base64 = Buffer.from(serviceAccountJson).toString('base64');
  
  console.log('\n✅ Service account encoded successfully!\n');
  console.log('Add this to your .env file:');
  console.log(`FIREBASE_SERVICE_ACCOUNT_BASE64=${base64}\n`);
  
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(`❌ Error: File not found: ${serviceAccountPath}`);
  } else if (error instanceof SyntaxError) {
    console.error(`❌ Error: Invalid JSON file: ${error.message}`);
  } else {
    console.error(`❌ Error: ${error.message}`);
  }
  process.exit(1);
}


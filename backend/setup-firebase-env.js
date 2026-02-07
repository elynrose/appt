#!/usr/bin/env node

/**
 * Script to set up Firebase credentials in .env file
 * Usage: node setup-firebase-env.js <path-to-service-account.json>
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { Buffer } from 'buffer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = process.argv[2];
const envPath = join(__dirname, '.env');
const envExamplePath = join(__dirname, '.env.example');

if (!serviceAccountPath) {
  console.error('❌ Usage: node setup-firebase-env.js <path-to-service-account.json>');
  process.exit(1);
}

try {
  // Read and validate service account JSON
  const serviceAccountJson = readFileSync(serviceAccountPath, 'utf8');
  const serviceAccount = JSON.parse(serviceAccountJson);
  
  // Validate required fields
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    throw new Error('Invalid service account JSON: missing required fields');
  }
  
  console.log(`✅ Valid service account for project: ${serviceAccount.project_id}`);
  
  // Encode to base64
  const base64 = Buffer.from(serviceAccountJson).toString('base64');
  
  // Read existing .env or create from .env.example
  let envContent = '';
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf8');
  } else if (existsSync(envExamplePath)) {
    envContent = readFileSync(envExamplePath, 'utf8');
    console.log('📝 Created .env from .env.example');
  }
  
  // Update or add FIREBASE_SERVICE_ACCOUNT_BASE64
  const lines = envContent.split('\n');
  let found = false;
  const updatedLines = lines.map(line => {
    if (line.startsWith('FIREBASE_SERVICE_ACCOUNT_BASE64=')) {
      found = true;
      return `FIREBASE_SERVICE_ACCOUNT_BASE64=${base64}`;
    }
    return line;
  });
  
  if (!found) {
    // Add if not found
    if (updatedLines[updatedLines.length - 1] !== '') {
      updatedLines.push('');
    }
    updatedLines.push(`FIREBASE_SERVICE_ACCOUNT_BASE64=${base64}`);
  }
  
  // Write .env file
  writeFileSync(envPath, updatedLines.join('\n'));
  
  console.log('\n✅ Successfully updated .env file with Firebase credentials!');
  console.log(`\n📋 Project ID: ${serviceAccount.project_id}`);
  console.log(`📋 Service Account: ${serviceAccount.client_email}`);
  console.log('\n⚠️  Remember to also set:');
  console.log('   - OPENAI_API_KEY');
  console.log('   - Any TWILIO_BUSINESS_* variables if needed\n');
  
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


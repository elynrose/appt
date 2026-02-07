#!/usr/bin/env node

/**
 * Script to set custom claims (businessId) for Firebase users
 * Usage: node set-user-claims.js <user-email> <business-id>
 * 
 * Example: node set-user-claims.js user@example.com business-123
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import { Buffer } from 'buffer';

// Load environment variables
dotenv.config();

const userEmail = process.argv[2];
const businessId = process.argv[3];

if (!userEmail || !businessId) {
  console.error('❌ Usage: node set-user-claims.js <user-email> <business-id>');
  console.error('   Example: node set-user-claims.js user@example.com business-123');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
if (!serviceAccountBase64) {
  console.error('❌ Error: FIREBASE_SERVICE_ACCOUNT_BASE64 is not set in .env file');
  process.exit(1);
}

try {
  const jsonString = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
  const adminCredential = JSON.parse(jsonString);
  
  initializeApp({ credential: cert(adminCredential) });
  const auth = getAuth();
  
  // Get user by email
  const user = await auth.getUserByEmail(userEmail);
  
  // Set custom claims
  await auth.setCustomUserClaims(user.uid, { businessId });
  
  console.log(`✅ Successfully set businessId claim for user:`);
  console.log(`   Email: ${userEmail}`);
  console.log(`   UID: ${user.uid}`);
  console.log(`   Business ID: ${businessId}`);
  console.log(`\n⚠️  Note: User needs to sign out and sign in again for the claim to take effect.`);
  
} catch (error) {
  if (error.code === 'auth/user-not-found') {
    console.error(`❌ Error: User with email "${userEmail}" not found`);
    console.error('   Make sure the user has signed up first.');
  } else {
    console.error(`❌ Error: ${error.message}`);
  }
  process.exit(1);
}


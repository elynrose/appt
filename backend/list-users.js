#!/usr/bin/env node

/**
 * Script to list all Firebase users and their custom claims
 * Usage: node list-users.js
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import { Buffer } from 'buffer';

// Load environment variables
dotenv.config();

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
  
  // List all users (first 100)
  const listUsersResult = await auth.listUsers(100);
  
  if (listUsersResult.users.length === 0) {
    console.log('📭 No users found. Create users in Firebase Console first.');
    process.exit(0);
  }
  
  console.log(`\n👥 Found ${listUsersResult.users.length} user(s):\n`);
  
  for (const user of listUsersResult.users) {
    const businessId = user.customClaims?.businessId || '(not set)';
    console.log(`📧 Email: ${user.email || '(no email)'}`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Business ID: ${businessId}`);
    console.log(`   Created: ${user.metadata.creationTime}`);
    console.log('');
  }
  
  console.log(`\n💡 To set businessId for a user, run:`);
  console.log(`   node set-user-claims.js <email> <business-id>\n`);
  
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}


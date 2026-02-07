#!/usr/bin/env node

/**
 * Script to create a business document in Firestore
 * Usage: node create-business.js <business-id> [plan]
 * 
 * Example: node create-business.js business-1 premium
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { Buffer } from 'buffer';

// Load environment variables
dotenv.config();

const businessId = process.argv[2];
const plan = process.argv[3] || 'basic'; // 'basic' or 'premium'

if (!businessId) {
  console.error('❌ Usage: node create-business.js <business-id> [plan]');
  console.error('   Example: node create-business.js business-1 premium');
  process.exit(1);
}

if (plan !== 'basic' && plan !== 'premium') {
  console.error('❌ Plan must be either "basic" or "premium"');
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
  const db = getFirestore();
  
  // Create business document
  const businessRef = db.collection('businesses').doc(businessId);
  const businessData = {
    plan,
    timezone: 'America/New_York', // Default timezone, can be customized
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await businessRef.set(businessData);
  
  console.log(`✅ Successfully created business document:`);
  console.log(`   Business ID: ${businessId}`);
  console.log(`   Plan: ${plan}`);
  console.log(`   Timezone: ${businessData.timezone}`);
  
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}


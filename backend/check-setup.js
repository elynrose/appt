#!/usr/bin/env node

/**
 * Script to check if the backend is properly configured for Twilio
 */

import dotenv from 'dotenv';
import { Buffer } from 'buffer';

dotenv.config();

console.log('🔍 Checking Twilio Setup...\n');

let allGood = true;

// Check OpenAI API Key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set');
  allGood = false;
} else {
  console.log('✅ OPENAI_API_KEY is set');
}

// Check Firebase
if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_BASE64 is not set');
  allGood = false;
} else {
  try {
    const jsonString = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    JSON.parse(jsonString);
    console.log('✅ FIREBASE_SERVICE_ACCOUNT_BASE64 is valid');
  } catch (err) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_BASE64 is invalid:', err.message);
    allGood = false;
  }
}

// Check Public URL
if (!process.env.PUBLIC_URL) {
  console.warn('⚠️  PUBLIC_URL is not set (will use request host header)');
} else {
  console.log(`✅ PUBLIC_URL is set: ${process.env.PUBLIC_URL}`);
}

// Check for Twilio credentials
const twilioVars = Object.keys(process.env).filter(key => key.startsWith('TWILIO_BUSINESS_'));
if (twilioVars.length === 0) {
  console.warn('⚠️  No TWILIO_BUSINESS_* variables found (only needed for premium plans)');
} else {
  console.log(`✅ Found ${twilioVars.length} Twilio business configuration(s)`);
  twilioVars.forEach(varName => {
    try {
      const config = JSON.parse(process.env[varName]);
      console.log(`   - ${varName}: ${config.phoneNumber || 'phone number missing'}`);
    } catch (err) {
      console.error(`   - ${varName}: Invalid JSON`);
    }
  });
}

console.log('\n' + (allGood ? '✅ Setup looks good!' : '❌ Please fix the issues above'));
process.exit(allGood ? 0 : 1);


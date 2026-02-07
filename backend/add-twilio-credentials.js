#!/usr/bin/env node

/**
 * Script to add Twilio credentials to .env file
 * Usage: node add-twilio-credentials.js <business-id> <account-sid> <auth-token> <phone-number>
 * 
 * Example: node add-twilio-credentials.js business-1 AC1234567890abcdef your_auth_token +15551234567
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const businessId = process.argv[2];
const accountSid = process.argv[3];
const authToken = process.argv[4];
const phoneNumber = process.argv[5];

if (!businessId || !accountSid || !authToken || !phoneNumber) {
  console.error('❌ Usage: node add-twilio-credentials.js <business-id> <account-sid> <auth-token> <phone-number>');
  console.error('   Example: node add-twilio-credentials.js business-1 AC1234567890abcdef your_token +15551234567');
  process.exit(1);
}

// Validate phone number format (E.164)
if (!phoneNumber.startsWith('+')) {
  console.error('❌ Error: Phone number must be in E.164 format (e.g., +15551234567)');
  process.exit(1);
}

const envPath = join(__dirname, '.env');

try {
  // Read existing .env
  let envContent = '';
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf8');
  }

  // Create Twilio config JSON
  const twilioConfig = {
    accountSid,
    authToken,
    phoneNumber,
  };
  const configJson = JSON.stringify(twilioConfig);

  // Variable name
  const varName = `TWILIO_BUSINESS_${businessId}`;

  // Check if already exists
  const lines = envContent.split('\n');
  let found = false;
  const updatedLines = lines.map((line) => {
    if (line.startsWith(`${varName}=`)) {
      found = true;
      return `${varName}=${configJson}`;
    }
    return line;
  });

  if (!found) {
    // Add if not found
    if (updatedLines[updatedLines.length - 1] !== '') {
      updatedLines.push('');
    }
    updatedLines.push(`${varName}=${configJson}`);
  }

  // Write .env file
  writeFileSync(envPath, updatedLines.join('\n'));

  console.log('\n✅ Successfully added Twilio credentials to .env file!');
  console.log(`\n📋 Configuration:`);
  console.log(`   Business ID: ${businessId}`);
  console.log(`   Account SID: ${accountSid}`);
  console.log(`   Phone Number: ${phoneNumber}`);
  console.log(`\n⚠️  Next steps:`);
  console.log(`   1. Configure Twilio webhook URL in Twilio Console:`);
  console.log(`      https://your-ngrok-url.ngrok-free.dev/voice?businessId=${businessId}`);
  console.log(`   2. Restart your backend server`);
  console.log(`   3. Test by calling your Twilio number\n`);

} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}


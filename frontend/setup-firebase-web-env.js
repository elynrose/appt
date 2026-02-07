#!/usr/bin/env node

/**
 * Script to set up Firebase web app configuration in .env file
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '.env');
const envExamplePath = join(__dirname, '.env.example');

// Firebase web app configuration from Firebase CLI
const firebaseConfig = {
  apiKey: 'AIzaSyAfX20OsEdxSyJrIApZp_IU4yERf5moOic',
  authDomain: 'studio-5771582587-5ae19.firebaseapp.com',
  projectId: 'studio-5771582587-5ae19',
  appId: '1:767449505901:web:a81ed5939980ebb673df64',
};

try {
  // Read existing .env or create from .env.example
  let envContent = '';
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf8');
  } else if (existsSync(envExamplePath)) {
    envContent = readFileSync(envExamplePath, 'utf8');
    console.log('📝 Created .env from .env.example');
  }
  
  // Update or add Firebase configuration
  const lines = envContent.split('\n');
  const configVars = {
    'VITE_FIREBASE_API_KEY': firebaseConfig.apiKey,
    'VITE_FIREBASE_AUTH_DOMAIN': firebaseConfig.authDomain,
    'VITE_FIREBASE_PROJECT_ID': firebaseConfig.projectId,
    'VITE_FIREBASE_APP_ID': firebaseConfig.appId,
  };
  
  const updatedLines = [];
  const foundVars = new Set();
  
  // Update existing lines
  for (const line of lines) {
    let updated = false;
    for (const [varName, varValue] of Object.entries(configVars)) {
      if (line.startsWith(`${varName}=`)) {
        updatedLines.push(`${varName}=${varValue}`);
        foundVars.add(varName);
        updated = true;
        break;
      }
    }
    if (!updated) {
      updatedLines.push(line);
    }
  }
  
  // Add missing variables
  if (updatedLines[updatedLines.length - 1] !== '') {
    updatedLines.push('');
  }
  
  for (const [varName, varValue] of Object.entries(configVars)) {
    if (!foundVars.has(varName)) {
      updatedLines.push(`${varName}=${varValue}`);
    }
  }
  
  // Write .env file
  writeFileSync(envPath, updatedLines.join('\n'));
  
  console.log('\n✅ Successfully configured Firebase web app in .env file!');
  console.log(`\n📋 Configuration:`);
  console.log(`   Project ID: ${firebaseConfig.projectId}`);
  console.log(`   Auth Domain: ${firebaseConfig.authDomain}`);
  console.log(`   App ID: ${firebaseConfig.appId}`);
  console.log('\n✅ Frontend is ready to run!\n');
  
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}


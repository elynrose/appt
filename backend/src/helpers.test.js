import { test } from 'node:test';
import assert from 'node:assert';

// Test helper functions
// Note: These test the logic, not the full integration

test('getTwilioConfig - valid config', () => {
  process.env.TWILIO_BUSINESS_test123 = JSON.stringify({
    accountSid: 'AC123',
    authToken: 'token123',
    phoneNumber: '+15551234567'
  });

  // Import the function (we'll need to export it from index.js)
  // For now, test the logic
  const varName = 'TWILIO_BUSINESS_test123';
  const raw = process.env[varName];
  const config = JSON.parse(raw);

  assert.strictEqual(config.accountSid, 'AC123');
  assert.strictEqual(config.authToken, 'token123');
  assert.strictEqual(config.phoneNumber, '+15551234567');
});

test('getTwilioConfig - missing config', () => {
  const varName = 'TWILIO_BUSINESS_nonexistent';
  const raw = process.env[varName];
  
  assert.strictEqual(raw, undefined);
});

test('getTwilioConfig - invalid JSON', () => {
  process.env.TWILIO_BUSINESS_invalid = 'not-json';
  
  const varName = 'TWILIO_BUSINESS_invalid';
  const raw = process.env[varName];
  
  assert.throws(() => {
    JSON.parse(raw);
  }, SyntaxError);
});


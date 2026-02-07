import { test, before, after } from 'node:test';
import assert from 'node:assert';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.PORT = '5051'; // Use different port for tests

// Mock Firebase Admin (we'll test without actual Firebase)
const originalEnv = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
delete process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

let app;

before(async () => {
  // Import app after env setup
  const module = await import('./index.js');
  app = module.default;
  // Wait for Fastify to be ready
  await app.ready();
});

after(async () => {
  // Close the app after tests
  if (app) {
    await app.close();
  }
  // Restore original env
  if (originalEnv) {
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 = originalEnv;
  }
});

test('Voice webhook - premium plan with businessId', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/voice?businessId=business-1',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    payload: 'CallSid=CA123&To=%2B15551234567'
  });

  assert.strictEqual(response.statusCode, 200);
  assert(response.body.includes('<?xml'));
  assert(response.body.includes('<Stream'));
  assert(response.body.includes('wss://'));
  assert(response.body.includes('businessId=business-1'));
});

test('Voice webhook - missing businessId returns error', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/voice',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    payload: 'CallSid=CA123&To=%2B15559999999' // Number not in phoneRoutes
  });

  assert.strictEqual(response.statusCode, 200);
  assert(response.body.includes('<?xml'));
  assert(response.body.includes('not configured'));
});

test('Twilio validation - missing parameters', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/integrations/twilio/validate',
    payload: {
      businessId: 'business-1'
      // Missing accountSid, authToken, phoneNumber
    }
  });

  assert.strictEqual(response.statusCode, 400);
  const body = JSON.parse(response.body);
  assert.strictEqual(body.ok, false);
  assert(body.error.includes('Missing parameters'));
});

test('Onboarding - missing parameters', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/onboarding',
    headers: {
      'authorization': 'Bearer invalid-token'
    },
    payload: {
      // Missing businessName, timezone, plan
    }
  });

  assert.strictEqual(response.statusCode, 400);
  const body = JSON.parse(response.body);
  assert.strictEqual(body.ok, false);
});


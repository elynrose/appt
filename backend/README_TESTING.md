# Testing Guide

## Running Tests

### Run All Tests
```bash
cd backend
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## Test Structure

Tests are located in `src/*.test.js` files and use Node.js's built-in test runner.

### Current Tests

1. **`src/index.test.js`** - Tests for main API endpoints:
   - Voice webhook endpoint (premium plan)
   - Voice webhook error handling
   - Twilio validation endpoint
   - Onboarding endpoint
   - Health check

2. **`src/helpers.test.js`** - Tests for helper functions:
   - `getTwilioConfig` function
   - Config parsing and validation

## Writing New Tests

### Example Test Structure

```javascript
import { test } from 'node:test';
import assert from 'node:assert';

test('Test name', async () => {
  // Arrange
  const input = 'test';
  
  // Act
  const result = await someFunction(input);
  
  // Assert
  assert.strictEqual(result, 'expected');
});
```

### Testing Fastify Endpoints

```javascript
import { default: app } from './index.js';

test('Endpoint test', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/endpoint',
    payload: { data: 'test' }
  });
  
  assert.strictEqual(response.statusCode, 200);
});
```

## Test Coverage

Current test coverage includes:
- ✅ Voice webhook endpoint (basic)
- ✅ Twilio validation endpoint
- ✅ Onboarding endpoint
- ✅ Helper functions
- ⚠️ WebSocket endpoint (needs integration testing)
- ⚠️ Firebase integration (needs mocking)

## Mocking External Services

For tests that require external services:

1. **Firebase** - Mock Firestore and Auth
2. **Twilio** - Mock Twilio client
3. **OpenAI** - Mock OpenAI API calls

## Continuous Integration

Tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test
```

## Future Test Improvements

- [ ] Add integration tests for WebSocket connections
- [ ] Add E2E tests for full call flow
- [ ] Add performance tests
- [ ] Add load tests for concurrent calls
- [ ] Add tests for error scenarios


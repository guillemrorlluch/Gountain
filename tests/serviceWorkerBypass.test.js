const test = require('node:test');
const assert = require('node:assert/strict');

test('third-party and POST requests bypass fetch handler', () => {
  const handlers = {};
  const originalSelf = global.self;
  const originalLocation = global.location;
  global.self = { addEventListener: (type, fn) => { handlers[type] = fn; } };
  global.location = { origin: 'https://example.com' };

  require('../sw-v9.js');
  const fetchHandler = handlers.fetch;
  assert.ok(fetchHandler, 'fetch handler registered');

  // Cross-origin GET request
  {
    let responded = false;
    const event = {
      request: { method: 'GET', url: 'https://third.party/resource.js' },
      respondWith: () => { responded = true; }
    };
    fetchHandler(event);
    assert.equal(responded, false, 'should not intercept cross-origin GET');
  }

  // Same-origin POST request
  {
    let responded = false;
    const event = {
      request: { method: 'POST', url: 'https://example.com/api' },
      respondWith: () => { responded = true; }
    };
    fetchHandler(event);
    assert.equal(responded, false, 'should not intercept POST requests');
  }

  if (originalSelf === undefined) delete global.self; else global.self = originalSelf;
  if (originalLocation === undefined) delete global.location; else global.location = originalLocation;
});

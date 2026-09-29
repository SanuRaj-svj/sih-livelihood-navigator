const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

test('health endpoint reports dependency-aware status shape', async () => {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const body = await response.json();
    assert.ok([200, 503].includes(response.status));
    assert.equal(typeof body.success, 'boolean');
    assert.equal(body.services.api, 'online');
    assert.ok(['connected', 'disconnected'].includes(body.services.mongodb));
    assert.equal(typeof body.services.ai_service, 'string');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('certificate routes are mounted on the API', () => {
  const routePaths = [];

  const walkRoutes = (stack) => {
    for (const layer of stack) {
      if (layer.route) {
        Object.keys(layer.route.methods).forEach((method) => {
          routePaths.push(`${method.toUpperCase()} ${layer.route.path}`);
        });
      } else if (layer.handle && layer.handle.stack) {
        walkRoutes(layer.handle.stack);
      }
    }
  };

  walkRoutes(app.router.stack);

  assert.ok(routePaths.includes('GET /verify/:certificateId'));
  assert.ok(routePaths.includes('POST /:enrollmentId/issue'));
});

test('livelihood workflow and source document routes are mounted', () => {
  const routePaths = [];
  const walkRoutes = (stack) => {
    for (const layer of stack) {
      if (layer.route) {
        Object.keys(layer.route.methods).forEach((method) => routePaths.push(`${method.toUpperCase()} ${layer.route.path}`));
      } else if (layer.handle && layer.handle.stack) {
        walkRoutes(layer.handle.stack);
      }
    }
  };
  walkRoutes(app.router.stack);

  assert.ok(routePaths.includes('GET /review-queue'));
  assert.ok(routePaths.includes('PATCH /:id/review'));
  assert.ok(routePaths.includes('POST /source-certificates'));
  assert.ok(routePaths.includes('GET /pending'));
  assert.ok(routePaths.includes('PATCH /:id/complete'));
  assert.ok(routePaths.includes('POST /:id/check-ins'));
  assert.ok(routePaths.includes('POST /:opportunityId/apply'));
  assert.ok(routePaths.includes('GET /mine'));
  assert.ok(routePaths.includes('GET /profiles/incomplete'));
  assert.ok(routePaths.includes('POST /profile/:id/correction-requests'));
});
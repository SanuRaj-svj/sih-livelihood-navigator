const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

test('video-call request endpoints require authentication', async () => {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    const requests = [
      fetch(`http://127.0.0.1:${port}/api/video-calls/mine`),
      fetch(`http://127.0.0.1:${port}/api/video-calls/pending`),
      fetch(`http://127.0.0.1:${port}/api/video-calls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'Training support' }),
      }),
    ];
    const responses = await Promise.all(requests);
    assert.deepEqual(responses.map((response) => response.status), [401, 401, 401]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('video-call request routes are mounted', () => {
  const routePaths = [];
  const walkRoutes = (stack) => {
    for (const layer of stack) {
      if (layer.route) {
        Object.keys(layer.route.methods).forEach((method) => routePaths.push(`${method.toUpperCase()} ${layer.route.path}`));
      } else if (layer.handle?.stack) {
        walkRoutes(layer.handle.stack);
      }
    }
  };
  walkRoutes(app.router.stack);

  assert.ok(routePaths.includes('POST /'));
  assert.ok(routePaths.includes('GET /mine'));
  assert.ok(routePaths.includes('GET /pending'));
  assert.ok(routePaths.includes('PATCH /:id/accept'));
  assert.ok(routePaths.includes('PATCH /:id/decline'));
});
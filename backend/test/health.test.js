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

  const walkRoutes = (stack, mountPath = '') => {
    for (const layer of stack) {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods);
        methods.forEach((method) => {
          routePaths.push(`${method.toUpperCase()} ${mountPath}${layer.route.path}`);
        });
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        const nextMount = mountPath + (layer.regexp && typeof layer.regexp.source === 'string' && layer.regexp.source !== '/^\\/.*?\//' ? layer.regexp.source.replace(/^\^\\\//, '').replace(/\\\/$/, '') : '');
        walkRoutes(layer.handle.stack, nextMount || mountPath);
      }
    }
  };

  walkRoutes(app.router.stack);

  assert.ok(routePaths.some((entry) => entry.includes('GET /api/certificates/verify/')) || routePaths.some((entry) => entry.includes('GET /certificates/verify/')));
  assert.ok(routePaths.some((entry) => entry.includes('POST /api/certificates/:enrollmentId/issue')) || routePaths.some((entry) => entry.includes('POST /certificates/:enrollmentId/issue')));
});
const app = require('../src/app');

const walk = (stack, mountPath = '') => {
  for (const layer of stack) {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods);
      methods.forEach((method) => {
        console.log(`${method.toUpperCase()} ${mountPath}${layer.route.path}`);
      });
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      const source = layer.regexp && typeof layer.regexp.source === 'string' ? layer.regexp.source : '';
      const nextMount = mountPath + (source && source !== '/^\\/.*?\\/' ? source.replace(/^\^\\\//, '').replace(/\\\/$/, '') : '');
      walk(layer.handle.stack, nextMount || mountPath);
    }
  }
};

walk(app.router.stack);

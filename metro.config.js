const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Resolve "three" to the CJS build so the deprecated build/three.js (and its
// console.warn) are never loaded. The "main" entry triggers the warning; use three.cjs.
const projectRoot = __dirname;
const threeCjsPath = path.join(projectRoot, 'node_modules/three/build/three.cjs');

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'three') {
    return { type: 'sourceFile', filePath: threeCjsPath };
  }
  return originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

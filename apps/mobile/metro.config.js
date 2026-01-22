const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const { withNativeWind } = require('nativewind/metro');
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// ✅ EXTEND watchFolders instead of replacing
config.watchFolders = [...config.watchFolders, workspaceRoot];

// ✅ Force single React resolution
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// ✅ Ensure React resolves from mobile app only
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, "node_modules/react"),
  "react-dom": path.resolve(projectRoot, "node_modules/react-dom"),
};

module.exports = withNativeWind(config, { 
  input: './global.css',
  // Disable CSS interop debugging warnings to prevent navigation context serialization errors
  features: {
    transformPercentagePolyfill: false,
  },
});

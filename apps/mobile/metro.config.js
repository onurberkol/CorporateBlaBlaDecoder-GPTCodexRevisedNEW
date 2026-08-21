const { getDefaultConfig } = require('expo/metro-config');

// Expo SDK 54 discovers npm workspaces automatically. Keeping the official
// defaults prevents duplicate native-module resolution in production builds.
module.exports = getDefaultConfig(__dirname);

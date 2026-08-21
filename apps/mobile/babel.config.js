module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated 4 (SDK 54) uses the worklets plugin. It MUST be listed last.
    // If you downgrade to Reanimated 3, switch to 'react-native-reanimated/plugin'.
    plugins: ['react-native-worklets/plugin'],
  };
};

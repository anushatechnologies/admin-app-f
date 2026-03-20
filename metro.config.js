const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Force resolution of 'util' to the node-util package that Metro can handle better
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  util: require.resolve('util/'),
};

module.exports = config;

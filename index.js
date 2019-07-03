const Platform = require('./platform');
const { PLUGIN_NAME, PLATFORM_NAME } = require('./constants');

module.exports = homebridge => homebridge.registerPlatform(
  PLUGIN_NAME,
  PLATFORM_NAME,
  Platform,
  true // ensure platform is registered as a dynamic platform
)


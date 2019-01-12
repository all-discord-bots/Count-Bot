const { Client: { plugin } } = require('klasa');

module.exports = {
	ChannelGateway: require('./GatewayTextChannel'),
	Client: require('./Client'),
	[plugin]: require('./Client')[plugin]
};

/**
 * @external GuildMember
 * @see {@link https://discord.js.org/#/docs/main/master/class/GuildMember}
 */
/**
 * @external Settings
 * @see {@link https://klasa.js.org/#/docs/klasa/master/class/Settings}
 */
/**
 * @external GatewayStorage
 * @see {@link https://klasa.js.org/#/docs/klasa/master/class/GatewayStorage}
 */
/**
 * @external GatewayDriver
 * @see {@link https://klasa.js.org/#/docs/klasa/master/class/GatewayDriver}
 */
/**
 * @external Schema
 * @see {@link https://klasa.js.org/#/docs/klasa/master/class/Schema}
 */
/**
 * @external Collection
 * @see {@link https://discord.js.org/#/docs/main/master/class/Collection}
 */
/**
 * @external GatewayGetPathOptions
 * @see {@link https://klasa.js.org/#/docs/klasa/master/typedef/GatewayGetPathOptions}
 */
/**
 * @external GatewayJSON
 * @see {@link https://klasa.js.org/#/docs/klasa/master/typedef/GatewayJSON}
 */
/**
 * @external SettingsJSON
 * @see {@link https://klasa.js.org/#/docs/klasa/master/typedef/SettingsJSON}
 */

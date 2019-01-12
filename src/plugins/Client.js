const { Client, Schema, util: { mergeDefault } } = require('klasa');
const { CLIENT } = require('./util/constants');

const ChannelGateway = require('./GatewayTextChannel');
Client.defaultChannelSchema = new Schema();

module.exports = class extends Client {

	constructor(options) {
		super(options);
		this.constructor[Client.plugin].call(this);
	}

	static [Client.plugin]() {
		mergeDefault(CLIENT, this.options);
		const { channels } = this.options.gateways;
		const channelSchema = 'schema' in channels ? channels.schema : this.constructor.defaultChannelSchema;

		this.gateways.members = new ChannelGateway(this.gateways, 'channels', channelSchema, channels.provider || this.options.providers.default);
		this.gateways.keys.add('channels');
		this.gateways._queue.push(this.gateways.channels.init.bind(this.gateways.channels));
	}

};

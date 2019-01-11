const { Event } = require('klasa');
const chalk = require('chalk');

module.exports = class extends Event {

	run(event) { //err) {
		//this.client.emit('error', `Disconnected | ${event.code}: ${event.reason}`);
		switch (event.code) {
			case 0:
				this.client.logger.severe("Gateway Error");
				if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
					embed: {
						color: 15684432,
						timestamp: new Date(),
						title: `Error`,
						description: `\`[${event.code}] Gateway Error\``
					}
				});
				break;
			case 1000:
				this.client.logger.info("Disconnected from Discord cleanly.");
				if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
					embed: {
						color: 5892826,
						timestamp: new Date(),
						title: `Info`,
						description: `\`[${event.code}] Disconnected from Discord cleanly.\``
					}
				});
				break;
			case 4000:
				this.client.logger.warn('Unknown Error - We\'re not sure what went wrong. Try reconnecting?');
				if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
					embed: {
						color: 12696890,
						timestamp: new Date(),
						title: `Warn`,
						description: `\`[${event.code}] Unknown Error\``
					}
				});
				break;
			case 4001:
				this.client.logger.warn('Unknown Opcode - You sent an invalid Gateway opcode or an invalid payload for an opcode. Don\'t do that!');
				if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
					embed: {
						color: 12696890,
						timestamp: new Date(),
						title: `Warn`,
						description: `\`[${event.code}] Unknown Opcode\``
					}
				});
				break;
			case 4002:
				this.client.logger.warn('Decode Error - You sent an invalid payload to us. Don\'t do that!');
				if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
					embed: {
						color: 12696890,
						timestamp: new Date(),
						title: `Warn`,
						description: `\`[${event.code}] Decode Error\``
					}
				});
				break;
			case 4003:
				this.client.logger.severe('Not Authenticated - You sent us a payload prior to identifying.');
				if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
					embed: {
						color: 15684432,
						timestamp: new Date(),
						title: `Error`,
						description: `\`[${event.code}] Not Authenticated\``
					}
				});
				return this.client.shutdown(false);
			case 4004:
				this.client.logger.severe(`Authentication Failed - The account token sent with your identify payload is incorrect.`);
				if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
					embed: {
						color: 15684432,
						timestamp: new Date(),
						title: `Error`,
						description: `\`[${event.code}] Failed to authenticate with Discord. Please follow the instructions at 'https://discordapp.com/developers' and re-enter your token by running 'yarn run config'.\``
					}
				});
				return this.client.shutdown(false);
			case 4005:
				this.client.logger.info('Already Authenticated - You sent more than one identify payload. Don\'t do that!');
				if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
					embed: {
						color: 5892826,
						timestamp: new Date(),
						title: `Info`,
						description: `\`[${event.code}] Already Authenticated\``
					}
				});
				break;
			case 4006:
				this.client.logger.severe('Session No Longer Valid - Your session is no longer valid.');
				if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
					embed: {
						color: 15684432,
						timestamp: new Date(),
						title: `Error`,
						description: `\`[${event.code}] Session Not Valid\``
					}
				});
				break;
			case 4007:
				this.client.logger.warn('Invalid Sequence Number - The sequence sent when resuming the session was invalid. Reconnect and start a new session.');
				if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
					embed: {
						color: 12696890,
						timestamp: new Date(),
						title: `Warn`,
						description: `\`[${event.code}] Invalid Sequence Number\``
					}
				});
				break;
			case 4008:
				this.client.logger.info('Rate Limited - Woah nelly! You\'re sending payloads to us too quickly. Slow it down!');
				if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
					embed: {
						color: 5892826,
						timestamp: new Date(),
						title: `Info`,
						description: `\`[${event.code}] Rate Limited\``
					}
				});
				break;
			case 4009:
				this.client.logger.info('Session Timeout - Your session timed out. Reconnect and start a new one.');
				if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
					embed: {
						color: 5892826,
						timestamp: new Date(),
						title: `Error`,
						description: `\`[${event.code}] Session Timeout\``
					}
				});
				break;
			case 4010:
				this.client.logger.warn('Invalid Shard - You sent us an invalid shard when identifying.');
				if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
					embed: {
						color: 15684432,
						timestamp: new Date(),
						title: `Warn`,
						description: `\`[${event.code}] Invalid Shard\``
					}
				});
				break;
			case 4011:
				this.client.logger.severe('Sharding Required - The session would have handled too many guilds - you are required to shard your connection in order to connect.');
				if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
					embed: {
						color: 15684432,
						timestamp: new Date(),
						title: `Error`,
						description: `\`[${event.code}] Sharding is required!\``
					}
				});
				return this.client.shutdown(false);
			default:
				this.client.logger.warn(`Disconnected from Discord with code ${event.code}: ${event.reason}`);
				if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
					embed: {
						color: 12696890,
						timestamp: new Date(),
						title: `Warn`,
						description: `\`Disconnected from Discord with code ${event.code}: ${event.reason}\``
					}
				});
				break;
		}
		this.client.shutdown();
	}

};

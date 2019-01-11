const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { emitter: process });
	}

	run(err) {
		if (!err) return;
		if (err.name === 'DiscordAPIError') return;
		//logger.severe(`Uncaught Promise error:\n${err.stack || err.toString()}`);
		if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
			embed: {
				color: 15684432,
				timestamp: new Date(),
				title: `Unhandled Rejection | Uncaught Promise error:`,
				description: `\`\`\`\n${(err.stack || err.toString()).slice(0, 2048)}\n\`\`\``,
				fields: [
					{
						name: `Error Message:`,
						value: `\`${err.message || 'N/A'}\``
					}
				]
			}
		});
		this.client.emit('error', `Uncaught Promise Error: \n${err.stack || err}`);
	}

	init() {
		if (this.client.options.production) this.disable();
	}

};

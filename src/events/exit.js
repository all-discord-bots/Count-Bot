const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { emitter: process });
	}

	run(code) {
		this.client.logger.info(`Process exited with exit code ${code}`);
		if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
			embed: {
				color: 12696890,
				timestamp: new Date(),
				title: `Process Exited`,
				description: `\`Process exited with exit code ${code}\``
			}
		});
		this.client.shutdown();
	}

	init() {
		if (this.client.options.production) this.disable();
	}

};

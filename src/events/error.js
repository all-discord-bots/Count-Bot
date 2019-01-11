const { Event } = require('klasa');

module.exports = class extends Event {
	run(error) {
		try {
			this.client.console.error(error);
			//console.error(error.stack ? error.stack : error.toString());
			if (this.client.ready && this.client.channels.has(process.env.BOT_CONSOLE_LOG)) this.client.channels.get(process.env.BOT_CONSOLE_LOG).send({
				embed: {
					color: 15684432,
					timestamp: new Date(),
					title: `Error`,
					description: `\`${error.toString()}\``
				}
			});
		} catch (error) {
			return console.error(error.stack ? error.stack : error.toString());
		}
	}

	init() {
		if (!this.client.options.consoleEvents.error) this.disable();
	}
};

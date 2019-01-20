const { Event } = require('klasa');

module.exports = class extends Event {
	async run(message) {
		this.client.managers.stats.increment(`messages-${this.client.user === message.author ? 'sent' : 'received'}`);
		if (message.mentions.has(this.client.user.id)) {
			this.client.managers.stats.increment('mentions');
		}
		try {
			if (this.client.ready) this.client.monitors.run(message);
		} catch (error) {
			console.error(error.stack ? error.stack : error.toString());
		}
	}

};

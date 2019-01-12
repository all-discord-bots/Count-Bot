const { Event } = require('klasa');

module.exports = class extends Event {
	async run(msg) {
		this.client.managers.stats.increment(`messages-${this.client.user === msg.author ? 'sent' : 'received'}`);
		if (msg.mentions.has(this.client.user.id)) {
			this.client.managers.stats.increment('mentions');
		}
		try {
			if (this.client.ready) this.client.monitors.run(msg);
		} catch (error) {
			console.error(error.stack ? error.stack : error.toString());
		}
	}

};

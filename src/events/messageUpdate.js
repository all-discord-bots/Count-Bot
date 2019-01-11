const { Event } = require('klasa');

module.exports = class extends Event {

	async run(old, message) {
		if (!global.users_messages.has(old.channel.id)) global.users_messages.set(old.channel.id, new Map());
		global.users_messages.get(old.channel.id).set(old.author.id, Date.now());
		if (this.client.ready && old.content !== message.content) this.client.monitors.run(message);
	}

};

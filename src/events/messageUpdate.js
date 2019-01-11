const { Event } = require('klasa');

module.exports = class extends Event {

	async run(old, message) {
		if (this.client.ready && old.content !== message.content && !message.guild.settings.countingChannels.includes(message.channel)) this.client.monitors.run(message);
	}

};

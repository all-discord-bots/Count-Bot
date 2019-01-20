const { Event } = require('klasa');

module.exports = class extends Event {

	async run(old, message) {
		const { settings: { cantCountRole, countingChannels } } = message.guild;
		if (countingChannels.length && (countingChannels.includes(message.channel) || countingChannels.includes(message.channel.id))) {
			if (cantCountRole) await message.member.roles.add(cantCountRole.id, 'This user tried to edit their counting message!');
			if (message.channel.lastMessageID === message.id) {
				await message.channel.settings.update('currentNumber', message.channel.settings.currentNumber - 1);
				//message.channel.currentNumber = message.channel.currentNumber - 1;
				//message.channel.sync();
			}
			await message.member.settings.reset('messups');
			return await message.delete({ reason: 'Wrong number!' });
		}
		if (this.client.ready && old.content !== message.content) this.client.monitors.run(message);
	}

};

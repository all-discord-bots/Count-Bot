const { Command } = require('klasa');
const { TextChannel } = require('discord.js');

module.exports = class extends Command {
	constructor (...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Sets the max amount of mistakes a user can get before getting the can\'t count role.',
			usage: '<TextChannel:string> [Mistakes:float]',
			guarded: true
		});
		this.needsMember = true;
	}

	async run (message, [userOrChannel, mistakes]) {
		const items = [...await this.client.utils.get_instances(message, userOrChannel, { show_hidden: false, get_types: ['channels'], guild_only: ['channels'], channel_types: ['text'] } )];
		return this._configure(message, items, mistakes);
	}
	
	async _block (message, instance, mistakes) {
		if (instance.length > 6) instance.splice(6, instance.length);
		let results = '';
		let i = 0;
		await instance.map((item) => results += `\n${++i}. ${item}`)
		if (instance.length > 1) {
			await message.prompt({
				embed: {
					color: 0x43B581,
					description: `Multiple items found. Please choose one of the following, or type cancel.${results}`
				}
			}).then((choices) => {
				if (choices.content.toLowerCase() === 'cancel' || !parseInt(choices.content)) return message.send('Cancelled command.');
				const answer = instance[parseInt(choices.content)-1];
				if (parseInt(choices.content)-1 < 0 || parseInt(choices.content)-1 > instance.length-1) return message.send('Cancelled command.');
				if (answer instanceof TextChannel) return this._configuration(message, answer, mistakes);
			}).catch(console.error);
		} else if (instance.length === 1) {
			if (instance[0] instanceof TextChannel) return this._configuration(message, instance[0], mistakes);
		}
	}

	async _configuration (message, channel, mistakes = 0) {
		const { settings: { countingChannels }, settings } = message.guild;
		if (!countingChannels.length || (countingChannels.length && !countingChannels.includes(channel.id))) {
			return message.send({
				embed: {
					color: 0xCC0F16,
					description: 'That channel is not a counting channel!',
				},
			});
		}
		channel.currentNumber = channel.currentNumber;
		channel.maxMessups = mistakes;
		await settings.update('countingChannels', channel);
		return message.send({
			embed: {
				color: 0x43B581,
				description: `Done! ${channel} \`#${channel.name}\` has been set.`,
			},
		});
		return message.send({
			embed: {
				color: 0x43B581,
				description: `Done! the max amount of mistakes has been set to ${mistakes}.`,
			},
		});
	}
};

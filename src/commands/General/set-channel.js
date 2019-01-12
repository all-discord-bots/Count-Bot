const { Command } = require('klasa');
const { TextChannel } = require('discord.js');

module.exports = class extends Command {
	constructor (...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Set the channels that you want to count in.',
			usage: '<TextChannel:string>',
			permissionLevel: 7,
			aliases: ['set-counting-channel','setcountingchannel','setchannel'],
			guarded: true
		});
		this.needsMember = true;
	}

	async run (message, [userOrChannel]) {
		const items = [...await this.client.utils.get_instances(message, userOrChannel, { show_hidden: false, get_types: ['channels'], guild_only: ['channels'], channel_types: ['text'] } )];
		return this._setchannel(message, items);
	}
	
	async _setchannel (message, instance) {
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
				if (answer instanceof TextChannel) return this._setChannel(message, answer);
			}).catch(console.error);
		} else if (instance.length === 1) {
			if (instance[0] instanceof TextChannel) return this._setChannel(message, instance[0]);
		}
	}

	async _setChannel (message, channel) {
		const { settings: { countingChannels }, settings } = message.guild;
		if (countingChannels.includes(channel.id)) {
			return message.send({
				embed: {
					color: 0xCC0F16,
					description: 'That channel is already set!',
				},
			});
		}
		channel.currentNumber = 0;
		channel.maxMessups = Infinity;
		await settings.update('countingChannels', channel, { action: 'add' });
		return message.send({
			embed: {
				color: 0x43B581,
				description: `Done! ${channel} \`#${channel.name}\` has been set.`,
			},
		});
	}
};

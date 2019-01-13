const { Command, util: { mergeDefault } = require('klasa');
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
		/*if (countingChannels.length) {
			const check_channel = countingChannels.map((channel) => channel.includes(`"id":"${channel.id}"`));
			if (check_channel.includes(true)) {
				return message.send({
					embed: {
						color: 0xCC0F16,
						description: 'That channel is already set!',
					},
				});
			}
		}*/
		if (countingChannels.includes(channel.id) && this.client.countingChannels.has(channel.id)) {
			return message.send({
				embed: {
					color: 0xCC0F16,
					description: 'That channel is already set!',
				},
			});
		}
		if (channel.topic === null) {
			channel.currentNumber = 0;
			channel.lastNumber = 0;
			channel.maxMessups = Infinity;
			channel.countBy = 1;
			channel.countBase = 'decimal';
			channel.startAt = 0;
		} else {
			const count_by = channel.topic.split('\n').filter((m) => m.toLowerCase().startsWith('by: ') || m.toLowerCase().startsWith('countby: ')).toString().replace(/(countby: |by: )/i, '');
			const count_base = channel.topic.split('\n').filter((m) => m.toLowerCase().startsWith('base: ') || m.toLowerCase().startsWith('countbase: ')).toString().replace(/(countbase: |base: )/i, '');
			const max_messups = channel.topic.split('\n').filter((m) => m.toLowerCase().startsWith('maxmistakes: ') || m.toLowerCase().startsWith('maxmessups: ')).toString().replace(/(maxmistakes: |maxmessups: )/i, '');
			const start_at = channel.topic.split('\n').filter((m) => m.toLowerCase().startsWith('startcountat: ') || m.toLowerCase().startsWith('startat: ')).toString().replace(/(startat: |startcountat: )/i, '');
			channel.currentNumber = 0;
			channel.lastNumber = 0;
			channel.maxMessups = max_messups !== '' && !(parseFloat(max_messups) <= 0) ? parseFloat(max_messups) : Infinity;
			channel.countBy = count_by !== '' && count_by != '0' && count_by != '-0' ? parseInt(count_by) : 1;
			channel.countBase = count_base !== '' && !parseInt(count_base) ? String(count_base) : 'decimal';
			channel.startAt = start_at !== '' ? parseInt(start_at) : 0;
		}
		//channel.currentNumber = 0;
		//channel.maxMessups = Infinity;
		/*const copied_channel = {
			"id": channel.id,
			"currentNumber": 0,
			"lastNumber": 0,
			"maxMessups": Infinity,
			"countBy": 1,
			"countBase": 'decimal'
		};*/
		//await settings.update('countingChannels', JSON.stringify(copied_channel), { action: 'add' });
		if (!countingChannels.includes(channel.id)) await settings.update('countingChannels', channel, { action: 'add' });
		if (!this.client.countingChannels.has(channel.id)) this.client.countingChannels.set(channel.id, channel);
		return message.send({
			embed: {
				color: 0x43B581,
				description: `Done! ${channel} \`#${channel.name}\` has been set.`,
			},
		});
	}
};

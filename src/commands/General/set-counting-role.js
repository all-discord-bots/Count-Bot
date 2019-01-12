const { Command } = require('klasa');
const { Role } = require('discord.js');

module.exports = class extends Command {
	constructor (...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Set the role that a user will get if they mess up the max amount of times.',
			usage: '<TextChannel:string>',
			permissionLevel: 7,
			aliases: ['set-cant-count','setcantcount','setcountingrole'],
			guarded: true
		});
		this.needsMember = true;
	}

	async run (message, [userOrChannel]) {
		const items = [...await this.client.utils.get_instances(message, userOrChannel, { show_hidden: false, get_types: ['roles'], guild_only: ['roles'] } )];
		return this._setcantcount(message, items);
	}
	
	async _setcantcount (message, instance) {
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
				if (answer instanceof Role) return this._setCantCount(message, answer);
			}).catch(console.error);
		} else if (instance.length === 1) {
			if (instance[0] instanceof Role) return this._setCantCount(message, instance[0]);
		}
	}

	async _setCantCount (message, role) {
		const { settings: { cantCountRole }, settings } = message.guild;
		if (cantCountRole.includes(role.id)) {
			return message.send({
				embed: {
					color: 0xCC0F16,
					description: 'That role is already being used for can\'t count!',
				},
			});
		}
		await settings.update('cantCountRole', role, message.guild);
		return message.send({
			embed: {
				color: 0x43B581,
				description: `Done! ${role} \`@${role.name}\` will now be used for can't count.`,
			},
		});
	}
};

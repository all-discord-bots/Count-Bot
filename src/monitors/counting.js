const { Util: { escapeMarkdown, basename }, MessageEmbed } = require("discord.js");
const { Monitor } = require("klasa");
const { STRIP } = require("../lib/Constants");
const RE2 = require('re2');

module.exports = class extends Monitor {
	constructor (...args) {
		super(...args, {
			enabled: true,
			ignoreBots: true,
			ignoreSelf: true,
			ignoreEdits: false,
			ignoreOthers: false,
			ignoreWebhooks: true,
			ignoreBlacklistedUsers: false,
			//ignoreBlacklistedGuilds: true,
		});

		this.cache = new Map();
		this.debug = false;
	}

	async run (message) {
		try {
			if (!message.guild) return;
			const { settings: { countingChannels } } = message.guild;
			if (!countingChannels.includes(message.channel.id)) return;
			if (this.client.settings.blacklist.length && (this.client.settings.blacklist.includes(message.author.id) || this.client.settings.blacklist.includes(message.guild.id))) return;
			this._beginCounting(message);
		} catch (e) {
			throw e;
		}
	}
	
	async _beginCounting (message) {
		const { channel: { settings: { maxMessups, currentNumber, countingBase, countBy, currentNumber, lastNumber } }, channel, guild: { settings: { cantCountRole } }, guild, member: { settings: { messups }, settings }, member } = message;
		const number = this.parseNumber(message);
		const last_number = lastNumber;
		if ((message.content.length !== last_number.toString().length && number !== last_number) || !this.isNextInSequence(number) || message.attachments.size || message.embeds.length || RegExp(/([\s\+\=\_\`\~\!\@\#\$\%\^\&\*\(\)\\\|\]\[\{\}\'\"\;\:\?\/\,\<\>\t\r\na-z])/i).test(message.content) || RegExp(/(^(-0+|-{2,}))/i).test(message.content) || (message.content.length >= 2 && RegExp(/^(-?0+)/i).test(message.content)) || (!countBy.toString().startsWith('-') && message.content.includes('-')) || (countBy.toString().startsWith('-') && message.content.startsWith('-') && message.content.split('').filter((char) => char === '-').splice(1).length >= 1) || (!countBy.toString().includes('.') && message.content.includes('.')) || (countBy.toString().includes('.') && message.content.includes('.') && message.content.split('').filter((char) => char === '.').splice(1).length >= 1)) {
			if (maxMessups !== Infinity) {
				if (messups >= maxMessups) {
					if (cantCountRole && channel.permissionsFor(guild.me).has('MANAGE_ROLES')) await member.roles.add(cantCountRole.id, 'This user can\'t count correctly');
					await settings.reset('messups');
				} else {
					await settings.update('messups', messups + 1);
				}
			}
			return this.deleteMessage(message);
		}
		currentNumber = this.currentCount(message);
		return channel.sync();
	}
	
	parseNumber(message) {
		const { channel: { settings: { countBase, countBy } } } = message;
		if (countBy % 1 !== 0)
			return parseFloat(message.content);

		if (message.content.search(/^\d+\.[1-9]/) !== -1)
			return NaN;
		return parseInt(message.content.replace(/ .*/, ''), countBase);
	}
	
	isNextInSequence(message, number) {
		return number === this.currentCount(message);
	}
	
	currentCount(message) {
		const { channel: { settings: { currentNumber, countBy } } } = message;
		return currentNumber + countBy;
	}
	
	async deleteMessage(message) {
		if (!message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) return;
		await message.delete({ reason: 'Wrong number!' });
	}

};

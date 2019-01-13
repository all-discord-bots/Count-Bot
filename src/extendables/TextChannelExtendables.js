const { Extendable } = require('klasa');
const { TextChannel } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [TextChannel] });
		this.cached_settings = this.guild.settings.get('countingChannels').indexOf(this.id) < 0 ? undefined : this.guild.settings.get('countingChannels')[this.guild.settings.get('countingChannels').indexOf(this.id)];
		this.currentNumber =  this.cached_settings.currentNumber || 0;
		this.maxMessups = this.cached_settings.maxMessups || 0;
		this.countBase = this.cached_settings.countBase || 'decimal';
		this.countBy = this.cached_settings.countBy || 1;
		this.startAt = this.cached_settings.startAt || 0;
	}
}

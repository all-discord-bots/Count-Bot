const { Extendable } = require('klasa');
const { TextChannel } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [TextChannel] });
		this.currentNumber = this.currentNumber || 0;
		this.maxMessups = this.maxMessups || 0;
		this.countBase = this.countBase || 10;
		this.countBy = this.countBy || 1;
		this.startAt = this.startAt || 0;
	}
}

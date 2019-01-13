const { Extendable } = require('klasa');
const { TextChannel } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [TextChannel] });
		const settings = this.guild.settings.get('countingChannels').indexOf(this.id) >= 0 ? this.guild.settings.get('countingChannels')[this.guild.settings.get('countingChannels').indexOf(this.id)] : undefined;
		this._currentNumber = settings.currentNumber || 0;
		this._lastNumber = settings.lastNumber || undefined;
		this._maxMessups = settings.maxMessups || Infinity;
		this._countBase = settings.countBase || 'decimal';
		this._countBy = settings.countBy || 1;
		this._startAt = settings.startAt || 0;
	}

	set currentNumber(number) {
		this._lastNumber = this._currentNumber;
		this._currentNumber = number;
	}

	get currentNumber() {
		return this._currentNumber;
	}
	
	get lastNumber() {
		return this._lastNumber;
	}

	set maxMessups(number) {
		this._maxMessups = number;
	}

	get maxMessups() {
		return this._maxMessups;
	}

	set countBase(base) {
		this._countBase = base;
	}

	get countBase() {
		return this._countBase;
	}

	set countBy(by) {
		this._countBy = by;
	}

	get countBy() {
		return this._countBy;
	}
	
	set startAt(number) {
		this._startAt = number;
	}

	get startAt() {
		return this._startAt;
	}
}

const { Extendable } = require('klasa');
const { TextChannel } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [TextChannel] });
		/*this._currentNumber = this.settings.currentNumber || 0;
		this._lastNumber = this.settings.lastNumber || undefined;
		this._maxMessups = this.settings.maxMessups || Infinity;
		this._countBase = this.settings.countBase || 'decimal';
		this._countBy = this.settings.countBy || 1;
		this._startAt = this.settings.startAt || 0;*/
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
	
	async sync() {
		const { settings: { currentNumber, lastNumber, countBy, countBase, startAt, maxMessups }, settings } = this;
		await settings.update('currentNumber', currentNumber);
		await settings.update('lastNumber', lastNumber);
		await settings.update('countBy', countBy);
		await settings.update('countBase', countBase);
		await settings.update('startAt', startAt);
		await settings.update('maxMessups', maxMessups);
	}
}

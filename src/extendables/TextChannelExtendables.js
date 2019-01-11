const { Extendable } = require('klasa');
const { TextChannel } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [TextChannel] });
		this.current_number = 0;
	}
}

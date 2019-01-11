const { Inhibitor } = require('klasa');

module.exports = class extends Inhibitor {

	run(message, command) {
		const { settings: { blacklist } } = this.client;
		return blacklist.length && (blacklist.includes(message.author.id) || blacklist.includes(message.guild.id));
	}

};

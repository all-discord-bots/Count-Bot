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
      if (message.guild && !message.guild.settings.countingChannels.includes(message.channel)) return;
			if (this.client.settings.blacklist.length && (this.client.settings.blacklist.includes(message.author.id) || this.client.settings.blacklist.includes(message.guild.id))) return;
			this._beginCounting(message);
		} catch (e) {
			throw e;
		}
	}
};

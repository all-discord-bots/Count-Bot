const { Event } = require('klasa');

module.exports = class extends Event {
	async run(msg) {
		this.client.managers.stats.increment(`messages-${this.client.user === msg.author ? 'sent' : 'received'}`);
		//if (msg.channel.type === 'dm') this.client.managers.stats.increment(`direct-messages-sent`);
		//if (msg.channel.type === 'text') this.client.managers.stats.increment(`textchannel-messages-sent`);
		if (msg.mentions.has(this.client.user.id)) {
			this.client.managers.stats.increment('mentions');
			//console.log(`[MENTION] ${msg.author.username} | ${msg.guild ? msg.guild.name : '(DM)'} | #${msg.channel.name || 'N/A'}:\n${msg.cleanContent}`);
		}
		//if (msg.content.toLowerCase() === "highlight pls ss") return msg.channel.send("`SS` ~~--~~ Shorthand for **Screenshot**.\nIf someone says `Please take a ss`, they want a screenshot of what you're seeing!");
		//if (msg.content.toLowerCase() === "highlight nuker?" || msg.content.toLowerCase() === "h nuker?") return msg.channel.send("Click the link.\n\n<https://canary.discordapp.com/channels/339942739275677727/339944237305036812/465157099761041409>")
		/*if ((msg.content.toLowerCase() === ".bork" || msg.content.toLowerCase() === ".blep") && (msg.guild.id === "339376237560463360" || msg.guild.id === "444629538958213150")) {
			const borker = await this.client.users.fetch("293552473942261762");
			borker.send(`${msg.content.toLowerCase() === ".blep" ? "BLEP" : "BORK"} by ${msg.author.tag} in ${msg.channel}`);
			msg.react(msg.content.toLowerCase() === ".bork" ? "bork:450861231998500864" : Math.random() < 0.5 ? "jokerBLEP:464857497610747904" : "cheapBLEP:465853194015211520").catch(() => null);
			return;
		}
		if (msg.content.toLowerCase() === '.thonk') {
			msg.react('thonk:352878018840100866').catch(() => null);
			return;
		}
		if (msg.content.toLowerCase() === '.hecc') {
			msg.react('blobpout:466059369877078016').catch(() => null);
			return;
		}
		if (msg.content.toLowerCase() === ".soam") {
			const ima = await this.client.users.fetch("237372935214596097");
			ima.send(`SOAM received from ${msg.author.tag} in ${msg.channel}`);
			return;
		}
		if (msg.content.toLowerCase() === '.gay') {
			msg.react('gay:350267475373457412').catch(() => null);
			return;
		}*/
		try {
			if (this.client.ready && msg.author != this.client.user && (msg.channel.type === 'dm' || (msg.guild && msg.guild.id === '305129477627969547'))) {
				if (msg.content.length >= 0 && msg.attachments.size >= 0 && msg.embeds.length <= 0) {
					if (this.client.channels.has('516032161321582593')) this.client.channels.get('516032161321582593').send({
						embed: {
							author: {
								name: `${msg.author.username}`,
								url: msg.url ? msg.url : undefined,
								icon_url: msg.author.displayAvatarURL()
							},
							title: `${msg.author.bot ? '<:bot:491157258915414016>' : ''}`,
							description: msg.content.length > 0 ? `${msg.content}` : '',
							timestamp: new Date(),
							color: msg.member ? (msg.member.roles ? msg.member.roles.highest.color : undefined) : undefined,
							footer: {
								text: msg.guild ? `${msg.guild.name} | #${msg.channel.name} | ${msg.id}` : 'Direct Message'
							},
							image: {
								url: msg.attachments.size > 0 ? msg.attachments.first().url : undefined
							}
						}
					});
				} else if (msg.content.length >= 0 && msg.embeds.length > 0 && msg.attachments.size <= 0) {
					if (this.client.channels.has('516032161321582593')) this.client.channels.get('516032161321582593').send(`\`${msg.author.username}\` ${msg.author.bot ? '<:bot:491157258915414016>' : ''} | \`${msg.guild ? `${msg.guild.name}` : 'Direct Message'}\` | \`#${msg.channel.name}\`${msg.content.length > 0 ? '\n\n' + msg.content : ''}`, msg.embeds);
				}
			}
			if (this.client.ready) this.client.monitors.run(msg);
		} catch (error) {
			console.error(error.stack ? error.stack : error.toString());
		}
	}

};

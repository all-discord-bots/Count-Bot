const { Event } = require('klasa');

module.exports = class extends Event {
	async run(guild) {
		try {
			if (!this.client.ready) return;
			console.log(`Left a guild: ${guild.name}`);
			const gusers = guild.members.filter((user) => user.user ? !user.user.bot : !user.bot).size; // get only users and exclude bots
			const gbots = guild.members.filter((user) => user.user ? user.user.bot : user.bot).size; // get all bots excluding users
			if (this.client.channels.has(process.env.BOT_SERVER_LOG)) this.client.channels.get(process.env.BOT_SERVER_LOG).send({
				embed: {
					color: 15684432,
					title: 'Removed',
					timestamp: new Date(),
					description: `${guild.name} (${guild.id})\n\`${gusers} members   -   ${gbots} bots  (${Math.floor((gbots/guild.memberCount)*100)}%)\`\n\nOwner: ${guild.owner}  \`[${guild.owner.user.username}#${guild.owner.user.discriminator}]\``
				}
			}).catch((err) => console.error(err.toString()));
			client.user.setPresence({
				activity: {
					name: `${this.client.guilds.size.toLocaleString()} server${this.client.guilds.size === 1 ? '' : 's'}`,
					type: 3
				},
				status: 'online'
			}).then(() => {
				console.log(`Successfully updated the bots presence.`);
			}).catch((err) => {
				console.error(err.toString());
			});
			if (this.client.ready && guild.available && !this.client.options.preserveSettings) guild.settings.destroy().catch(() => null);
		} catch (error) {
			console.error(error.stack ? error.stack : error.toString());
		}
	}
};

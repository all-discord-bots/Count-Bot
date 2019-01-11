const { Event } = require('klasa');

module.exports = class extends Event {
	async run(guild) {
		try {
			if (!guild.available) return;
			const { settings: { blacklist } } = this.client;
			if (blacklist.length && blacklist.includes(guild.id || guild)) return await guild.leave();
			//this.client.emit('warn', `Blacklisted guild detected: ${guild.name} [${guild.id}]`);
			console.log(`Joined a new guild: ${guild.name}`);
			const gusers = guild.members.filter((user) => user.user ? !user.user.bot : !user.bot).size; // get only users and exclude bots
			const gbots = guild.members.filter((user) => user.user ? user.user.bot : user.bot).size; // get all bots excluding users
			if (this.client.channels.has(process.env.BOT_SERVER_LOG)) this.client.channels.get(process.env.BOT_SERVER_LOG).send({
				embed: {
					color: 6732650,
					title: 'Added',
					timestamp: new Date(),
					description: `${guild.name} (${guild.id})\n\`${gusers} members   -   ${gbots} bots  (${Math.floor((gbots/guild.memberCount)*100)}%)\`\n\nOwner: ${guild.owner}  \`[${guild.owner.user.tag}]\``
				}
			}).catch(console.error);
		} catch (error) {
			console.error(error.stack ? error.stack : error.toString());
		}
	}
};

const { Event } = require('klasa');

module.exports = class extends Event {
	async run(guild) {
		try {
			if (guild.id != process.env.MAIN_SERVER_ID) return;
			this.client.users.get(process.env.BOT_OWNER_ID).send(`<@${process.env.BOT_OWNER_ID}>, \`${guild.name} [${guild.id}]\` is currently unavailable!`);
		} catch (error) {
			console.error(error.stack ? error.stack : error.toString());
		}
	}
};

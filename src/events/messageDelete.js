const { Event } = require('klasa');

module.exports = class extends Event {

	async run(message) {
		if (this.client.ready) {
			if (message.guild.me.permissions.has('VIEW_AUDIT_LOG', true)) {
				const entry = await message.guild.fetchAuditLogs({ type: 'MESSAGE_DELETE' }).then((audit) => audit.entries.first());
				let user = "";
				if (entry.extra.channel.id === message.channel.id && (entry.target.id === message.author.id) && (entry.createdTimestamp > (Date.now() - 5000)) && (entry.extra.count >= 1)) {
					user = entry.executor;
				} else {
					user = message.author;
				}
				message.deleted_by = user;
				if (entry.reason !== 'Wrong number!' && message.guild.settings.countingChannels.length && (message.guild.settings.countingChannels.includes(message.channel) || message.guild.settings.countingChannels.includes(message.channel.id))) {
					if (!user.bot && message.guild.settings.cantCountRole) await message.guild.members.get(user.id).roles.add(message.guild.settings.cantCountRole.id, 'Tried to delete a count message!');
					await message.guild.members.get(user.id).settings.reset('messups');
				}
			}
			//message.channel.messages.set(message.id, message);
			//this.client.deleted.set(message.author.id, message);
			this.client.deleted.set(message.id, message);
		}
		
		if (message.command && message.command.deletable) {
			for (const msg of message.responses) {
				if (!msg.deleted) msg.delete();
			}
		}
	}
};

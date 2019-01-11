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
			}
			message.channel.messages.set(message.id, message);
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

//u!eval client.shard.broadcastEval("this.shard.id === 40 && process.exit()");
//u!eval client.shard.broadcastEval("this.shard.id === 40 && this.shard.respawn()");

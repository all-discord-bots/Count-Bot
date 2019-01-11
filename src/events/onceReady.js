const { Event, util } = require('klasa');
//const LogMemoryUsage = require('log-memory-usage');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			once: true,
			event: 'ready'
		});
	}

	async run() {
		try {
			try {
				await this.client.fetchApplication();
				if (!this.client.options.ownerID) this.client.options.ownerID = this.client.application.owner.id;
			} catch (error) {
				console.error(error.stack ? error.stack : error.toString());
				await this.client.fetchApplication();
				if (!this.client.options.ownerID) this.client.options.ownerID = this.client.application.owner.id;
				
			}

			this.client.settings = this.client.gateways.clientStorage.get(this.client.user.id, true);
			// Added for consistency with other datastores, Client#clients does not exist
			this.client.gateways.clientStorage.cache.set(this.client.user.id, this.client);
			await this.client.gateways.sync();

			// Init all the pieces
			await Promise.all(this.client.pieceStores.filter((store) => !['providers', 'extendables'].includes(store.name)).map((store) => store.init()));
			util.initClean(this.client);
			global.starting = false;
			this.client.ready = true;

			this.client.user.setPresence({
				activity: {
					name: `${this.client.guilds.size.toLocaleString()} server${this.client.guilds.size === 1 ? '' : 's'}`,
					type: 3
				},
				status: 'online'
			}).then(() => {
				console.log(`Successfully updated the bots presence.`);
			}).catch(console.error);

			if (this.client.ready && this.client.channels.has(process.env.BOT_CONNECTION_LOG)) this.client.channels.get(process.env.BOT_CONNECTION_LOG).send({
				embed: {
					color: 6732650,
					title: 'Ready',
					timestamp: new Date(),
					description: `Ready in: \`${parseInt(new Date() - global.startTime)}ms\``
				}
			}).catch(console.error);
			if (this.client.ready) await this.client.guilds.map(async(guild) => await guild.members.fetch({ cache: true }));

			//const status = ['online','idle','dnd']; // 'invisible'

			/*setInterval(async() => {
				await this.client.user.setStatus(status[Math.floor(Math.random() * Math.floor(status.length))]);
			},2000);*/
			//await this.client.user.setStatus('online');

			/*setInterval(() => {
				LogMemoryUsage.check();
			}, 30 * 1000);*/
			// Init the schedule
			await this.client.schedule.init();

			if (this.client.options.readyMessage !== null) {
				this.client.emit('log', util.isFunction(this.client.options.readyMessage) ? this.client.options.readyMessage(this.client) : this.client.options.readyMessage);
			}

			this.client.emit('klasaReady');
		} catch (error) {
			console.error(error.stack ? error.stack : error.toString());
		}
	}

};

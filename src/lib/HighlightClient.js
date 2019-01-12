const { Client, Schema , util: { sleep, mergeDefault } } = require("klasa");
//const wait = ms => new Promise(_ => setTimeout(_, ms));
const ChannelGateway = require('./extensions/ChannelGateway');
const os = require("os");

Client.defaultChannelSchema = new Schema();

module.exports = class HighlightClient extends Client {
	mergeDefault({ CLIENT: { gateways: { channels: {} } } }, this.options);
	const { channels } = this.options.gateways;
	const channelSchema = 'schema' in channels ? channels.schema : this.constructor.defaultChannelSchema;
	this.gateways.members = new ChannelGateway(this.gateways, 'channels', channelSchema, channels.provider || this.options.providers.default);
	this.gateways.keys.add('channels');
	this.gateways._queue.push(this.gateways.channels.init.bind(this.gateways.channels));
	
	async getCPUUsage () {
		const { idle: startIdle, total: startTotal } = getCPUInfo();
		await sleep(1000);
		const { idle: endIdle, total: endTotal } = getCPUInfo();
		return 1 - ((endIdle - startIdle) / (endTotal - startTotal));
	}
	
	start() {
		if (!this.config) return false;
		
		this.login(process.env.BOT_TOKEN)
			.then(console.log)
			.catch(console.error);
		return true;
	}
	
	async shutdown(restart = true) {
		if (this.shuttingDown) return;
		this.shuttingDown = true;
		this.logger.uninject();
		
		if (this.ready) {
			await this.destroy();
		}
		
		if (restart) {
			console.log('Process has exited. Rebooting... (3 seconds)');
			await sleep(3000);
			this.start();
		} else {
			console.log('Client has exited cleanly.');
			process.exit(0);
		}
	}
};

function getCPUInfo () {
	let cpus = os.cpus();

	let user = 0, nice = 0, sys = 0, idle = 0, irq = 0, total = 0;

	for (let i = 0; i < cpus.length; i++) {
		user += cpus[i].times.user;
		nice += cpus[i].times.nice;
		sys += cpus[i].times.sys;
		irq += cpus[i].times.irq;
		idle += cpus[i].times.idle;
	}

	total = user + nice + sys + idle + irq;

	return { total, idle };
}

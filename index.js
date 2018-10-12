// let readyAt = new Date();

const config = require('./config.json'),
	Eris = require('eris'),
	bot = new Eris(config.token, {
		messageLimit: 0
	}),
	CountingChannelManager = require('./CountingChannelManager');

let countingChannels = new Map();

const fs = require("fs");
let messups = JSON.parse(fs.readFileSync("./messups.json", "utf8"));

bot.once('ready', () => {
	console.info('Counting bot connected');
	//var channelone = bot.channels.get('410125427777077248'); // counting_bot_status_log channel
	bot.editStatus("online", { name: "1 2 3...", type: 0 });
	// console.log(`${new Date() - readyAt`});
	return bot.guilds.forEach((g) => {
		return g.channels.filter((c) => c.name.startsWith('counting')).forEach((c) => {
			let manager = new CountingChannelManager(c);
			manager.init();
			return countingChannels.set(c.id, manager);
		});
	});
});

bot.on('disconnected', () => {
	console.warn('Counting bot disconnected');
});

bot.on('channelCreate', (channel) => {
	if (channel.name.startsWith('counting')) {
		let manager = new CountingChannelManager(channel);
		manager.init();
		return countingChannels.set(channel.id, manager);
	}
});

bot.on('messageCreate', (message) => {
	if (message.channel.type !== 'text') return;
	if (message.author.bot) return;
	if (message.channel.id == "410125427777077248") return;
	if (countingChannels.has(message.channel.id)) {
		return countingChannels.get(message.channel.id).handleNewMessage(message);
	}
});

bot.once('messageUpdate', (message, oldMessage) => {
	if (message.channel.type !== 0) return;
	//if (message.author.bot) return;
	if (message.id === message.channel.lastMessageID) {
		message.channel.guild.roles.map((role) => role.id).forEach((value,index) => {
			if (message.channel.guild.roles.get(`${value}`).name === "can't count") {
				message.member.addRole(`${value}`);
				if (messups[message.channel.guild.id] && messups[message.channel.guild.id][message.author.id]) {
					messups[message.channel.guild.id][message.author.id].messups = 0;
				}
			}
		});
		return message.delete();
	}
});

/*bot.once('messageDelete', (message) => {
	if (message.channel.type !== 'text') return;
	if (message.author.bot) return;
	message.channel.guild.roles.map((role) => role.id).forEach((value,index) => {
		if (message.channel.guild.roles.get(`${value}`).name === "can't count") {
			message.member.addRole(`${value}`); // "381975847977877524"
		}
	});
});*/

process.on("uncaughtException", (err) => {
	bot.emit("error", err)
	process.exit(1)
});

process.on("unhandledRejection", (err) => {
	bot.emit("error", err)
});

bot.on("error", (err) => {
	console.warn(err.stack);
});

//bot.on("message", message => {
//  if (message.author.bot) return;
//if (message.content === ":num") {
//return countingChannels.get(message.channel.id).handleGetNum(bot);
//}
//});

//bot.on('messageDelete', message => {
//  if (countingChannels.has(message.channel.id)) {
//    message.channel.guild.members.get(message.author.id).addRole("381975847977877524");
//  }
  //return countingChannels.get(message.channel.id).handleDelMessage(message);
//    bot.createMessage("403757067225006101", `<@${message.author.id}>: **${message.content}**`);
//});

bot.connect();

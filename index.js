// let readyAt = new Date();

const config = require('./config.json');
//const fse = require('fs-extra');
const { Client } = require('discord.js');
const CountingChannelManager = require('./CountingChannelManager');

const client = new Client({
	messageCacheMaxSize: 10
});

client.login(process.env.TOKEN);

const countingChannels = new Map();
const messups = global.messups = new Collection();//JSON.parse(fse.readJsonSync("./messups.json", "utf8"));

bot.once('ready', async() => {
	console.info('Counting bot connected');
	bot.user.setPresence({ activity: { name: `1 2 3...`, type: 0 }, status: 'online' }).then(() => {
		console.log(`Successfully updated the bots presence.`);
	}).catch((err) => {
		console.error(err.toString());
	});
	await bot.channels.filter((channel) => channel.type === 'text' && channel.name.startsWith('counting')).map((channel) => bot.emit('setChannelManager', channel));
});

bot.on('setChannelManager', (channel) => {
	const manager = new CountingChannelManager(channel);
	manager.init();
	return countingChannels.set(channel.id, manager);
});

bot.on('giveMemberCantCount', async (message, member) => {
	const role = await message.guild.roles.filter((role) => role.name === "can't count").map((role) => role);
	if (!role.length) return;
	await member.roles.add(role[0], 'can\'t count');
});

bot.on('handleMessage', (message) => {
	if (message.channel.type !== 'text') return;
	if (message.author.bot) return;
	if (countingChannels.has(message.channel.id)) return countingChannels.get(message.channel.id).handleNewMessage(message);
});

bot.on('disconnected', () => {
	console.warn('Counting bot disconnected');
});

bot.on('channelCreate', (channel) => {
	if (channel.name.startsWith('counting')) bot.emit('setChannelManager', channel);
});

/*
These are for editPermission. These ones have `Send Messages` denied.
Deny: 537319505
Allow: 268510208
*/
bot.on('message', (message) => {
	//if (message.channel.type !== 'text') return;
	//if (message.author.bot) return;
	//if (message.author.id === "269247101697916939" && message.content === 'c!current') return bot.createMessage(message.channel.id, `${countingChannels.get(message.channel.id).currentNumber()}`);
	//if (countingChannels.has(message.channel.id)) {
		/*if (message.channel.id === '360228611489267713' && (message.channel.permissionOverwrites.get(bot.user.id).allow.bitfield !== 268512256 || message.channel.permissionOverwrites.get(bot.user.id).deny.bitfield !== 537317457)) {
			message.channel.editPermission(bot.user.id, 268512256, 537317457, 'member');
		}*/
		//return countingChannels.get(message.channel.id).handleNewMessage(message);
	//}
	bot.emit('handleMessage', message);
});

bot.on('messageUpdate', (newMessage, oldMessage) => {
	//if (message.channel.type !== 0) return;
	//if (message.author.bot) return;
	if (countingChannels.has(newMessage.channel.id)) {
		/*if (message.channel.id === '360228611489267713' && (message.channel.permissionOverwrites.get(bot.user.id).allow.bitfield !== 268512256 || message.channel.permissionOverwrites.get(bot.user.id).deny.bitfield !== 537317457)) {
			message.channel.editPermission(bot.user.id, 268512256, 537317457, 'member');
		}*/
		if (newMessage.id === newMessage.channel.lastMessageID) {
			
			if (newMessage.channel.guild.roles.get(`${role_id}`)) {
				newMessage.member.addRole(`${role_id}`);
				if (messups[newMessage.channel.guild.id] && messups[newMessage.channel.guild.id][newMessage.author.id]) {
					messups[newMessage.channel.guild.id][newMessage.author.id].messups = 0;
				}
			}
			countingChannels.get(newMessage.channel.id).setDeletedBy(newMessage, "bot");
			newMessage.delete();
			/*return message.delete().then((m) => {
				//await countingChannels.get(message.channel.id).recalculateNextNumber(message);
				countingChannels.get(m.channel.id).recalculateNextNumber(m);
			});*/
			//return bot.createMessage(message.channel.id, `${countingChannels.get(message.channel.id).currentNumber()}`);
			return countingChannels.get(newMessage.channel.id).recalculateNextNumber(newMessage);
		}
		countingChannels.get(newMessage.channel.id).setDeletedBy(newMessage, "bot");
		return newMessage.delete();
	}
});

bot.on('messageDelete', (message) => {
	//if (message.channel.type !== 'text') return;
	//if (message.author.bot) return;
	if (countingChannels.has(message.channel.id)) {
		if (message.channel.id === '360228611489267713' && (message.channel.permissionOverwrites.get(bot.user.id).allow.bitfield !== 268512256 || channel.permissionOverwrites.get(id).deny.bitfield !== 537317457)) {
			message.channel.editPermission(bot.user.id, 268512256, 537317457, 'member');
		}
		if (message.id === message.channel.lastMessageID) {
			//console.log(countingChannels.get(message.channel.id).getDeletedBy(message));
			if (countingChannels.get(message.channel.id).getDeletedBy(message) === "bot") return;
			/*message.channel.guild.roles.map((role) => role.id).forEach((value,index) => {
				if (message.channel.guild.roles.get(`${value}`).name === "can't count") {
					message.member.addRole(`${value}`); // "381975847977877524"
					if (messups[message.channel.guild.id] && messups[message.channel.guild.id][message.author.id]) {
						messups[message.channel.guild.id][message.author.id].messups = 0;
					}
				}
			});*/
			return countingChannels.get(message.channel.id).recalculateNextNumber(message);
			//return bot.createMessage(message.channel.id, `${countingChannels.get(message.channel.id).currentNumber()}`);
		}
	}
});

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

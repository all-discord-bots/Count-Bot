// let readyAt = new Date();

const config = require('./config.json');
//const fse = require('fs-extra');
const { Client, Collection } = require('discord.js');
const CountingChannelManager = require('./CountingChannelManager');

const bot = global.bot = new Client({
	messageCacheMaxSize: 10
});

const countingChannels = new Map();
bot.messups = new Collection();
bot.deleted_messages = new Collection();
bot.data = {
	last_number: 0,
	allowed_messups: 3
};

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

bot.on('giveMemberCantCount', async (message) => {
	const role = await message.guild.roles.filter((role) => role.name === "can't count").map((role) => role);
	if (role.length) await message.member.roles.add(role[0], 'can\'t count');
	return bot.messups.set(message.author.id, 0);
});

bot.on('messup', (id) => {
	return bot.messups.set(id, bot.messups.get(id) + 1);
});

//bot.on('resetMessups', (id) => {
//	return bot.messups.set(id, 0);
//});

bot.on('recalculateNumber', (message) => {
	return countingChannels.get(message.channel.id).recalculateNextNumber(message);
});

bot.on('setDeletedBy', (message, by) => {
	bot.deleted_messages.set(message.id, by);
});

bot.on('handleDelete', (message) => {
	bot.emit('setDeletedBy', message, 'bot');
	message.delete('Wrong Number!');
});

bot.on('handleMessage', (message, action) => {
	if (message.channel.type !== 'text') return;
	if (message.author.bot) return;
	if (!bot.messups.get(message.author.id)) bot.messups.set(message.author.id, 0);
	if (countingChannels.has(message.channel.id)) {
		if (action === 'updated') {
			if (message === message.channel.lastMessage) {
				bot.emit('giveMemberCantCount', message);
				bot.emit('handleDelete', message);
				return bot.emit('recalculateNumber', message);
			} else {
				return bot.emit('handleDelete', message);
			}
		} else if (action === 'delete') {
			if (message === message.channel.lastMessage) {
				if (bot.deleted_messages.get(message.id) === 'bot') return;
				bot.emit('giveMemberCantCount', message);
				return bot.emit('recalculateNumber', message);
			}
		}
		return countingChannels.get(message.channel.id).handleNewMessage(bot, message);
	}
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
	return bot.emit('handleMessage', message, 'none');
});

bot.on('messageUpdate', (newMessage, oldMessage) => {
	return bot.emit('handleMessage', newMessage, 'update');
});

bot.on('messageDelete', (message) => {
	return bot.emit('handleMessage', message, 'delete');
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

bot.login(process.env.TOKEN);

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
	debug: false,
	last_number: 0,
	allowed_messups: 3
};
bot.baseMap = {
	'binary': 2,
	'ternary': 3,
	'quaternary': 4,
	'pental': 5,
	'quinary': 5,
	'heximal': 6,
	'senary': 6,
	'oct': 8,
	'octal': 8,
	'decimal': 10,
	'dozenal': 12,
	'duodecimal': 12,
	'hex': 16,
	'hexadecimal': 16,
	'vigesimal': 20,
	'sexagesimal': 60
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
	if (countingChannels.has(channel.id)) countingChannels.delete(channel.id);
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
			if (message.id === message.channel.lastMessageID) {
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

/*
These are for editPermission. These ones have `Send Messages` denied.
Deny: 537319505
Allow: 268510208
*/
bot.on('message', (message) => {
	if (!countingChannels.has(message.channel.id)) {
		if (message.author.bot) return;
		if (message.content.toLowerCase() === 'c!help') return message.channel.send({
										embed: ({
												title: 'help',
												description: 'To start create a channel that starts with the word `counting`. You may choose what counting system you want to use by doing the following.\n`counting-in-[ternary,quaternary,quinary,senary,octal,decimal,dozenal,hexadecimal,vigesimal,sexagesimal]`\n**Example**: `counting-in-hexadecimal`.\nYou may also choose how much to count by, by doing something like `count-by-10` or `count-in-hexadecimal-by-10` or `count-by--10` which you would have to count down by 10.'
										})
									});
	} else {
		return bot.emit('handleMessage', message, 'none');
	}
});

bot.on('messageUpdate', (oldMessage, newMessage) => {
	bot.emit('handleMessage', newMessage, 'update');
});

bot.on('messageDelete', (message) => {
	bot.emit('handleMessage', message, 'delete');
});

bot.on('channelUpdate', (oldChannel, newChannel) => {
	if (newChannel.type !== 'text') return;
	if (oldChannel.name === newChannel.name) return;
	if (newChannel.name.startsWith('counting')) bot.emit('setChannelManager', newChannel);
});

bot.on('channelDelete', (channel) => {
	if (channel.type !== 'text') return;
	if (countingChannels.has(channel.id)) countingChannels.delete(channel.id);
});

bot.on('channelCreate', (channel) => {
	if (channel.type !== 'text') return;
	if (channel.name.startsWith('counting')) bot.emit('setChannelManager', channel);
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

bot.login(process.env.TOKEN);

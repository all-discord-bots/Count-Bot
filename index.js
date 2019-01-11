// let readyAt = new Date();

const config = require('./config.json');
//const fse = require('fs-extra');
const { Client, Collection } = require('discord.js');
const CountingChannelManager = require('./CountingChannelManager');

const bot = global.bot = new Client({
	messageCacheMaxSize: 10
});

const countingChannels = bot.countingChannels = new Map();
bot.messups = new Collection();
bot.deleted_messages = new Collection();
bot.data = {
	debug: true,
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

//bot.notified_owners = [];

bot.once('ready', async() => {
	console.info('Counting bot connected');
	bot.user.setPresence({ activity: { name: `1 2 3...`, type: 0 }, status: 'online' }).then(() => {
		console.log(`Successfully updated the bots presence.`);
	}).catch((err) => {
		console.error(err.toString());
	});
	await bot.channels.filter((channel) => channel.type === 'text' && channel.name.startsWith('counting') && (channel.permissionsFor(bot.user).has('READ_MESSAGE_HISTORY') && channel.permissionsFor(bot.user).has('VIEW_CHANNEL'))).map((channel) => bot.emit('setChannelManager', channel));
});

bot.on('setChannelManager', (channel) => {
	if (countingChannels.has(channel.id)) countingChannels.delete(channel.id);
	const manager = new CountingChannelManager(channel);
	manager.init();
	return countingChannels.set(channel.id, manager);
});

bot.on('giveMemberCantCount', async (message) => {
	if (!message.channel.permissionsFor(message.guild.me).has('MANAGE_ROLES')) return;
	const role = await message.guild.roles.filter((role) => role.name === "can't count" || role.name === "cant count");
	if (role.length) await message.member.roles.add(role.first(), 'This user can\'t count correctly.');
	return bot.messups.get(message.channel.id).set(message.author.id, 0);
});

bot.on('messup', (message) => {
	return bot.messups.get(message.channel.id).set(message.author.id, bot.messups.get(message.channel.id).get(message.author.id) + 1);
});

//bot.on('resetMessups', (id) => {
//	return bot.messups.set(id, 0);
//});

bot.on('recalculateNumber', (message) => {
	return countingChannels.get(message.channel.id).recalculateNextNumber(message);
});

bot.on('setDeletedBy', (message, by) => {
	if (bot.deleted_messages.has(message.id) && bot.deleted_messages.get(message.id) !== 'user') bot.deleted_messages.set(message.id, by);
});

bot.on('handleDelete', async (message) => {
	bot.emit('setDeletedBy', message, 'bot');
	if (!message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) return;
	/*if (!message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES') && message.guild.owner && !bot.notified_owners.includes(`${message.channel.id}.${message.guild.owner.id}`)) return message.guild.owner.send({
		embed: {
			color: 13373206,
			description: `Make sure to give me \`Manage Messages\` for the channel ${message.channel}, in guild \`${message.guild}\`!`
		}
	}).then((msg) => {
		if (!bot.notified_owners.includes(message.guild.owner.id)) return bot.notified_owners.push(`${message.channel.id}.${message.guild.owner.id}`);
	});*/
	await message.delete('Wrong Number!');
});

bot.on('handleMessage', (message, action) => {
	if (message.channel.type !== 'text') return;
	if (message.author.bot) return;
	if (!bot.messups.has(message.channel.id)) bot.messups.set(message.channel.id, new Collection());
	if (bot.messups.has(message.channel.id) && !bot.messups.get(message.channel.id).has(message.author.id)) bot.messups.get(message.channel.id).set(message.author.id, 0);
	if (countingChannels.has(message.channel.id)) {
		if (action === 'updated') {
			if (message.id === message.channel.lastMessageID) {
				bot.emit('giveMemberCantCount', message);
				bot.emit('handleDelete', message);
				return bot.emit('recalculateNumber', message);
			} else {
				return bot.emit('handleDelete', message);
			}
		} else if (action === 'delete') {
			bot.emit('setDeletedBy', message, 'user');
			if (message.id === message.channel.lastMessageID) {
				//if (bot.deleted_messages.get(message.id) === 'bot') return;
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
	//if (message.channel.type === 'dm') return console.log(`Author: ${message.author.tag}${message.content ? `\nContent: ${message.content}` : 'N/A'}${message.attachments.size ? `\nAttachments: ${message.attachments.map((at) => at.url)}` : 'N/A'}`);
	if (!countingChannels.has(message.channel.id)) {
		if (message.author.bot) return;
		if (message.content.toLowerCase() === 'c!help') return message.channel.send({
										embed: {
												title: 'help',
												description: 'To start create a channel that starts with the word `counting`. You may choose what counting system you want to use by doing the following.\n`counting-in-[ternary,quaternary,quinary,senary,octal,decimal,dozenal,hexadecimal,vigesimal,sexagesimal]`\n**Example**: `counting-in-hexadecimal`.\nYou may also choose how much to count by, by doing something like `counting-by-10` or `counting-in-hexadecimal-by-10` or `counting-by--10` which you would have to count down by 10.'
										}
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
	console.error(err.stack);
});

bot.login(process.env.TOKEN);

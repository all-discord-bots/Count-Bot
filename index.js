const config = require('./config.json'),
	Eris = require('eris'),
	bot = new Eris(config.token, {
		messageLimit: 0
	}),
	CountingChannelManager = require('./CountingChannelManager');

let countingChannels = new Map();

bot.on('ready', () => {
  console.info('Counting bot connected');
  bot.editStatus("online", { name: "1 2 3...", type: 0 });
});

bot.on('disconnected', () => {
  console.warn('Counting bot disconnected');
});

bot.once('ready', () => {
	return bot.guilds.forEach(g => {
		return g.channels.filter(c => c.name.startsWith('counting')).forEach(c => {
			let manager = new CountingChannelManager(c);
			manager.init();
			return countingChannels.set(c.id, manager);
		});
	});
});

bot.on('channelCreate', channel => {
	if (channel.name.startsWith('counting')) {
		let manager = new CountingChannelManager(channel);
		manager.init();
		return countingChannels.set(channel.id, manager);
	}
});

bot.on('messageCreate', message => {
	if (countingChannels.has(message.channel.id))
	if (message.channel.id !== 381974306693054476) return;
	  if (message.author.bot) return; // dont do anything if message is from bot
		  return countingChannels.get(message.channel.id).handleNewMessage(message);
});

bot.on('messageDelete', message => {
//  if (countingChannels.has(message.channel.id)) {
//    message.channel.guild.members.get(message.author.id).addRole("381975847977877524");
//  }
  //return countingChannels.get(message.channel.id).handleDelMessage(message);
  var gusername = message.author;
  //var gdiscrim = message.author.discriminator;
  var guser = gusername;// + '#' + gdiscrim;
    bot.createMessage(403757067225006101, guser + ' ' + message.content);
});

bot.connect();

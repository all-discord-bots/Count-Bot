//const util = require('util');
const { Collection } = require('discord.js');
const vm = require('vm');
const RE2 = require('re2');
const fetch = require('node-fetch');
const got = require('got');

const colors = {
	default: 0,
	teal: 1752220,
	dark_teal: 1146986,
	green: 3066993,
	dark_green: 2067276,
	blue: 3447003,
	dark_blue: 2123412,
	purple: 10181046,
	dark_purple: 7419530,
	magenta: 15277667,
	dark_magenta: 11342935,
	gold: 15844367,
	dark_gold: 12745742,
	orange: 15105570,
	dark_orange: 11027200,
	red: 15158332,
	dark_red: 10038562,
	lighter_grey: 9807270,
	dark_grey: 6323595,
	light_grey: 9936031,
	darker_grey: 5533306,
	blurple: 7506394,
	greyple: 10070709
};

const permissions = {
	ADMINISTRATOR: 'Administrator',
	VIEW_AUDIT_LOG: 'View audit log',
	MANAGE_GUILD: 'Manage server',
	MANAGE_ROLES: 'Manage roles',
	MANAGE_CHANNELS: 'Manage channels',
	KICK_MEMBERS: 'Kick members',
	BAN_MEMBERS: 'Ban members',
	CREATE_INSTANT_INVITE: 'Create instant invite',
	CHANGE_NICKNAME: 'Change nickname',
	MANAGE_NICKNAMES: 'Manage nicknames',
	MANAGE_EMOJIS: 'Manage emojis',
	MANAGE_WEBHOOKS: 'Manage webhooks',
	VIEW_CHANNEL: 'View channel', // 'Read text channels and see voice channels',
	SEND_MESSAGES: 'Send messages',
	SEND_TTS_MESSAGES: 'Send TTS messages',
	MANAGE_MESSAGES: 'Manage messages',
	EMBED_LINKS: 'Embed links',
	ATTACH_FILES: 'Attach files',
	READ_MESSAGE_HISTORY: 'Read message history',
	MENTION_EVERYONE: 'Mention everyone',
	USE_EXTERNAL_EMOJIS: 'Use external emojis',
	ADD_REACTIONS: 'Add reactions',
	CONNECT: 'Connect',
	SPEAK: 'Speak',
	MUTE_MEMBERS: 'Mute members',
	DEAFEN_MEMBERS: 'Deafen members',
	MOVE_MEMBERS: 'Move members',
	USE_VAD: 'Use voice activity'
};
//const missing = msg.channel.permissionsFor(msg.author).missing(this.getInfo('userPermissions',info));
//if (missing.length > 0) return `<:redx:411978781226696705> You do not have permission to use the \`${info.name}\` command.\n<:transparent:411703305467854889>Missing: \`${missing.map((perm) => this.bot.utils.permissions[perm]).join("` `")}\``;

const client_information = async() => {
	let [users, guilds, guilds_per_shard, channels, connections] = [0, 0, [], 0, 0];
	if (global.client.shard) {
		const results = await global.client.shard.broadcastEval(`[this.users.size, this.guilds.size, [this.guilds.size], this.channels.size, this.voice.connections.size]`); // this.voiceConnections.size
		for (const result of results) {
			users += result[0];
			guilds += result[1];
			guilds_per_shard = result[2]; // [...result[2]]
			channels += result[3];
			connections += result[4];
		}
	} else {
		users += global.client.users.size;
		guilds += global.client.guilds.size;
		//guilds_per_shard = []; //[global.client.guilds.size];
		channels += global.client.channels.size;
		connections += global.client.voice.connections.size;
	}
	return {
		'user_size': users,
		'guild_size': guilds,
		'guilds_per_shard': guilds_per_shard,
		'channel_size': channels,
		'voice_connections': connections
	};
};


const unicode_filter = (message) => {
	return message
		.replace(':zero:', '0')
		.replace(':one:', '1')
		.replace(':two:', '2')
		.replace(':three:', '3')
		.replace(':four:', '4')
		.replace(':five:', '5')
		.replace(':six:', '6')
		.replace(':seven:', '7')
		.replace(':eight:', '8')
		.replace(':nine:', '9')
		.replace('🔟', '10')
		.replace(/([🇦🅰])/g, 'a')
		.replace(/([🇧🅱])/g, 'b')
		.replace('🇨', 'c')
		.replace('🇩', 'd')
		.replace('🇪', 'e')
		.replace('🇫', 'f')
		.replace('🇬', 'g')
		.replace('🇭', 'h')
		.replace('🇮', 'i')
		.replace('🇯', 'j')
		.replace('🇰', 'k')
		.replace('🇱', 'l')
		.replace('🇲', 'm')
		.replace('🇳', 'n')
		.replace('🇴', 'o')
		.replace('🇵', 'p')
		.replace('🇶', 'q')
		.replace('🇷', 'r')
		.replace('🇸', 's')
		.replace('🇹', 't')
		.replace('🇺', 'u')
		.replace('🇻', 'v')
		.replace('🇼', 'w')
		.replace('🇽', 'x')
		.replace('🇾', 'y')
		.replace('🇿', 'z')
		.replace('🆘', 'sos')
		.replace('🆑', 'cl')
		.replace('🆎', 'ab')
};

const check_redos = (regexp) => {
	const sandbox = {
		result: null
	};
	const context = vm.createContext(sandbox);
	//console.log(`Sandbox initialized: ${vm.isContext(sandbox)}`);
	const script = new vm.Script(`result = /${regexp.source}/`);
	try {
		// One could argue if a RegExp hasn't processed in a given time.
		// then, it's likely it will exponential time.
		script.runInContext(context, { timeout: 1000 }); // milliseconds
	} catch (e) {
		//console.log('ReDos occurred'); // Take some remedial action here...
		return {
			result: regexp, // sandbox.result
			safe: false
		};
	}
	//console.log(util.inspect(sandbox)); // Check the results
	return {
		result: sandbox.result,
		safe: true
	};
};


const check_regexp_syntax = (regexp) => {
	try {
		RE2(regexp, regexp.flags ? regexp.flags : 'gi');
		return {
			error: undefined,
			valid: true
		};
	} catch (e) {
		return {
			error: e,
			valid: false
		};
	}
};

const parseArgs = (args, options) => {
	if (!options)
		return args;
	if (typeof options === 'string')
		options = [options];

	let optionValues = {};

	let i;
	for (i = 0; i < args.length; i++) {
		let arg = args[i];
		if (!arg.startsWith('--')) {
			break;
		}

		let label = arg.substr(1);

		if (args.indexOf(label + ':') > -1) {
			let leftover = args.slice(i + 1).join(' ');
			let matches = leftover.match(/^"(.+?)"/);
			if (matches) {
				optionValues[label] = matches[1];
				i += matches[0].split(' ').length;
			} else {
				i++;
				optionValues[label] = args[i];
			}
		} else if (args.indexOf(label) > -1) {
			optionValues[label] = true;
		} else {
			break;
		}
	}

	return {
		options: optionValues,
		leftover: args.slice(i)
	};
};

const multiSend = (channel, messages, delay) => {
	delay = delay || 100;
	messages.forEach((m, i) => {
		setTimeout(() => {
			channel.send(m);
		}, delay * i);
	});
};


const sendLarge = (channel, largeMessage, status = '', options = {}) => {
	let message = largeMessage;
	let messages = [];
	let prefix = options.prefix || '';
	let suffix = options.suffix || '';
	let max = 2000 - prefix.length - suffix.length;
	while (message.length >= max) {
		let part = message.substr(0, max);
		let cutTo = max;
		if (options.cutOn) {
			/*
			 Prevent infinite loop where lastIndexOf(cutOn) is the first char in `part`
			 Later, we will correct by +1 since we did lastIndexOf on all but the first char in `part`
			 We *dont* correct immediately, since if cutOn is not found, cutTo will be -1, and we dont want that
			 to become 0
			 */
			cutTo = part.slice(1).lastIndexOf(options.cutOn);

			// Prevent infinite loop when cutOn isnt found in message
			if (cutTo === -1) {
				cutTo = max;
			} else {
				// Correction necessary from a few lines above
				cutTo += 1;

				if (options.cutAfter) {
					cutTo += 1;
				}
				part = part.substr(0, cutTo);
			}
		}
		messages.push(status + prefix + part + suffix);
		message = message.substr(cutTo);
	}

	if (message.length > 1) {
		messages.push(status + prefix + message + suffix);
	}

	multiSend(channel, messages, options.delay);
};

/*const permissionsFor = (message, permission) => {
	return message.channel.permissionsFor(message.guild.me).has("ADD_REACTIONS");
};*/

// Upload Providers
const uploadMethods = {
	mystbin: 'mystbin',
	hastebin: 'hastebin',
	ix: 'ix.io',
};

const textUpload = (text, options) => {
	options = options || {};
	let method = (options.method || uploadMethods.ix).toLowerCase();

	if (method === uploadMethods.ix) {
		return ixUpload(text);
	} else if (method === uploadMethods.hastebin) {
		return hastebinUpload(text);
	} else if (method === uploadMethods.mystbin) {
		return mystbinUpload(text);
	}
};

const hastebinUpload = async (evalResult, language = 'js') => {
	const key = await fetch("https://hastebin.com/documents", { method: "POST", body: evalResult })
		.then((response) => response.json())
		.then((body) => body.key);
	return `https://hastebin.com/${key}.${language}`;
};

/*const hastebinUpload = (text) => {
	return got('https://hastebin.com/documents', { body: { 'contents': text }, form: true })
		.then((res) => {
			if (res && res.body && res.body.key) {
				const key = res.body.key;
				return {
					key: key,
					success: true,
					url: `https://hastebin.com/${key}`,
					rawUrl: `https://hastebin.com/raw/${key}`
				};
			} else {
				return {
					success: false
				};
			}
		});
};*/

/*const gistUpload = (text, lang = 'js') => {
    const filename = `cripsbot_upload.${lang}';
    return got.post('https://api.github.com/gists', {
        body: {//JSON.stringify({
            files: {
                [filename]: {
                    content: text
                }
            }
		},
        //}),
        //json: true
    }).then((res) => {
            if (res && res.body && res.body.html_url) {
                return {
                    success: true,
                    url: res.body.html_url,
                    rawUrl: res.body.files[filename].raw_url
                };
            } else {
                return {
                    success: false
                };
            }
        });
};*/

/*const gistUpload = async (text, lang = 'js') => {
	const key = await fetch("https://api.github.com/gists", { method: "POST", body: evalResult })
		.then((res) => res.json())
		.then((body) => body.key);
	return `https://gist.github.com/${key}`;
};*/

const mystbinUpload = async (evalResult, language = 'js') => {
	const key = await fetch("http://mystb.in/documents", { method: "POST", body: evalResult })
		.then((response) => response.json())
		.then((body) => body.key);
	return `http://mystb.in/${key}.${language}`;
};

const ixUpload = (evalResult) => {
	return got('http://ix.io', { body: { 'f:1': evalResult }, form: true }).then((response) => {
		if (response && response.body) {
			return {
				success: true,
				url: response.body,
				rawUrl: response.body
			};
		} else {
			return {
				success: false
			};
		}
	});
};

const get_instances = async (message, search, options = { search_blocked: false, show_hidden: true, get_types: [], guild_only: [], channel_types: [] }) => {
	if (RegExp(/(<@​!?(\d{17,19})>)/g).test(search.toString())) search = search.replace(/(^<@!?|>$)/g,'');
	if (RegExp(/(<@​&(\d{17,19})>)/g).test(search.toString())) search = search.replace(/(^<@&|>$)/g,'');
	if (RegExp(/(<#(\d{17,19})>)/g).test(search.toString())) search = search.replace(/(^<#|>$)/g,'');
	if (message.flags['channel'] || message.flags['channels'] || message.flags['member'] || message.flags['members'] || message.flags['user'] || message.flags['users'] || message.flags['role'] || message.flags['roles'] || message.flags['all']) options.get_types = [];
	if (!message.flags['all'] && (message.flags['channel'] || message.flags['channels'])) options.get_types.push('channels');
	if (message.flags['all'] || message.flags['text'] || message.flags['textchannel'] || message.flags['textchannels'] || message.flags['category'] || message.flags['categories'] || message.flags['voice'] || message.flags['voicechannel'] || message.flags['voicechannels']) options.channel_types = [];
	if (!message.flags['all'] && (message.flags['text'] || message.flags['textchannel'] || message.flags['textchannels'])) options.channel_types.push('text');
	if (!message.flags['all'] && (message.flags['category'] || message.flags['categories'])) options.channel_types.push('category');
	if (!message.flags['all'] && (message.flags['voice'] || message.flags['voicechannel'] || message.flags['voicechannels'])) options.channel_types.push('voice');
	if (!message.flags['all'] && (message.flags['member'] || message.flags['members'] || message.flags['user'] || message.flags['users'])) options.get_types.push('members');
	if (!message.flags['all'] && (message.flags['role'] || message.flags['roles'])) options.get_types.push('roles');
	if (message.flags['all']) {
		options.get_types.push('all');
		options.channel_types.push('all');
	}
	if (message.author === global.client.owner) {
		if (message.flags['guild-channels'] || message.flags['guildChannels'] || message.flags['guild-members'] || message.flags['guildMembers'] || message.flags['guild-roles'] || message.flags['guildRoles'] || message.flags['guild-all'] || message.flags['guildAll']) options.guild_only = ['none'];
		if (!message.flags['guild-all'] && !message.flags['guildAll']) {
			if (message.flags['guild-channels'] || message.flags['guildChannels']) options.guild_only.push('channels');
			if (message.flags['guild-members'] || message.flags['guildMembers']) options.guild_only.push('members');
			if (message.flags['guild-roles'] || message.flags['guildRoles']) options.guild_only.push('roles');
		} else {
			if (message.flags['guild-all'] || message.flags['guildAll']) options.guild_only.push('all');
		}
	}

	const items = [];
	if (options.search_blocked) {
		const { member: { settings: { blockedUsers, blockedChannels, blockedCategories, blockedRoles } }, guild: { channels, members, roles } } = message;
		const blocked = new Collection();
		blocked.set('channels', new Collection());
		blocked.set('members', new Collection());
		blocked.set('roles', new Collection());

		if ((blockedChannels && blockedChannels.length) || (blockedCategories && blockedCategories.length)) [...blockedChannels, ...blockedCategories].map((channel_id) => blocked.get('channels').set(channel_id, channels.has(channel_id) ? channels.get(channel_id) : `${channel_id} (Invalid)`));
		if (blockedUsers && blockedUsers.length) blockedUsers.map(async(member_id) => blocked.get('members').set(member_id, members.has(member_id) ? members.get(member_id) : await members.fetch(member_id, { cache: true }) || `${member_id} (Invalid)`));
		if (blockedRoles && blockedRoles.length) blockedRoles.map((role_id) => blocked.get('roles').set(role_id, roles.has(role_id) ? roles.get(role_id) : `${role_id} (Invalid)`));
		if (RegExp(['all','channel','channels'].join('|')).test(options.get_types.join(' '))) blocked.get('channels').filter((channel) => (options.channel_types && options.channel_types.length ? options.channel_types : ['voice','text','category']).includes(channel.type) && (channel === search || channel.toString() === search || channel.id === search || channel.name.toLowerCase().includes(search.toLowerCase()))).map((channel) => items.push(channel));
		if (RegExp(['all','member','members','user','users'].join('|')).test(options.get_types.join(' '))) blocked.get('members').filter((member) => (member.user ? member.user : member) === search || (member.user ? member.user : member).toString() === search || member.id === search || (member.user ? member.user : member).tag.toString().toLowerCase().includes(search.toString().toLowerCase()) || member.displayName.toString().toLowerCase().includes(search.toString().toLowerCase())).map((member) => items.push(member));
		if (RegExp(['all','role','roles'].join('|')).test(options.get_types.join(' '))) blocked.get('roles').filter((role) => role === search || role.toString() === search || role.id === search || role.name.toLowerCase().includes(search.toLowerCase())).map((role) => items.push(role));
	} else {
		if (RegExp(['all','channel','channels'].join('|')).test(options.get_types.join(' '))) await (RegExp(['all','channel','channels'].join('|')).test(options.guild_only.join(' ')) ? message.guild : global.client).channels.filter((channel) => (!options.show_hidden ? channel.permissionsFor(message.member).has('VIEW_CHANNEL') : (channel.permissionsFor(message.member).has('VIEW_CHANNEL') || !channel.permissionsFor(message.member).has('VIEW_CHANNEL'))) && (options.channel_types && options.channel_types.length ? options.channel_types : ['voice','text','category']).includes(channel.type) && (channel === search || channel.toString() === search || channel.id === search || channel.name.toLowerCase().includes(search.toLowerCase()))).map((channel) => items.push(channel));
		if (RegExp(['all','member','members','user','users'].join('|')).test(options.get_types.join(' '))) await (RegExp(['all','member','members','user','users'].join('|')).test(options.guild_only.join(' ')) ? message.guild.members.size === message.guild.memberCount ? message.guild.members.filter((member) => (member.user ? member.user : member) === search || (member.user ? member.user : member).toString() === search || member.id === search || (member.user ? member.user : member).tag.toString().toLowerCase().includes(search.toString().toLowerCase()) || member.displayName.toString().toLowerCase().includes(search.toString().toLowerCase())) : await message.guild.members.fetch({ cache: true }).then((member_collection) => member_collection.filter((member) => (member.user ? member.user : member) === search || (member.user ? member.user : member).toString() === search || member.id === search || (member.user ? member.user : member).tag.toString().toLowerCase().includes(search.toString().toLowerCase()) || member.displayName.toString().toLowerCase().includes(search.toString().toLowerCase()))) : global.client.users.filter((user) => (user.user ? user.user : user) === search || (user.user ? user.user : user).toString() === search || user.id === search || (user.user ? user.user : user).tag.toString().toLowerCase().includes(search.toString().toLowerCase()))).map((member) => items.push(member));
		if (RegExp(['all','role','roles'].join('|')).test(options.get_types.join(' '))) await (RegExp(['all','role','roles'].join('|')).test(options.guild_only.join(' ')) ? message.guild.roles : global.client.guilds.map((guild) => guild.roles.array()).flat()).filter((role) => role === search || role.toString() === search || role.id === search || role.name.toLowerCase().includes(search.toLowerCase())).map((role) => items.push(role));
		//if (RegExp(['all','member','members','user','users'].join('|')).test(options.get_types.join(' '))) await (RegExp(['all','member','members','user','users'].join('|')).test(options.guild_only.join(' ')) ? await message.guild.members.fetch({ cache: true }).then((member_collection) => member_collection.filter((member) => (member.user ? member.user : member) === search || (member.user ? member.user : member).toString() === search || member.id === search || (member.user ? member.user : member).tag.toString().toLowerCase().includes(search.toString().toLowerCase()) || member.displayName.toString().toLowerCase().includes(search.toString().toLowerCase()))) : global.client.users.filter((user) => (user.user ? user.user : user) === search || (user.user ? user.user : user).toString() === search || user.id === search || (user.user ? user.user : user).tag.toString().toLowerCase().includes(search.toString().toLowerCase()))).map((member) => items.push(member));
	}
	if (!items.length) throw `Your option didn't match any of the possibilities: (${message.command.usage.parsedUsage[0].possibles.map((possible) => possible.name).join(', ')})`;
	return items; //h!eval this.client.users.fetch().then((members) => members.filter((m) => m.id === '315169774688534530'))
};

/*const verify = async (channel, user, time = 30000) => {
	const filter = res => {
		const value = res.content.toLowerCase();
		return res.author.id === user.id && (yes.includes(value) || no.includes(value));
	};
	const verify = await channel.awaitMessages(filter, { // need to fix this
		max: 1,
		time
	});
	if (!verify.size) return 0;
	const choice = verify.first().content.toLowerCase();
	if (yes.includes(choice)) return true;
	if (no.includes(choice)) return false;
	return false;
};*/

// Array Functions
const findDuplicates = (data) => {
	const result = [];
	data.forEach(function(element, index) {
		// Find if there is a duplicate or not
		if (data.indexOf(element, index + 1) > -1) {
			// Find if the element is already in the result array or not
			if (result.indexOf(element) === -1) {
				result.push(element);
			}
		}
	});

	return result;
};

const shuffle = (array) => {
	const arr = array.slice(0);
	for (let i = arr.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = arr[i];
		arr[i] = arr[j];

		arr[j] = temp;
	}

	return arr;
};

module.exports = {
	colors,
	permissions,
	unicode_filter,
	check_redos,
	check_regexp_syntax,
	parseArgs,
	multiSend,
	sendLarge,
	client_information,
	// Upload Providers
	uploadMethods,
	textUpload,
	hastebinUpload,
	mystbinUpload,
	ixUpload,
	get_instances,
	// Array Functions
	findDuplicates,
	shuffle
};

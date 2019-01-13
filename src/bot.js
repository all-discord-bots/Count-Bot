const { Collection, WebSocket, Permissions: { FLAGS } } = require('discord.js');
const { constants: { MENTION_REGEX } } = require('klasa');
//const axios = require('axios');
const { Managers: { Logger, Stats }, Extensions: { StructureExtender }, Client } = require('./');
const config = require("../config.json");

let starting = global.starting = true;

/**
	 * @typedef {AliasPieceOptions} CommandOptions
	 * @property {boolean} [autoAliases=true] If automatic aliases should be added (adds aliases of name and aliases without dashes)
	 * @property {external:PermissionResolvable} [requiredPermissions=0] The required Discord permissions for the bot to use this command
	 * @property {number} [bucket=1] The number of times this command can be run before ratelimited by the cooldown
	 * @property {number} [cooldown=0] The amount of time before the user can run the command again in seconds
	 * @property {string} [cooldownLevel='author'] The level the cooldown applies to (valid options are 'author', 'channel', 'guild')
	 * @property {boolean} [deletable=false] If the responses should be deleted if the triggering message is deleted
	 * @property {(string|Function)} [description=''] The help description for the command
	 * @property {(string|Function)} [extendedHelp=language.get('COMMAND_HELP_NO_EXTENDED')] Extended help strings
	 * @property {boolean} [guarded=false] If the command can be disabled on a guild level (does not effect global disable)
	 * @property {boolean} [nsfw=false] If the command should only run in nsfw channels
	 * @property {number} [permissionLevel=0] The required permission level to use the command
	 * @property {number} [promptLimit=0] The number or attempts allowed for re-prompting an argument
	 * @property {number} [promptTime=30000] The time allowed for re-prompting of this command
	 * @property {boolean} [quotedStringSupport=false] Whether args for this command should not deliminated inside quotes
	 * @property {string[]} [requiredSettings=[]] The required guild settings to use this command
	 * @property {string[]} [runIn=['text','dm']] What channel types the command should run in
	 * @property {boolean} [subcommands=false] Whether to enable sub commands or not
	 * @property {string} [usage=''] The usage string for the command
	 * @property {?string} [usageDelim=undefined] The string to delimit the command input for usage
	 */

/*
datatypes: {
			any: { type: 'TEXT' },
			boolean: { type: 'BOOLEAN', resolver: value => value },
			categorychannel: { type: 'VARCHAR(18)' },
			channel: { type: 'VARCHAR(18)' },
			command: { type: 'TEXT' },
			float: { type: 'FLOAT', resolver: value => value },
			guild: { type: 'VARCHAR(18)' },
			integer: { type: 'INTEGER', resolver: value => value },
			json: { type: 'JSON', resolver: (value) => `'${JSON.stringify(value).replace(/'/g, "''")}'` },
			language: { type: 'VARCHAR(5)' },
			role: { type: 'VARCHAR(18)' },
			string: { type: ({ max }) => max ? `VARCHAR(${max})` : 'TEXT' },
			textchannel: { type: 'VARCHAR(18)' },
			url: { type: 'TEXT' },
			user: { type: 'VARCHAR(18)' },
			voicechannel: { type: 'VARCHAR(18)' }
		},
*/

const startTime = global.startTime = new Date(); // start recording time of boot

Client.use(require("klasa-member-gateway"));
//Client.use(require("./plugins"));

/*
 defaultGuildSchema
 defaultClientSchema
 defaultUserSchema
 defaultMemberSchema
*/

Client.defaultClientSchema
	.add('blacklist', 'string', { array: true, filter: (__, value) => !MENTION_REGEX.snowflake.test(value) })
/*
KlasaClient.defaultClientSchema = new Schema()
	.add('userBlacklist', 'user', { array: true })
	.add('guildBlacklist', 'string', { array: true, filter: (__, value) => !MENTION_REGEX.snowflake.test(value) })
	.add('schedules', 'any', { array: true });
*/

Client.defaultGuildSchema
	//.add('channelData', 'string', { array: true })
	//.add('maxMistakes', 'float', { default: 1000000, min: 0 })
	.add("countingChannels", "textchannel", { array: true })
	.add('cantCountRole', 'role')
	.add('bot', folder => folder
		.add('channel', 'textchannel')
		.add('redirect', 'boolean'))
/*
KlasaClient.defaultGuildSchema = new Schema()
	.add('prefix', 'string')
	.add('language', 'language')
	.add('disableNaturalPrefix', 'boolean')
	.add('disabledCommands', 'command', {
		array: true,
		filter: (client, command, piece, language) => {
			if (command.guarded) throw language.get('COMMAND_CONF_GUARDED', command.name);
		}
	});
*/

Client.defaultMemberSchema
	.add('mistakes', 'integer', { default: 0, min: 0 })

/*Client.defaultChannelSchema
	.add('currentNumber', 'number', { default: 0 })*/

//Client.defaultUserSchema

/*Client.defaultPermissionLevels
	.add(4, ({ guild, member }) => guild && member.permissions.has(FLAGS.BAN_MEMBERS), { fetch: true })*/

const client = global.client = new Client({
	autoReconnect: true,
	commandEditing: true,
	commandLogging: true,
	disableEveryone: true,
	fetchAllMembers: true,
	preserveSettings: false,
	disabledEvents: [
		"TYPING_START",
		"VOICE_STATE_UPDATE",
		"CHANNEL_PINS_UPDATE",
	],
	pieceDefaults: { commands: { deletable: true } },
	presence: {
		activity: {
			name: '1 2 3...',
			type: 0,
		},
	},
	consoleEvents: { verbose: true },
	prefix: 'c!',
	restTimeOffset: 0,
	regexPrefix: /^((?:hey |hi )?counting(?:,|!|\w)?)/i,
	providers: {
		default: process.env.PROVIDER,
	},
	gateways: {
		clientStorage: { provider: process.env.PROVIDER },//"json" },
		members: { providers: process.env.PROVIDER },
		channels: { providers: process.env.PROVIDER },
	},
	schedule: { interval: 1000 },
	disabledCorePieces: ["commands"],
	console: { useColor: true },
});

client.baseMap = {
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

client.countingChannels = new Collection();

/*
 * Console Colors
 * shard: { background: 'cyan', text: 'black' },
 * debug: mergeDefault(colorBase, { time: { background: 'magenta' } }),
 * error: mergeDefault(colorBase, { time: { background: 'red' } }),
 * log: mergeDefault(colorBase, { time: { background: 'blue' } }),
 * verbose: mergeDefault(colorBase, { time: { text: 'gray' } }),
 * warn: mergeDefault(colorBase, { time: { background: 'lightyellow', text: 'black' } }),
 * wtf: mergeDefault(colorBase, { message: { text: 'red' }, time: { background: 'red' } })
 */

// Managers
client.managers = {};

// Logger

const logger = client.logger = new Logger(client);
logger.inject();

// Prevent any further loading if we're prompting them.
if (!config) return;

// Config
client.config = config;

// Stats
const stats = client.managers.stats = new Stats(client);

// Deleted message record handler
const deleted = client.deleted = new Collection();
client.setInterval(() => {
	deleted.clear();
}, 7200000);

// Uncategorized
let shuttingDown = client.shuttingDown = false;
client.utils = global.utils = require('./utils');

/*ws.on('hello', (hello) => {
	console.log(hello);
});

ws.once('open', () => {
	console.log('WebSocket connected successfully.');
});*/


// Discord bot listing stats poster
/*const postDiscordStats = async(bot) => {
	try {*/
		/*const discordBots = axios({
			method: 'post',
			url: `https://discordbots.org/api/bots/${bot.user.id}/stats`,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `${process.env.DBL_TOKEN_AUTH}`
			},
			data: {
				server_count: bot.utils.client_information().guild_size, // Type: Numbers or Array of numbers, The amount of servers the bot is in. If an array it acts like `shards`
				shards: bot.utils.client_information().guilds_per_shard, // Type: Array of numbers, The amount of servers the bot is in per shard.
				shard_id: bot.shard.id, // Type: Number, The zero-indexed id of the shard posting. Makes server_count set the shard specific server count.
				shard_count: bot.shard.count // Type: Number, The amount of shards the bot has.
			}
		}).then(() => {
			console.log("Uploaded bot stats to discordbots.org!");
		}).catch(console.error);*/

/*		const discordBotList = axios({
			method: 'post',
			url: `https://discordbotlist.com/api/bots/${bot.user.id}/stats`,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bot ${process.env.DBL_TOKEN}`
			},
			data: {
				//shard_id: bot.shard.id,
				guilds: bot.utils.client_information().guild_size,
				users: bot.utils.client_information().user_size,
				voice_connections: bot.utils.client_information().voice_connections
			}
		}).then(() => {
			console.log("Uploaded bot stats to discordbotlist.com!");
		}).catch(console.error);*/

		/*const botsForDiscord = axios({
			method: 'post',
			url: `https://botsfordiscord.com/api/bot/${bot.user.id}`,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `${process.env.B4D_TOKEN}`
			},
			data: {
				server_count: bot.utils.client_information().guild_size
			}
		}).then(() => {
			console.log("Uploaded bot stats to botsfordiscord.com!");
		}).catch(console.error);*/
		/*
		const discordPw = axios({
			method: 'post',
			url: `https://bots.discord.pw/api/bots/${this.user.id}/stats`,
			headers: {
				Authorization: ''
			},
			data: {
				server_count: this.guilds.size
			}
		})*/
		/*const botlistSpace = axios({
			method: 'post',
			url: `https://botlist.space/api/bots/${bot.user.id}`,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `${process.env.BOTLIST_SPACE_TOKEN_AUTH}`
			},
			data: {
				server_count: bot.utils.client_information().guild_size,
				shards: bot.utils.client_information().guilds_per_shard // - server count per shard
			}
		}).then(() => {
			console.log("Uploaded bot stats to botlist.space!");
		}).catch(console.error);*/
		/*const discordServices = axios({
			method: 'post',
			url: `https://discord.services/api/bots/${this.user.id}`,
			headers: {
				Authorization: ''
			},
			data: {
				server_count: this.guilds.size
			}
		})
		const listCord = axios({
			method: 'post',
			url: `https://listcord.com/api/bot/${this.user.id}/guilds`,
			headers: {
				Authorization: ''
			},
			data: {
				guilds: this.guilds.size
			}
		})
		const [dbres, dpwres, bspaceres, dservres, listres] = await Promise.all([discordBots, discordPw, botlistSpace, discordServices, listCord])
		console.log(dbres.res, dpwres.res, bspaceres.res, dservres.res, listres.res)
		*/
/*
		const [discordbotlist] = await Promise.all([discordBotList]);
		///console.log(dbres.toString());
	} catch (err) {
		console.error(err.stack ? err.stack : err.toString());
	}
};

client.setInterval(() => {
	try {
		postDiscordStats(client);
	} catch (err) {
		console.error(err.stack ? err.stack : err.toString());
	}
}, 1800000);*/

if (!client.ready) client.start();

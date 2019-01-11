const { Collection, WebSocket, Permissions: { FLAGS } } = require('discord.js');
const { constants: { MENTION_REGEX } } = require('klasa');
//const axios = require('axios');
//const Client = require("./lib/HighlightClient");
//require('./index.js');
const { Managers: { Logger, Stats }, Extensions: { StructureExtender }, Client, IPC } = require('./');
//const Managers = require('./managers');
const config = require("../config.json");
//require("./StructureExtender");
const firebaseServiceAccount = require('../firebaseDatabase.json');

let starting = global.starting = true;

//const ws = global.ws = new WebSocket.WebSocket('wss://gateway.discord.gg/?v=6&encoding=json');

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

/*
 defaultGuildSchema
 defaultClientSchema
 defaultUserSchema
 defaultMemberSchema
*/

Client.defaultClientSchema
	//.remove('userBlacklist')
	//.remove('guildBlacklist')
	.add('blacklist', 'string', { array: true, filter: (__, value) => !MENTION_REGEX.snowflake.test(value) })
	//.add('userBlacklist', 'user', { array: true })
	//.add('guildBlacklist', 'string', { array: true, filter: (__, value) => !MENTION_REGEX.snowflake.test(value) })
	.add('restart', folder => folder
		.add('message', 'messagepromise')
		.add('timestamp', 'bigint', { min: 0 }))
/*
KlasaClient.defaultClientSchema = new Schema()
	.add('userBlacklist', 'user', { array: true })
	.add('guildBlacklist', 'string', { array: true, filter: (__, value) => !MENTION_REGEX.snowflake.test(value) })
	.add('schedules', 'any', { array: true });
*/

Client.defaultGuildSchema
	.add("bannedWords", "string", { array: true })
	.add("bot", folder => folder
		.add("channel", "textchannel")
		.add("redirect", "boolean"))
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
	.add("words", "string", { array: true })
	.add("regexes", "string", { array: true })
	.add("notes", "string", { array: true })
	.add("blockedUsers", "user", { array: true })
	.add("blockedChannels", "textchannel", { array: true })
	.add("blockedCategories", "categorychannel", { array: true })
	.add("blockedRoles", "role", { array: true })
	.add("clearedWords", "string", { array: true })
	.add("clearedRegexes", "string", { array: true })
	.add("clearedNotes", "string", { array: true })

Client.defaultUserSchema
	.add("dnd", "boolean", { default: false })
	.add("ocr_disabled", "boolean", { default: false })
	.add("developer_mode", "boolean", { default: false })

// https://klasa.js.org/#/docs/klasa/master/Getting%20Started/UnderstandingPermissionLevels?scrollTo=what-39-s-different-from-komada-
Client.defaultPermissionLevels
	.add(4, ({ guild, member }) => guild && member.permissions.has(FLAGS.BAN_MEMBERS), { fetch: true }) // VIEW_AUDIT_LOG
/*
KlasaClient.defaultPermissionLevels = new PermissionLevels()
	.add(0, () => true)
	.add(6, ({ guild, member }) => guild && member.permissions.has(FLAGS.MANAGE_GUILD), { fetch: true })
	.add(7, ({ guild, member }) => guild && member === guild.owner, { fetch: true })
	.add(9, ({ author, client }) => author === client.owner, { break: true })
	.add(10, ({ author, client }) => author === client.owner);
*/

const client = global.client = new Client({
	autoReconnect: true,
	commandEditing: true,
	commandLogging: true,
	disableEveryone: true,
	fetchAllMembers: true,
	//preserveSettings: false,
	disabledEvents: [
		"TYPING_START",
		"VOICE_STATE_UPDATE",
		"CHANNEL_PINS_UPDATE",
	],
	pieceDefaults: { commands: { deletable: true } },
	/*presence: {
		activity: {
			name: 'for words',
			type: 3,
		},
	},*/
	presence: {
		activity: {
			name: '1 2 3...',
			type: 0,
		},
	},
	consoleEvents: { verbose: true },
	prefix: 'h!',
	restTimeOffset: 0,
	regexPrefix: /^((?:hey |hi )?highlight(?:,|!|\w)?)/i,
	providers: {
		default: config.provider,
		rethinkdb: config.rethinkdb,
		firestore: { credentials: firebaseServiceAccount, databaseURL: "https://highlightbot-58399.firebaseio.com" },
	},
	gateways: {
		clientStorage: { provider: "json" },
		members: { providers: config.provider },
	},
	schedule: { interval: 1000 },
	disabledCorePieces: ["commands"],
	console: { useColor: true },
});

client.ipc = new IPC();

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

const top = client.top = [];

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

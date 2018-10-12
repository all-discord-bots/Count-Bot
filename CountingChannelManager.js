const fs = require("fs");
let messups = JSON.parse(fs.readFileSync("./messups.json", "utf8"));

let thisMessage = new Map();

const numOfMessups = 3;

const baseMap = {
	'binary': 2,
	'ternary': 3,
	'quaternary': 4,
	'pental': 5,
	'quinary': 5,
	'heximal': 6,
	'senary': 6,
	'oct': 8,
	'octal': 8,
	'dozenal': 12,
	'duodecimal': 12,
	'hex': 16,
	'hexadecimal': 16,
	'vigesimal': 20,
	'sexagesimal': 60
};

class CountingChannelManager {
	constructor(channel) {
		this.channel = channel;
		this.base = null;
		this.by = null;
		this.lastNumber = null;
	}

	async init() {
		let [, base] = this.channel.name.match(/-in-([^-]+)/i) || [];
		if (!base)
			this.base = 10;
		else if (baseMap[base] !== undefined)
			this.base = baseMap[base];
		else if (!isNaN(base))
			this.base = parseInt(base, 10);
		else {
			console.error('Error: Invalid base for counting channel ', this.channel.name);
			return false;
		}

		let [, by] = this.channel.name.match(/-by-(-?\d+(?:\.\d+)?)/i) || [];
		if (!by)
			this.by = 1;
		else if (!isNaN(by)) {
			if (by.includes('.')) {
				if (this.base === 10)
					this.by = parseFloat(by);
				else {
					console.error('Error: Can only count in decimals for base 10. Channel: ', this.channel.name);
					return false;
				}
			} else
				this.by = parseInt(by, 10);
		} else {
			console.error('Error: Invalid by for counting channel ', this.channel.name);
			return false;
		}

		let lastMessage;
		//let perms = this.channel.permissionsOf("381973716566933507").json; // bot user id
		//if (perms.readMessages && perms.readMessageHistory) { // Not using this perm checker because I lock the channel sometimes during updates and keep it locked so I can test it
		try { // If you uncomment the permission checker comment this line
			lastMessage = (await this.channel.getMessages(50) || []).find(m => this.parseNumber(m) > 0);
		} catch (e) { // if you uncomment the permission checker change this line to } else {
			lastMessage = null;
		}

		if (!lastMessage)
			this.lastNumber = 0;
		else
			this.lastNumber = this.parseNumber(lastMessage);

		return true;
	}

	destroy() {
		
	}

	handleNewMessage(message) {
		this.setDeletedBy(message, "not deleted");
		let number = this.parseNumber(message);
		let gLastNumber = this.lastNumber + 1;
		let debug = false;
		if (debug) {
			console.info("User Message to Number:", number);
			console.info("LastNumber:", this.lastNumber);
			console.info("isNextInSequence:", this.isNextInSequence(number));
			console.info("Users Message:", message.content);
		}
		if (!messups[message.channel.guild.id]) {
			messups[message.channel.guild.id] = {}
		}
		if (messups[message.channel.guild.id] && !messups[message.channel.guild.id][message.author.id]) {
			messups[message.channel.guild.id][message.author.id] = {
				messups: 0
			}
		}
		if (number !== gLastNumber || message.content.includes(" ") || message.content.includes("-") || message.content.includes("+") || message.content.includes("=") || message.content.includes("_") || message.content.includes("`") || message.content.includes("~") || message.content.includes("!") || message.content.includes("@") || message.content.includes("#") || message.content.includes("$") || message.content.includes("%") || message.content.includes("^") || message.content.includes("&") || message.content.includes("*") || message.content.includes("(") || message.content.includes(")") || message.content.includes("\\") || message.content.includes("|") || message.content.includes("]") || message.content.includes("[") || message.content.includes("{") || message.content.includes("}") || message.content.includes("'") || message.content.includes("\"") || message.content.includes(";") || message.content.includes(":") || message.content.includes("?") || message.content.includes("/") || message.content.includes(".") || message.content.includes(",") || message.content.includes("<") || message.content.includes(">")) {
			//message.channel.guild.members.fetch(message.author).then(member => {
				//member.addRole("381975847977877524");
			//});
			messups[message.channel.guild.id][message.author.id].messups++;
			if (messups[message.channel.guild.id][message.author.id].messups >= numOfMessups) {
				message.channel.guild.roles.map((role) => role.id).forEach((value,index) => {
					if (message.channel.guild.roles.get(`${value}`).name === "can't count") {
						message.member.addRole(`${value}`);
						if (messups[message.channel.guild.id] && messups[message.channel.guild.id][message.author.id]) {
							messups[message.channel.guild.id][message.author.id].messups = 0;
						}
					}
				});
			}
			this.setDeletedBy(message, "bot");
			return message.delete();
		}
		fs.writeFile("./messups.json", JSON.stringify(messups), (err) => {
			if (err) console.error(err);
		});
		if (!number) {
			this.setDeletedBy(message, "bot");
			return message.delete();
		}
		if (!this.isNextInSequence(number)) {
			this.setDeletedBy(message, "bot");
			return message.delete();
		}
		this.lastNumber = number;
	}

	//handleDelMessage(message) {
		//message.channel.guild.members.get(message.author.id).addRole("381975847977877524"); //.addRole({name: role});
	//}

	parseNumber(message) {
		if (this.by % 1 !== 0)
			return parseFloat(message.content);

		if (message.content.search(/^\d+\.[1-9]/) !== -1)
			return NaN;
		return parseInt(message.content.replace(/ .*/, ''), this.base);
	}

	isNextInSequence(number) {
		return number === this.lastNumber + this.by;
	}
	
	async recalculateNextNumber(message) {
		let lastMessage;
		try { // If you uncomment the permission checker comment this line
			/*
				>eval var numbers = [1, 2, 3, 4];
				Math.max(...numbers);
			*/
			lastMessage = (await message.channel.getMessages(50) || []).find((m) => Math.max(this.parseNumber(m))); //> 0);
		} catch (e) { // if you uncomment the permission checker change this line to } else {
			lastMessage = null;
		}
		
		if (!lastMessage) {
			this.lastNumber = 0;
		} else {
			this.lastNumber = this.parseNumber(lastMessage);
		}
	}
	
	setDeletedBy(message, userType) {
		return thisMessage.set(message.id, userType);
	}
	
	getDeletedBy(message) {
		return thisMessage.get(message.id);
	}
	
	/*giveRole(message) {
		message.channel.guild.roles.map((role) => role.id).forEach((value,index) => {
			if (message.channel.guild.roles.get(`${value}`).name === "can't count") {
				message.member.addRole(`${value}`);
				if (messups[message.channel.guild.id] && messups[message.channel.guild.id][message.author.id]) {
					messups[message.channel.guild.id][message.author.id].messups = 0;
				}
			}
		});
	}*/
}

module.exports = CountingChannelManager;

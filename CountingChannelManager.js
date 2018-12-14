class CountingChannelManager {
	constructor(channel) {
		this.channel = channel;
		this.base = null;
		this.by = null;
		this.lastNumber = global.bot.data.last_number;
	}

	async init() {
		let [, base] = this.channel.name.match(/-in-([^-]+)/i) || [];
		if (!base)
			this.base = 10;
		else if (global.bot.baseMap[base] !== undefined)
			this.base = global.bot.baseMap[base];
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
			lastMessage = (await this.channel.messages.fetch({ limit: 50 }) || []).find((msg) => this.parseNumber(msg) > 0);
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

	handleNewMessage(bot, message) {
		bot.emit('setDeletedBy', message, 'not deleted');
		let number = this.parseNumber(message);
		let gLastNumber = this.lastNumber + this.by;
		if (bot.data.debug) {
			console.info("User Message to Number:", number);
			console.info("LastNumber:", this.lastNumber);
			console.info("isNextInSequence:", this.isNextInSequence(number));
			console.info("Users Message:", message.content);
		}
		
		if ((message.content.length != gLastNumber.toString().length && number !== gLastNumber) || RegExp(/([a-z])/gi).test(message.content.toLowerCase()) || RegExp(/^(0+)/gi).test(message.content.toLowerCase()) || (message.content.includes(" ") || message.content.includes("-") || message.content.includes("+") || message.content.includes("=") || message.content.includes("_") || message.content.includes("`") || message.content.includes("~") || message.content.includes("!") || message.content.includes("@") || message.content.includes("#") || message.content.includes("$") || message.content.includes("%") || message.content.includes("^") || message.content.includes("&") || message.content.includes("*") || message.content.includes("(") || message.content.includes(")") || message.content.includes("\\") || message.content.includes("|") || message.content.includes("]") || message.content.includes("[") || message.content.includes("{") || message.content.includes("}") || message.content.includes("'") || message.content.includes("\"") || message.content.includes(";") || message.content.includes(":") || message.content.includes("?") || message.content.includes("/") || message.content.includes(".") || message.content.includes(",") || message.content.includes("<") || message.content.includes(">") || message.content.includes("\t") || message.content.includes("\r") || message.content.includes("\n"))) {
			bot.emit('messup', message.author.id);
			if (bot.messups.has(message.author.id) && bot.messups.get(message.author.id) >= bot.data.allowed_messups) bot.emit('giveMemberCantCount', message);
			return bot.emit('handleDelete', message);
		}
		if (!number) return bot.emit('handleDelete', message);
		if (!this.isNextInSequence(number)) return bot.emit('handleDelete', message);
		this.lastNumber = number;
	}

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
	
	currentNumber() {
		return this.lastNumber + this.by;
	}
	
	recalculateNextNumber(message) {
		this.lastNumber = Math.max(...message.channel.messages.filter((msg) => msg.id !== message.id && parseInt(msg.content)).map((msg) => parseInt(msg.content)));
	}
}

module.exports = CountingChannelManager;

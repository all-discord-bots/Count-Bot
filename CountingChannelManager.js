class CountingChannelManager {
	constructor(channel) {
		this.channel = channel;
		this.base = null;
		this.by = null;
		this.lastNumber = global.bot.data.last_number;
	}

	async init() {
		let errors = "";
		let [, base] = this.channel.name.match(/[-_]in[-_]([^-_]+)/i) || [];// /-in-([^-]+)/i
		if (!base)
			this.base = 10;
		else if (global.bot.baseMap[base] !== undefined)
			this.base = global.bot.baseMap[base];
		else if (!isNaN(base))
			this.base = parseInt(base, 10);
		else {
			errors += `• The ${this.channel} channel, in \`${this.channel.guild}\` has an invalid counting base \`-in-\` option defined in the channel name.`;
			console.error('Error: Invalid base for counting channel ', this.channel.name);
			return false;
		}

		let [, by] = this.channel.name.match(/[-_]by[-_](-?\d+(?:\.\d+)?)/i) || [];///-by-(-?\d+(?:\.\d+)?)/i
		if (!by)
			this.by = 1;
		else if (!isNaN(by)) {
			if (by.includes('.')) {
				if (this.base === 10)
					this.by = parseFloat(by);
				else {
					errors += `\n• You can only count in decimals for base \`-in-\` option \`decimal\` in the ${this.channel} channel, in \`${this.channel.guild}\``;
					console.error('Error: Can only count in decimals for base 10. Channel: ', this.channel.name);
					return false;
				}
			} else
				this.by = parseInt(by, 10);
		} else {
			errors += `\n• The ${this.channel} channel, in \`${this.channel.guild}\` has an invalid counting by \`-by-\` option defined in the channel name.`;
			console.error('Error: Invalid by for counting channel ', this.channel.name);
			return false;
		}
		
		if (errors !== "") {
			if (this.channel.guild.owner) return this.channel.guild.owner.send({
				embed: {
					color: 13373206,
					description: `${errors}`
				}
			});
		}

		let lastMessage;
		//let perms = this.channel.permissionsOf("381973716566933507").json; // bot user idh!eval let [, by] = msg.channel.name.match(/[-_]by[-_](-?\d+(?:\.\d+)?)/i) || [];
		//if (perms.readMessages && perms.readMessageHistory) { // Not using this perm checker because I lock the channel sometimes during updates and keep it locked so I can test it
		/*if (this.channel.guild.owner && !this.channel.permissionsFor(global.bot.user).has('READ_MESSAGE_HISTORY')) return this.channel.guild.owner.send({
			embed: {
				color: 13373206,
				description: `Make sure to give me the permissions \`Read Message History\` in the channel ${this.channel}, in guild \`${this.channel.guild}\`!`);
			}
		}*/
		try { // If you uncomment the permission checker comment this line
			//lastMessage = (await this.channel.messages.fetch({ limit: 50 }) || []).find((msg) => this.parseNumber(msg) > 0);
			//lastMessage = Math[this.by.startsWith('-') ? 'min' : 'max'](...(await this.channel.messages.fetch({ limit: 50 }) || []).filter((number) => this.parseNumber(number) <= 0 || this.parseNumber(number) >= 0).map((number) => this.parseNumber(number)));
			lastMessage = (await this.channel.messages.fetch({ limit: 50 }) || []).find((number) => this.by.toString().startsWith('-') ? this.parseNumber(number) <= 0 : this.parseNumber(number) >= 0);
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
		
		//if ((message.content.length != gLastNumber.toString().length && number !== gLastNumber) || RegExp(/([a-z])/gi).test(message.content.toLowerCase()) || RegExp(/^(0+)/gi).test(message.content.toLowerCase()) || (message.content.includes(" ") || (!message.content.startsWith('-') && message.content.includes("-")) || message.content.includes("+") || message.content.includes("=") || message.content.includes("_") || message.content.includes("`") || message.content.includes("~") || message.content.includes("!") || message.content.includes("@") || message.content.includes("#") || message.content.includes("$") || message.content.includes("%") || message.content.includes("^") || message.content.includes("&") || message.content.includes("*") || message.content.includes("(") || message.content.includes(")") || message.content.includes("\\") || message.content.includes("|") || message.content.includes("]") || message.content.includes("[") || message.content.includes("{") || message.content.includes("}") || message.content.includes("'") || message.content.includes("\"") || message.content.includes(";") || message.content.includes(":") || message.content.includes("?") || message.content.includes("/") || message.content.includes(".") || message.content.includes(",") || message.content.includes("<") || message.content.includes(">") || message.content.includes("\t") || message.content.includes("\r") || message.content.includes("\n") || message.attachments.size)) {
		if ((message.content.length != gLastNumber.toString().length && number !== gLastNumber) || message.attachments.size || message.embeds.length || RegExp(/([\s\+\=\_\`\~\!\@\#\$\%\^\&\*\(\)\\\|\]\[\{\}\'\"\;\:\?\/\,\<\>\t\r\na-z])/i).test(message.content) || RegExp(/(^(-0+|-{2,}))/i).test(message.content) || (message.content.length >= 2 && RegExp(/^(-?0+)/i).test(message.content)) || (!this.by.toString().startsWith('-') && message.content.includes('-')) || (this.by.toString().startsWith('-') && message.content.startsWith('-') && message.content.split('').filter((char) => char === '-').splice(1).length >= 1) || (!this.by.toString().includes('.') && message.content.includes('.')) || (this.by.toString().includes('.') && message.content.includes('.') && message.content.split('').filter((char) => char === '.').splice(1).length >= 1)) {
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
	
	async recalculateNextNumber(message) {
		this.lastNumber = Math[this.by.includes('-') ? 'min' : 'max'](...await message.channel.messages.filter((msg) => msg.id !== message.id && this.parseNumber(msg.content)).map((msg) => this.parseNumber(msg.content)));
	}
}

module.exports = CountingChannelManager;

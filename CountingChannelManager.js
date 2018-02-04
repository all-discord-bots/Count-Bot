//const Enmap = require('enmap');
//const EnmapLevel = require('enmap-level');
const fs = require("fs");
let messups = JSON.parse(fs.readFileSync("./messups.json", "utf8"));

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

		let lastMessage = (await this.channel.getMessages(50) || []).find(m => this.parseNumber(m) > 0);

		if (!lastMessage)
			this.lastNumber = 0;
		else
			this.lastNumber = this.parseNumber(lastMessage);

		return true;
	}

	destroy() {

	}

	handleNewMessage(message) {
                if (!messups[message.author.id]) { messups[message.author.id] = {"messups": 0} }
		let number = this.parseNumber(message);
                //const getMessups = new Enmap({ provider: new EnmapLevel({ name: 'messups' }); });
                //const auth = message.author.id;
                //(async function() {
                //await getMessups.defer;
                //if (!getMessups.get(auth)) {
                //  getMessups.set(auth, 0);
                //}
                //var messup = getMessups.get(auth);
		if (!number)
                //        messup++;
                        //getMessups.auth
                //        getMessups.set(auth, messup);
                //        if (messup > 2) {
                //            message.channel.guild.members.get(message.author.id).addRole("381975847977877524");
                //        }
                        messups[message.author.id].messups++;
                        if (messups[message.author.id].messups >= 3) {
                          var cantcount = message.channel.guild.roles.get("381975847977877524");
                          message.member.addRole(cantcount.id).catch(err => console.log(err)); // add the role to the user
                        }
			return message.delete();

		if (!this.isNextInSequence(number))
                //        messup++;
                //        getMessups.set(auth, messup);
                //        if (messup > 2) {
                //          message.channel.guild.member.get(message.author.id).addRole("381975847977877524");
                //        }
                        messups[message.author.id].messups++;
                        if (messups[message.author.id].messups >= 3) {
                          var cantcount = message.channel.guild.roles.get("381975847977877524");
                          message.member.addRole(cantcount.id).catch(err => console.log(err)); // add the role to the user
                        }
			return message.delete();

		this.lastNumber = number;
          //}());
          fs.writeFile("./messups.json", JSON.stringify(messups), (err) => {
           if (err) console.error(err);
          });
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
}

module.exports = CountingChannelManager;

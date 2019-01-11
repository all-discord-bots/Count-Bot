const { Event } = require("klasa");
const TABLES = ["members", "guilds"];

module.exports = class extends Event {
	constructor (...args) {
		super(...args, {
			enabled: true,
			once: true,
		});
	}

	async run () {
		if (process.argv.includes("--migrate")) {
			for (const table of TABLES) {
				const docs = await this.client.providers.default.getAll(table);
				for (const doc of docs) {
					const newID = doc.id.split("-").join(".");
					await this.client.providers.default.delete(table, doc.id).catch(() => null);
					doc.id = newID;
					await this.client.providers.default.create(table, newID, doc);
				}
			}
			this.client.console.warn("Migration Done. Process will now exit. Remove the `--migrate` flag");
			process.exit(0);
		}
		if (process.argv.includes("--migrate-rethink")) {
			const jsonProvider = this.client.providers.get("json");
			for (const table of TABLES) {
				const docs = await jsonProvider.getAll(table);
				for (const doc of docs) {
					const newID = doc.id.split("-").join(".");
					await jsonProvider.delete(table, doc.id).catch(() => null);
					doc.id = newID;
					await this.client.providers.default.create(table, newID, doc);
				}
			}
			this.client.console.warn("Migration to RethinkDB Done. Process will now exit. Remove the `--migrate` flag");
			process.exit(0);
		}
		if (!this.client.schedule.get("clearCache")) {
			this.client.schedule.create("cacheCleanup", "*/10 * * * *", {
				catchUp: true,
				id: "clearCache",
			});
		}
		/*for (const guild of this.client.guilds.values()) {
			for (const member of guild.members.values()) {
				if (member.settings.words.length) {
					for (const word of member.settings.words) guild.addCachedWord(word, member);
				}
				if (member.settings.regexes.length) {
					for (const regex of member.settings.regexes) guild.addCachedRegexp(regex, member);
				}
			}
		}*/
	}
};

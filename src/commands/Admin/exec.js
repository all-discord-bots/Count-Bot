const { Command, util: { codeBlock } } = require("klasa");
const { exec } = require('child_process');
const username = require('os').userInfo().username;

module.exports = class extends Command {
	constructor (...args) {
		super(...args, {
			aliases: ["execute"],
			description: "Execute commands in the terminal, use with EXTREME CAUTION.",
			extendedHelp: [
				'The --silent flag runs in silent mode, not showing any console output',
				'The --language <lang> flag sets the language of the outputted code block',
				'The --raw flag sends the output raw, without any code blocks',
				'The --delete flag deletes the command message',
				'The --file flag interperts the response as a file URL/path to send',
				'The --filename <name> flag sets the name for the sent file',
				'The --wait flag waits for the program to finish before sending the output',
				'The --timeout <ms> flag sets a timeout'
			],
			guarded: true,
			permissionLevel: 10,
			usage: "<expression:str>",
			hidden: true
		});
	}

	async run (msg, [input]) {
		let parsed = this.client.utils.parseArgs([input], ['r', 'd', 's', 'f', 'w', 'fn:', 'l:']);
		if (parsed.length < 1) {
			throw 'You must provide a command to run!';
		}

		if (msg.flags.del || msg.flags.delete) {
			msg.delete();
		}

		let ps = exec(parsed.leftover.join(' '), { timeout: "timeout" in msg.flags ? Number(msg.flags.timeout) : 60000 });
		if (!ps) {
			throw 'Failed to start process!';
		}

		if (msg.flags.silent) {
			return;
		}

		let opts = {
			delay: 10,
			cutOn: '\n'
		};

		if (!msg.flags.raw) {
			opts.prefix = `\`\`\`${(msg.flags.lang || msg.flags.language) || 'prolog'}\n`; // bash
			opts.suffix = '\n```';
		}

		if (msg.flags.file) {
			let output = '';

			ps.stdout.on('data', data => output += data.toString());
			await new Promise((resolve) => {
				ps.once('exit', async () => {
					if (!output) {
						return resolve();
					}

					try {
						await msg.send({
							files: [
								{
									attachment: output.replace(/^file:\/\//, ''),
									name: (msg.flags.fn || msg.flags.filename)
								}
							]
						});
					} catch (err) {
						msg.error('Invalid URL/path!');
					}

					resolve();
				});
			});
		} else {
			if (msg.flags.wait) {
				let output = '';
				let handler = data => output += data.toString();

				[ps.stdout, ps.stderr].forEach((stream) => stream.on('data', handler));

				await new Promise((resolve) => {
					ps.once('exit', async () => {
						if (!output) {
							return resolve();
						}

						await this.client.utils.sendLarge(msg, `${this.clean(output)}`, `**\`OUTPUT\`**`, opts);

						resolve();
					});
				});
			} else {
				ps.stdout.on('data', data => this.client.utils.sendLarge(msg, `${this.clean(data)}`, `**\`OUTPUT\`**`, opts)); //prolog // `**\`OUTPUT\`**${codeBlock(language, this.clean(data))}`
				ps.stderr.on('data', data => this.client.utils.sendLarge(msg, `${this.clean(data)}`, `**\`ERROR\`**`, opts)); // `**\`ERROR\`**${codeBlock(language, this.clean(data))}`

				await new Promise((resolve) => ps.once('exit', resolve));
			}
		}

		//const result = await exec(input, { timeout: "timeout" in msg.flags ? Number(msg.flags.timeout) : 60000 }).catch((error) => ({ stdout: null, stderr: error }));
		//const output = result.stdout ? `**\`OUTPUT\`**${codeBlock("prolog", result.stdout)}` : "";
		//const outerr = result.stderr ? `**\`ERROR\`**${codeBlock("prolog", result.stderr)}` : "";

		//return msg.send([output, outerr].join("\n"));
	};

	clean (data) {
		return `${data}`
			.replace(/`/g, '\u200b$&')
			.replace(new RegExp(username, 'g'), '<Hidden>')
			.replace(/\[[0-9]*m/g, '');
	};
};

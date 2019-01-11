const chalk = require('chalk');
const { inspect } = require('util');

/**
 * The Highlight logger
 *
 * @class Logger
 */
class Logger {
	/**
	 * Creates an instance of Logger.
	 * @param { Highlight } client
	 *
	 * @memberOf Logger
	 */

	constructor(client) {
		this.client = client;
	}

	_log(prefix, message) {
		(console._original && console._original.log ? console._original.log : console.log)(`${prefix} ${message}`);
	}

	info(message) {
		//chalk.blue('🛈'), message)
		//chalk.blue('ℹ')
		//chalk.green('✔')
		this._log(chalk.green('\u2713'), message);
	}

	warn(message, error) {
		// chalk.yellow('⚠')
		this._log(chalk.yellow('!'), message);
		error && console.error(error);
	}

	severe(message, error) {
		//chalk.red('✖')
		this._log(chalk.red('!'), message);
		error && console.error(error);
	}

	debug(message) {
		this.info(inspect(message));
	}

	inject() {
		if (console._original) throw 'Logger already injected!';

		let original = {
			log: console.log,
			info: console.info,
			error: console.error,
			debug: console.debug
		};

		console._original = original;
		console.log = this._wrap(this.info);
		console.info = this._wrap(this.warn);
		console.error = this._wrap(this.severe);
		console.debug = this._wrap(this.debug);
	}

	uninject() {
		if (!console._original) throw 'Logger not injected!';

		let original = console._original;

		delete console._original;

		Object.assign(console, original);
	}

	_wrap(func) {
		let self = this;
		return function () {
			func.call(self, Array.from(arguments));
		};
	}
}

module.exports = Logger;

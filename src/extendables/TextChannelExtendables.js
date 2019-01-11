const { Extendable } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [String] });
	}

	static random(length = 1) {
		const random13chars = () => {
			return Math.random().toString(16).substring(2, 15)
		}
		return new Array(Math.ceil(length / 13)).fill(random13chars).reduce((string, func) => {
			return string + func();
		}, '').substring(0, length);
	}

}

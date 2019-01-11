const { Argument } = require('klasa');

module.exports = class extends Argument {

	run(arg, possible, message) {
		const category = this.constructor.regex.category.test(arg) ? this.client.category.get(this.constructor.regex.category.exec(arg)[1]) : null;
		if (category) return category;
		throw message.language.get('RESOLVER_INVALID_CATEGORY', possible.name);
	}

};

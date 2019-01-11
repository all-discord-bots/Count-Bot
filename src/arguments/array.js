const { Argument } = require('klasa');

module.exports = class extends Argument {

	constructor(...args) {
		super(...args, { aliases: ['array'] });
	}

	run(arg, possible, message) {
		console.log(arg);
		/*
		 * (?:\[(?:.*?)\])+
		 * (?:\[+(?:.*?)\]+)+
		 * (?:\[+(?:.*?)\]+)
		 * (\[([\'\"\`]\w+[\'\"\`]\,?\s?)+\])+
		 */
		// ['this', 'is', 'a', 'test', 'string']['this', 'is', 'also', 'a', 'test', 'string']
		// (\[+(.*?)\]+)+  - matches it as 1 string as there is no space between `][`. Will also match []]]].
		// (\[+(.*?)\]+)   - matches it as 2 strings as the match ends with a `]` to specify the end of the string. Will also match []]]].
		// (\[+(.*?)\])+   - matches it as 1 string as there is no space between `][`. Will not match `[]]]]`.
		// (\[+(.*?)\])    - matches it as 2 strings as the match ends with a `]` to specify the end of the string. Will not match `[]]]]`.
		if (!arg) throw message.language.get('RESOLVER_INVALID_STRING', possible.name);
		//const array = arg.replace(/([\'\"\`\,])/gi, '').match(/(\[(.*?)\])/gi).map((item) => item.replace(/(\[|\]\s?)/gi, '').split(' '));
		const array = arg.replace(/([\[\]\'\"\`\,])/gi, '').split(' ');//.match(/(?=\[(.*?)\])/i).filter((item) => item !== "").map((item) => item.split(' '))
		return array.flat();
	}

};

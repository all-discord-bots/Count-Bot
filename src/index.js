const path = require('path');
const shard = false;

module.exports = {
  Client: require(path.resolve(__dirname, './lib/HighlightClient')),
  Extensions: {
    StructureExtender: require(path.resolve(__dirname, './lib/extensions/StructureExtender')),
  },
	Managers: {
		//CommandManager: require('./commands'),
		Logger: require(path.resolve(__dirname, './managers/logger')),
		//Migrator: require('./migrator'),
		Stats: require(path.resolve(__dirname, './managers/stats')),
		//Config: require('./config'),
		//Notifications: require('./notifications'),
		//Storage: require('./storage'),
		//DynamicImports: require('./dynamic-imports'),
		//Plugins: require('./plugins')
	}
};

module.exports = require(`./${shard ? 'shard' : 'bot'}`);

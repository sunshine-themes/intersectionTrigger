const { plugins } = require('./build-config');
const { buildFormats } = require('./utils/utils');

const buildPlugins = () => {
	plugins.forEach(({ capitalized }) =>
		buildFormats({
			entryPath: `plugins/${capitalized.toLowerCase()}/${capitalized.toLowerCase()}`,
			name: capitalized.toLowerCase()
		})
	);
};

module.exports = buildPlugins;

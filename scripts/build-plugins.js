const { existsSync } = require('fs-extra');
const { config } = require('./build-config');
const { capitalize } = require('./helpers');

const buildPlugins = (buildAll) => {
  const plugins = [];
  config.plugins.forEach((name) => {
    const capitalized = capitalize(name);
    const jsFilePath = `./src/plugins/${capitalized.toLowerCase()}.js`;
    if (existsSync(jsFilePath)) {
      plugins.push({ name, capitalized });
    }
  });

  plugins.forEach(({ name, capitalized }) => buildAll({ path: `plugins/${capitalized.toLowerCase()}`, name: capitalized.toLowerCase() }));
};

module.exports = buildPlugins;

const fs = require('fs-extra');

const { config } = require('./build-config');
const { banner } = require('./utils/banner');
const { capitalize } = require('./helpers');
const { outputDir } = require('./utils/output-dir');

async function build(plugins) {
  const filename = `intersectiontrigger.esm`;
  const coreContent = [
    banner(),
    `export { default as IntersectionTrigger, default } from './core/core.esm.js';`,
    ...plugins.map(({ name, capitalized }) => `export { default as ${capitalized} } from './plugins/${capitalized.toLowerCase()}.esm.js';`),
  ].join('\n');

  await Promise.all([fs.writeFile(`./${outputDir}/${filename}.js`, coreContent)]);
}

async function buildMain() {
  const plugins = [];
  config.plugins.forEach((name) => {
    const capitalized = capitalize(name);
    const jsFilePath = `./src/plugins/${capitalized.toLowerCase()}.js`;
    if (fs.existsSync(jsFilePath)) {
      plugins.push({ name, capitalized });
    }
  });

  await build(plugins, 'esm');
}

module.exports = buildMain;

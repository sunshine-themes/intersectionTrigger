const fs = require('fs-extra');
const { plugins } = require('./build-config');
const { banner } = require('./utils/banner');
const { outputDir } = require('./utils/output-dir');

async function buildMain() {
	const filename = `intersectiontrigger.esm`;
	const coreContent = [
		banner(),
		`export { default as IntersectionTrigger, default } from './core/core.esm.js';`,
		...plugins.map(
			({ name, capitalized }) =>
				`export { default as ${capitalized} } from './plugins/${capitalized.toLowerCase()}/${capitalized.toLowerCase()}.esm.js';`
		)
	].join('\n');

	await Promise.all([fs.writeFile(`./${outputDir}/${filename}.js`, coreContent)]);
}

module.exports = buildMain;

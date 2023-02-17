const { existsSync } = require('fs-extra');
const { banner } = require('./utils/banner');
const { outputDir } = require('./utils/output-dir');
const babelConfig = require('./babel-config');
const { capitalize } = require('./helpers');

const config = {
	core: { entryPath: 'core/core', name: 'core' },
	plugins: ['toggle-class', 'guides', 'animation'],
};

const plugins = config.plugins.map((name) => {
	const capitalized = capitalize(name);
	const jsFilePath = `./src/plugins/${capitalized.toLowerCase()}/${capitalized.toLowerCase()}.ts`;
	if (existsSync(jsFilePath)) {
		return { name, capitalized };
	} else {
		throw new Error(`There is no such plugin path: ${jsFilePath} .`);
	}
});

const buildConfig = ({ data, babel = null, format = 'esm', target = 'esnext', bundle = true, minify = false, sourcemap = false }) => {
	const { entryPath, outPath, name } = data;
	const fileNameFormat = format === 'iife' ? '' : `.${format}`;
	const outfileNameVersion = target === 'es5' ? `.browser` : '';
	const fileNameMinify = minify ? '.min' : '';
	const outfileName = `${outputDir}/${outPath ?? entryPath}${fileNameFormat}${outfileNameVersion}${fileNameMinify}.js`;
	const plugins = target === 'es5' && babel ? [babel(babelConfig)] : [];

	return {
		globalName: `it_${name}`,
		entryPoints: [`src/${entryPath}.ts`],
		outfile: outfileName,
		format,
		minify,
		bundle,
		sourcemap,
		banner: { js: banner() },
		target: [target],
		plugins,
	};
};

module.exports = { config, buildConfig, plugins };

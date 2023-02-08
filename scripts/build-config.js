const { banner } = require('./utils/banner');
const { outputDir } = require('./utils/output-dir');
const babelConfig = require('./babel-config');

const config = {
	core: { path: 'core/core', name: 'core' },
	plugins: ['toggle-class', 'guides', 'animation'],
};

const buildConfig = ({ data, babel = null, format = 'esm', target = 'esnext', bundle = true, minify = false, sourcemap = false }) => {
	const fileNameFormat = format === 'iife' ? '' : `.${format}`;
	const outfileNameVersion = target === 'es5' ? `.browser` : '';
	const fileNameMinify = minify ? '.min' : '';
	const outfileName = `${outputDir}/${data.path}${fileNameFormat}${outfileNameVersion}${fileNameMinify}.js`;
	const plugins = target === 'es5' && babel ? [babel(babelConfig)] : [];

	return {
		globalName: `it_${data.name}`,
		entryPoints: [`src/${data.path}.ts`],
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

module.exports = { config, buildConfig };

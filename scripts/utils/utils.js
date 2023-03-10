const { build } = require('estrella');
const { buildConfig } = require('../build-config');

const buildFormats = async data => {
	const { default: babel } = await import('esbuild-plugin-babel');
	//IIF
	// build(buildConfig({ data, format: 'iife', target: 'es5', babel }));
	build(buildConfig({ data, format: 'iife', target: 'es5', babel, minify: true, sourcemap: true })); //browser
	//ESM
	build(buildConfig({ data }));
	build(buildConfig({ data, minify: true, sourcemap: true }));
	build(buildConfig({ data, target: 'es5', babel, minify: true, sourcemap: true })); //browser
	//CJS
	build(buildConfig({ data, format: 'cjs' }));
	build(buildConfig({ data, format: 'cjs', minify: true }));
};

module.exports = { buildFormats };

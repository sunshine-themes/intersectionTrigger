const fs = require('fs-extra');
const { config } = require('./build-config');
const { outputDir } = require('./utils/output-dir');
const { banner } = require('./utils/banner');
const { capitalize } = require('./helpers');
const exec = require('exec-sh').promise;

const entryFileName = 'intersectiontrigger-bundle';

async function buildEntry(plugins, format, target = 'esnext', isBrowser = false) {
	const isIIFE = format === 'iife';
	// const isESM = format === 'esm';
	const isES5 = target === 'es5';

	const outfileFormat = isIIFE ? '' : `.${format}`;
	const outfileVersion = isBrowser ? `.browser` : '';
	const outfileMinify = isBrowser ? `.min` : '';
	const outfilePath = `${outputDir}/${entryFileName}${outfileFormat}${outfileVersion}${outfileMinify}.js`;

	const contentFilePath = isBrowser ? '' : '.esm';

	const content = [
		`import IntersectionTrigger from './core/core${contentFilePath}.js';`,
		...plugins.map(({ name, capitalized }) => `import ${capitalized} from './plugins/${capitalized.toLowerCase()}${contentFilePath}.js';`),
		'const plugins = [',
		...plugins.map((mod) => `${mod.capitalized},`),
		']',
		'IntersectionTrigger.registerPlugins(plugins);',
		'export default IntersectionTrigger',
	].join('\n');

	const buildContent = [
		`const { build } = require('estrella');`,
		`const babelConfig = require('../scripts/babel-config');`,
		isES5 ? `import('esbuild-plugin-babel').then(({default: babel}) => {` : '',
		`const buildConfig = {
            globalName: '${isIIFE ? 'intersectiontrigger' : ''}',
            entryPoints: ['src/temp-${entryFileName}.js'],
            outfile: '${outfilePath}',
            format: '${format}',
            minify: ${isBrowser},
            bundle: ${isBrowser},
            sourcemap: ${isBrowser},
            banner: { js: \`${banner()}\` },
            target: ['${target}'],
            plugins: ${isES5 ? `[babel(babelConfig)]` : '[]'},
        };
        build(buildConfig);`,
		isES5 ? `})` : '',
	].join('\n');

	await Promise.all([fs.writeFile(`./src/temp-${entryFileName}.js`, content), fs.writeFile(`./src/temp-esbuild.js`, buildContent)]);

	await exec(`node src/temp-esbuild.js`);
}

async function buildBundle() {
	const plugins = [];
	config.plugins.forEach((name) => {
		const capitalized = capitalize(name);
		const jsFilePath = `./src/plugins/${capitalized.toLowerCase()}.ts`;
		if (fs.existsSync(jsFilePath)) {
			plugins.push({ name, capitalized });
		}
	});
	await buildEntry(plugins, 'esm');
	await buildEntry(plugins, 'esm', 'es5', true);
	await buildEntry(plugins, 'iife', 'es5', true);

	fs.unlink(`./src/temp-${entryFileName}.js`);
	fs.unlink(`./src/temp-esbuild.js`);
}

module.exports = buildBundle;

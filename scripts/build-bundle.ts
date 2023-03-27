import fs from 'fs-extra';
import { plugins } from './build-config';
import { outputDir } from './utils/output-dir';
import { banner } from './utils/banner';
import exec from 'exec-sh';

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
		...plugins.map(
			({ capitalized }) =>
				`import ${capitalized} from './plugins/${capitalized.toLowerCase()}/${capitalized.toLowerCase()}${contentFilePath}.js';`
		),
		'const plugins = [',
		...plugins.map(mod => `${mod.capitalized},`),
		']',
		'IntersectionTrigger.registerPlugins(plugins);',
		'export default IntersectionTrigger'
	].join('\n');

	const buildContent = [
		`import { BuildOptions, build } from 'esbuild';`,
		isES5 ? `import babelConfig from '../scripts/babel-config';` : '',
		isES5 ? `import babel from 'esbuild-plugin-babel';` : '',
		`const buildConfig: BuildOptions = {
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
        build(buildConfig);`
	].join('\n');

	await Promise.all([fs.writeFile(`./src/temp-${entryFileName}.js`, content), fs.writeFile(`./src/temp-esbuild.ts`, buildContent)]);

	await exec.promise(`ts-node src/temp-esbuild.ts`);
}

async function buildBundle() {
	await buildEntry(plugins, 'esm');
	await buildEntry(plugins, 'esm', 'es5', true);
	await buildEntry(plugins, 'iife', 'es5', true);

	fs.unlink(`./src/temp-${entryFileName}.js`);
	fs.unlink(`./src/temp-esbuild.ts`);
}

export default buildBundle;

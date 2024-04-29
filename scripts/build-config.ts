import fs from 'fs-extra';
import { banner } from './utils/banner';
import { outputDir } from './utils/output-dir';
import babelConfig from './babel-config';
import { capitalize } from './helpers';
import { BuildOptions, Format, Plugin } from 'esbuild';

interface BuildConfig {
	data: { entryPath: string; outPath: string; name: string };
	babel?: (config: object) => Plugin;
	format?: Format;
	target?: string;
	bundle?: boolean;
	minify?: boolean;
	sourcemap?: boolean;
}

const config = {
	core: { entryPath: 'core/core', name: 'core' },
	plugins: ['toggle-class', 'guides', 'animation']
};

const plugins = config.plugins.map(name => {
	const capitalized = capitalize(name);
	const jsFilePath = `./src/plugins/${capitalized.toLowerCase()}/${capitalized.toLowerCase()}.ts`;
	if (fs.existsSync(jsFilePath)) {
		return { name, capitalized };
	} else {
		throw new Error(`There is no such plugin path: ${jsFilePath} .`);
	}
});

const buildConfig = ({
	data,
	babel,
	format = 'esm',
	target = 'esnext',
	bundle = true,
	minify = false,
	sourcemap = false
}: BuildConfig): BuildOptions => {
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
		plugins
	};
};

export { config, buildConfig, plugins };

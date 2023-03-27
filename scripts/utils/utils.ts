import { build, BuildContext, context } from 'esbuild';
import { buildConfig } from '../build-config';
import babel from 'esbuild-plugin-babel';

const buildScripts = async (fn: typeof build | typeof context, mode: 'build' | 'watch', data, babel) => {
	//IIF
	// build(buildConfig({ data, format: 'iife', target: 'es5', babel }));
	const iifeCtx = await fn(buildConfig({ data, format: 'iife', target: 'es5', babel, minify: true, sourcemap: true })); //browser

	//ESM
	const esmCtx = await fn(buildConfig({ data }));
	const esmMiniCtx = await fn(buildConfig({ data, minify: true, sourcemap: true }));
	const esmEs5Ctx = await fn(buildConfig({ data, target: 'es5', babel, minify: true, sourcemap: true })); //browser

	//CJS
	const cjsCtx = await fn(buildConfig({ data, format: 'cjs' }));
	const cjsMiniCtx = await fn(buildConfig({ data, format: 'cjs', minify: true }));

	if (mode === 'watch') {
		await (iifeCtx as BuildContext).watch();
		await (esmCtx as BuildContext).watch();
		await (esmMiniCtx as BuildContext).watch();
		await (esmEs5Ctx as BuildContext).watch();
		await (cjsCtx as BuildContext).watch();
		await (cjsMiniCtx as BuildContext).watch();
	}
};

const buildFormats = data => {
	if (process.argv.includes('-w')) {
		//watch
		buildScripts(context, 'watch', data, babel);

		return;
	}

	//build
	buildScripts(build, 'build', data, babel);
};

export { buildFormats };

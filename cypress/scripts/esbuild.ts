import { sassPlugin } from 'esbuild-sass-plugin';
import fs from 'fs-extra';
import path from 'path';
import { BuildOptions, context, build } from 'esbuild';
import babel from 'esbuild-plugin-babel';

const host = 'http://localhost:3000/';
const pathToScripts = `cypress/scripts`;
const htmlFilePaths = getFilePaths('cypress/html', 'html');
const buildConfig: BuildOptions = {
	entryPoints: getFilePaths(`${pathToScripts}/src/js`, 'ts'),
	outdir: `${pathToScripts}/build`,
	target: 'esnext',
	format: 'esm',
	minify: false,
	bundle: true,
	outbase: `${pathToScripts}/src/js`,
	tsconfig: `${pathToScripts}/tsconfig.json`,
	plugins: [
		sassPlugin(),
		babel({
			filter: /.*/,
			namespace: '',
			config: { presets: ['@babel/preset-typescript'], plugins: ['istanbul'] }
		})
	]
};

const buildScripts = () => {
	build(buildConfig).then(() => embedScripts());
};
const watchScripts = async () => {
	const ctx = await context(buildConfig);
	await ctx.watch();
};

if (process.argv.includes('-w')) {
	//watch
	buildScripts();
	watchScripts();
} else {
	//build
	buildScripts();
}

//Helpers
function getFilePaths(dirPath: string, fileExtension: string): string[] {
	let filePaths = [] as string[];
	const files = fs.readdirSync(dirPath);

	for (const file of files) {
		const filePath = path.join(dirPath, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			// Recursively search for files in subdirectories
			filePaths = filePaths.concat(getFilePaths(filePath, fileExtension));
		} else if (path.extname(file) === `.${fileExtension}`) {
			// Add files to the list of file paths
			filePaths.push(filePath);
		}
	}

	return filePaths;
}
const embedScripts = () => {
	const jsPaths = getFilePaths(`${pathToScripts}/build`, 'js');
	const cssPaths = getFilePaths(`${pathToScripts}/build`, 'css');

	jsPaths.forEach(jsPath => {
		const jsFileName = path.parse(jsPath).name;
		const HTMLFilePath = htmlFilePaths.find(htmlPath => htmlPath.includes(jsFileName));

		if (HTMLFilePath) {
			const cssPath = cssPaths.find(cssPath => cssPath.includes(jsFileName));

			// const jsContent = fs.readFileSync(jsPath, 'utf-8');
			// const cssContent = cssPath && fs.readFileSync(cssPath, 'utf-8');

			const HTMLFileContent = fs
				.readFileSync(HTMLFilePath, 'utf-8')
				.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, `<script src="${host}${jsPath.replace(/\\/g, '/')}"></script>`)
				.replace(/<link([\s\S]*?)\/>/gim, `<link rel="stylesheet" href="${host}${cssPath?.replace(/\\/g, '/')}" />`);

			// Write the updated HTML content back to the file
			fs.writeFileSync(HTMLFilePath, HTMLFileContent);
		}
	});
};

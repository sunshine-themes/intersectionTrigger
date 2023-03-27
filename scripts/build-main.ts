import fs from 'fs-extra';
import { plugins } from './build-config';
import { banner } from './utils/banner';
import { outputDir } from './utils/output-dir';

async function buildMain() {
	const filename = `intersectiontrigger.esm`;
	const coreContent = [
		banner(),
		`export { default as IntersectionTrigger, default } from './core/core.esm.js';`,
		...plugins.map(
			({ capitalized }) =>
				`export { default as ${capitalized} } from './plugins/${capitalized.toLowerCase()}/${capitalized.toLowerCase()}.esm.js';`
		)
	].join('\n');

	await Promise.all([fs.writeFile(`./${outputDir}/${filename}.js`, coreContent)]);
}

export default buildMain;

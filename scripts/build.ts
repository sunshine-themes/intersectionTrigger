import fs from 'fs-extra';
import { outputDir, createOutputDir } from './utils/output-dir';
import buildCore from './build-core';
import buildPlugins from './build-plugins';
import buildMain from './build-main';
import buildBundle from './build-bundle';
import buildMath from './build-math';

//make distribution dir
createOutputDir();

//Copy required files
const mainFileTypeName = 'intersectiontrigger.d.ts';
const bundledFileTypeName = 'intersectiontrigger-bundle.esm.d.ts';

//The published manifest gets "sideEffects": false so bundlers can drop plugin modules the consumer never imports.
//It must stay out of the ROOT package.json: Cypress bundles the specs with webpack against the root manifest, and
//any sideEffects declaration there tree-shakes side-effect-only imports (cypress/support) — every withIT spec breaks.
fs.copy('./package.json', `./${outputDir}/package.json`).then(() => {
	const distPkgPath = `./${outputDir}/package.json`;
	const distPkg = fs.readJsonSync(distPkgPath) as Record<string, unknown>;
	const publishedPkg: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(distPkg)) {
		publishedPkg[key] = value;
		if ('type' === key) publishedPkg.sideEffects = false;
	}
	fs.writeFileSync(distPkgPath, JSON.stringify(publishedPkg, null, '\t') + '\n');
});
fs.copy('./README.md', `./${outputDir}/README.md`);
fs.copy('./LICENSE', `./${outputDir}/LICENSE`);
fs.copy(`./src/types/${mainFileTypeName}`, `./${outputDir}/${mainFileTypeName}`);
fs.copy(`./src/types/${bundledFileTypeName}`, `./${outputDir}/${bundledFileTypeName}`);
fs.copy('./src/types', `./${outputDir}/types`).then(() => {
	fs.unlink(`./${outputDir}/types/${mainFileTypeName}`);
	fs.unlink(`./${outputDir}/types/${bundledFileTypeName}`);
});

buildCore(); //Core build
buildPlugins(); //Plugin build
buildMain(); //build the main file
buildBundle(); //bundle build
buildMath(); //public math subpath

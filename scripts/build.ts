import fs from 'fs-extra';
import { outputDir, createOutputDir } from './utils/output-dir';
import buildCore from './build-core';
import buildPlugins from './build-plugins';
import buildMain from './build-main';
import buildBundle from './build-bundle';

//make distribution dir
createOutputDir();

//Copy required files
const mainFileTypeName = 'intersectiontrigger.d.ts';
const bundledFileTypeName = 'intersectiontrigger-bundle.esm.d.ts';

fs.copy('./package.json', `./${outputDir}/package.json`);
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

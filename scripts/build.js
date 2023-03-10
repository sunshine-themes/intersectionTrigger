#!/usr/bin/env node
const { copy, unlink } = require('fs-extra');
const { outputDir, createOutputDir } = require('./utils/output-dir');
const buildCore = require('./build-core');
const buildPlugins = require('./build-plugins');
const buildMain = require('./build-main');
const buildBundle = require('./build-bundle');

//make distribution dir
createOutputDir();

//Copy required files
const mainFileTypeName = 'intersectiontrigger.d.ts';
const bundledFileTypeName = 'intersectiontrigger-bundle.esm.d.ts';

copy('./package.json', `./${outputDir}/package.json`);
copy('./README.md', `./${outputDir}/README.md`);
copy('./LICENSE', `./${outputDir}/LICENSE`);
copy(`./src/types/${mainFileTypeName}`, `./${outputDir}/${mainFileTypeName}`);
copy(`./src/types/${bundledFileTypeName}`, `./${outputDir}/${bundledFileTypeName}`);
copy('./src/types', `./${outputDir}/types`).then(() => {
	unlink(`./${outputDir}/types/${mainFileTypeName}`);
	unlink(`./${outputDir}/types/${bundledFileTypeName}`);
});

buildCore(); //Core build
buildPlugins(); //Plugin build
buildMain(); //build the main file
buildBundle(); //bundle build

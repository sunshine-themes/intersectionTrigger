#!/usr/bin/env node
const { build } = require('estrella');
const { copy } = require('fs-extra');
const { buildConfig } = require('./build-config');
const { outputDir } = require('./utils/output-dir');
const buildCore = require('./build-core');
const buildPlugins = require('./build-plugins');
const buildMain = require('./build-main');
const buildBundle = require('./build-bundle');

const buildAll = async (data) => {
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

//Copy required files
copy('./package.json', `./${outputDir}/package.json`);
copy('./README.md', `./${outputDir}/README.md`);
copy('./LICENSE', `./${outputDir}/LICENSE`);

buildCore(buildAll); //Core build
buildPlugins(buildAll); //Plugin build
buildMain(); //build the main file
buildBundle(); //bundle build

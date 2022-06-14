#!/usr/bin/env node
const { build } = require('estrella');

const date = new Date();

const babelConfig = {
  filter: /.*/,
  namespace: '',
  config: {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'entry',
          corejs: 3.22,
          modules: false,
          targets: {
            browsers: ['> 0.25%, not dead'],
          },
        },
      ],
    ],
  },
};

import('esbuild-plugin-babel').then(({ default: babel }) => {
  const buildConfig = (format, target, minify, name) => {
    const fileNameFormat = format === 'iife' ? 'es5' : format;
    const fileNameMinify = minify ? '.min' : '';
    const plugins = target === 'es5' ? [babel(babelConfig)] : [];
    const outfileName = `lib/${name}.${fileNameFormat}${fileNameMinify}.js`;
    const banner = `/*
* ${name} v${process.env.npm_package_version}
* https://sunshine-themes.com/intersectionTrigger
*
* @license Copyright ${date.getFullYear()}, Sunshine. All rights reserved.
* Subject to the terms at https://sunshine-themes.com/intersectionTrigger/standard-licensew.
* @author: Sherif magdy, sherifmagdy@sunshine-themes.com
*/
                  `;
    return {
      globalName: `${name.toLowerCase()}`,
      entryPoints: [`src/${name}.js`],
      outfile: outfileName,
      format: format,
      minify: minify,
      bundle: true,
      banner: { js: banner },
      target: [target],
      plugins: plugins,
    };
  };

  ['IntersectionTrigger', 'Guides'].forEach((name) => {
    build(buildConfig('iife', 'es5', false, name));
    build(buildConfig('iife', 'es5', true, name));
    build(buildConfig('esm', 'esnext', false, name));
    build(buildConfig('esm', 'esnext', true, name));
    build(buildConfig('cjs', 'esnext', false, name));
    build(buildConfig('cjs', 'esnext', true, name));
  });
});

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
  const buildConfig = (format, target, minify, data) => {
    const fileNameFormat = format === 'iife' ? 'es5' : format;
    const fileNameMinify = minify ? '.min' : '';
    const plugins = target === 'es5' ? [babel(babelConfig)] : [];
    const outfileName = `lib/${data.path}.${fileNameFormat}${fileNameMinify}.js`;
    const banner = `/*
* ${data.name} v${process.env.npm_package_version}
* https://sunshine-themes.com/intersectionTrigger
*
* @license Copyright ${date.getFullYear()}, Sunshine. All rights reserved.
* Subject to the terms at https://sunshine-themes.com/intersectionTrigger/standard-licensew.
* @author: Sherif magdy, sherifmagdy@sunshine-themes.com
*/
                  `;
    return {
      globalName: `${data.name.toLowerCase()}`,
      entryPoints: [`src/${data.path}.js`],
      outfile: outfileName,
      format: format,
      minify: minify,
      bundle: true,
      banner: { js: banner },
      target: [target],
      plugins: plugins,
    };
  };

  [
    { name: 'IntersectionTrigger', path: 'IntersectionTrigger' },
    { name: 'Animation', path: 'plugins/Animation' },
    { name: 'ToggleClass', path: 'plugins/ToggleClass' },
    { name: 'Guides', path: 'Guides' },
  ].forEach((obj) => {
    build(buildConfig('iife', 'es5', false, obj));
    build(buildConfig('iife', 'es5', true, obj));
    build(buildConfig('esm', 'esnext', false, obj));
    build(buildConfig('esm', 'esnext', true, obj));
    build(buildConfig('cjs', 'esnext', false, obj));
    build(buildConfig('cjs', 'esnext', true, obj));
  });
});

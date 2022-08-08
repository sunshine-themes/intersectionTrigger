module.exports = {
  filter: /.*/,
  namespace: '',
  config: {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'entry',
          corejs: 3.22,
          targets: {
            browsers: ['> 0.25%, not dead'],
          },
        },
      ],
    ],
  },
};

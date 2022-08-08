const { config } = require('./build-config');

const buildCore = (build) => build(config.core);
module.exports = buildCore;

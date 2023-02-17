const { config } = require('./build-config');
const { buildFormats } = require('./utils/utils');

const buildCore = () => buildFormats(config.core);
module.exports = buildCore;

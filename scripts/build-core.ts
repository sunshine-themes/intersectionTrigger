import { config } from './build-config';
import { buildFormats } from './utils/utils';

const buildCore = () => buildFormats(config.core);
export default buildCore;

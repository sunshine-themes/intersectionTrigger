import { plugins } from './build-config';
import { buildFormats } from './utils/utils';

const buildPlugins = () => {
	plugins.forEach(({ capitalized }) =>
		buildFormats({
			entryPath: `plugins/${capitalized.toLowerCase()}/${capitalized.toLowerCase()}`,
			name: capitalized.toLowerCase()
		})
	);
};

export default buildPlugins;

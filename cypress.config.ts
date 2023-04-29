import { defineConfig } from 'cypress';
import registerCodeCoverageTasks from '@cypress/code-coverage/task';
import webpackPreprocessor from './cypress/plugins/webpack-preprocessor';

export default defineConfig({
	projectId: 'qwazj6',
	e2e: {
		baseUrl: 'http://localhost:3000/cypress/html',
		setupNodeEvents(on, config) {
			registerCodeCoverageTasks(on, config);
			webpackPreprocessor(on, config);

			// It's IMPORTANT to return the config object
			// with any changed environment variables
			return config;
		}
	}
});

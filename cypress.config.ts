import { defineConfig } from 'cypress';
import registerCodeCoverageTasks from '@cypress/code-coverage/task';

export default defineConfig({
	projectId: 'qwazj6',
	e2e: {
		baseUrl: 'http://localhost:3000/cypress/html',
		setupNodeEvents(on, config) {
			registerCodeCoverageTasks(on, config);

			// It's IMPORTANT to return the config object
			// with any changed environment variables
			return config;
		}
	}
});

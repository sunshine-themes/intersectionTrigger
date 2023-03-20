import { defineConfig } from 'cypress';

export default defineConfig({
	projectId: 'qwazj6',
	e2e: {
		baseUrl: 'http://localhost:3000/cypress/e2e/templates'
	}
});

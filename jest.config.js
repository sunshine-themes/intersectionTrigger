module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ['./tests/_template.ts'],
	roots: ['<rootDir>/src/', '<rootDir>/tests/'],
	collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/types/**'],
	verbose: true,
	testEnvironmentOptions: {
		pretendToBeVisual: true
	}
};

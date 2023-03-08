module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/*.test.(js|jsx|ts|tsx)'],
	moduleFileExtensions: ['ts', 'js', 'json', 'node'],
	collectCoverage: true,
	coverageDirectory: 'coverage',
	collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],
	coverageReporters: ['text', 'lcov']
};

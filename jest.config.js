module.exports = {
	preset: 'ts-jest',
	roots: ['./src/'],
	testEnvironment: 'node',
	testMatch: ['**/*.test.ts'],
	moduleFileExtensions: ['ts', 'js', 'json', 'node'],
	collectCoverage: true,
	coverageDirectory: 'coverage',
	collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
	coverageReporters: ['text', 'lcov']
};

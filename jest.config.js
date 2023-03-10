module.exports = {
	preset: 'ts-jest',
	roots: ['<rootDir>/src/', '<rootDir>/tests/'],
	testEnvironment: 'node',
	testMatch: ['**/*.test.(js|jsx|ts|tsx)'],
	moduleFileExtensions: ['ts', 'js', 'json', 'node'],
	coverageDirectory: 'coverage',
	collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts']
};

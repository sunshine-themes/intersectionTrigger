module.exports = {
	preset: 'ts-jest',
	roots: ['<rootDir>/tests/'],
	testEnvironment: 'node',
	testMatch: ['**/*.test.(js|jsx|ts|tsx)'],
	moduleFileExtensions: ['ts', 'js', 'json', 'node']
};

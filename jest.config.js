module.exports = {
	preset: 'ts-jest',
	roots: ['<rootDir>/src/', '<rootDir>/tests/'],
	collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/types/**']
};

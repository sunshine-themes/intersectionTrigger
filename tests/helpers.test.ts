import { is, splitStr } from '../src/helpers';

describe('is', () => {
	test('should return true for a function', () => {
		expect(is.function(() => {})).toBe(true);
	});

	test('should return false for a non-function', () => {
		expect(is.function('not a function')).toBe(false);
	});

	test('should return true for a string', () => {
		expect(is.string('hello')).toBe(true);
	});

	test('should return false for a non-string', () => {
		expect(is.string(123)).toBe(false);
	});
});

describe('splitStr', () => {
	test('should split a string into an array of words', () => {
		expect(splitStr('hello world')).toEqual(['hello', 'world']);
	});
});

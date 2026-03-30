import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import cypressPlugin from 'eslint-plugin-cypress';
import globals from 'globals';

export default [
	{
		ignores: ['node_modules/**', 'dist/**', 'build/**', '*.js', 'types/**', 'coverage/**', 'cypress/scripts/build/**', 'tests/**']
	},
	eslint.configs.recommended,
	{
		files: ['src/**/*.ts', 'scripts/**/*.ts', 'cypress/**/*.ts', 'cypress/**/*.js'],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module'
			},
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		plugins: {
			'@typescript-eslint': tseslint,
			import: importPlugin,
			prettier: prettierPlugin
		},
		rules: {
			...tseslint.configs.recommended.rules,
			'new-cap': 'error',
			'no-invalid-this': 'error',
			'no-unused-expressions': 'off',
			'no-empty-function': 'off',
			'import/no-unresolved': 'off',
			'import/namespace': 'warn',
			'import/named': 'warn',
			'no-prototype-builtins': 'warn',
			'no-mixed-spaces-and-tabs': 'off',
			'@typescript-eslint/ban-ts-comment': 'warn',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/no-namespace': [
				'error',
				{
					allowDeclarations: true
				}
			],
			'@typescript-eslint/no-unused-expressions': 'warn',
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'prettier/prettier': [
				'error',
				{
					endOfLine: 'auto'
				}
			],
			'arrow-body-style': 'off',
			'prefer-arrow-callback': 'off',
			'no-undef': 'off',
			'no-useless-assignment': 'off'
		}
	},
	{
		files: ['cypress/**/*.ts', 'cypress/**/*.js'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.mocha,
				cy: 'readonly',
				describe: 'readonly',
				it: 'readonly',
				before: 'readonly',
				after: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				expect: 'readonly',
				Cypress: 'readonly'
			}
		},
		plugins: {
			cypress: cypressPlugin
		},
		rules: {
			'cypress/no-unnecessary-waiting': 'warn',
			'cypress/no-assigning-return-values': 'warn',
			'no-unused-expressions': 'warn',
			'@typescript-eslint/no-unused-expressions': 'warn'
		}
	}
];

module.exports = {
	'extends': [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript'
	],
	'env': {
		'node': true,
		'es6': true
	},
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'sourceType': 'module',
		'ecmaVersion': 2020
	},
	'plugins': [
		'@typescript-eslint',
		'import',
		'promise',
		'node'
	],
	'rules': {
		'no-var': 2,
		'no-unused-vars': 0,
		'no-unused-labels': 1,
		'no-case-declarations': 0,
		'no-constant-condition': [2, { 'checkLoops': false }],
		'no-unreachable': 2,
		'object-curly-spacing': [2, 'always'],
		'prefer-const': 2,
		'quotes': [2, 'single', { 'avoidEscape': true }],
		'semi': [2, 'always'],
		'no-extra-semi': 2,
		'space-before-blocks': [2, 'always'],
		'keyword-spacing': [2, { 'before': true, 'after': true }],
		'yoda': 2,
		'strict': [2, 'never'],
		'arrow-body-style': 0,
		'arrow-parens': [2, 'always'],
		'no-inner-declarations': 0,
		'one-var': [2, 'never'],
		'no-useless-constructor': 2,
		'no-useless-rename': 2,
		'import/prefer-default-export': 0,
		'import/no-default-export': 2,
		'@typescript-eslint/explicit-module-boundary-types': 0,
		'@typescript-eslint/no-explicit-any': 0,
		'@typescript-eslint/no-unused-vars': 0,
		'@typescript-eslint/no-non-null-assertion': 0,
		'@typescript-eslint/ban-types': 0,
		'promise/always-return': 2,
		'promise/no-return-wrap': 2,
		'promise/param-names': 2,
		'promise/catch-or-return': 2,
		'promise/no-native': 0,
		'promise/no-nesting': 1,
		'promise/no-promise-in-callback': 1,
		'promise/no-callback-in-promise': 1,
		'promise/avoid-new': 1,
		'promise/no-new-statics': 2,
		'promise/no-return-in-finally': 1,
		'promise/valid-params': 1
	}
};
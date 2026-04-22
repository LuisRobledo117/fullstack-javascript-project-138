import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/', 'dist/'],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 2021,
      sourceType: 'module',
      node: true,
    },
    rules: {
      ...js.configs.recommended.rules,
      // Reglas de indentación
      indent: ['error', 2, { SwitchCase: 1 }],

      // Reglas de comillas
      quotes: ['error', 'single', { avoidEscape: true }],

      // Reglas de espacios en blanco
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'space-before-function-paren': ['error', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
      'space-before-blocks': 'error',
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'comma-spacing': ['error', { before: false, after: true }],
      semi: ['error', 'always'],
      'no-mixed-spaces-and-tabs': 'error',
      'eol-last': ['error', 'always'],
      'space-infix-ops': 'error',
    },
  },
];

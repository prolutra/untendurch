// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import perfectionist from 'eslint-plugin-perfectionist';
import globals from 'globals';

/**
 * Shared ESLint flat config for the untendurch monorepo.
 *
 * References:
 * - ESLint flat config: https://eslint.org/docs/latest/use/configure/configuration-files
 * - typescript-eslint: https://typescript-eslint.io/getting-started
 * - eslint-plugin-react: https://github.com/jsx-eslint/eslint-plugin-react
 */

/** @type {import('typescript-eslint').ConfigArray} */
const baseConfig = tseslint.config(
  // Ignore patterns
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.d.ts',
      '.yarn/**',
      '**/public/**',
      '**/build/**',
      'db-backup/**',
      'scripts/**',
      '**/*.config.mjs',
      '**/*.config.js',
      '**/*.config.cjs',
    ],
  },

  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript-ESLint recommended rules
  ...tseslint.configs.recommended,

  // Perfectionist sorting rules (natural order)
  // https://perfectionist.dev/configs/recommended-natural
  perfectionist.configs['recommended-natural'],

  // TypeScript settings for all TS/JS files
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Relax some rules for practicality
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);

/** @type {import('typescript-eslint').ConfigArray} */
const reactConfig = tseslint.config(
  // React plugin flat config
  {
    files: ['packages/frontend/**/*.{ts,tsx,js,jsx}'],
    ...reactPlugin.configs.flat.recommended,
    ...reactPlugin.configs.flat['jsx-runtime'],
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React 17+ with new JSX transform doesn't need React in scope
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off', // Using TypeScript for prop validation
    },
  }
);

/** @type {import('typescript-eslint').ConfigArray} */
const nodeConfig = tseslint.config({
  files: ['packages/backend/**/*.{ts,js}', 'packages/tools/**/*.{ts,js}'],
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
});

export default tseslint.config(...baseConfig, ...reactConfig, ...nodeConfig);

/**
 * Prettier configuration for the untendurch monorepo.
 * Run via CLI only - not integrated with ESLint.
 *
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import('prettier').Config}
 */
export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  tabWidth: 2,
  printWidth: 80,
  plugins: ['prettier-plugin-tailwindcss'],
};

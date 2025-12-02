/**
 * Prettier configuration for the frontend package.
 * Includes Tailwind CSS plugin for class sorting.
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

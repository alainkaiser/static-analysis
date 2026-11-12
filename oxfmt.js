/** @type {import('oxfmt').OxfmtConfig} */
export default {
  // Oxfmt defaults to 100; Biome and Prettier default to 80.
  printWidth: 80,
  semi: false,
  singleQuote: true,
  // Biome leaves CSS-in-JS and other embedded code untouched.
  embeddedLanguageFormatting: 'off',
  // Biome does not reorder package.json keys.
  sortPackageJson: false,
  // Biome's import order: node: builtins, packages, aliases, then relative
  // paths, with no blank lines added and existing blank lines kept as breaks.
  sortImports: {
    groups: [
      'builtin',
      'external',
      ['internal', 'subpath'],
      'parent',
      ['sibling', 'index'],
      'unknown',
    ],
    newlinesBetween: false,
    partitionByNewline: true,
  },
  // Biome 2.5 formats neither Markdown nor YAML.
  ignorePatterns: ['**/*.md', '**/*.mdx', '**/*.yml', '**/*.yaml'],
  overrides: [
    {
      // Biome keeps double quotes in CSS.
      files: ['**/*.css'],
      options: { singleQuote: false },
    },
  ],
}

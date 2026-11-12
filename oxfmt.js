/** @type {import('oxfmt').OxfmtConfig} */
export default {
  printWidth: 80,
  semi: false,
  singleQuote: true,
  embeddedLanguageFormatting: 'off',
  sortPackageJson: false,
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
  ignorePatterns: ['**/*.md', '**/*.mdx', '**/*.yml', '**/*.yaml'],
  overrides: [
    {
      files: ['**/*.css'],
      options: { singleQuote: false },
    },
  ],
}

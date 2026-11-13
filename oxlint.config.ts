import { defineConfig } from 'oxlint'
import { base } from './oxlint.js'

export default defineConfig({
  extends: [base],
  ignorePatterns: ['test/fixtures/**'],
  options: {
    reportUnusedDisableDirectives: 'error',
  },
})

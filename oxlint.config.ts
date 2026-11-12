import { defineConfig } from 'oxlint'
import { base } from './oxlint.js'

export default defineConfig({
  extends: [base],
  options: {
    reportUnusedDisableDirectives: 'error',
  },
})

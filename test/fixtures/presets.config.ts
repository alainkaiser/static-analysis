import { defineConfig } from 'oxlint'
import { base, react, typeAware } from '../../oxlint.js'

export default defineConfig({
  extends: [base, react, typeAware],
  options: {
    reportUnusedDisableDirectives: 'error',
  },
})

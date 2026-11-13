/** @typedef {import('oxlint').OxlintConfig} OxlintConfig */

/** @type {OxlintConfig} */
export const base = {
  plugins: [
    'eslint',
    'typescript',
    'unicorn',
    'oxc',
    'import',
    'promise',
    'vitest',
  ],
  categories: {
    correctness: 'error',
    suspicious: 'error',
  },
  rules: {
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'promise/always-return': ['error', { ignoreLastCallback: true }],
    'no-empty': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'import/no-cycle': 'error',
    'typescript/ban-ts-comment': 'error',
    'typescript/consistent-type-imports': 'error',
    'typescript/no-explicit-any': 'error',
    'typescript/no-non-null-assertion': 'error',
    'unicorn/filename-case': ['error', { case: 'kebabCase' }],
    'unicorn/no-abusive-eslint-disable': 'error',
    'unicorn/prefer-node-protocol': 'error',

    'import/no-unassigned-import': 'off',
    // Sanity documents use `_id`, `_type` and `_key`.
    'no-underscore-dangle': 'off',
  },
}

/** @type {OxlintConfig} */
export const react = {
  plugins: [...(base.plugins ?? []), 'react', 'jsx-a11y'],
  rules: {
    'react/rules-of-hooks': 'error',
    'react/exhaustive-deps': 'error',
    'react/error-boundaries': 'error',
    'react/globals': 'error',
    'react/immutability': 'error',
    'react/incompatible-library': 'error',
    'react/preserve-manual-memoization': 'error',
    'react/purity': 'error',
    'react/refs': 'error',
    'react/set-state-in-effect': 'error',
    'react/set-state-in-render': 'error',
    'react/static-components': 'error',
    'react/unsupported-syntax': 'error',
    'react/use-memo': 'error',

    'react/button-has-type': 'error',
    'react/jsx-no-useless-fragment': 'error',
    'react/no-array-index-key': 'error',
    'react/no-danger': 'error',
    'react/no-unstable-nested-components': 'error',
    'react/self-closing-comp': 'error',

    // These report the same problems as rules-of-hooks and exhaustive-deps.
    'react/hooks': 'off',
    'react/exhaustive-effect-dependencies': 'off',
    'react/memo-dependencies': 'off',
    'react/react-in-jsx-scope': 'off',
  },
}

/** @type {OxlintConfig} */
export const typeAware = {
  options: {
    typeAware: true,
    typeCheck: true,
  },
  rules: {
    'typescript/await-thenable': 'error',
    'typescript/no-array-delete': 'error',
    'typescript/no-base-to-string': 'error',
    'typescript/no-deprecated': 'error',
    'typescript/no-duplicate-type-constituents': 'error',
    'typescript/no-floating-promises': 'error',
    'typescript/no-for-in-array': 'error',
    'typescript/no-implied-eval': 'error',
    'typescript/no-misused-promises': 'error',
    'typescript/no-redundant-type-constituents': 'error',
    'typescript/no-unnecessary-condition': [
      'error',
      { allowConstantLoopConditions: 'only-allowed-literals' },
    ],
    'typescript/no-unnecessary-type-assertion': 'error',
    'typescript/no-unsafe-argument': 'error',
    'typescript/no-unsafe-assignment': 'error',
    'typescript/no-unsafe-call': 'error',
    'typescript/no-unsafe-enum-comparison': 'error',
    'typescript/no-unsafe-member-access': 'error',
    'typescript/no-unsafe-return': 'error',
    'typescript/no-unsafe-unary-minus': 'error',
    'typescript/only-throw-error': 'error',
    'typescript/prefer-promise-reject-errors': 'error',
    'typescript/require-await': 'error',
    'typescript/restrict-plus-operands': 'error',
    'typescript/restrict-template-expressions': 'error',
    'typescript/return-await': ['error', 'error-handling-correctness-only'],
    'typescript/switch-exhaustiveness-check': 'error',
    'typescript/unbound-method': 'error',
  },
}

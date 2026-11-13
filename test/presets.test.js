import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const fixtures = fileURLToPath(new URL('fixtures/', import.meta.url))
const bin = (name) =>
  fileURLToPath(new URL(`../node_modules/.bin/${name}`, import.meta.url))

const unusedDirective =
  'Unused oxlint-disable directive (no problems were reported).'

const expected = {
  'base/blanket-disable.ts': [
    'unicorn(no-abusive-eslint-disable)',
    unusedDirective,
  ],
  'base/clean.ts': [],
  'base/cycle-a.ts': ['import(no-cycle)'],
  'base/cycle-b.ts': ['import(no-cycle)'],
  'base/empty-catch.ts': ['eslint(no-empty)'],
  'base/explicit-any.ts': ['typescript(no-explicit-any)'],
  'base/loose-equality.ts': ['eslint(eqeqeq)'],
  'base/node-builtin.ts': ['unicorn(prefer-node-protocol)'],
  'base/non-null-assertion.ts': ['typescript(no-non-null-assertion)'],
  'base/PascalName.ts': ['unicorn(filename-case)'],
  'base/routes/_index.tsx': [],
  'base/routes/blog.$slug.tsx': [],
  'base/shape.ts': [],
  'base/then-without-return.ts': ['promise(always-return)'],
  'base/ts-ignore.ts': ['typescript(ban-ts-comment)'],
  'base/unused-disable.ts': [unusedDirective],
  'base/value-import-for-type.ts': [
    'typescript(TS1484)',
    'typescript(consistent-type-imports)',
  ],
  'base/var-and-let.ts': ['eslint(no-var)', 'eslint(prefer-const)'],
  'react/clean.tsx': [],
  'react/effects/event-handler-prop.tsx': ['react-effects(no-event-handler)'],
  'react/effects/event-handler-state.tsx': ['react-effects(no-event-handler)'],
  'react/effects/external-store.tsx': ['react-effects(no-external-store)'],
  'react/effects/fetch-await-without-cleanup.tsx': [
    'react-effects(no-fetch-without-cleanup)',
  ],
  'react/effects/fetch-then-without-cleanup.tsx': [
    'react-effects(no-fetch-without-cleanup)',
  ],
  'react/effects/notify-parent-hook-data.tsx': [
    'react-effects(no-notify-parent)',
  ],
  'react/effects/notify-parent-state.tsx': ['react-effects(no-notify-parent)'],
  'react/effects/ok-chat-connection.tsx': [],
  'react/effects/ok-derived-condition.tsx': [],
  'react/effects/ok-document-title.tsx': [],
  'react/effects/ok-fetch-with-cleanup.tsx': [],
  'react/effects/ok-gated-sync-without-data.tsx': [],
  'react/effects/ok-listener-notifies-parent.tsx': [],
  'react/effects/ok-notify-parent-without-state.tsx': [],
  'react/effects/ok-observer-callbacks.tsx': [],
  'react/effects/ok-ref-sync.tsx': [],
  'react/conditional-hook.tsx': ['react-hooks(rules-of-hooks)'],
  'react/impure-render.tsx': ['react(purity)'],
  'react/jsx-checks.tsx': [
    'jsx-a11y(alt-text)',
    'react(button-has-type)',
    'react(no-array-index-key)',
    'react(no-danger)',
  ],
  'react/missing-deps.tsx': [
    'react-hooks(exhaustive-deps)',
    'react-hooks(exhaustive-deps)',
  ],
  'react/mutation-in-render.tsx': ['react(immutability)'],
  'react/nested-component.tsx': [
    'react(no-unstable-nested-components)',
    'react(static-components)',
  ],
  'react/ref-in-render.tsx': ['react(refs)'],
  'react/set-state-in-effect.tsx': ['react(set-state-in-effect)'],
  'type-aware/constant-loop.ts': [],
  'type-aware/double-assertion.ts': ['typescript(no-unsafe-type-assertion)'],
  'type-aware/floating-promise.ts': ['typescript(no-floating-promises)'],
  'type-aware/misused-promise.ts': ['typescript(no-misused-promises)'],
  'type-aware/missing-module.ts': [
    'typescript(TS2307)',
    'typescript(no-unsafe-assignment)',
  ],
  'type-aware/object-in-template.ts': [
    'typescript(no-base-to-string)',
    'typescript(restrict-template-expressions)',
  ],
  'type-aware/record-guard.ts': [],
  'type-aware/redundant-fallback.ts': [
    'typescript(no-unnecessary-condition)',
    'typescript(no-unnecessary-condition)',
  ],
  'type-aware/return-in-try.ts': ['typescript(return-await)'],
  'type-aware/switch-exhaustive.ts': [
    'typescript(switch-exhaustiveness-check)',
  ],
  'type-aware/throw-string.ts': ['typescript(only-throw-error)'],
  'type-aware/type-error.ts': ['typescript(TS2322)'],
  'type-aware/unsafe-any.ts': [
    'typescript(no-unsafe-assignment)',
    'typescript(no-unsafe-return)',
  ],
  'vitest/clean.test.ts': [],
  'vitest/escape-hatches.test.ts': [
    'vitest(expect-expect)',
    'vitest(no-disabled-tests)',
    'vitest(no-focused-tests)',
  ],
}

const lint = spawnSync(
  bin('oxlint'),
  ['-c', 'presets.config.ts', '-f', 'json'],
  {
    cwd: fixtures,
    encoding: 'utf8',
  },
)
assert.ok(lint.stdout.startsWith('{'), lint.stdout)
const reported = new Map()
for (const diagnostic of JSON.parse(lint.stdout).diagnostics) {
  const codes = reported.get(diagnostic.filename) ?? []
  codes.push(diagnostic.code ?? diagnostic.message)
  reported.set(diagnostic.filename, codes)
}

test('every lint fixture has an expectation', () => {
  const sources = readdirSync(fixtures, { recursive: true })
    .filter((file) => /\.tsx?$/.test(file))
    .filter(
      (file) =>
        !['presets.config.ts', 'oxfmt.config.ts', 'modules.d.ts'].includes(
          file,
        ),
    )
  assert.deepEqual(sources.toSorted(), Object.keys(expected).toSorted())
})

for (const [file, codes] of Object.entries(expected)) {
  test(`lint ${file}`, () => {
    assert.deepEqual((reported.get(file) ?? []).toSorted(), codes.toSorted())
  })
}

const format = (filepath, input) =>
  spawnSync(bin('oxfmt'), ['--stdin-filepath', filepath], {
    cwd: fixtures,
    input,
    encoding: 'utf8',
  }).stdout

test('format sorts builtins, packages, aliases, then relative imports', () => {
  const input = [
    "import { sibling } from './sibling'",
    "import { parent } from '../parent'",
    "import { alias } from '~/alias'",
    "import { z } from 'zod'",
    "import { readFile } from 'node:fs/promises'",
    '',
    'export const all = [sibling, parent, alias, z, readFile]',
    '',
  ].join('\n')
  const output = [
    "import { readFile } from 'node:fs/promises'",
    "import { z } from 'zod'",
    "import { alias } from '~/alias'",
    "import { parent } from '../parent'",
    "import { sibling } from './sibling'",
    '',
    'export const all = [sibling, parent, alias, z, readFile]',
    '',
  ].join('\n')
  assert.equal(format('imports.ts', input), output)
})

test('format keeps side-effect imports in place', () => {
  const input = "import './reset.css'\nimport './app.css'\n"
  assert.equal(format('entry.ts', input), input)
})

test('format uses double quotes in CSS', () => {
  assert.equal(
    format('styles.css', "a {\n  font-family: 'Geist';\n}\n"),
    'a {\n  font-family: "Geist";\n}\n',
  )
})

# static-analysis

Shared lint, format and type-check setup. A project installs it as a dev dependency and imports the configs.

| Import | Tool | Contents |
| --- | --- | --- |
| `@alainkaiser/static-analysis/oxlint` | [Oxlint](https://oxc.rs/docs/guide/usage/linter) | The presets `base`, `react` and `typeAware` |
| `@alainkaiser/static-analysis/oxfmt` | [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) | One formatter config |
| `@alainkaiser/static-analysis/tsconfig` | TypeScript | Strict compiler options |
| `@alainkaiser/static-analysis/doctor` | [React Doctor](https://react.doctor) | A config without the rules that Oxlint already reports |

Requirements: Node 22.18, Oxlint 1.91 and Oxfmt 0.76, or newer. `typeAware` also needs `oxlint-tsgolint` 7 and TypeScript 7.

## Set up a project

1. Install the tools and this package:

   ```bash
   npm i -D oxlint oxfmt oxlint-tsgolint github:alainkaiser/static-analysis
   ```

   npm pins the package's commit in the lockfile. `npm update @alainkaiser/static-analysis` moves a project to the newest commit.

2. Extend the shared TypeScript settings in `tsconfig.json`. Keep the project's own `module`, `jsx`, `lib`, `types` and `paths`, and remove the options that the shared file already sets:

   ```json
   {
     "extends": "@alainkaiser/static-analysis/tsconfig"
   }
   ```

3. Create `oxlint.config.ts`:

   ```ts
   import { base, react, typeAware } from '@alainkaiser/static-analysis/oxlint'
   import { defineConfig } from 'oxlint'

   export default defineConfig({
     extends: [base, react, typeAware],
     options: {
       reportUnusedDisableDirectives: 'error',
     },
   })
   ```

4. Create `oxfmt.config.ts`:

   ```ts
   import base from '@alainkaiser/static-analysis/oxfmt'
   import { defineConfig } from 'oxfmt'

   export default defineConfig({
     ...base,
   })
   ```

5. Set the scripts in `package.json`:

   ```json
   {
     "lint": "oxlint && oxfmt --check",
     "fix": "oxlint --fix && oxfmt"
   }
   ```

Four things to know:

- **Type errors.** With `typeAware`, `oxlint` reports TypeScript compiler errors, so `lint` needs no `tsc`. One exception: `oxlint` skips files that `.gitignore` or `ignorePatterns` exclude. If `tsconfig.json` includes such files, keep `tsc` in `lint`.
- **React Router.** Its `tsconfig.json` includes the git-ignored `.react-router/types`. Use `"lint": "react-router typegen && tsc && oxlint && oxfmt --check"`. Without the generated types, each `./+types/*` import fails with TS2307.
- **Import order.** `oxfmt` sorts imports across a side-effect import such as `import './setup'`. To keep a module first, put a blank line before and after its import.
- **`node_modules`.** Oxlint lints the installed packages unless `.gitignore` lists `node_modules`.

## Lint presets

Every rule reports as an error. CI and coding agents act on pass or fail, and warnings get ignored.

| Preset | Use for | Contains |
| --- | --- | --- |
| `base` | Every project | Oxlint's `correctness` and `suspicious` categories. No `any`, non-null assertions, blanket lint or TypeScript suppressions, empty blocks such as `catch {}`, or import cycles. Kebab-case file names. No `.only`, `.skip` or assertion-free Vitest tests |
| `react` | React projects | The `recommended` rules of [`eslint-plugin-react-hooks`](https://react.dev/reference/eslint-plugin-react-hooks), including the React Compiler rules, the [effect rules](#react-effect-rules), JSX and `jsx-a11y` checks |
| `typeAware` | TypeScript 7 projects that extend the shared `tsconfig` | TypeScript compiler errors and the type-checked typescript-eslint rules: floating and misused promises, the `no-unsafe-*` family, unnecessary conditions, deprecated APIs, exhaustive switches, and a missing `await` on a promise returned inside `try` |

- `typeAware` turns on type checking by itself. Leave it out of `extends` in projects that cannot use it.
- `base` does not check the conditions of `skipIf` and `runIf`: `it.skipIf(true)` passes lint.
- Project rules go after `extends` in the project's `oxlint.config.ts`.

## React effect rules

`plugins/react-effects.js` is an Oxlint JS plugin that the `react` preset loads. It reports the patterns from [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) that React's own rules miss. Each message names the fix and links the matching react.dev section.

| Rule | Reports an effect that |
| --- | --- |
| `react-effects/no-event-handler` | calls a function with a state or prop value inside an `if` on that value, such as `if (submitted) post(url, submitted)` |
| `react-effects/no-notify-parent` | passes state, or data from a custom hook, to a callback prop |
| `react-effects/no-external-store` | copies a value into state right away and again on each `addEventListener` or `subscribe` event, which `useSyncExternalStore` does instead |
| `react-effects/no-fetch-without-cleanup` | has dependencies, sets state after a `.then` or inside an `async` function, and returns no cleanup |

- Not reported: effects that run once at app start, calls on refs such as `ref.current?.showModal()`, calls that do not receive the tested value, and calls inside listeners and observers.
- `react/set-state-in-effect` already reports derived state, state that is reset or adjusted when a prop changes, and chains of effects.
- Oxlint marks JS plugins as alpha, so an Oxlint upgrade can break the plugin. `npm test` catches that.

## React Doctor

[React Doctor](https://react.doctor) is an optional second check for React projects. Its CLI runs its own copy of Oxlint and never reads `oxlint.config.ts`, so it cannot change what `oxlint` reports. Without the shared config, it repeats many findings of the `react` preset.

1. Install it. With `typeAware`, `oxlint` type-checks `doctor.config.ts`, and the `react-doctor/api` import fails with TS2307 without the package:

   ```bash
   npm i -D react-doctor
   ```

2. Create `doctor.config.ts`:

   ```ts
   import base from '@alainkaiser/static-analysis/doctor'
   import { defineConfig } from 'react-doctor/api'

   export default defineConfig({
     ...base,
   })
   ```

3. Add a script of its own. Most React Doctor rules report warnings, so it stays out of `lint`:

   ```json
   {
     "doctor": "react-doctor --no-telemetry --no-score --no-supply-chain"
   }
   ```

   The flags turn off usage telemetry and crash reports, the score request to React Doctor's API, and the dependency check through Socket.dev.

The shared config sets `customRulesOnly: true`. That turns off React Doctor's copies of rules from other lint plugins, such as `react`, `jsx-a11y` and React hooks, and its React Compiler plugin. It also turns off 10 React Doctor rules that report the same code as `react-effects`, `react/set-state-in-effect`, `react/no-array-index-key` or `react/no-unstable-nested-components`. `doctor.js` lists them.

- A copied rule that the `react` preset does not enable is off in both tools. To use it, enable the original rule in `oxlint.config.ts`.
- One overlap remains: `react-doctor/dangerous-html-sink` and `react/no-danger` both report a `dangerouslySetInnerHTML` prop. The React Doctor rule stays on because it also reports `innerHTML` assignments.
- `react-doctor/prefer-use-sync-external-store` stays on. It reports state that changes only in a listener, which `react-effects/no-external-store` does not report.
- To suppress one finding, use `// react-doctor-disable-next-line <rule>`. An `oxlint-disable` comment that names a React Doctor rule fails `oxlint` as an unused directive.
- To change a rule in one project, keep the shared ones: `rules: { ...base.rules, 'react-doctor/no-danger': 'off' }`.

## TypeScript settings

`tsconfig.json` turns on `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `moduleDetection: "force"` and `skipLibCheck`.

- `typeAware` depends on `noUncheckedIndexedAccess`. Without it, `record[key]` never includes `undefined`, so `typescript/no-unnecessary-condition` reports the `=== undefined` guard after a lookup as unnecessary. Deleting that guard ships a crash on a missing key.
- `exactOptionalPropertyTypes` stays off. It rejects passing a `string | undefined` value to an optional `string` prop, which React components do all the time.

## Formatting

`oxfmt.js` sets 2 spaces, width 80, single quotes and no semicolons, with double quotes in CSS. Imports are sorted: Node built-ins, packages, aliases, then relative paths. `package.json` key order, embedded CSS-in-JS, Markdown and YAML are left untouched.

To change a setting in one project, override it after the spread. To add ignores, keep the shared ones:

```ts
export default defineConfig({
  ...base,
  ignorePatterns: [...base.ignorePatterns, '**/*.gen.ts'],
})
```

Tailwind class sorting is off by default, because the stylesheet path differs per project:

```ts
export default defineConfig({
  ...base,
  sortTailwindcss: {
    stylesheet: './app/app.css',
    functions: ['cn'],
  },
})
```

## Coding agents

Run the check when the agent finishes its turn, not only in CI. In Claude Code, add a `Stop` hook to the project's `.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [{ "type": "command", "command": "npm run lint 1>&2 || exit 2" }]
      }
    ]
  }
}
```

Exit code 2 sends the lint output back to Claude, which keeps working until the check passes. After 8 such continuations in a row without a tool call, Claude Code ends the turn anyway. CI stays the final gate.

## Migrate a project from Biome

1. Follow [Set up a project](#set-up-a-project).
2. Move the project-specific Biome settings:

   | `biome.json` | New home |
   | --- | --- |
   | `files.includes` entries starting with `!` | `ignorePatterns` in `oxlint.config.ts` and `oxfmt.config.ts` |
   | `formatter.lineWidth` other than 80 | `printWidth` in `oxfmt.config.ts` |
   | `style/noRestrictedImports` | `no-restricted-imports` |
   | `nursery/noJsRestrictedProperties` | `no-restricted-properties` |
   | `a11y/noLabelWithoutControl: "off"` | `jsx-a11y/label-has-associated-control: "off"` |
   | `nursery/useSortedClasses` | Tailwind class sorting, see [Formatting](#formatting) |

   `correctness/useUniqueElementIds` and `nursery/noTailwindRawColors` have no replacement: after the migration, no check reports fixed element ids or raw Tailwind colors.

3. Run `npx oxfmt` and review the diff. Expect a handful of files at most, from these differences:
   - Imports are sorted across a side-effect import such as `import './app.css'`; Biome sorts each side separately.
   - Relative imports that differ only in letter case sort differently.
   - A long `interface A extends B<...>` header wraps inside the type arguments.
   - Long comma-separated CSS values such as `unicode-range` wrap at width 80.
   - Tailwind class sorting, once enabled, reorders most class strings once.
4. Run `npx oxlint` and fix the findings. A React Router project gets `typescript/prefer-promise-reject-errors` on `reject(error)` in the stock `entry.server.tsx`: wrap a value that is not an `Error` in one.
5. Remove `@biomejs/biome` and `biome.json`.

## Change this package

`npm test` lints the files in `test/fixtures` with all three presets. For each file, it compares the reported rule IDs with the table in `test/presets.test.js`, and it checks four formatting cases. When you change a preset or upgrade Oxlint, add or update a fixture and its expected IDs, then run `npm run check`.

The React Doctor config has no automated test. Its rule list matches React Doctor 0.9.22. After a React Doctor upgrade, copy `test/fixtures/react` into a scratch project and run both tools on it. A line that both report is a new duplicate.

# static-analysis

Shared static analysis setup for projects: the automatic checks a project installs as a dev dependency. It ships [Oxlint](https://oxc.rs/docs/guide/usage/linter), [Oxfmt](https://oxc.rs/docs/guide/usage/formatter), TypeScript and [React Doctor](#react-doctor) configs.

## Use in a project

1. Install the tools and this package:

   ```bash
   npm i -D oxlint oxfmt oxlint-tsgolint github:alainkaiser/static-analysis
   ```

   While this repository is private, the install works only where Git has access to it.

   Oxlint does not skip `node_modules` on its own. Check that the project's `.gitignore` lists `node_modules`. Without that entry, `oxlint` also lints the installed packages.

2. Extend the shared TypeScript settings in `tsconfig.json`:

   ```json
   {
     "extends": "@alainkaiser/static-analysis/tsconfig"
   }
   ```

   Keep the project's own `module`, `jsx`, `lib`, `types` and `paths`. Remove the options that the shared file already sets.

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

   With `typeAware`, `oxlint` also reports TypeScript compiler errors in the files it lints. It skips files that `.gitignore` or `ignorePatterns` exclude, even when `tsconfig.json` includes them. If `tsconfig.json` includes such files, for example a git-ignored `generated/` folder, keep `tsc --noEmit` in the `lint` script. Otherwise the project needs no separate `tsc` step. In React Router projects, run `react-router typegen` before `oxlint`. Without the generated types, each `./+types/*` import fails with TS2307.

   `oxfmt` sorts imports across a side-effect import such as `import './setup'`. After `fix`, the imported modules can load in a different order. If a module must run before the imports that follow it, put a blank line before and after its import. `oxfmt` does not sort imports across a blank line.

## Lint presets

Every rule reports as an error. A check that passes or fails is something CI and coding agents act on; warnings get ignored.

| Preset      | Use for                         | Contains                                                                                                                                                                                 |
| ----------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`      | Every project                   | Oxlint's `correctness` and `suspicious` categories, no `any`, no non-null assertions, no blanket lint or TypeScript suppressions, no empty blocks such as `catch {}`, no import cycles, kebab-case file names, no `.only`, `.skip` or assertion-free Vitest tests |
| `react`     | React projects                  | The `recommended` preset of `eslint-plugin-react-hooks` from [react.dev](https://react.dev/reference/eslint-plugin-react-hooks), including the React Compiler rules, plus [effect rules](#react-effect-rules), JSX and `jsx-a11y` checks |
| `typeAware` | TypeScript 7 projects that extend the shared `tsconfig` | TypeScript compiler errors and the type-checked rules of typescript-eslint: floating and misused promises, the `no-unsafe-*` family, plus unnecessary conditions, deprecated APIs, exhaustive switches and a missing `await` on a promise returned inside `try` |

`base` does not check the conditions of `skipIf` and `runIf`. A test with `it.skipIf(true)` passes lint, and Vitest reports it as skipped.

`typeAware` turns on type-aware linting and type checking by itself. It needs `oxlint-tsgolint` and TypeScript 7. Leave it out of `extends` in projects that cannot use it.

Project rules go into the project's `oxlint.config.ts` after `extends`, for example `no-restricted-imports` with a message that names the replacement.

## React effect rules

The `react` preset loads `plugins/react-effects.js`, an Oxlint JS plugin in this package. Its rules cover the patterns from [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) that React's own rules miss. Each message names the fix and links the matching react.dev section.

| Rule | Reports an effect that |
| --- | --- |
| `react-effects/no-event-handler` | calls a function with a state or prop value inside an `if` on that value, such as `if (submitted) post(url, submitted)` |
| `react-effects/no-notify-parent` | passes state, or data from a custom hook, to a callback prop |
| `react-effects/no-external-store` | copies a value into state right away and again on each `addEventListener` or `subscribe` event, which `useSyncExternalStore` does instead |
| `react-effects/no-fetch-without-cleanup` | has dependencies, sets state after a `.then` or inside an `async` function, and returns no cleanup |

`react/set-state-in-effect` already reports derived state, state that is reset or adjusted when a prop changes, and chains of effects. Effects that run once at app start stay unreported, because whether that code belongs in an effect depends on intent.

The rules skip calls on refs such as `ref.current?.showModal()`, calls that do not receive the tested value, and calls inside listeners and observers. Oxlint marks JS plugins as alpha, so an Oxlint upgrade can break the plugin. `npm test` catches that.

## React Doctor

[React Doctor](https://react.doctor) is an optional second check for React projects. Its CLI runs its own Oxlint with a generated config and does not read `oxlint.config.ts`, so it does not change what `oxlint` reports. On its own, it reports many problems that the `react` preset already reports. The shared config turns those rules off.

1. Install it:

   ```bash
   npm i -D react-doctor
   ```

   With `typeAware`, `oxlint` type-checks `doctor.config.ts`. Without the installed package, the `react-doctor/api` import fails with TS2307.

2. Create `doctor.config.ts`:

   ```ts
   import base from '@alainkaiser/static-analysis/doctor'
   import { defineConfig } from 'react-doctor/api'

   export default defineConfig({
     ...base,
   })
   ```

3. Run `npx react-doctor`.

| Shared setting | Turns off | Reported by |
| --- | --- | --- |
| `customRulesOnly: true` | React Doctor's copies of the `react`, `jsx-a11y` and React hooks rules, and its React Compiler plugin | the `react` preset |
| `react-doctor/no-effect-event-handler` | effects used as event handlers | `react-effects/no-event-handler` |
| `react-doctor/no-prop-callback-in-effect` | effects that keep a parent in sync through a callback prop | `react-effects/no-notify-parent` |
| `react-doctor/prefer-use-sync-external-store` | hand-written store subscriptions | `react-effects/no-external-store` |
| `react-doctor/no-fetch-in-effect`, `react-doctor/no-set-state-after-await-in-effect` | fetches and asynchronous state updates in an effect without cancellation | `react-effects/no-fetch-without-cleanup` |
| `react-doctor/no-derived-state-effect`, `react-doctor/no-effect-chain`, `react-doctor/no-mirror-prop-effect` | derived state, chains of effects and props copied into state | `react/set-state-in-effect` |

To change a rule in one project, keep the shared ones:

```ts
export default defineConfig({
  ...base,
  rules: { ...base.rules, 'react-doctor/no-danger': 'off' },
})
```

To suppress one React Doctor finding, use `// react-doctor-disable-next-line <rule>`. An `oxlint-disable` comment that names a React Doctor rule fails `oxlint` as an unused directive.

## TypeScript settings

`tsconfig.json` turns on `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `moduleDetection: "force"` and `skipLibCheck`.

`typeAware` depends on `noUncheckedIndexedAccess`. Without it, `record[key]` never includes `undefined`, so `typescript/no-unnecessary-condition` reports the `=== undefined` guard after a lookup as unnecessary. Deleting that guard ships a crash on a missing key.

`exactOptionalPropertyTypes` stays off. It rejects passing a `string | undefined` value to an optional `string` prop, which React components do all the time.

## Coding agents

Run the check where the agent finishes its turn, not only in CI. In Claude Code, add a `Stop` hook to the project's `.claude/settings.json`:

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

Exit code 2 sends the lint output back to Claude, which keeps working until the check passes. Claude Code ignores the hook after it blocks 8 times in a row with no tool call in between, so a check the agent cannot fix does not loop forever. Keep CI as the final gate.

## Formatting

`oxfmt.js` sets 2 spaces, width 80, single quotes and no semicolons, with double quotes in CSS. Imports are sorted: Node built-ins, packages, aliases, then relative paths. `package.json` key order, embedded CSS-in-JS, Markdown and YAML are left untouched.

To change a setting in one project, override it after the spread. To add ignores, keep the shared ones:

```ts
export default defineConfig({
  ...base,
  ignorePatterns: [...base.ignorePatterns, '**/*.gen.ts'],
})
```

### Tailwind class sorting

Off by default, because the stylesheet path differs per project. Enable it per project:

```ts
export default defineConfig({
  ...base,
  sortTailwindcss: {
    stylesheet: './app/app.css',
    functions: ['cn'],
  },
})
```

## Migrate a project from Biome

1. Follow [Use in a project](#use-in-a-project).
2. Move project-specific Biome settings to the new config files:

   | `biome.json`                              | New home                                                         |
   | ----------------------------------------- | ---------------------------------------------------------------- |
   | `files.includes` entries starting with `!` | `ignorePatterns` in `oxlint.config.ts` and `oxfmt.config.ts`     |
   | `formatter.lineWidth` other than 80       | `printWidth` in `oxfmt.config.ts`                                |
   | `style/noRestrictedImports`               | `no-restricted-imports`                                          |
   | `nursery/noJsRestrictedProperties`        | `no-restricted-properties`                                       |
   | `a11y/noLabelWithoutControl: "off"`       | `jsx-a11y/label-has-associated-control: "off"`                   |
   | `nursery/useSortedClasses`                | [Tailwind class sorting](#tailwind-class-sorting)                |

   `correctness/useUniqueElementIds` and `nursery/noTailwindRawColors` have no mapping here yet.

3. Run `npx oxfmt` and review the diff. Expect a handful of files at most, from these differences:
   - Imports are sorted across a side-effect import such as `import './app.css'`; Biome sorts each side separately.
   - Relative imports that differ only in letter case sort differently.
   - A long `interface A extends B<...>` header wraps inside the type arguments.
   - Long comma-separated CSS values such as `unicode-range` wrap at width 80.
   - Tailwind class sorting, once enabled, uses the official Tailwind order and reorders most class strings once.
4. Run `npx oxlint` and fix or triage the findings.
5. Remove `@biomejs/biome` and `biome.json`.

## Change this package

`npm test` lints the files in `test/fixtures` with all three presets. For each file, it compares the reported rule IDs with the table in `test/presets.test.js`, and it checks four formatting cases. When you change a preset or upgrade Oxlint, add or update a fixture and its expected IDs, then run `npm run check`.

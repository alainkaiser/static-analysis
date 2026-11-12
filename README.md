# oxc-config

Shared [Oxlint](https://oxc.rs/docs/guide/usage/linter) and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) configs. The formatter output matches the Biome setup used so far, so switching a project causes almost no formatting diff.

## Use in a project

1. Install the tools and this package:

   ```bash
   npm i -D oxlint oxfmt oxlint-tsgolint github:alainkaiser/oxc-config
   ```

   While this repository is private, the install works only where Git has access to it.

2. Create `oxlint.config.ts`:

   ```ts
   import { base, react, typeAware } from '@alainkaiser/oxc-config/oxlint'
   import { defineConfig } from 'oxlint'

   export default defineConfig({
     extends: [base, react, typeAware],
     options: {
       reportUnusedDisableDirectives: 'error',
     },
   })
   ```

3. Create `oxfmt.config.ts`:

   ```ts
   import base from '@alainkaiser/oxc-config/oxfmt'
   import { defineConfig } from 'oxfmt'

   export default defineConfig({
     ...base,
   })
   ```

4. Set the scripts in `package.json`:

   ```json
   {
     "lint": "oxlint && oxfmt --check",
     "fix": "oxlint --fix && oxfmt"
   }
   ```

## Lint presets

Every rule reports as an error. A check that passes or fails is something CI and coding agents act on; warnings get ignored.

| Preset      | Use for                         | Contains                                                                                                                                                                                 |
| ----------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`      | Every project                   | Oxlint's `correctness` and `suspicious` categories, no `any`, no non-null assertions, no blanket lint or TypeScript suppressions, no import cycles, kebab-case file names                 |
| `react`     | React projects                  | The `recommended` preset of `eslint-plugin-react-hooks` from [react.dev](https://react.dev/reference/eslint-plugin-react-hooks), including the React Compiler rules, plus JSX and `jsx-a11y` checks |
| `typeAware` | TypeScript 7 projects           | The type-checked rules of typescript-eslint: floating and misused promises, the `no-unsafe-*` family, plus unnecessary conditions, deprecated APIs and exhaustive switches               |

`typeAware` turns on type-aware linting by itself and needs `oxlint-tsgolint` installed. Leave it out of `extends` in projects that cannot use it.

Project rules go into the project's `oxlint.config.ts` after `extends`, for example `no-restricted-imports` with a message that names the replacement.

## Formatting

`oxfmt.js` reproduces the Biome settings used across existing projects: 2 spaces, width 80, single quotes, no semicolons, double quotes in CSS, Biome's import order. It leaves `package.json` key order, embedded CSS-in-JS, Markdown and YAML untouched because Biome did.

To change a setting in one project, override it after the spread. To add ignores, keep the shared ones:

```ts
export default defineConfig({
  ...base,
  ignorePatterns: [...base.ignorePatterns, '**/*.gen.ts'],
})
```

### Known differences from Biome

- Imports are sorted across a side-effect import such as `import './app.css'`; Biome sorts each side separately.
- Relative imports that differ only in letter case sort differently.
- A long `interface A extends B<...>` header wraps inside the type arguments.
- Long comma-separated CSS values such as `unicode-range` wrap at width 80.

### Tailwind class sorting

Off by default, because Oxfmt uses the official Tailwind order and Biome's `useSortedClasses` does not, so turning it on reorders most class strings once. Enable it per project:

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

3. Run `npx oxfmt` and review the diff. Expect a handful of files at most.
4. Run `npx oxlint` and fix or triage the findings.
5. Remove `@biomejs/biome` and `biome.json`.

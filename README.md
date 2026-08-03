# @module-foundry/configs

Shared configuration profiles published as one package. Common tools are
exported from the package root; project-specific presets live under `nestjs`,
`reactjs`, and `solidjs` subpaths.

## Requirements

- Node.js 24.18 or newer.
- pnpm 11.18 or newer for this repository.

The package declares every external tool as an optional peer. Installing
`@module-foundry/configs` therefore does not install ESLint, Prettier, Steiger,
Stylelint, Commitlint, TypeScript, or their plugins automatically. Install only
the tools used by the selected exports.

## Public exports

### Common

| Tool       | Export                               |
| ---------- | ------------------------------------ |
| Commitlint | `@module-foundry/configs/commitlint` |
| Prettier   | `@module-foundry/configs/prettier`   |
| Steiger    | `@module-foundry/configs/steiger`    |
| Stylelint  | `@module-foundry/configs/stylelint`  |

### Profiles

| Profile | ESLint export                            | TypeScript export                            |
| ------- | ---------------------------------------- | -------------------------------------------- |
| NestJS  | `@module-foundry/configs/nestjs/eslint`  | `@module-foundry/configs/nestjs/typescript`  |
| ReactJS | `@module-foundry/configs/reactjs/eslint` | `@module-foundry/configs/reactjs/typescript` |
| SolidJS | `@module-foundry/configs/solidjs/eslint` | `@module-foundry/configs/solidjs/typescript` |

NestJS and ReactJS use ESLint 10. SolidJS uses ESLint 9 because the current
`eslint-plugin-solid` release does not support ESLint 10.

## Common configurations

### Prettier

```sh
pnpm add --save-dev @module-foundry/configs prettier
```

```js
// prettier.config.mjs
export { default } from "@module-foundry/configs/prettier";
```

### Commitlint

```sh
pnpm add --save-dev @module-foundry/configs @commitlint/cli @commitlint/config-conventional
```

```js
// commitlint.config.mjs
export { default } from "@module-foundry/configs/commitlint";
```

### Steiger

```sh
pnpm add --save-dev @module-foundry/configs steiger @feature-sliced/steiger-plugin
```

```js
// steiger.config.mjs
export { default } from "@module-foundry/configs/steiger";
```

### Stylelint

```sh
pnpm add --save-dev @module-foundry/configs stylelint stylelint-config-standard-scss stylelint-order
```

```js
// stylelint.config.mjs
export { default } from "@module-foundry/configs/stylelint";
```

The preset applies the standard SCSS rules to `.scss` files, including CSS
Modules named `*.module.scss`. CSS custom properties must appear before regular
declarations, are sorted alphabetically, and are separated from property groups
by an empty line.

## ESLint profiles

The ESLint presets use type-aware rules. Until `typescript-eslint` supports the
TypeScript 7 compiler API, keep the TypeScript 6 API under the package name
`typescript` and install TypeScript 7 through an alias for the `tsc` command:

```json
{
  "devDependencies": {
    "typescript": "npm:@typescript/typescript6@^6.0.2",
    "typescript-native": "npm:typescript@^7.0.2"
  }
}
```

The complete peer list is intentionally explicit in `package.json`. The
playgrounds contain ready-to-copy dependency sets for each profile.

Run ESLint from the consumer project root, or from a monorepo root that contains
the projects being linted. The presets use that working directory as the
`tsconfigRootDir`; TypeScript's project service then selects the nearest
`tsconfig.json` for each source file.

Named type imports use inline type specifiers:

```ts
import { type JSX } from "react";
```

The profiles reject the separate `import type { JSX } from "react"` form.

ReactJS and SolidJS treat every `.jsx` and `.tsx` file as a component file.
Component files must have a default export and cannot contain named exports.
Component functions must use block bodies with explicit `return` statements.

All three ESLint profiles require JavaScript and TypeScript source filenames,
and their folder names, to use `kebab-case`. This includes ReactJS and SolidJS
component, hook, and utility files. Middle extensions are ignored, so names
such as `user-card.test.tsx` are valid; `__tests__` and `__mocks__` folders are
also allowed.

Install `eslint-plugin-check-file` together with the other peer packages used
by the selected ESLint profile:

```sh
pnpm add --save-dev eslint-plugin-check-file
```

NestJS ESLint configuration:

```js
// eslint.config.mjs
export { default } from "@module-foundry/configs/nestjs/eslint";
```

ReactJS ESLint configuration:

```js
// eslint.config.mjs
export { default } from "@module-foundry/configs/reactjs/eslint";
```

SolidJS ESLint configuration:

```js
// eslint.config.mjs
export { default } from "@module-foundry/configs/solidjs/eslint";
```

Project-level TypeScript configuration:

```json
{
  "extends": "@module-foundry/configs/reactjs/typescript",
  "include": ["src"]
}
```

## Repository layout

```text
packages/
  common/   standalone shared tool configurations
  nestjs/   NestJS-specific configuration files
  reactjs/  ReactJS-specific configuration files
  solidjs/  SolidJS-specific configuration files
playgrounds/
  nestjs/   minimal NestJS-profile consumer
  reactjs/  minimal ReactJS consumer
  solidjs/  minimal SolidJS consumer
```

The workspace packages are private implementation units. The build copies their
configuration files into `dist/`, which is the only directory included in the
published `@module-foundry/configs` package.

Each profile owns a complete ESLint configuration and a complete TypeScript
configuration. Profile presets do not import or extend files from `common`, so
NestJS, ReactJS, and SolidJS can evolve independently across their supported
ESLint versions.

## Manual playgrounds

```sh
pnpm playground:nestjs
pnpm playground:reactjs
pnpm playground:solidjs
```

These are small consuming projects for manual compatibility checks. The
repository intentionally has no test suite and no global `check` script.

## Releasing

Update the root version and push a matching `v*` tag. The release workflow
installs with pnpm, builds `dist/`, and publishes the single package with npm
provenance.

## License

Licensed under the MIT License.

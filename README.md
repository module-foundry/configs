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

All profiles use ESLint 10. `eslint-plugin-solid` supports ESLint 10 since
version 0.18.0.

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

The ESLint presets use type-aware rules. Install TypeScript inside the range
supported by `typescript-eslint`. The current ceiling comes from
`typescript-eslint` (`<6.1`), so install the latest compatible release:

```json
{
  "devDependencies": {
    "typescript": "^6.0.3"
  }
}
```

No alias packages or separate `tsc` installations are required. When
`typescript-eslint` supports TypeScript 7, the ceiling will be raised in a new
release.

Run ESLint from the consumer project root, or from a monorepo root that contains
the projects being linted. The presets use that working directory as the
`tsconfigRootDir`; TypeScript's project service then selects the nearest
`tsconfig.json` for each source file. Root-level config files that are not part
of a `tsconfig.json` are accepted through `allowDefaultProject`.

Every rule in the presets is an error: the presets emit no warnings. Advisory
warn-level rules from the underlying plugin presets are either promoted to
errors or disabled deliberately.

### Installation

ReactJS:

```sh
pnpm add --save-dev @module-foundry/configs prettier \
  eslint @eslint/js typescript typescript-eslint \
  @eslint-community/eslint-plugin-eslint-comments \
  @eslint-react/eslint-plugin eslint-plugin-react-hooks \
  eslint-plugin-check-file eslint-plugin-jsdoc \
  eslint-config-prettier globals
```

SolidJS:

```sh
pnpm add --save-dev @module-foundry/configs prettier \
  eslint @eslint/js typescript typescript-eslint \
  @eslint-community/eslint-plugin-eslint-comments \
  eslint-plugin-solid eslint-plugin-check-file eslint-plugin-jsdoc \
  eslint-config-prettier globals
```

### Configuration

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

### Component conventions

ReactJS and SolidJS treat every `.jsx` and `.tsx` file as a component file:

- component files must have a default export; named exports such as interfaces
  and types are allowed;
- component functions must use a block body with an explicit `return`.

Exceptions:

- Next.js App Router folders under `app/` may use `[param]`, `[...slug]`,
  `(group)`, and `@slot` names;
- test, story, and mock files (`*.test.*`, `*.spec.*`, `*.stories.*`,
  `__tests__`, `__mocks__`) are exempt from the default-export requirement.

SolidJS component props are handled by `eslint-plugin-solid`: destructuring
component props is an error because it breaks reactivity.

All ESLint profiles require JavaScript and TypeScript source filenames, and
their folder names, to use `kebab-case`. Middle extensions are ignored, so names
such as `user-card.test.tsx` are valid; `__tests__` and `__mocks__` folders are
also allowed.

### Quality rules

- `no-console` is an error; `console.warn` and `console.error` are allowed.
- `no-magic-numbers` is an error; use named constants. `-1`, `0`, `1`, `2`,
  array indexes, enum members, and default parameter values are exempt.
- JSDoc blocks require a meaningful description (1-300 characters), and
  `@returns` and `@throws` descriptions are required when those tags are used.
- `eslint-disable` directives must carry a description, for example
  `// eslint-disable-next-line rule-name -- reason`. Unused disable directives
  are errors.
- Test and story files are exempt from `no-console` and `no-magic-numbers`.

### Next.js App Router

The ReactJS preset supports App Router files without additional overrides.
Pages, layouts, and other route files keep the component contract (default
export, block body) and accept dynamic and grouped route folders; named exports
such as `metadata` are allowed. Layer `eslint-config-next` on top of the preset
when you need Next.js-specific rules.

### AI agent quickstart

Add these instructions to the consuming project so AI agents generate code that
passes the presets:

- use `kebab-case` for every file and folder;
- give each `.jsx` and `.tsx` file a default export; named exports such as
  interfaces are allowed (test and story files are exempt);
- write components as `const Name = (): JSX.Element => { return ...; };`;
- do not destructure Solid props; access them as `props.name`;
- extract repeated numbers into named constants and keep `console.log` out of
  source files;
- document every JSDoc block with a description and describe `@returns` and
  `@throws` tags; add a reason to every `eslint-disable` directive;
- after changes run `pnpm exec eslint . --fix && pnpm exec prettier --write .`,
  then `pnpm exec tsc --noEmit`.

### Hardening

The presets cover correctness and hygiene, not architecture. Layer more rules
when a project needs them:

- `eslint-config-next` for Next.js-specific rules;
- architecture or module-boundary plugins when the project enforces a structure,
  for example Feature-Sliced Design;
- complexity and duplication budgets (`complexity`, `max-lines-per-function`,
  `sonarjs/*`) as an additional strict layer.

Keep added rules at error level so the project stays warning-free.

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

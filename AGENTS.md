# AI Maintenance Guide

## Project status

This repository is finalized and is maintained as a stable configuration
package. Treat the current architecture, public exports, dependency model, and
configuration behavior as an intentional compatibility contract.

Default to maintenance work only:

- fix confirmed defects;
- keep documented compatibility with supported tools;
- update dependencies when explicitly requested;
- maintain consumer documentation and the release process.

Do not proactively add profiles, presets, public exports, dependencies,
automation, tests, hooks, or repository tooling. Do not perform speculative
cleanup, broad refactors, or deduplication. A user request may explicitly change
the finalized scope; otherwise preserve it. If a requested change conflicts with
this guide, identify the conflict before implementation instead of silently
changing the product contract.

## Product contract

The repository publishes exactly one public npm package:
`@module-foundry/configs`. It provides reusable configuration presets for
NestJS, ReactJS, and SolidJS consumers through explicit subpath exports.

Every maintenance change must preserve these invariants:

1. Only the root `@module-foundry/configs` package is published.
2. Common presets are exported directly below the package root; `/common` is
   never part of a public import path.
3. Framework presets remain below `nestjs`, `reactjs`, or `solidjs`.
4. Every public entry point is declared explicitly in the root `exports` field;
   wildcard exports are not part of the API.
5. External tools and plugins remain optional peer dependencies, so consumers
   install only what their selected presets require.
6. NestJS and ReactJS use ESLint 10. SolidJS remains on ESLint 9 while
   `eslint-plugin-solid` does not support ESLint 10.
7. Each framework profile owns one complete ESLint preset and one complete
   TypeScript preset.
8. Framework presets do not import, extend, or re-export implementation files
   from `common`, another profile, or `dist`.
9. Published contents consist of configuration assets, `package.json`,
   `README.md`, and `LICENSE`, not workspace sources, playgrounds, scripts, or
   repository automation.
10. ESLint presets use ESLint core rules and maintained external plugins, never
    repository-local or inline custom plugins.

The supported public exports are fixed:

```text
@module-foundry/configs/commitlint
@module-foundry/configs/prettier
@module-foundry/configs/steiger
@module-foundry/configs/stylelint
@module-foundry/configs/nestjs/eslint
@module-foundry/configs/nestjs/typescript
@module-foundry/configs/reactjs/eslint
@module-foundry/configs/reactjs/typescript
@module-foundry/configs/solidjs/eslint
@module-foundry/configs/solidjs/typescript
```

Do not introduce aliases such as `common/prettier`, `backend/eslint`,
`react/eslint`, or `solid/eslint`.

## Repository layout and ownership

```text
packages/
  common/   standalone common presets
  nestjs/   autonomous NestJS ESLint and TypeScript presets
  reactjs/  autonomous ReactJS ESLint and TypeScript presets
  solidjs/  autonomous SolidJS ESLint and TypeScript presets

playgrounds/
  nestjs/   minimal NestJS consumer and compatibility lane
  reactjs/  minimal ReactJS consumer and compatibility lane
  solidjs/  minimal SolidJS consumer and compatibility lane

dist/       generated package contents; ignored by Git
scripts/    repository build scripts
```

Directories under `packages/` and `playgrounds/` are private pnpm workspaces.
They are never published independently.

Files under `packages/*/src` are the source of truth. Complete standalone
presets for Commitlint, Prettier, Steiger, and Stylelint belong under
`packages/common/src`. TypeScript presets are framework-specific and belong
only to their matching profile workspaces.

Duplication among profile files is deliberate. Do not extract shared rule maps,
import-order builders, TypeScript options, helper modules, base presets, or
configuration factories. Do not split a profile configuration across internal
files or create relative TypeScript `extends` chains.

Playgrounds are minimal consumer projects, not unit-test packages. Keep them
small and realistic. The repository intentionally has no unit-test suite,
coverage setup, global `check` script, verification hooks, or CI lint/test job.

## ESLint compatibility and behavior

The compatibility lanes are independent:

| Profile | ESLint | Constraint                                            |
| ------- | ------ | ----------------------------------------------------- |
| NestJS  | 10     | Current NestJS preset dependencies support ESLint 10. |
| ReactJS | 10     | Current React plugins support ESLint 10.              |
| SolidJS | 9      | `eslint-plugin-solid` supports ESLint only through 9. |

Never unify these versions for lockfile convenience. Before updating ESLint or
an ESLint plugin, inspect the package's declared peer range and validate only
the compatible profile lanes. Installation under hoisting is not evidence of
published compatibility.

Preserve the following behavior in every type-aware profile:

- import `cwd` from `node:process` and set
  `parserOptions.tsconfigRootDir` to `cwd()`;
- do not use the global `process` or `import.meta.dirname` for the consumer
  TypeScript project root;
- keep `@typescript-eslint/consistent-type-imports` configured with
  `fixStyle: "inline-type-imports"`;
- accept named type imports as `import { type JSX } from "react"` and reject
  `import type { JSX } from "react"` with a local `no-restricted-syntax`
  selector;
- keep `@typescript-eslint/no-import-type-side-effects` disabled;
- do not apply the named-import restriction to default or namespace type
  imports;
- enforce `kebab-case` for JavaScript and TypeScript source filenames and folder
  names through `eslint-plugin-check-file`, while allowing middle extensions
  and the `__tests__` and `__mocks__` folders.

ReactJS and SolidJS treat every `.jsx` and `.tsx` file as a component file.
Each such file must contain an `ExportDefaultDeclaration` and must not contain
an `ExportNamedDeclaration`. Uppercase component functions containing JSX must
use a block body and an explicit `return`. Keep these checks local to each
autonomous profile through `no-restricted-syntax` selectors.

Do not add local rule modules, `create(context)` implementations, inline plugin
objects, or custom plugin packages. When an external plugin is explicitly
approved, add it only to profiles that use it, add it as an optional root peer,
add it to the matching playgrounds, document its consumer installation, and run
every affected lane.

## Dependency and package-manager policy

Use pnpm only, preferably through `corepack pnpm`. Keep `pnpm-lock.yaml`
committed. Never create or restore `package-lock.json`, `yarn.lock`, or another
package-manager lockfile.

Keep `autoInstallPeers: false` and independent playground peer resolution in
`pnpm-workspace.yaml`. Workspace packages remain private and the root toolchain
must not be moved into root `dependencies` or `devDependencies`.

Every imported external package must appear in all applicable locations:

1. the relevant private workspace's `devDependencies`;
2. the root `peerDependencies` with a compatible range;
3. the root `peerDependenciesMeta` with `optional: true`;
4. each playground that exercises the preset;
5. the corresponding consumer installation instructions in `README.md`.

Do not replace optional peers with `optionalDependencies`; package managers
install optional dependencies by default, which breaks dependency isolation.

`typescript-eslint` currently requires the TypeScript compiler API below 6.1.
Preserve the playground arrangement until upstream support changes:

- TypeScript 6 is installed under `typescript` for ESLint integration;
- TypeScript 7 is installed through the `typescript-native` alias for the `tsc`
  executable.

## Generated and published contents

Never edit `dist/` manually. The build script recreates it by copying files from
`packages/*/src`. Keep the build deterministic and free of transpilation unless
an explicitly approved source-format change requires it. Do not copy workspace
`package.json` files into `dist/`.

After any source preset change, run:

```sh
corepack pnpm build
```

The root `files` field must continue to publish only `dist/`. A release tarball
may contain only:

```text
dist/**
package.json
README.md
LICENSE
```

## Validation

Match validation to the affected compatibility lanes:

- NestJS-only changes: `corepack pnpm playground:nestjs`;
- ReactJS-only changes: `corepack pnpm playground:reactjs`;
- SolidJS-only changes: `corepack pnpm playground:solidjs`;
- shared build, dependency-range, or cross-profile changes: run all three.

For dependency or packaging changes, also run:

```sh
corepack pnpm peers check
corepack pnpm pack --dry-run
```

Inspect the dry-run file list and verify public exports resolve from built
`dist/`. Do not claim compatibility based only on dependency installation.

## Documentation and release maintenance

Write repository documentation in English. Keep `README.md` aligned with actual
playground usage, document every public export, show pnpm commands, list required
optional peers explicitly, and explain compatibility constraints.

The release workflow publishes the root package only. Before a requested
release:

1. update the root package version;
2. build `dist/`;
3. run every affected playground;
4. run `corepack pnpm peers check`;
5. inspect `corepack pnpm pack --dry-run`;
6. push the matching `v*` tag.

Do not publish workspaces recursively. Do not add new release behavior unless
the user explicitly requests a change to the finalized release contract.

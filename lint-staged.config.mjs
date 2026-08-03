const prettier =
  "corepack pnpm --filter @module-foundry/configs-common exec prettier --write";

export default {
  "playgrounds/nestjs/src/**/*.{cjs,js,mjs,ts}": [
    "corepack pnpm --filter @module-foundry/playground-nestjs exec eslint --fix",
    prettier,
  ],
  "playgrounds/reactjs/src/**/*.{cjs,js,jsx,mjs,ts,tsx}": [
    "corepack pnpm --filter @module-foundry/playground-reactjs exec eslint --fix",
    prettier,
  ],
  "playgrounds/solidjs/src/**/*.{cjs,js,jsx,mjs,ts,tsx}": [
    "corepack pnpm --filter @module-foundry/playground-solidjs exec eslint --fix",
    prettier,
  ],
  "playgrounds/**/*.{css,json,md,scss,yaml,yml}": prettier,
  "{packages,scripts}/**/*.{cjs,js,json,md,mjs,yaml,yml}": prettier,
  ".github/**/*.{json,md,yaml,yml}": prettier,
  "*.{cjs,js,json,md,mjs,yaml,yml}": prettier,
};

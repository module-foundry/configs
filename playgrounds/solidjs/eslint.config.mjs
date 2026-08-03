import config from "@module-foundry/configs/solidjs/eslint";

export default [
  ...config,
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    name: "@module-foundry/playground-solidjs/typescript-project",
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];

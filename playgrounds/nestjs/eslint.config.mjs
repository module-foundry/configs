import config from "@module-foundry/configs/nestjs/eslint";

export default [
  ...config,
  {
    files: ["**/*.{ts,mts,cts}"],
    name: "@module-foundry/playground-nestjs/typescript-project",
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];

import config from "@module-foundry/configs/reactjs/eslint";

export default [
  ...config,
  {
    name: "@module-foundry/playground-reactjs/typescript-project",
    files: ["**/*.{ts,mts,cts,tsx}"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];

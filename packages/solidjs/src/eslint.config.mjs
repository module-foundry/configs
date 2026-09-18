import { cwd } from "node:process";

import eslintComments from "@eslint-community/eslint-plugin-eslint-comments";
import eslint from "@eslint/js";
import prettierConfig from "eslint-config-prettier/flat";
import checkFile from "eslint-plugin-check-file";
import jsdoc from "eslint-plugin-jsdoc";
import solid from "eslint-plugin-solid";
import globals from "globals";
import tseslint from "typescript-eslint";

const sourceFiles = ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"];
const typescriptFiles = ["**/*.{ts,mts,cts,tsx}"];
const frontendFiles = ["**/*.{js,jsx,ts,tsx}"];
const componentFiles = ["**/*.{jsx,tsx}"];
const testFiles = [
  "**/*.{test,spec}.{js,jsx,ts,tsx}",
  "**/*.stories.{js,jsx,ts,tsx}",
  "**/__tests__/**/*.{js,jsx,ts,tsx}",
  "**/__mocks__/**/*.{js,jsx,ts,tsx}",
];

const solidCorrectnessRules = new Set([
  "solid/components-return-once",
  "solid/event-handlers",
  "solid/imports",
  "solid/no-react-deps",
  "solid/no-react-specific-props",
  "solid/reactivity",
]);

const severityOf = (value) => (Array.isArray(value) ? value[0] : value);
const isWarning = (value) => {
  const severity = severityOf(value);
  return severity === "warn" || severity === 1;
};
const normalizeWarnings = (rules, promotedRules) =>
  Object.fromEntries(
    Object.entries(rules).map(([ruleName, setting]) => {
      if (!isWarning(setting)) {
        return [ruleName, setting];
      }
      return [ruleName, promotedRules.has(ruleName) ? "error" : "off"];
    }),
  );

const defaultExportRestriction = {
  selector: "Program:not(:has(ExportDefaultDeclaration))",
  message: "Component files must have a default export.",
};
const conciseArrowRestriction = {
  selector:
    "VariableDeclarator[id.name=/^[A-Z]/] > ArrowFunctionExpression[body.type!='BlockStatement']:has(JSXElement, JSXFragment)",
  message:
    "Write Solid components with a block body and an explicit return statement.",
};
const explicitReturnRestrictions = [
  "FunctionDeclaration[id.name=/^[A-Z]/]:has(JSXElement, JSXFragment):not(:has(ReturnStatement))",
  "VariableDeclarator[id.name=/^[A-Z]/] > ArrowFunctionExpression[body.type='BlockStatement']:has(JSXElement, JSXFragment):not(:has(ReturnStatement))",
  "VariableDeclarator[id.name=/^[A-Z]/] > FunctionExpression:has(JSXElement, JSXFragment):not(:has(ReturnStatement))",
].map((selector) => ({
  selector,
  message: "Solid components must contain an explicit return statement.",
}));

const componentRestrictions = [
  defaultExportRestriction,
  conciseArrowRestriction,
  ...explicitReturnRestrictions,
];

export default tseslint.config(
  {
    name: "@module-foundry/eslint/solidjs/ignores",
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/.vite/**",
      "**/.output/**",
      "**/out/**",
      "**/storybook-static/**",
    ],
  },
  {
    name: "@module-foundry/eslint/solidjs/linter-options",
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
  {
    ...eslint.configs.recommended,
    name: "@module-foundry/eslint/solidjs/javascript",
    files: sourceFiles,
  },
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: typescriptFiles,
  })),
  {
    ...solid.configs["flat/typescript"],
    name: "@module-foundry/eslint/solidjs/solid",
    files: frontendFiles,
    rules: normalizeWarnings(
      solid.configs["flat/typescript"].rules,
      solidCorrectnessRules,
    ),
  },
  {
    name: "@module-foundry/eslint/solidjs/check-file",
    files: sourceFiles,
    plugins: {
      "check-file": checkFile,
    },
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.es2024,
    },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
      "check-file/folder-naming-convention": [
        "error",
        { "**/": "KEBAB_CASE" },
        { ignoreWords: ["__mocks__", "__tests__"] },
      ],
    },
  },
  {
    name: "@module-foundry/eslint/solidjs/quality",
    files: sourceFiles,
    plugins: {
      jsdoc,
      "eslint-comments": eslintComments,
    },
    settings: {
      jsdoc: {
        mode: "typescript",
      },
    },
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-magic-numbers": [
        "error",
        {
          enforceConst: true,
          detectObjects: false,
          ignore: [-1, 0, 1, 2],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreEnums: true,
        },
      ],
      "eslint-comments/require-description": "error",
      "jsdoc/check-syntax": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/empty-tags": "error",
      "jsdoc/no-blank-block-descriptions": "error",
      "jsdoc/require-throws": "error",
      "jsdoc/require-throws-description": "error",
      "jsdoc/require-returns": ["error", { forceRequireReturn: false }],
      "jsdoc/require-returns-description": "error",
      "jsdoc/require-description": [
        "error",
        { contexts: ["any"], descriptionStyle: "body" },
      ],
      "jsdoc/match-description": [
        "error",
        {
          contexts: ["any"],
          mainDescription: {
            match: "^[\\s\\S]{1,300}$",
            message: "Keep the JSDoc description between 1 and 300 characters.",
          },
        },
      ],
    },
  },
  {
    name: "@module-foundry/eslint/solidjs/typescript-type-checked",
    files: typescriptFiles,
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.{js,mjs,cjs,ts,mts,cts}"],
        },
        tsconfigRootDir: cwd(),
      },
    },
    rules: {
      "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
  },
  {
    name: "@module-foundry/eslint/solidjs/browser",
    files: frontendFiles,
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    name: "@module-foundry/eslint/solidjs/component-contract",
    files: componentFiles,
    rules: {
      "no-restricted-syntax": ["error", ...componentRestrictions],
    },
  },
  {
    name: "@module-foundry/eslint/solidjs/tests-and-stories",
    files: testFiles,
    rules: {
      "no-console": "off",
      "no-magic-numbers": "off",
      "no-restricted-syntax": "off",
    },
  },
  {
    ...prettierConfig,
    name: "@module-foundry/eslint/solidjs/prettier-compatibility",
  },
);

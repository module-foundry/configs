import { cwd } from "node:process";

import eslintComments from "@eslint-community/eslint-plugin-eslint-comments";
import eslintReact from "@eslint-react/eslint-plugin";
import eslint from "@eslint/js";
import prettierConfig from "eslint-config-prettier/flat";
import checkFile from "eslint-plugin-check-file";
import jsdoc from "eslint-plugin-jsdoc";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const sourceFiles = ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"];
const typescriptFiles = ["**/*.{ts,mts,cts,tsx}"];
const frontendFiles = ["**/*.{js,jsx,ts,tsx}"];
const componentFiles = ["**/*.{jsx,tsx}"];
const nextFiles = ["**/app/**/*.{js,jsx,ts,tsx}"];
const testFiles = [
  "**/*.{test,spec}.{js,jsx,ts,tsx}",
  "**/*.stories.{js,jsx,ts,tsx}",
  "**/__tests__/**/*.{js,jsx,ts,tsx}",
  "**/__mocks__/**/*.{js,jsx,ts,tsx}",
];

const reactCorrectnessRules = new Set([
  "@eslint-react/dom-no-dangerously-set-innerhtml",
  "@eslint-react/dom-no-script-url",
  "@eslint-react/dom-no-unsafe-iframe-sandbox",
  "@eslint-react/jsx-no-comment-textnodes",
  "@eslint-react/jsx-no-leaked-dollar",
  "@eslint-react/jsx-no-leaked-semicolon",
  "@eslint-react/purity",
  "@eslint-react/set-state-in-effect",
  "@eslint-react/web-api-no-leaked-event-listener",
  "@eslint-react/web-api-no-leaked-fetch",
  "@eslint-react/web-api-no-leaked-intersection-observer",
  "@eslint-react/web-api-no-leaked-interval",
  "@eslint-react/web-api-no-leaked-resize-observer",
  "@eslint-react/web-api-no-leaked-timeout",
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
    "Write React components with a block body and an explicit return statement.",
};
const explicitReturnRestrictions = [
  "FunctionDeclaration[id.name=/^[A-Z]/]:has(JSXElement, JSXFragment):not(:has(ReturnStatement))",
  "VariableDeclarator[id.name=/^[A-Z]/] > ArrowFunctionExpression[body.type='BlockStatement']:has(JSXElement, JSXFragment):not(:has(ReturnStatement))",
  "VariableDeclarator[id.name=/^[A-Z]/] > FunctionExpression:has(JSXElement, JSXFragment):not(:has(ReturnStatement))",
].map((selector) => ({
  selector,
  message: "React components must contain an explicit return statement.",
}));

const componentRestrictions = [
  defaultExportRestriction,
  conciseArrowRestriction,
  ...explicitReturnRestrictions,
];

export default tseslint.config(
  {
    name: "@module-foundry/eslint/reactjs/ignores",
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/.vite/**",
      "**/.output/**",
      "**/out/**",
      "**/storybook-static/**",
    ],
  },
  {
    name: "@module-foundry/eslint/reactjs/linter-options",
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
  {
    ...eslint.configs.recommended,
    name: "@module-foundry/eslint/reactjs/javascript",
    files: sourceFiles,
  },
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: typescriptFiles,
  })),
  {
    ...eslintReact.configs.recommended,
    name: "@module-foundry/eslint/reactjs/react",
    files: frontendFiles,
    rules: normalizeWarnings(
      eslintReact.configs.recommended.rules,
      reactCorrectnessRules,
    ),
  },
  {
    ...reactHooks.configs.flat["recommended-latest"],
    name: "@module-foundry/eslint/reactjs/react-hooks",
    files: frontendFiles,
    rules: {
      ...reactHooks.configs.flat["recommended-latest"].rules,
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/incompatible-library": "off",
      "react-hooks/unsupported-syntax": "off",
    },
  },
  {
    name: "@module-foundry/eslint/reactjs/check-file",
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
    name: "@module-foundry/eslint/reactjs/quality",
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
    name: "@module-foundry/eslint/reactjs/typescript-type-checked",
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
    name: "@module-foundry/eslint/reactjs/browser",
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
    name: "@module-foundry/eslint/reactjs/component-contract",
    files: componentFiles,
    rules: {
      "no-restricted-syntax": ["error", ...componentRestrictions],
    },
  },
  {
    name: "@module-foundry/eslint/reactjs/nextjs-app-router",
    files: nextFiles,
    rules: {
      "check-file/folder-naming-convention": "off",
    },
  },
  {
    name: "@module-foundry/eslint/reactjs/tests-and-stories",
    files: testFiles,
    rules: {
      "no-console": "off",
      "no-magic-numbers": "off",
      "no-restricted-syntax": "off",
    },
  },
  {
    ...prettierConfig,
    name: "@module-foundry/eslint/reactjs/prettier-compatibility",
  },
);

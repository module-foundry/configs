import { cwd } from "node:process";

import eslintComments from "@eslint-community/eslint-plugin-eslint-comments";
import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import prettierConfig from "eslint-config-prettier/flat";
import checkFile from "eslint-plugin-check-file";
import jsdoc from "eslint-plugin-jsdoc";
import perfectionist from "eslint-plugin-perfectionist";
import regexp from "eslint-plugin-regexp";
import sonarjs from "eslint-plugin-sonarjs";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

const COGNITIVE_COMPLEXITY_LIMIT = 15;
const COMPLEXITY_LIMIT = 12;
const FUNCTION_LINE_LIMIT = 100;
const FUNCTION_PARAMETER_LIMIT = 5;
const JSDOC_DESCRIPTION_LIMIT = 300;
const MAX_NESTING_DEPTH = 4;

const sourceFiles = ["**/*.{js,mjs,cjs,ts,mts,cts}"];
const typescriptFiles = ["**/*.{ts,mts,cts}"];
const separator = { newlinesBetween: 1 };
const inlineTypeImportRestriction = {
  selector: "ImportDeclaration[importKind='type']:has(ImportSpecifier)",
  message: "Use inline type specifiers: import { type Name } from 'module'.",
};

const plugins = {
  jsdoc,
  sonarjs,
  perfectionist,
  "check-file": checkFile,
  "@stylistic": stylistic,
  "unused-imports": unusedImports,
  "eslint-comments": eslintComments,
};

const commonRules = {
  // File and folder names.
  "check-file/filename-naming-convention": [
    "error",
    { "**/*.{js,mjs,cjs,ts,mts,cts}": "KEBAB_CASE" },
    { ignoreMiddleExtensions: true },
  ],
  "check-file/folder-naming-convention": [
    "error",
    { "**/": "KEBAB_CASE" },
    { ignoreWords: ["__mocks__", "__tests__"] },
  ],

  // Language and control flow.
  "no-var": "error",
  curly: ["error", "all"],
  "prefer-template": "error",
  eqeqeq: ["error", "always"],
  "no-return-assign": "error",
  "consistent-return": "error",
  "no-param-reassign": "error",
  "no-useless-concat": "error",
  "prefer-object-spread": "error",
  "require-atomic-updates": "error",
  "no-promise-executor-return": "error",
  "object-shorthand": ["error", "always"],
  "no-else-return": ["error", { allowElseIf: false }],
  "prefer-const": ["error", { destructuring: "all" }],
  "prefer-arrow-callback": ["error", { allowNamedFunctions: false }],
  "func-style": ["error", "expression", { allowArrowFunctions: true }],

  // Diagnostics and complexity budgets.
  "no-console": "warn",
  "no-await-in-loop": "warn",
  "no-nested-ternary": "warn",
  "no-implicit-coercion": "warn",
  complexity: ["warn", COMPLEXITY_LIMIT],
  "max-depth": ["warn", MAX_NESTING_DEPTH],
  "max-params": ["warn", FUNCTION_PARAMETER_LIMIT],
  "max-lines-per-function": [
    "warn",
    {
      skipComments: true,
      skipBlankLines: true,
      max: FUNCTION_LINE_LIMIT,
    },
  ],
  "no-magic-numbers": [
    "warn",
    {
      enforceConst: true,
      detectObjects: false,
      ignore: [-1, 0, 1, 2],
      ignoreArrayIndexes: true,
    },
  ],

  // Unused code.
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": "off",
  "unused-imports/no-unused-imports": "error",
  "unused-imports/no-unused-vars": [
    "warn",
    {
      vars: "all",
      args: "after-used",
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    },
  ],

  // Maintainability checks.
  "sonarjs/no-collapsible-if": "warn",
  "sonarjs/no-identical-functions": "warn",
  "sonarjs/no-duplicated-branches": "error",
  "sonarjs/prefer-immediate-return": "warn",
  "sonarjs/cognitive-complexity": ["warn", COGNITIVE_COMPLEXITY_LIMIT],

  // ESLint directives.
  "eslint-comments/no-unused-disable": "error",
  "eslint-comments/require-description": "error",
  "eslint-comments/disable-enable-pair": ["error", { allowWholeFile: true }],

  // JSDoc.
  "jsdoc/require-param": "off",
  "jsdoc/check-syntax": "error",
  "jsdoc/require-throws": "error",
  "jsdoc/check-alignment": "error",
  "jsdoc/check-param-names": "off",
  "jsdoc/check-tag-names": "error",
  "jsdoc/require-param-type": "off",
  "jsdoc/require-returns-type": "off",
  "jsdoc/require-param-description": "off",
  "jsdoc/require-throws-description": "error",
  "jsdoc/require-returns-description": "error",
  "jsdoc/require-returns": ["error", { forceRequireReturn: false }],
  "jsdoc/require-description": [
    "error",
    { contexts: ["any"], descriptionStyle: "body" },
  ],
  "jsdoc/sort-tags": [
    "error",
    {
      linesBetween: 0,
      tagSequence: [
        { tags: ["-other"] },
        { tags: ["return", "returns"] },
        { tags: ["exception", "throws"] },
      ],
    },
  ],
  "jsdoc/match-description": [
    "error",
    {
      contexts: ["any"],
      mainDescription: {
        match: `^[\\s\\S]{1,${JSDOC_DESCRIPTION_LIMIT}}$`,
        message: `Keep the JSDoc description between 1 and ${JSDOC_DESCRIPTION_LIMIT} characters.`,
      },
    },
  ],

  // Local formatting policies not owned by Prettier.
  "@stylistic/template-curly-spacing": ["error", "never"],
  "perfectionist/sort-objects": [
    "error",
    {
      order: "asc",
      ignoreCase: true,
      type: "line-length",
      styledComponents: false,
      partitionByComment: true,
      partitionByNewLine: true,
      fallbackSort: { type: "natural" },
      useExperimentalDependencyDetection: true,
    },
  ],
};

const typescriptRules = {
  "no-restricted-syntax": ["error", inlineTypeImportRestriction],
  "@typescript-eslint/no-unnecessary-condition": "warn",
  "@typescript-eslint/no-import-type-side-effects": "off",
  "@typescript-eslint/switch-exhaustiveness-check": "error",
  "@typescript-eslint/no-confusing-void-expression": "error",
  "@typescript-eslint/return-await": ["error", "in-try-catch"],
  "@typescript-eslint/consistent-type-imports": [
    "error",
    { prefer: "type-imports", fixStyle: "inline-type-imports" },
  ],
};

const structuralRules = {
  "@stylistic/no-multiple-empty-lines": [
    "error",
    { max: 1, maxBOF: 0, maxEOF: 0 },
  ],
  "@stylistic/lines-between-class-members": [
    "error",
    "always",
    { exceptAfterOverload: true, exceptAfterSingleLine: true },
  ],
  "@stylistic/padding-line-between-statements": [
    "error",
    { next: "*", prev: "directive", blankLine: "always" },
    { blankLine: "any", next: "directive", prev: "directive" },
    { next: "*", prev: "import", blankLine: "always" },
    { next: "import", prev: "import", blankLine: "any" },
    {
      blankLine: "always",
      prev: ["const", "let", "var"],
      next: ["block", "block-like", "return", "throw"],
    },
  ],
};

const namedImportOrder = {
  order: "asc",
  type: "natural",
  ignoreCase: true,
  newlinesBetween: 0,
  groups: ["value-import", "type-import"],
};

const nestjsImportOrder = {
  order: "asc",
  type: "natural",
  ignoreCase: true,
  newlinesInside: 0,
  newlinesBetween: 0,
  sortSideEffects: false,
  partitionByNewLine: false,
  internalPattern: ["^src(?:/|$)"],
  fallbackSort: { order: "asc", type: "alphabetical" },
  groups: [
    "side-effect",
    separator,
    "value-builtin",
    "type-builtin",
    separator,
    "value-external",
    "type-external",
    separator,
    "value-internal",
    "type-internal",
    separator,
    "value-parent",
    "type-parent",
    "value-sibling",
    "type-sibling",
    "value-index",
    "type-index",
  ],
};

export default tseslint.config(
  {
    name: "@module-foundry/eslint/nestjs/ignores",
    ignores: [
      "coverage/**",
      "dist/**",
      "playgrounds/**",
      "node_modules/**",
      "test/**",
    ],
  },
  {
    ...eslint.configs.recommended,
    files: sourceFiles,
    name: "@module-foundry/eslint/nestjs/javascript",
  },
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: typescriptFiles,
  })),
  {
    ...regexp.configs["flat/recommended"],
    files: sourceFiles,
    name: "@module-foundry/eslint/nestjs/regexp",
  },
  {
    plugins,
    files: sourceFiles,
    rules: commonRules,
    name: "@module-foundry/eslint/nestjs/common",
    settings: {
      jsdoc: {
        mode: "typescript",
      },
    },
    languageOptions: {
      ecmaVersion: "latest",
      globals: { ...globals.es2024, ...globals.node },
    },
  },
  {
    files: typescriptFiles,
    rules: typescriptRules,
    name: "@module-foundry/eslint/nestjs/typescript-type-checked",
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: cwd(),
      },
    },
  },
  {
    files: sourceFiles,
    name: "@module-foundry/eslint/nestjs/imports",
    rules: {
      "perfectionist/sort-imports": ["error", nestjsImportOrder],
      "perfectionist/sort-named-imports": ["error", namedImportOrder],
    },
  },
  {
    files: typescriptFiles,
    name: "@module-foundry/eslint/nestjs/classes",
    rules: {
      "@typescript-eslint/no-extraneous-class": "error",
      "@typescript-eslint/no-useless-constructor": "error",
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        { accessibility: "explicit" },
      ],
      "perfectionist/sort-classes": [
        "error",
        {
          order: "asc",
          type: "natural",
          ignoreCase: true,
          fallbackSort: { type: "natural" },
          useExperimentalDependencyDetection: true,
          groups: [
            ["static-property", "static-accessor-property"],
            ["static-method", "static-function-property"],
            ["property", "accessor-property"],
            ["protected-property", "protected-accessor-property"],
            ["private-property", "private-accessor-property"],
            "constructor",
            ["method", "function-property"],
            ["protected-method", "protected-function-property"],
            ["private-method", "private-function-property"],
            "unknown",
          ],
        },
      ],
    },
  },
  {
    ...prettierConfig,
    name: "@module-foundry/eslint/nestjs/prettier-compatibility",
  },
  {
    rules: structuralRules,
    name: "@module-foundry/eslint/nestjs/structural-formatting",
  },
);

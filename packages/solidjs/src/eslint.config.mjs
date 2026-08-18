import { cwd } from "node:process";

import eslintComments from "@eslint-community/eslint-plugin-eslint-comments";
import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import prettierConfig from "eslint-config-prettier/flat";
import checkFile from "eslint-plugin-check-file";
import jsdoc from "eslint-plugin-jsdoc";
import perfectionist from "eslint-plugin-perfectionist";
import regexp from "eslint-plugin-regexp";
import solid from "eslint-plugin-solid";
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

const sourceFiles = ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"];
const typescriptFiles = ["**/*.{ts,mts,cts,tsx}"];
const frontendFiles = ["**/*.{js,jsx,ts,tsx}"];
const componentFiles = ["**/*.{jsx,tsx}"];
const separator = { newlinesBetween: 1 };
const inlineTypeImportRestriction = {
  selector: "ImportDeclaration[importKind='type']:has(ImportSpecifier)",
  message: "Use inline type specifiers: import { type Name } from 'module'.",
};
const solidReactiveGroups = [
  {
    name: "signals and reactive sources",
    selector:
      "VariableDeclaration:has(CallExpression[callee.name=/^create(?!(?:Memo|Selector|Deferred|Computed|RenderEffect|Effect|Reaction)$)[A-Z]/])",
  },
  {
    name: "constants",
    selector:
      "VariableDeclaration:not(:has(CallExpression[callee.name=/^create[A-Z]/])):not(:has(VariableDeclarator[init.type=/^(?:ArrowFunctionExpression|FunctionExpression)$/]))",
  },
  {
    name: "memoized values",
    selector:
      "VariableDeclaration:has(CallExpression[callee.name=/^(?:createMemo|createSelector|createDeferred)$/])",
  },
  {
    name: "handlers",
    selector:
      "VariableDeclaration:has(VariableDeclarator[init.type=/^(?:ArrowFunctionExpression|FunctionExpression)$/])",
  },
  {
    name: "effects",
    selector:
      "ExpressionStatement:has(> CallExpression[callee.name=/^(?:createComputed|createRenderEffect|createEffect|createReaction|onMount|onCleanup)$/])",
  },
];
const solidReactiveGroupOrder = solidReactiveGroups
  .map(({ name }) => name)
  .join(", ");
const solidReactiveOrderRestrictions = solidReactiveGroups.flatMap(
  (earlierGroup, earlierIndex) =>
    solidReactiveGroups.slice(earlierIndex + 1).map((laterGroup) => ({
      selector: `BlockStatement > ${laterGroup.selector} ~ ${earlierGroup.selector}`,
      message: `Keep Solid component groups in this order: ${solidReactiveGroupOrder}.`,
    })),
);
const solidEffectSelector = solidReactiveGroups.at(-1).selector;
const solidReactivePaddingRules = solidReactiveGroups.flatMap(
  (earlierGroup, earlierIndex) =>
    solidReactiveGroups.slice(earlierIndex + 1).map((laterGroup) => ({
      blankLine: "always",
      prev: { selector: earlierGroup.selector },
      next: { selector: laterGroup.selector },
    })),
);

solidReactiveOrderRestrictions.push({
  selector: `BlockStatement > ${solidEffectSelector} ~ :not(${solidEffectSelector}):not(ReturnStatement)`,
  message: "Keep Solid effects at the bottom of the component, before return.",
});

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
    { "**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}": "KEBAB_CASE" },
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
  "@typescript-eslint/no-unnecessary-condition": "warn",
  "@typescript-eslint/no-import-type-side-effects": "off",
  "@typescript-eslint/switch-exhaustiveness-check": "error",
  "@typescript-eslint/no-confusing-void-expression": "error",
  "@typescript-eslint/return-await": ["error", "in-try-catch"],
  "no-restricted-syntax": ["error", inlineTypeImportRestriction],
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
    ...solidReactivePaddingRules,
  ],
};

const fsdLayers = [
  ["app", "@/app(?:/|$)"],
  ["pages", "@/pages(?:/|$)"],
  ["widgets", "@/widgets(?:/|$)"],
  ["features", "@/features(?:/|$)"],
  ["entities", "@/entities(?:/|$)"],
  ["shared", "@/shared(?:/|$)"],
  ["parent", "\\.\\.(?:/|$)"],
  ["sibling", "\\./"],
  ["root", "@/"],
];
const semanticGroups = [
  ["config", "(?:config|constants?)(?:/|$)"],
  ["utilities", "(?:lib|hooks?)(?:/|$)"],
  ["api", "(?:api|requests?)(?:/|$)"],
  ["models", "(?:model|models|store|types?)(?:/|$)"],
  [
    "components",
    "(?:(?:ui|components?)(?:/|$)|@/(?:pages|widgets|features|entities)/[^/]+$)",
  ],
  [
    "assets",
    "(?:assets?)(?:/|$)|\\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp|woff2?)(?:\\?.*)?$",
  ],
  ["other", null],
];
const importForms = [
  ["mixed", ["default", "named"]],
  ["default", ["default"]],
  ["named", ["named"]],
  ["wildcard", ["wildcard"]],
];
const baseImportOrder = {
  order: "asc",
  type: "natural",
  ignoreCase: true,
  newlinesInside: 0,
  newlinesBetween: 0,
  sortSideEffects: false,
  partitionByNewLine: false,
  fallbackSort: { order: "asc", type: "alphabetical" },
};

const customGroup = (groupName, elementNamePattern, modifiers) => ({
  groupName,
  elementNamePattern,
  ...(modifiers && { modifiers }),
});

const createLayer = (
  semanticName,
  semanticPattern,
  layerName,
  layerPattern,
) => {
  const prefix = `${semanticName}-${layerName}`;
  const name = (form) => `${prefix}-${form}`;
  const elementNamePattern = semanticPattern
    ? `^(?=${layerPattern})(?=.*${semanticPattern})`
    : `^${layerPattern}`;
  const groups =
    semanticName === "assets"
      ? [[name("named"), name("wildcard")], name("mixed"), name("default")]
      : [name("default"), name("mixed"), [name("named"), name("wildcard")]];

  return {
    groups,
    customGroups: importForms.map(([form, modifiers]) =>
      customGroup(name(form), elementNamePattern, modifiers),
    ),
  };
};

const semanticSections = semanticGroups.map(
  ([semanticName, semanticPattern], semanticIndex) => {
    const layers = fsdLayers.map(([layerName, layerPattern]) =>
      createLayer(semanticName, semanticPattern, layerName, layerPattern),
    );

    return {
      customGroups: layers.flatMap(({ customGroups }) => customGroups),
      groups: [
        ...layers.flatMap(({ groups }, layerIndex) => [
          ...groups,
          ...(layerIndex < layers.length - 1 ? [separator] : []),
        ]),
        ...(semanticIndex < semanticGroups.length - 1 ? [separator] : []),
      ],
    };
  },
);

const namedImportOrder = {
  order: "asc",
  type: "natural",
  ignoreCase: true,
  newlinesBetween: 0,
  groups: ["value-import", "type-import"],
};

const createFrontendImportOrder = (frameworkGroups) => ({
  ...baseImportOrder,
  internalPattern: ["^@/"],
  groups: [
    "styles",
    separator,
    ...frameworkGroups.map(([name]) => name),
    ["value-external", "type-external"],
    "zod",
    "valibot",
    "clsx",
    separator,
    ...semanticSections.flatMap(({ groups }) => groups),
    separator,
    "side-effect",
    "unknown",
  ],
  customGroups: [
    customGroup("styles", "\\.(?:css|less|sass|scss|styl)(?:\\?.*)?$"),
    ...frameworkGroups.map(([name, pattern]) => customGroup(name, pattern)),
    customGroup("zod", "^zod(?:/|$)"),
    customGroup("valibot", "^valibot(?:/|$)"),
    customGroup("clsx", "^clsx$"),
    ...semanticSections.flatMap(({ customGroups }) => customGroups),
  ],
});

const frameworkImports = [
  ["solid", "^solid-js(?:/|$)"],
  ["solid-ecosystem", "^(?:@solidjs|solid-.+)(?:/|$)"],
];

const propsRestrictions = [
  ...[
    "FunctionDeclaration[id.name=/^[A-Z]/][params.0.type='ObjectPattern']:has(JSXElement, JSXFragment)",
    "VariableDeclarator[id.name=/^[A-Z]/] > ArrowFunctionExpression[params.0.type='ObjectPattern']:has(JSXElement, JSXFragment)",
    "VariableDeclarator[id.name=/^[A-Z]/] > FunctionExpression[params.0.type='ObjectPattern']:has(JSXElement, JSXFragment)",
  ].map((selector) => ({
    selector,
    message: "Keep Solid component props as an object to preserve reactivity.",
  })),
  ...[
    "FunctionDeclaration[id.name=/^[A-Z]/][params.0.type='Identifier'][params.0.name!='props']:has(JSXElement, JSXFragment)",
    "VariableDeclarator[id.name=/^[A-Z]/] > ArrowFunctionExpression[params.0.type='Identifier'][params.0.name!='props']:has(JSXElement, JSXFragment)",
    "VariableDeclarator[id.name=/^[A-Z]/] > FunctionExpression[params.0.type='Identifier'][params.0.name!='props']:has(JSXElement, JSXFragment)",
  ].map((selector) => ({
    selector,
    message: 'Name the Solid component props parameter "props".',
  })),
];

const componentFunctionSelectors = [
  "FunctionDeclaration[id.name=/^[A-Z]/]:has(JSXElement, JSXFragment)",
  "VariableDeclarator[id.name=/^[A-Z]/] > ArrowFunctionExpression:has(JSXElement, JSXFragment)",
  "VariableDeclarator[id.name=/^[A-Z]/] > FunctionExpression:has(JSXElement, JSXFragment)",
];
const staticComponentConstantRestrictions = componentFunctionSelectors.flatMap(
  (componentSelector) =>
    [
      "VariableDeclaration[kind='const']:has(> VariableDeclarator[init.type='Literal'])",
      "VariableDeclaration[kind='const']:has(> VariableDeclarator[init.type='ObjectExpression']):not(:has(Property[value.type!='Literal'], SpreadElement))",
      "VariableDeclaration[kind='const']:has(> VariableDeclarator[init.type='ArrayExpression']):not(:has(SpreadElement, Property[value.type!='Literal'], ArrayExpression > :not(Literal, ObjectExpression, ArrayExpression)))",
    ].map((constantSelector) => ({
      selector: `${componentSelector} > BlockStatement > ${constantSelector}`,
      message: "Move component-independent constants to module scope.",
    })),
);

const componentRestrictions = [
  {
    selector: "Program:not(:has(ExportDefaultDeclaration))",
    message: "Component files must have a default export.",
  },
  {
    selector: "ExportNamedDeclaration",
    message: "Use only a default export in component files.",
  },
  {
    selector:
      "VariableDeclarator[id.name=/^[A-Z]/] > ArrowFunctionExpression[body.type!='BlockStatement']:has(JSXElement, JSXFragment)",
    message:
      "Write Solid components with a block body and an explicit return statement.",
  },
  ...staticComponentConstantRestrictions,
  ...[
    "FunctionDeclaration[id.name=/^[A-Z]/]:has(JSXElement, JSXFragment):not(:has(ReturnStatement))",
    "VariableDeclarator[id.name=/^[A-Z]/] > ArrowFunctionExpression[body.type='BlockStatement']:has(JSXElement, JSXFragment):not(:has(ReturnStatement))",
    "VariableDeclarator[id.name=/^[A-Z]/] > FunctionExpression:has(JSXElement, JSXFragment):not(:has(ReturnStatement))",
  ].map((selector) => ({
    selector,
    message: "Solid components must contain an explicit return statement.",
  })),
];

export default tseslint.config(
  {
    name: "@module-foundry/eslint/solidjs/ignores",
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
    name: "@module-foundry/eslint/solidjs/javascript",
  },
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: typescriptFiles,
  })),
  {
    ...regexp.configs["flat/recommended"],
    files: sourceFiles,
    name: "@module-foundry/eslint/solidjs/regexp",
  },
  {
    plugins,
    files: sourceFiles,
    rules: commonRules,
    name: "@module-foundry/eslint/solidjs/common",
    settings: {
      jsdoc: {
        mode: "typescript",
      },
    },
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.es2024,
    },
  },
  {
    files: typescriptFiles,
    rules: typescriptRules,
    name: "@module-foundry/eslint/solidjs/typescript-type-checked",
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: cwd(),
      },
    },
  },
  ...[solid.configs["flat/typescript"]].map((config) => ({
    ...config,
    files: frontendFiles,
  })),
  {
    files: frontendFiles,
    name: "@module-foundry/eslint/solidjs/framework",
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "perfectionist/sort-named-imports": ["error", namedImportOrder],
      "perfectionist/sort-imports": [
        "error",
        createFrontendImportOrder(frameworkImports),
      ],
      "no-restricted-syntax": [
        "error",
        inlineTypeImportRestriction,
        ...propsRestrictions,
        ...solidReactiveOrderRestrictions,
      ],
      "@stylistic/jsx-curly-brace-presence": [
        "error",
        { props: "always", children: "ignore", propElementValues: "ignore" },
      ],
    },
  },
  {
    files: componentFiles,
    name: "@module-foundry/eslint/solidjs/component-exports",
    rules: {
      "no-restricted-syntax": [
        "error",
        inlineTypeImportRestriction,
        ...propsRestrictions,
        ...componentRestrictions,
        ...solidReactiveOrderRestrictions,
      ],
    },
  },
  {
    ...prettierConfig,
    name: "@module-foundry/eslint/solidjs/prettier-compatibility",
  },
  {
    rules: structuralRules,
    name: "@module-foundry/eslint/solidjs/structural-formatting",
  },
);

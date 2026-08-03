/** @type {import("stylelint").Config} */
export default {
  plugins: ["stylelint-order"],
  extends: ["stylelint-config-standard-scss"],
  rules: {
    "declaration-empty-line-before": [
      "always",
      {
        except: ["first-nested"],
        ignore: ["after-comment", "after-declaration"],
      },
    ],
    "custom-property-empty-line-before": "never",
    "selector-class-pattern": [
      "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\\*|(?:__[a-z][a-z0-9]*(?:-[a-z0-9]+)*)?(?:--[a-z][a-z0-9]*(?:-[a-z0-9]+)*)?)$",
      {
        message:
          "Use kebab-case BEM: block, block*, block__element, block--modifier, or block__element--modifier",
      },
    ],
    "max-nesting-depth": [
      2,
      {
        ignoreAtRules: ["supports", "container"],
        ignore: ["blockless-at-rules", "pseudo-classes"],
      },
    ],
    "order/order": ["custom-properties", "declarations"],
    "order/custom-properties-alphabetical-order": true,
    "order/properties-order": [
      [
        {
          emptyLineBefore: "always",
          groupName: "positioning",
          noEmptyLineBetween: true,
          properties: ["position", "top", "right", "bottom", "left", "z-index"],
        },
        {
          groupName: "layout",
          noEmptyLineBetween: true,
          emptyLineBefore: "always",
          properties: [
            "display",
            "flex",
            "flex-direction",
            "justify-content",
            "align-items",
          ],
        },
        {
          groupName: "sizing",
          noEmptyLineBetween: true,
          emptyLineBefore: "always",
          properties: ["width", "height", "padding", "margin"],
        },
        {
          groupName: "appearance",
          noEmptyLineBetween: true,
          emptyLineBefore: "always",
          properties: [
            "background",
            "border",
            "border-radius",
            "box-shadow",
            "color",
          ],
        },
      ],
      {
        unspecified: "bottomAlphabetical",
        emptyLineBeforeUnspecified: "always",
      },
    ],
  },
};

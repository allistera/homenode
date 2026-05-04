import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default [
  js.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { "caughtErrorsIgnorePattern": "^_" }],
      "vue/multi-word-component-names": "off",
    },
  },
];

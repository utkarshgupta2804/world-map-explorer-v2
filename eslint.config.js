import globals from "globals";
import pluginJs from "@eslint/js";
import pluginA11y from "eslint-plugin-jsx-a11y";
import eslintConfigAirbnb from "eslint-config-airbnb-base";

export default [
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  pluginJs.configs.recommended,
  {
    // Airbnb configuration
    ...eslintConfigAirbnb,
    plugins: ["import", "jsx-a11y", "prettier"],
    rules: {
      "prettier/prettier": "error", // Treat Prettier issues as errors
      "strict": ["error", "global"], // Enforce strict mode globally
      // Add any additional rules here for stricter checks
    },
  },
  pluginA11y.configs.recommended, // Include recommended rules from jsx-a11y
];

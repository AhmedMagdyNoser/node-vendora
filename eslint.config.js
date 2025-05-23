const jsPlugin = require("@eslint/js");
const nPlugin = require("eslint-plugin-n");
const linterConfig = require("eslint/config");

module.exports = linterConfig.defineConfig([
  {
    files: ["**/*.js"],
    extends: ["js/recommended"],
    plugins: { js: jsPlugin, n: nPlugin },
    languageOptions: {
      sourceType: "commonjs", // Tell ESLint that we're using CommonJS modules
      globals: {
        // Define global variables
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    rules: {
      "no-console": "warn", // Warn on console.log, etc.
      "no-unused-vars": "warn", // Warn on unused variables
      "no-undef": "error", // Error on undefined variables
      "n/no-missing-require": "error", // Error if require() path is incorrect
    },
  },
]);

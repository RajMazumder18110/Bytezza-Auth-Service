/** @notice library imports */
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  /// Recommendations
  eslintConfigPrettier,
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  /// Ignore files
  {
    ignores: [
      "dist",
      "migrations",
      "node_modules",
      "jest.config.js",
      "drizzle.config.ts",
      "eslint.config.mjs",
      "commitlint.config.ts",
    ],
  },

  /// Type information
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  /// Rules
  {
    rules: {
      "no-console": "error",
      "@typescript-eslint/no-duplicate-enum-values": "off",
    },
  },
);

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },

  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier",
  ],

  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },

  rules: {},

  settings: {
    react: {
      version: "detect",
    },
  },

  overrides: [
    {
      files: [
        "**/*.test.*",
        "**/*.spec.*",
        "src/test/**/*",
        "src/**/__tests__/**/*",
      ],
      rules: {
        "react-refresh/only-export-components": "off",
      },
    },
  ],
};
// client/.eslintrc.cjs
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser", // Should be @typescript-eslint/parser v4.x
    ecmaVersion: 2020,
    sourceType: "module",
    project: "./tsconfig.json",
    extraFileExtensions: [".vue"],
  },
  plugins: [
    "@typescript-eslint", // Should be @typescript-eslint/eslint-plugin v4.x
    "vue", // Should be eslint-plugin-vue v7.x (e.g., ^7.20.0)
    "prettier", // Should be eslint-plugin-prettier v3.x
  ],
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended", // From eslint-plugin-vue v7.x
    "plugin:@typescript-eslint/recommended", // From @typescript-eslint/eslint-plugin v4.x
    "prettier", // From eslint-config-prettier (make sure version is compatible)
    "plugin:prettier/recommended", // From eslint-plugin-prettier v3.x
  ],
  rules: {
    "prettier/prettier": "warn",

    // Vue specific rules from eslint-plugin-vue v7.x
    "vue/multi-word-component-names": "warn",
    "vue/no-v-html": "warn",
    "vue/component-name-in-template-casing": [
      "warn",
      "PascalCase",
      {
        registeredComponentsOnly: false,
        globals: [],
      },
    ],
    // Check documentation for eslint-plugin-vue v7.x for available rules like:
    // 'vue/no-unused-components': 'warn',
    // 'vue/script-setup-uses-vars': 'error', // If available and using <script setup>

    // TypeScript specific rules from @typescript-eslint v4.x
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-ts-comment": [
      "warn",
      {
        "ts-expect-error": "allow-with-description",
        "ts-ignore": true,
        "ts-nocheck": true,
        "ts-check": false,
        minimumDescriptionLength: 3,
      },
    ],
    "@typescript-eslint/no-non-null-assertion": "warn",

    // General ESLint rules
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    indent: "off", // Let Prettier handle this
    "@typescript-eslint/indent": "off", // Let Prettier handle this
  },
  overrides: [
    {
      files: [
        "vite.config.ts",
        "tailwind.config.js",
        "postcss.config.js",
        ".eslintrc.cjs",
      ],
      env: {
        node: true,
      },
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-unused-vars": "off",
      },
    },
  ],
  ignorePatterns: [
    "node_modules/",
    "dist/",
    ".turbo/",
    "coverage/",
    "*.d.ts",
    "src/types/auto/auto-imports.d.ts",
    "src/types/auto/components.d.ts",
    ".eslintrc-auto-import.json",
  ],
};

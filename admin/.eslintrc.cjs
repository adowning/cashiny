// apps/admin/.eslintrc.cjs
module.exports = {
  root: false, // Set to false if you have a root ESLint config and this extends it.
              // Set to true if this is standalone for the admin app or the root of its own linting.
              // Assuming you might have a root config, adjust if needed.
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential', // or vue3-recommended for more rules
    'plugin:@typescript-eslint/recommended',
    // If you have a root prettier config for the monorepo, you might not need this here
    // or ensure it's compatible.
    'prettier',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'vue/multi-word-component-names': 'off',
    // Add any project-specific rules here
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
  // If extending a root config, you might have something like:
  // extends: ['../../.eslintrc.js'] // Adjust path as needed
};

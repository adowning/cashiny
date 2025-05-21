// server/.eslintrc.cjs
module.exports = {
  root: true, // Important for monorepos: stops ESLint from looking in parent folders
  env: {
    es2022: true, // Allows modern ECMAScript features
    node: true, // Enables Node.js global variables and Node.js scoping.
    // Bun aims for Node.js compatibility for many globals.
  },
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser for TypeScript
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json', // Path to your server's tsconfig.json
  },
  plugins: [
    '@typescript-eslint', // TypeScript specific linting rules
    'prettier', // Runs Prettier as an ESLint rule and reports differences as ESLint issues.
  ],
  extends: [
    'eslint:recommended', // ESLint's inbuilt 'recommended' set
    'plugin:@typescript-eslint/recommended', // Best practices for TypeScript
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking', // Stricter rules that require type information (can be slower)
    'prettier', // Turns off all rules that are unnecessary or might conflict with Prettier.
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  rules: {
    // Common Overrides & Additions
    'prettier/prettier': 'warn', // Show Prettier differences as warnings
    // TypeScript specific rules (examples, adjust as needed)
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn', // Warn instead of error for 'any'
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Explicit return types can be verbose, TS infers them well.
    '@typescript-eslint/no-inferrable-types': 'off', // Allows explicit types when they could be inferred.

    // Node/Bun specific preferences (examples)
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // Allow console in dev
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    semi: 'off',

    // Add any project-specific rules here
    // e.g., if you use specific Hono patterns or Prisma idioms you want to enforce/discourage
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.turbo/',
    'coverage/',
    '.eslintrc.cjs',
    // Add any other files or directories to ignore
  ],
}

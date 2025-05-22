import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'dist/',
      '.turbo/',
      'client/',
      'src/prisma/',
      'src/seed/products.json',
      'src/seed/games2.json',
      'src/seed/seedProducts.js',
      'src/seed/loadgames.js',
      'client/',
    ],
  },
  {
    files: ['src/**/*.ts', 'src/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  }
)

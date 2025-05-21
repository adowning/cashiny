// .prettierrc.cjs (at the monorepo root)
module.exports = {
  semi: false,
  singleQuote: true,
  trailingComma: 'es5', // or 'all' or 'none'
  printWidth: 100, // Adjust to your preference
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always', // or 'avoid'
  endOfLine: 'lf',

  // Vue specific prettier options (if not using a .prettierrc inside client with vue specific settings)
  // These often go into a .prettierrc in the client directory if you want them separate
  // or if you install prettier-plugin-vue (which is good practice for .vue files)
  // If prettier-plugin-vue is installed, Prettier should pick it up automatically.
  vueIndentScriptAndStyle: true, // Default is false
}

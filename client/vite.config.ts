import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AppLoading from 'vite-plugin-app-loading'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {
  UnpluginDirectivesResolver,
  UnpluginModulesResolver,
  UnpluginVueComponentsResolver,
} from 'maz-ui/resolvers'

const proxy: Record<string, string | any> = {
  '/auth/login': {
    target: 'http://localhost:6589',
    secure: false,
    // rewrite: (path: string) => path.replace(/^\/api/, '\/api/'),
    rewrite: (path: string) => path.replace(/^\/api/, '\/'),

    headers: { Connection: 'keep-alive' },
  },
  '/auth/session': {
    target: 'http://localhost:6589',
    secure: false,
    rewrite: (path: string) => path.replace(/^\/api/, '\/'),

    headers: { Connection: 'keep-alive' },
  },
  '/auth/google': {
    target: 'http://localhost:6589',
    secure: false,
    rewrite: (path: string) => path.replace(/^\/api/, '\/'),

    headers: { Connection: 'keep-alive' },
  },
  '/auth/register': {
    target: 'http://localhost:6589',
    secure: false,
    rewrite: (path: string) => path.replace(/^\/api/, '\/'),

    headers: { Connection: 'keep-alive' },
  },
  '/api': {
    target: 'http://localhost:6589',
    secure: false,
    rewrite: (path: string) => path.replace(/^\/api/, ''),
    headers: { Connection: 'keep-alive' },
  },

  // '/auth': {
  //   target: 'http://localhost:6589',
  //   secure: false,
  //   // rewrite: (path) => path.replace(/^\/auth/, 'auth'),
  //   headers: { Connection: 'keep-alive' },
  // },
  // '/user/connect/ws': { target: 'http://localhost:3001/user/connect/ws', ws: true },
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools({ launchEditor: 'code' }),

    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      dts: 'src/types/auto/auto-imports.d.ts',
      dirs: ['src/composables'],
      eslintrc: {
        enabled: true, // <-- this
      },
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/],
    }),
    AppLoading(),
    // 自动按需导入组件
    Components({
      dts: 'src/types/auto/components.d.ts',
      extensions: ['vue'],
      include: [/\.vue$/, /\.vue\?vue/],
      resolvers: [
        UnpluginVueComponentsResolver(),
        UnpluginDirectivesResolver(),
        UnpluginModulesResolver(),
        // RekaResolver(),
        // RekaResolver({
        //   prefix: '' // use the prefix option to add Prefix to the imported components
        // })
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias @ to src directory
      '@cashflow/types': path.resolve(__dirname, '../packages/types/dist'), // Alias for shared types
    },
  },
  build: {
    outDir: 'dist', // Output directory for production build
    sourcemap: true, // Generate source maps for debugging
  },
  server: {
    port: 3000,
    allowedHosts: ['test.cashflowcasino.com', 'localhost'],
    proxy,
  },
})

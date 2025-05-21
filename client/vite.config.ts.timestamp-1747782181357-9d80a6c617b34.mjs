// vite.config.ts
import { defineConfig } from "file:///home/ash/Documents/cashflow/node_modules/vite/dist/node/index.js";
import vue from "file:///home/ash/Documents/cashflow/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import AppLoading from "file:///home/ash/Documents/cashflow/node_modules/vite-plugin-app-loading/dist/index.js";
import AutoImport from "file:///home/ash/Documents/cashflow/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///home/ash/Documents/cashflow/node_modules/unplugin-vue-components/dist/vite.js";
import {
  UnpluginDirectivesResolver,
  UnpluginModulesResolver,
  UnpluginVueComponentsResolver
} from "file:///home/ash/Documents/cashflow/node_modules/maz-ui/resolvers/index.mjs";
var __vite_injected_original_dirname = "/home/ash/Documents/cashflow/client";
var proxy = {
  "/auth/login": {
    target: "http://localhost:6589",
    secure: false,
    rewrite: (path2) => path2.replace(/^\/api/, "/"),
    headers: { Connection: "keep-alive" }
  },
  "/auth/session": {
    target: "http://localhost:6589",
    secure: false,
    rewrite: (path2) => path2.replace(/^\/api/, "/"),
    headers: { Connection: "keep-alive" }
  },
  "/auth/google": {
    target: "http://localhost:6589",
    secure: false,
    rewrite: (path2) => path2.replace(/^\/api/, "/"),
    headers: { Connection: "keep-alive" }
  },
  "/auth/register": {
    target: "http://localhost:6589",
    secure: false,
    rewrite: (path2) => path2.replace(/^\/api/, "/"),
    headers: { Connection: "keep-alive" }
  },
  "/api": {
    target: "http://localhost:6589",
    secure: false,
    rewrite: (path2) => path2.replace(/^\/api/, ""),
    headers: { Connection: "keep-alive" }
  }
  // '/auth': {
  //   target: 'http://localhost:6589',
  //   secure: false,
  //   // rewrite: (path) => path.replace(/^\/auth/, 'auth'),
  //   headers: { Connection: 'keep-alive' },
  // },
  // '/user/connect/ws': { target: 'http://localhost:3001/user/connect/ws', ws: true },
};
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    // vueDevTools({ launchEditor: 'code' }),
    AutoImport({
      imports: ["vue", "vue-router", "pinia", "@vueuse/core"],
      dts: "src/types/auto/auto-imports.d.ts",
      dirs: ["src/composables"],
      eslintrc: {
        enabled: true
        // <-- this
      },
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/]
    }),
    AppLoading(),
    // 自动按需导入组件
    Components({
      dts: "src/types/auto/components.d.ts",
      extensions: ["vue"],
      include: [/\.vue$/, /\.vue\?vue/],
      resolvers: [
        UnpluginVueComponentsResolver(),
        UnpluginDirectivesResolver(),
        UnpluginModulesResolver()
        // RekaResolver(),
        // RekaResolver({
        //   prefix: '' // use the prefix option to add Prefix to the imported components
        // })
      ]
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      // Alias @ to src directory
      "@cashflow/types": path.resolve(__vite_injected_original_dirname, "../packages/types/dist")
      // Alias for shared types
    }
  },
  build: {
    outDir: "dist",
    // Output directory for production build
    sourcemap: true
    // Generate source maps for debugging
  },
  server: {
    port: 3e3,
    allowedHosts: ["test.cashflowcasino.com", "localhost"],
    proxy
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9hc2gvRG9jdW1lbnRzL2Nhc2hmbG93L2NsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvYXNoL0RvY3VtZW50cy9jYXNoZmxvdy9jbGllbnQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvYXNoL0RvY3VtZW50cy9jYXNoZmxvdy9jbGllbnQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IEFwcExvYWRpbmcgZnJvbSAndml0ZS1wbHVnaW4tYXBwLWxvYWRpbmcnO1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSc7XG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJztcbmltcG9ydCB7XG4gIFVucGx1Z2luRGlyZWN0aXZlc1Jlc29sdmVyLFxuICBVbnBsdWdpbk1vZHVsZXNSZXNvbHZlcixcbiAgVW5wbHVnaW5WdWVDb21wb25lbnRzUmVzb2x2ZXIsXG59IGZyb20gJ21hei11aS9yZXNvbHZlcnMnO1xuXG5jb25zdCBwcm94eTogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgYW55PiA9IHtcbiAgJy9hdXRoL2xvZ2luJzoge1xuICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NjU4OScsXG4gICAgc2VjdXJlOiBmYWxzZSxcbiAgICByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnXFwvJyksXG5cbiAgICBoZWFkZXJzOiB7IENvbm5lY3Rpb246ICdrZWVwLWFsaXZlJyB9LFxuICB9LFxuICAnL2F1dGgvc2Vzc2lvbic6IHtcbiAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjY1ODknLFxuICAgIHNlY3VyZTogZmFsc2UsXG4gICAgcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJ1xcLycpLFxuXG4gICAgaGVhZGVyczogeyBDb25uZWN0aW9uOiAna2VlcC1hbGl2ZScgfSxcbiAgfSxcbiAgJy9hdXRoL2dvb2dsZSc6IHtcbiAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjY1ODknLFxuICAgIHNlY3VyZTogZmFsc2UsXG4gICAgcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJ1xcLycpLFxuXG4gICAgaGVhZGVyczogeyBDb25uZWN0aW9uOiAna2VlcC1hbGl2ZScgfSxcbiAgfSxcbiAgJy9hdXRoL3JlZ2lzdGVyJzoge1xuICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NjU4OScsXG4gICAgc2VjdXJlOiBmYWxzZSxcbiAgICByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnXFwvJyksXG5cbiAgICBoZWFkZXJzOiB7IENvbm5lY3Rpb246ICdrZWVwLWFsaXZlJyB9LFxuICB9LFxuICAnL2FwaSc6IHtcbiAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjY1ODknLFxuICAgIHNlY3VyZTogZmFsc2UsXG4gICAgcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJycpLFxuICAgIGhlYWRlcnM6IHsgQ29ubmVjdGlvbjogJ2tlZXAtYWxpdmUnIH0sXG4gIH0sXG5cbiAgLy8gJy9hdXRoJzoge1xuICAvLyAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NjU4OScsXG4gIC8vICAgc2VjdXJlOiBmYWxzZSxcbiAgLy8gICAvLyByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXV0aC8sICdhdXRoJyksXG4gIC8vICAgaGVhZGVyczogeyBDb25uZWN0aW9uOiAna2VlcC1hbGl2ZScgfSxcbiAgLy8gfSxcbiAgLy8gJy91c2VyL2Nvbm5lY3Qvd3MnOiB7IHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMS91c2VyL2Nvbm5lY3Qvd3MnLCB3czogdHJ1ZSB9LFxufTtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoKSxcbiAgICAvLyB2dWVEZXZUb29scyh7IGxhdW5jaEVkaXRvcjogJ2NvZGUnIH0pLFxuXG4gICAgQXV0b0ltcG9ydCh7XG4gICAgICBpbXBvcnRzOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJywgJ0B2dWV1c2UvY29yZSddLFxuICAgICAgZHRzOiAnc3JjL3R5cGVzL2F1dG8vYXV0by1pbXBvcnRzLmQudHMnLFxuICAgICAgZGlyczogWydzcmMvY29tcG9zYWJsZXMnXSxcbiAgICAgIGVzbGludHJjOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsIC8vIDwtLSB0aGlzXG4gICAgICB9LFxuICAgICAgaW5jbHVkZTogWy9cXC5bdGpdc3g/JC8sIC9cXC52dWUkLywgL1xcLnZ1ZVxcP3Z1ZS9dLFxuICAgIH0pLFxuICAgIEFwcExvYWRpbmcoKSxcbiAgICAvLyBcdTgxRUFcdTUyQThcdTYzMDlcdTk3MDBcdTVCRkNcdTUxNjVcdTdFQzRcdTRFRjZcbiAgICBDb21wb25lbnRzKHtcbiAgICAgIGR0czogJ3NyYy90eXBlcy9hdXRvL2NvbXBvbmVudHMuZC50cycsXG4gICAgICBleHRlbnNpb25zOiBbJ3Z1ZSddLFxuICAgICAgaW5jbHVkZTogWy9cXC52dWUkLywgL1xcLnZ1ZVxcP3Z1ZS9dLFxuICAgICAgcmVzb2x2ZXJzOiBbXG4gICAgICAgIFVucGx1Z2luVnVlQ29tcG9uZW50c1Jlc29sdmVyKCksXG4gICAgICAgIFVucGx1Z2luRGlyZWN0aXZlc1Jlc29sdmVyKCksXG4gICAgICAgIFVucGx1Z2luTW9kdWxlc1Jlc29sdmVyKCksXG4gICAgICAgIC8vIFJla2FSZXNvbHZlcigpLFxuICAgICAgICAvLyBSZWthUmVzb2x2ZXIoe1xuICAgICAgICAvLyAgIHByZWZpeDogJycgLy8gdXNlIHRoZSBwcmVmaXggb3B0aW9uIHRvIGFkZCBQcmVmaXggdG8gdGhlIGltcG9ydGVkIGNvbXBvbmVudHNcbiAgICAgICAgLy8gfSlcbiAgICAgIF0sXG4gICAgfSksXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSwgLy8gQWxpYXMgQCB0byBzcmMgZGlyZWN0b3J5XG4gICAgICAnQGNhc2hmbG93L3R5cGVzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL3BhY2thZ2VzL3R5cGVzL2Rpc3QnKSwgLy8gQWxpYXMgZm9yIHNoYXJlZCB0eXBlc1xuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsIC8vIE91dHB1dCBkaXJlY3RvcnkgZm9yIHByb2R1Y3Rpb24gYnVpbGRcbiAgICBzb3VyY2VtYXA6IHRydWUsIC8vIEdlbmVyYXRlIHNvdXJjZSBtYXBzIGZvciBkZWJ1Z2dpbmdcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogMzAwMCxcbiAgICBhbGxvd2VkSG9zdHM6IFsndGVzdC5jYXNoZmxvd2Nhc2luby5jb20nLCAnbG9jYWxob3N0J10sXG4gICAgcHJveHksXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMlIsU0FBUyxvQkFBb0I7QUFDeFQsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sVUFBVTtBQUNqQixPQUFPLGdCQUFnQjtB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

// apps/client/src/env.d.ts
/// <reference types="vite/client" />

// This declares the type for .vue files, so TypeScript doesn't complain about importing them.
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

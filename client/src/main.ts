// Client entry point (e.g., main.ts for Vue, main.tsx for React)
// Setup your client framework here (Vue, React, Svelte, etc.)
// apps/client/src/main.ts
import { createApp } from 'vue'

// or import 'maz-ui/css/main.css'
// import '@/css/path_to_your_main_file.css';
import 'maz-ui/styles'

import './assets/main.css'
// Import Tailwind CSS base styles
// Path: client/src/main.ts (Example)
import App from './App.vue'
import { createPinia } from 'pinia' // Import createPinia
import { router } from './router' // Assuming your router setup
// import { GlobalAnimationsPlugin } from ...
// import { i18n } from ...
import { setupStore } from './stores' // If you have this function to register all stores

const app = createApp(App)

// const pinia = createPinia() // Create Pinia instance
// app.use(pinia) // Use Pinia

// If you have a setupStore function, ensure it's called after app.use(pinia),
// or that it handles the Pinia instance internally.
await setupStore(app) // For example

// app.use(GlobalAnimationsPlugin);
// app.use(i18n);
app.use(router) // Use router

app.mount('#app')

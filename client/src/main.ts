// Client entry point (e.g., main.ts for Vue, main.tsx for React)
// Setup your client framework here (Vue, React, Svelte, etc.)
// apps/client/src/main.ts
import { createApp } from 'vue';

// or import 'maz-ui/css/main.css'
// import '@/css/path_to_your_main_file.css';
import 'maz-ui/styles';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  // something vue-i18n options here ...
});
import App from './App.vue';
import './assets/main.css';
// Import Tailwind CSS base styles
import { router } from './router/index';
import { initializeApiClient } from './sdk/apiClient';
// Example usage of a shared type (for demonstration)
// const exampleUser: User = {
//   id: '1',
//   email: 'test@example.com',
//   name: 'Test User',
//   username: 'testuser',
//   // balance and other fields would come from your actual User type definition
// }
// console.log('Example user from shared types:', exampleUser)
import { resetAllStores, setupStore } from './stores';

// const app = createApp(App)
var app = createApp(App);
app.use(i18n);

// const POSTHOG_API_KEY = import.meta.env.VITE_POSTHOG_API_KEY
// const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST

// posthog.init(POSTHOG_API_KEY, {
//   api_host: POSTHOG_HOST,
//   // Other PostHog options can be added here
// })
// // export  posthog
// export { posthog }

// posthog.init(POSTHOG_API_KEY, {
//   api_host: POSTHOG_HOST,
//   // Other PostHog options can be added here
// })
// app.use(VueQueryPlugin)
// ;(window as any).posthog = posthog
await setupStore(app);
try {
  // initializeApiClient();
} catch (error) {
  console.error('Failed to initialize API client:', error);
  // Handle critical initialization failure if necessary
}

// app.component('inline-svg', InlineSvg)
// resetAllStores()
app.use(router);
// app.use(Vue3Marquee)
// app.mount("#app");
// const playerId = ''
// startSubscriptions()
router.isReady().then(() => {
  app.mount('#app');
  // loadingFadeOut(); // If you want to call this after router is ready and app is mounted
});

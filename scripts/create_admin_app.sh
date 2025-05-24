#!/bin/bash

# Script to create the new admin package for Cashflow monorepo

# Ensure we are in the monorepo root (basic check)


# --- Configuration ---
ADMIN_DIR="admin"
PACKAGE_NAME="@cashflow/admin"
TYPES_PATH_ALIAS="../packages/types/src/*" # Verified from types package structure

# --- Create Directory Structure ---
echo "Creating directory structure for $ADMIN_DIR..."
mkdir -p $ADMIN_DIR/public
mkdir -p $ADMIN_DIR/src/assets/primevue-theme
mkdir -p $ADMIN_DIR/src/components
mkdir -p $ADMIN_DIR/src/router
mkdir -p $ADMIN_DIR/src/views

# --- Create package.json ---
echo "Creating $ADMIN_DIR/package.json..."
cat <<EOF > $ADMIN_DIR/package.json
{
  "name": "$PACKAGE_NAME",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.ts,.jsx,.tsx --fix",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "primeicons": "^7.0.0",
    "primevue": "^4.0.0-rc.2",
    "vue": "^3.4.21",
    "vue-router": "^4.3.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0-alpha.16",
    "@types/node": "^20.12.7",
    "@vitejs/plugin-vue": "^5.0.4",
    "eslint": "^8.57.0",
    "eslint-plugin-vue": "^9.24.0",
    "postcss": "^8.4.38",
    "prettier": "^3.2.5",
    "sass": "^1.77.6",
    "tailwindcss": "^4.0.0-alpha.16",
    "typescript": "^5.4.5",
    "vite": "^5.2.0",
    "vue-tsc": "^2.0.6",
    "@primevue/themes": "^4.0.0-rc.2"
  }
}
EOF

# --- Create tsconfig.json ---
echo "Creating $ADMIN_DIR/tsconfig.json..."
cat <<EOF > $ADMIN_DIR/tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@cashflow/types/*": ["$TYPES_PATH_ALIAS"]
    },
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue", "vite.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# --- Create tsconfig.node.json ---
echo "Creating $ADMIN_DIR/tsconfig.node.json..."
cat <<EOF > $ADMIN_DIR/tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts", "tailwind.config.js", "postcss.config.js"]
}
EOF

# --- Create vite.config.ts ---
echo "Creating $ADMIN_DIR/vite.config.ts..."
cat <<EOF > $ADMIN_DIR/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@cashflow/types': path.resolve(__dirname, '$TYPES_PATH_ALIAS'.replace('/*', '')),
    },
  },
  server: {
    port: 3001, // Feel free to change this port
    fs: {
      allow: ['../..'],
    },
  },
})
EOF

# --- Create tailwind.config.js ---
echo "Creating $ADMIN_DIR/tailwind.config.js..."
cat <<EOF > $ADMIN_DIR/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {}, // You can extend Tailwind theme here
  },
  plugins: [],
}
EOF

# --- Create postcss.config.js ---
echo "Creating $ADMIN_DIR/postcss.config.js..."
cat <<EOF > $ADMIN_DIR/postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# --- Create .eslintrc.cjs ---
echo "Creating $ADMIN_DIR/.eslintrc.cjs..."
cat <<EOF > $ADMIN_DIR/.eslintrc.cjs
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
EOF

# --- Create index.html ---
echo "Creating $ADMIN_DIR/index.html..."
cat <<EOF > $ADMIN_DIR/index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>$PACKAGE_NAME</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
EOF

# --- Create src/main.ts ---
echo "Creating $ADMIN_DIR/src/main.ts..."
cat <<EOF > $ADMIN_DIR/src/main.ts
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import App from './App.vue'
import router from './router'
import MyTheme from './assets/primevue-theme/theme.js';

// Import main.css for Tailwind and global styles
import './assets/main.css'

// Import PrimeVue icons
import 'primeicons/primeicons.css';

const app = createApp(App)

app.use(router)

app.use(PrimeVue, {
  unstyled: true,
  theme: {
    preset: MyTheme,
    options: {
        prefix: 'p', // Default prefix
        darkModeSelector: '.p-dark', // Optional: if you plan to support dark mode
        cssLayer: { // Recommended for PrimeVue 4 with Tailwind
            name: 'primevue',
            order: 'primevue, tailwind-base, tailwind-utilities'
        }
    }
  }
});

app.mount('#app')
EOF

# --- Create src/assets/main.css (Tailwind CSS v4 entry) ---
echo "Creating $ADMIN_DIR/src/assets/main.css..."
cat <<EOF > $ADMIN_DIR/src/assets/main.css
@import 'tailwindcss'; /* Tailwind v4+ specific import */

/* Your global styles can go here */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF

# --- Create src/App.vue ---
echo "Creating $ADMIN_DIR/src/App.vue..."
cat <<EOF > $ADMIN_DIR/src/App.vue
<template>
  <div id="app-admin" class="min-h-screen bg-surface-0 text-surface-900 dark:bg-surface-900 dark:text-surface-0">
    <header class="p-4 bg-primary-500 text-white shadow-md">
      <h1 class="text-2xl font-semibold">Admin Panel ($PACKAGE_NAME)</h1>
    </header>
    <nav class="p-4 bg-surface-100 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
      <router-link to="/" class="mr-4 hover:text-primary-500">Home</router-link>
      </nav>
    <main class="p-4">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// Vue 3 setup syntax
</script>

<style>
/* You can add global admin-specific styles here if not in main.css */
/* For example, to ensure PrimeVue theme colors are applied if cssLayer is not fully effective for body */
body {
  background-color: var(--p-surface-0, #ffffff);
  color: var(--p-text-color, #495057);
}

.p-dark body {
   background-color: var(--p-surface-900, #121212);
   color: var(--p-text-color, #ffffffde);
}
</style>
EOF

# --- Create src/router/index.ts ---
echo "Creating $ADMIN_DIR/src/router/index.ts..."
cat <<EOF > $ADMIN_DIR/src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  // Example of a lazy-loaded route:
  // {
  //   path: '/about',
  //   name: 'about',
  //   component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
  // },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/admin/'), // Adjust base if deploying to a subpath
  routes,
})

export default router
EOF

# --- Create src/views/HomeView.vue ---
echo "Creating $ADMIN_DIR/src/views/HomeView.vue..."
cat <<EOF > $ADMIN_DIR/src/views/HomeView.vue
<template>
  <div class="home p-4 rounded-lg bg-surface-50 dark:bg-surface-800 shadow">
    <h2 class="text-xl font-semibold mb-4 text-primary-600 dark:text-primary-400">Welcome to the Admin Home Page</h2>
    <p class="mb-6 text-surface-700 dark:text-surface-200">
      This is a basic admin page using Vue 3, Vite, Tailwind CSS 4 (Alpha), and PrimeVue with a custom theme.
    </p>

    <div class="p-card p-4">
        <h3 class="text-lg mb-3 font-medium">PrimeVue Button Examples (Unstyled with Theme)</h3>
        <div class="flex flex-wrap gap-2">
            <Button label="Primary Button" />
            <Button label="Secondary Button" severity="secondary" />
            <Button label="Success Button" severity="success" />
            <Button label="Info Button" severity="info" />
            <Button label="Warning Button" severity="warning" />
            <Button label="Help Button" severity="help" />
            <Button label="Danger Button" severity="danger" />
        </div>

        <h3 class="text-lg mt-6 mb-3 font-medium">Input Field</h3>
        <InputText placeholder="Enter text here" class="w-full md:w-1/2" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
// Import other PrimeVue components as needed
</script>

<style scoped>
/* Scoped styles for HomeView if any */
.p-card {
    background: var(--p-surface-card);
    border: 1px solid var(--p-surface-border);
    border-radius: var(--p-border-radius);
    padding: 1.5rem;
}
</style>
EOF

# --- Create src/components/HelloWorld.vue (example component) ---
echo "Creating $ADMIN_DIR/src/components/HelloWorld.vue..."
cat <<EOF > $ADMIN_DIR/src/components/HelloWorld.vue
<template>
  <div class="p-4 bg-surface-100 dark:bg-surface-700 rounded-md shadow">
    <h3 class="text-lg font-medium text-primary-500 dark:text-primary-300">{{ msg }}</h3>
    <p class="text-surface-600 dark:text-surface-300">This is an example component.</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ msg: string }>()
</script>

<style scoped>
/* Scoped styles */
</style>
EOF


# --- Create src/assets/primevue-theme/theme.js ---
echo "Creating $ADMIN_DIR/src/assets/primevue-theme/theme.js..."
cat <<EOF > $ADMIN_DIR/src/assets/primevue-theme/theme.js
// apps/admin/src/assets/primevue-theme/theme.js

// Using colors from your style.css
const primary = {
    50: 'rgb(199, 213, 227)',
    100: 'rgb(154, 180, 206)',
    200: 'rgb(109, 147, 184)',
    300: 'rgb(65, 113, 162)',
    400: 'rgb(20, 80, 140)',
    500: 'rgb(17, 68, 119)', // Main primary color
    600: 'rgb(14, 56, 98)',
    700: 'rgb(11, 44, 77)',
    800: 'rgb(8, 32, 56)',
    900: 'rgb(5, 20, 35)',
    950: 'rgb(5, 20, 34)'
};

const surface = { // For light theme as base
    0: '#ffffff',
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa', // Neutral
    500: '#71717a', // Neutral
    600: '#52525b', // Neutral-Dark
    700: '#3f3f46', // Neutral-Darker
    800: '#27272a', // Neutral-Darkest
    900: '#18181b', // Almost black
    950: '#09090b'  // Blackest
};

export default {
    preset: {
        semantic: {
            primary: primary,
            // You can define other semantic palettes like success, info, warning, danger
            // For now, let's use shades of primary for simplicity or define distinct ones
            success: { // Example: using a green palette if you had one, or derive from primary
                50: 'rgb(236, 253, 245)', // Example green
                100: 'rgb(209, 250, 229)',
                200: 'rgb(167, 243, 208)',
                300: 'rgb(110, 231, 183)',
                400: 'rgb(52, 211, 153)',
                500: 'rgb(16, 185, 129)',
                600: 'rgb(5, 150, 105)',
                700: 'rgb(4, 120, 87)',
                800: 'rgb(6, 95, 70)',
                900: 'rgb(4, 78, 56)',
                950: 'rgb(2, 44, 32)'
            },
            info: { // Example: using a blue/cyan palette
                50: 'rgb(239, 246, 255)', // Softer blue
                // ... up to 950
                500: 'rgb(59, 130, 246)', // A distinct blue for info
                600: 'rgb(37, 99, 235)',
            },
            warning: { // Example: using an orange/amber palette
                50: 'rgb(255, 251, 235)',
                 // ... up to 950
                500: 'rgb(245, 158, 11)', // Amber
                600: 'rgb(217, 119, 6)',
            },
            danger: { // Example: using a red palette
                50: 'rgb(254, 242, 242)',
                 // ... up to 950
                500: 'rgb(239, 68, 68)', // Red
                600: 'rgb(220, 38, 38)',
            },
            surface: surface,
            // Color Scheme specific tokens
            light: {
                surface: surface, // uses the defined surface palette
                text: {
                    primary: '{primary.500}',
                    secondary: '{surface.700}',
                    muted: '{surface.500}',
                    disabled: '{surface.400}',
                    color: '{surface.900}', // Default text color for light scheme
                    placeholder: '{surface.500}',
                    brand: '{primary.500}'
                },
                background: '{surface.0}',
                // ... other light scheme specific mappings
            },
            dark: { // Define a dark scheme
                surface: { // Invert or use darker shades for dark mode surfaces
                    0: '{surface.950}',
                    50: '{surface.900}',
                    100: '{surface.800}',
                    200: '{surface.700}',
                    300: '{surface.600}',
                    400: '{surface.500}',
                    500: '{surface.400}',
                    // ... and so on, or define a completely new dark surface palette
                },
                text: {
                    primary: '{primary.400}', // Lighter primary for dark bg
                    secondary: '{surface.200}',
                    muted: '{surface.400}',
                    disabled: '{surface.500}',
                    color: '{surface.50}', // Default text color for dark scheme (light text)
                    placeholder: '{surface.400}',
                    brand: '{primary.400}'
                },
                background: '{surface.900}',
                // ... other dark scheme specific mappings
            },

            // General semantic tokens (can be overridden by color scheme)
            borderRadius: {
                none: '0',
                xs: '0.125rem', // 2px
                sm: '0.25rem',  // 4px
                DEFAULT: '0.375rem', // 6px (updated from 0.5rem)
                md: '0.5rem',   // 8px
                lg: '0.75rem',  // 12px
                xl: '1rem',     // 16px
                '2xl': '1.5rem',
                '3xl': '2rem',
                full: '9999px'
            },
            // Define other core semantic tokens
            // ...
        },
        // You can also define component-specific theming if needed with PT (Pass Through)
        // For unstyled mode, the semantic palette is the most critical part.
    }
};
EOF

# --- Create dummy favicon.ico in public (optional) ---
echo "Creating dummy $ADMIN_DIR/public/favicon.ico..."
cat <<EOF > $ADMIN_DIR/public/favicon.ico
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><circle cx="1" cy="1" r="1" fill="blue"/></svg>
EOF

# --- Installation ---
echo "Navigating to $ADMIN_DIR to install dependencies..."
cd $ADMIN_DIR || exit

echo "Installing dependencies (using bun, adjust if using yarn or pbun)..."
bun install
# If you prefer yarn: yarn install
# If you prefer pbun: pbun install

cd ../.. # Go back to monorepo root

echo ""
echo "---------------------------------------------------------------------"
echo "Admin package '$PACKAGE_NAME' created successfully in '$ADMIN_DIR'."
echo "Make sure to add it to your root turbo.json tasks if not already covered by wildcards."
echo "Example for root turbo.json:"
echo "  \"tasks\": {"
echo "    \"build\": { \"dependsOn\": [\"^build\"], \"outputs\": [\"dist/**\", \".next/**\"] },"
echo "    \"lint\": {},"
echo "    \"dev\": { \"cache\": false, \"persistent\": true }"
echo "    // ... other tasks"
echo "  }"
echo ""
echo "You can now run the admin app (from monorepo root):"
echo "  turbo dev --filter=$PACKAGE_NAME"
echo "Or using bun/yarn/pbun directly from the monorepo root if scripts are set up:"
echo "  bun run dev --workspace=$PACKAGE_NAME"
echo "  yarn workspace $PACKAGE_NAME dev"
echo "  pbun --filter $PACKAGE_NAME dev"
echo "---------------------------------------------------------------------"

exit 0

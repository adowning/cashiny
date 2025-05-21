<template>
  <div id="app" class="roxdisplay">
    <GlobalLoading v-if="isAppLoading" />

    <div v-else>
      <!-- <div class="aboslute top-0 left-0">
        <UserBlock class="relative" />
      </div> -->
      <div v-if="isAuthenticated && currentUser">
        <DesktopSection v-if="!isMobile">
          <RouterView />
        </DesktopSection>
        <MobileSection v-if="isMobile">
          <GlobalLoading v-if="globalStore.isLoading"></GlobalLoading>
          <RouterView v-else />
        </MobileSection>
      </div>

      <div v-else>
        <DesktopSection v-if="!isMobile">
          <LoginView />
        </DesktopSection>
        <MobileSection v-if="isMobile">
          <GlobalLoading v-if="globalStore.isLoading"></GlobalLoading>
          <LoginView v-else />
        </MobileSection>
      </div>

      <!-- <div v-if="authError" class="error-message">
        <p>Authentication Error: {{ authError.message }}</p>
      </div>
      <div v-if="userStore.profileUpdate.error" class="error-message">
        <p>User Data Error: {{ userStore.profileUpdate.error }}</p>
      </div> -->
    </div>
  </div>

  <OverlayLayer v-if="depositStore.shopOpen" :model-value="depositStore.shopOpen">
    <ShopView v-if="depositStore.shopOpen" />
  </OverlayLayer>
</template>

<script setup lang="ts">
  import { computed, onMounted, watch } from 'vue'

  import { setupGlobalAnimations } from '@/utils/setupAnimations'
  // Import necessary Vue 3 APIs
  import { storeToRefs } from 'pinia'
  // NOTE: Ensure these component paths are correct for your project or that they are auto-imported.
  import { loadingFadeOut } from 'virtual:app-loading'
  // Import storeToRefs
  import { useRouter } from 'vue-router'

  import { useDisplay } from './composables/useDisplay'
  import { useAuthStore } from './stores/auth'
  import { useDepositStore } from './stores/deposit'
  import { useGameStore } from './stores/game'
  // Import useRouter
  import { useGlobalStore } from './stores/global'
  import { useSocketStore } from './stores/socket'
  import { useUserStore } from './stores/user'
  import { useVipStore } from './stores/vip'
  import LoginView from './views/LoginView.vue'

  // --- Stores ---
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const socketStore = useSocketStore()
  const globalStore = useGlobalStore()
  const depositStore = useDepositStore()
  const { isMobile } = useDisplay()
  // const { status, connect, send, close, onMessage, data } = useAppWebSocket();
  const { status, connect, onMessage } = useAppWebSocket()

  // --- State & Getters from Stores (using storeToRefs for reactivity) ---
  const {
    isAuthenticated,
    currentUser,
    initialAuthCheckComplete,
    error: authError, // Renamed for clarity if used directly in template logic for isAppLoading
  } = storeToRefs(authStore)

  // const {
  //   userError, // Renamed for clarity
  // } = storeToRefs(userStore);

  // isLoading from globalStore is used for secondary loading indicators, not primary app load.
  // const { isLoading: globalIsLoading } = storeToRefs(globalStore); // Already available via globalStore.isLoading

  // --- Computed property for primary application loading state ---
  const isAppLoading = computed(() => {
    // If the initial authentication check hasn't completed, app is loading.
    if (!initialAuthCheckComplete.value) {
      return true
    }
    // If auth check is complete, and user is authenticated, but currentUser data is not yet loaded,
    // and there are no errors that would halt the process (e.g. auth error, user fetch error),
    // then the app is still effectively loading critical user data.
    console.log(isAuthenticated.value)
    console.log(currentUser)
    if (isAuthenticated.value && !currentUser) {
      return true
    }
    // Otherwise, critical loading is complete.
    return false
  })

  setupGlobalAnimations()
  // --- Initial App Bootstrap ---
  let unsubscribe: (() => void) | undefined

  onMounted(async () => {
    console.log('App mounted, calling initializeAuth...')
    // Trigger the initial authentication check and setup
    socketStore.startWatchToSubscribe()
    await authStore.initializeAuth()
    // Hide the initial loading screen provided by vite-plugin-vue-startup-loading
    loadingFadeOut()

    // Set up WebSocket message listener and store the unsubscribe function
    const unsubscribeFn = onMessage((message: WsMessage) => {
      console.log('Received message in component:', message)
      // Handle the message based on its type and payload
    })
    unsubscribe = typeof unsubscribeFn === 'function' ? unsubscribeFn : undefined
  })

  onUnmounted(() => {
    if (typeof unsubscribe === 'function') {
      unsubscribe() // Clean up the message listener
    }
    // close(); // Optionally close the WebSocket when the main app unmounts,
    // though createGlobalState with autoClose:true in useWebSocket
    // should handle WebSocket resource cleanup on app termination/reload.
  })
  // --- Watch for authentication state changes for side effects like navigation ---
  const router = useRouter() // Initialize router instance
  watch(status, (websocketStatus) => {
    console.log('App.vue reacting to websocketStatus change:', websocketStatus)
    if (websocketStatus === 'OPEN') {
      // WebSocket connected
      // Perform any necessary actions when the WebSocket connection is established
    } else if (websocketStatus === 'CLOSED') {
      // WebSocket disconnected
      // Perform any necessary actions when the WebSocket connection is lost
    }
  })
  watch(
    isAuthenticated,
    (isNowAuthenticated) => {
      console.log('App.vue reacting to isAuthenticated change:', isNowAuthenticated)
      if (isNowAuthenticated) {
        // User just became authenticated
        // Redirect to home if they are currently on login page
        // This handles cases where LoginView might be explicitly routed to.
        if (router.currentRoute.value.name === 'Login') {
          // Check by route name
          router.push({ name: 'Home' })
        }
      } else {
        // User just became unauthenticated (logged out)
        // Redirect to login page if they are currently on a protected route
        if (router.currentRoute.value.meta.requiresAuth) {
          router.push({ name: 'Login' })
        }
      }
    },
    { immediate: true } // Run immediately to handle initial state, e.g., if starting on a protected route while not auth'd
  )

  // Fetch initial data that depends on the user being loaded
  watch(
    currentUser,
    (user) => {
      if (user) {
        console.log('User data loaded in App.vue, fetching other initial data...')
        const vipStore = useVipStore()
        const gameStore = useGameStore()
        vipStore.dispatchVipInfo()
        // gameStore.dispatchGameBigWin();
        gameStore.dispatchGameSearch()
        // connect();
        // Potentially other data fetching dependent on the user
      }
    },
    { immediate: true } // Run immediately if currentUser is already populated from store (e.g. on refresh with persisted state)
  )
  onMounted(() => {
    // Optionally connect automatically when the main app component mounts
    // connect();
  })
</script>

<style>
  /* Global styles */
  #app {
    /* styles */
    color: white;
  }

  .error-message {
    position: fixed; /* Example: make errors noticeable */
    bottom: 20px;
    left: 20px;
    background-color: red;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10000;
    /* styles for error messages */
  }
</style>

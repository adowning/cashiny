<template>
  <div id="app" class="roxdisplay">
    <!-- <Transition name="fade-loader"> -->
    <div class="animate__animated animate__fadeIn">
      <GlobalLoading v-if="isAppLoading && isMobile" />
    </div>

    <div v-if="!isAppLoading">
      <!-- Content shown after loading is complete -->
      <div v-if="isAuthenticated && currentUser">
        <DesktopSection v-if="!isMobile">
          <div class="animate__animated animate__fadeIn">
            <GlobalLoading v-if="isAppLoading" />
          </div>

          <RouterView />
        </DesktopSection>
        <MobileSection v-if="isMobile">
          <RouterView />
        </MobileSection>
      </div>
      <!-- Fallback to LoginView if not authenticated or user data not available after initial checks -->
      <div v-else>
        <DesktopSection v-if="!isMobile">
          <LoginView />
        </DesktopSection>
        <MobileSection v-if="isMobile">
          <LoginView />
        </MobileSection>
      </div>
    </div>
  </div>

  <OverlayLayer v-if="depositStore.shopOpen" :model-value="depositStore.shopOpen">
    <ShopView v-if="depositStore.shopOpen" />
  </OverlayLayer>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, watch, nextTick } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useRouter } from 'vue-router'
  import LoginView from '@/views/auth/LoginView.vue' // Explicit import for view

  // Pinia Stores
  import { useAuthStore } from '@/stores/auth.store'
  import { useDepositStore } from '@/stores/deposit.store'
  import { useImageLoadingStore } from '@/stores/imageLoading.store'
  import { useVipStore } from '@/stores/vip.store'
  import { useGameStore } from '@/stores/game.store'

  // Composables
  import { useDisplay } from '@/composables/useDisplay'

  // Optional: Utility function to hide a very early, non-Vue loading screen (e.g., from index.html)
  // import { loadingFadeOut } from '@/utils/initialLoader';

  // --- Initialize Stores ---
  const authStore = useAuthStore()
  const depositStore = useDepositStore()
  const imageLoadingStore = useImageLoadingStore()
  const router = useRouter()

  // --- Composables ---
  const { isMobile } = useDisplay()

  // --- Configuration ---
  const MIN_LOADING_DISPLAY_TIME_MS = 700 // Minimum time the loader should be visible (in milliseconds)

  // --- Reactive State from Stores ---
  const { isAuthenticated, currentUser, initialAuthCheckComplete } = storeToRefs(authStore)
  const { areImagesLoading, initialScanPerformedOnView } = storeToRefs(imageLoadingStore)

  // --- Internal Loading State Management for Minimum Display Time ---
  const underlyingOperationsLoading = computed(() => {
    // Condition 1: Initial authentication check is pending.
    if (!initialAuthCheckComplete.value) return true
    // Condition 2: Authenticated, but currentUser data (from authStore) is pending.
    if (isAuthenticated.value && !currentUser.value) return true
    // Condition 3: The first image scan for the current view hasn't completed yet.
    if (!initialScanPerformedOnView.value) return true
    // Condition 4: Images are actively loading.
    if (areImagesLoading.value) return true

    return false // All clear
  })

  const showLoaderDueToMinTime = ref(false)
  let loadingStartTime: number | null = null
  let minTimeTimeoutId: ReturnType<typeof setTimeout> | null = null

  // --- Final Computed Property for GlobalLoading v-if ---
  const isAppLoading = computed(() => {
    return underlyingOperationsLoading.value || showLoaderDueToMinTime.value
  })

  watch(
    underlyingOperationsLoading,
    (isLoadingNow, wasLoadingBefore) => {
      if (isLoadingNow && !wasLoadingBefore) {
        // Operations just started loading
        loadingStartTime = Date.now()
        showLoaderDueToMinTime.value = false // Reset any pending min time hold
        if (minTimeTimeoutId) {
          clearTimeout(minTimeTimeoutId)
          minTimeTimeoutId = null
        }
        // Loader will show because underlyingOperationsLoading is true
      } else if (!isLoadingNow && wasLoadingBefore) {
        // Operations just finished loading
        if (loadingStartTime) {
          const elapsedTime = Date.now() - loadingStartTime
          if (elapsedTime < MIN_LOADING_DISPLAY_TIME_MS) {
            const remainingTime = MIN_LOADING_DISPLAY_TIME_MS - elapsedTime
            showLoaderDueToMinTime.value = true // Keep loader visible to meet min time
            minTimeTimeoutId = setTimeout(() => {
              showLoaderDueToMinTime.value = false
              minTimeTimeoutId = null
            }, remainingTime)
          } else {
            // Minimum time already met, no need to hold
            showLoaderDueToMinTime.value = false
          }
        }
        loadingStartTime = null // Reset for the next loading cycle
      }
    },
    { immediate: true }
  ) // `immediate: true` ensures this runs on mount to set initial state

  // --- Initial App Bootstrap ---
  onMounted(async () => {
    console.log('App.vue onMounted: Initializing authentication...')
    await authStore.initializeAuth()
    // If you have a static loader in index.html, you might hide it here:
    // loadingFadeOut();
  })

  // --- Watch for route changes to re-trigger image loading check ---
  watch(
    () => router.currentRoute.value,
    async (newRoute, oldRoute) => {
      // Trigger on actual path change or on initial load (where oldRoute might be undefined)
      if (newRoute.path !== oldRoute?.path || oldRoute === undefined) {
        console.log(
          `App.vue Route Watcher: Route changed to ${newRoute.path}. Resetting and checking images.`
        )
        imageLoadingStore.resetImageLoadingState() // This sets initialScanPerformedOnView to false

        await nextTick() // Wait for the DOM of the new route to be updated
        imageLoadingStore.trackImagesInView() // This will scan and set initialScanPerformedOnView to true
      }
    },
    { deep: true, immediate: true } // `immediate: true` ensures this runs on initial load
  )

  // --- Watch for authentication state changes for side effects like navigation ---
  watch(
    isAuthenticated,
    (isNowAuthenticated) => {
      console.log(`App.vue Auth Watcher: isAuthenticated changed to ${isNowAuthenticated}.`)
      if (isNowAuthenticated) {
        // If user becomes authenticated and is on the Login page, redirect to Home
        if (router.currentRoute.value.name === 'Login') {
          router.push({ name: 'Home' })
        }
      } else {
        // If user becomes unauthenticated (and initial auth check is complete)
        // and is on a route that requires auth, redirect to Login.
        if (initialAuthCheckComplete.value && router.currentRoute.value.meta.requiresAuth) {
          router.push({ name: 'Login' })
        }
      }
    }
    // `immediate: true` is generally not needed here if authStore.initializeAuth() and route guards handle initial state.
  )

  // --- Fetch initial data that depends on the user being loaded ---
  watch(
    currentUser,
    (user) => {
      if (user) {
        console.log('App.vue User Watcher: currentUser is available. Fetching user-specific data.')
        const vipStore = useVipStore()
        const gameStore = useGameStore()
        vipStore.dispatchVipInfo()
        gameStore.dispatchGameBigWin()
        gameStore.dispatchGameSearch('')
        // Potentially other data fetching dependent on the user
      }
    },
    { immediate: true } // Run immediately if currentUser is already populated (e.g., from persisted state)
  )

  // Example for `loadingFadeOut` if you were using a static HTML loader:
  // const loadingFadeOut = () => {
  //   const loader = document.getElementById('initial-static-loader');
  //   if (loader) {
  //     loader.style.opacity = '0';
  //     setTimeout(() => loader.remove(), 300); // Fade out then remove
  //   }
  // };
</script>

<style>
  /* Global styles */
  #app {
    color: white; /* Example global style */
    /* Add other global application container styles here, e.g., min-height, display: flex, etc. */
  }

  .error-message {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: red;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10000; /* Ensure it's above other content */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  /* Transition for the Global Loader */
  .fade-loader-enter-active,
  .fade-loader-leave-active {
    transition: opacity 0.3s ease; /* Duration and easing for fade */
  }

  .fade-loader-enter-from,
  .fade-loader-leave-to {
    opacity: 0;
  }

  /* Ensure your layout components like DesktopSection and MobileSection fill the viewport as needed */
  /* Add any necessary global styles for .roxdisplay or other root elements */
</style>

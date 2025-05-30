<template>
  <div class="rtg-game-container w-full h-full">
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
    >
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      <p class="ml-4 text-white text-xl">Loading {{ gameLaunchOptions?.gameId }}...</p>
    </div>
    <iframe
      v-if="iframeUrl"
      :src="iframeUrl"
      ref="gameIframe"
      frameborder="0"
      scrolling="no"
      allowfullscreen
      class="w-full h-full"
      @load="onIframeLoad"
      @error="onIframeError"
      title="Game"
    ></iframe>
    <div
      v-if="loadError"
      class="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white p-4"
    >
      <p class="text-xl text-red-500 mb-4">Failed to load game.</p>
      <p class="text-sm text-gray-400 mb-2">{{ loadErrorMessage }}</p>
      <button
        @click="retryLoadGame"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
      >
        Retry
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, type PropType } from 'vue'
  import { useAuthStore } from '@/stores/auth.store'
  import { useNotificationStore } from '@/stores/notification.store' //

  interface RtgGameLaunchOptions {
    gameId: string // e.g., "777Strike"
    lang?: string
    currency?: string
    mode?: 'real' | 'demo'
    // Add any other parameters that your rtg_loader_template.html expects
    // or that are needed to construct the full preconfig
    rgsApiBase?: string // Base for your proxy: e.g., /api/rtg/platform
    gameCdnBase?: string // If different from default construction
    operator?: string
    provider?: string
    depositUrl?: string
    lobbyUrl?: string
    // ... any other specific params from com.casino.preconfig
  }

  const props = defineProps({
    options: {
      type: Object as PropType<RtgGameLaunchOptions>,
      required: true,
    },
  })

  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()
  const gameIframe = ref<HTMLIFrameElement | null>(null)
  const isLoading = ref<boolean>(true)
  const loadError = ref<boolean>(false)
  const loadErrorMessage = ref<string>('')

  const iframeUrl = computed(() => {
    if (!props.options || !props.options.gameId) {
      loadError.value = true
      loadErrorMessage.value = 'Game ID is missing in options.'
      return null
    }

    const params = new URLSearchParams()
    params.set('gameId', props.options.gameId)
    params.set('userId', authStore.user?.id || 'GUEST_DEMO_USER') // Ensure you have a fallback or handle unauthenticated
    params.set('token', authStore.accessToken || 'GUEST_DEMO_TOKEN')
    params.set('lang', props.options.lang || authStore.user?.language || 'en')
    params.set('currency', props.options.currency || authStore.user?.currency || 'USD')
    params.set('mode', props.options.mode || 'real')

    // Pass through other options to the template
    if (props.options.rgsApiBase) params.set('rgsApiBase', props.options.rgsApiBase)
    if (props.options.gameCdnBase) params.set('gameCdnBase', props.options.gameCdnBase)
    if (props.options.operator) params.set('operator', props.options.operator)
    if (props.options.provider) params.set('provider', props.options.provider)
    if (props.options.depositUrl) params.set('depositUrl', props.options.depositUrl)
    if (props.options.lobbyUrl) params.set('lobbyUrl', props.options.lobbyUrl)
    // Add more params as needed from RtgGameLaunchOptions

    // Construct the URL to your static HTML template in the public folder
    // Make sure 'rtg_loader_template.html' is in your project's 'public' directory.
    return `/rtg_loader_template.html?${params.toString()}`
  })

  const onIframeLoad = () => {
    if (gameIframe.value?.contentWindow && authStore.accessToken) {
      gameIframe.value.contentWindow.postMessage(
        { type: 'SET_AUTH_TOKEN', token: authStore.accessToken, userId: authStore.currentUser?.id },
        '*' // Or better, the specific origin of your rtg_loader_template.html
      )
    }
    isLoading.value = false
    loadError.value = false
    console.log(`RTG Game Iframe loaded for: ${props.options.gameId}`)
    notificationStore.showInfo(`Game "${props.options.gameId}" loaded.`)
  }

  const onIframeError = (event: Event) => {
    isLoading.value = false
    loadError.value = true
    loadErrorMessage.value = `The game frame failed to load. Please check console for details.`
    console.error('Game Iframe load error:', event)
    notificationStore.showError(`Error loading game: ${props.options.gameId}`)
  }

  const retryLoadGame = () => {
    // This will trigger a re-computation of iframeUrl and thus reload the iframe
    // A more robust way might involve adding a cache-buster to the URL or explicitly setting iframe.src again
    loadError.value = false
    isLoading.value = true
    if (gameIframe.value && iframeUrl.value) {
      // Create a new URL object to break reactivity reference if needed, or add cache buster
      gameIframe.value.src = `${iframeUrl.value}&retry=${Date.now()}`
    }
  }

  // Watch for option changes to reload the game if necessary
  watch(
    () => props.options,
    (newOptions, oldOptions) => {
      if (newOptions && oldOptions && newOptions.gameId !== oldOptions.gameId) {
        console.log('Game options changed, reloading game:', newOptions.gameId)
        isLoading.value = true // Will be reset by onIframeLoad or onIframeError
        loadError.value = false
        // iframeUrl computed property will automatically update the src
      }
    },
    { deep: true }
  )

  onMounted(() => {
    if (!iframeUrl.value) {
      // Handle initial error if options are immediately invalid
      isLoading.value = false
    }
    // Setup postMessage listeners for communication with the iframe if needed
    // window.addEventListener('message', handleGameMessage);
  })

  // onUnmounted(() => {
  //   window.removeEventListener('message', handleGameMessage);
  // });

  // const handleGameMessage = (event: MessageEvent) => {
  //   // IMPORTANT: Check event.origin to ensure messages are from your game iframe's expected origin
  //   // if (event.origin !== expected_game_origin) return;
  //   const data = event.data;
  //   if (data && data.type === 'GAME_EVENT_BALANCE_UPDATE') {
  //     authStore.updateBalance(data.payload.balance); // Example
  //   } else if (data === 'CLOSE_GAME_REQUEST') {
  //     // Handle game close request, navigate to lobby
  //   }
  // };
</script>

<style scoped>
  .rtg-game-container {
    position: relative; /* For absolute positioning of overlays */
  }
  .loading-overlay,
  .error-overlay {
    /* Basic styling for overlays */
  }
</style>

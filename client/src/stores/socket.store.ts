import { logToPage } from '@/utils/logger'
import { WebSocketClient } from '@/utils/websocketClient'
import { defineStore } from 'pinia'

import { useAuthStore } from './auth.store'
import { WebSocketStatus } from '@vueuse/core'

export const useSocketStore = defineStore('socket', () => {
  // --- State ---
  // Maybe a state to track connection status if needed
  // const isConnected = ref(false);
  const status = ref<WebSocketStatus>('CLOSED')
  // --- Actions ---
  function connectWebSocket() {
    logToPage('info', 'Attempting to connect WebSocket...')
    const authStore = useAuthStore()
    const token = authStore.accessToken

    if (token) {
      // WebSocketService.getInstance().connect(token); // Pass token if needed for connection/authentication
      const wsInstance = WebSocketClient.getInstance()
      wsInstance.connect() // Assuming token is handled internally or not needed for initial connect
      status.value = wsInstance.wsClient?.status.value as WebSocketStatus
      // isConnected.value = true; // Update state
    } else {
      logToPage('warn', 'Cannot connect WebSocket, no token available.')
    }
  }

  function disconnectWebSocket() {
    logToPage('info', 'Attempting to disconnect WebSocket...')
    WebSocketClient.getInstance().close()
    // isConnected.value = false; // Update state
  }

  // --- Subscriptions ---
  function startWatchToSubscribe() {
    const authStore = useAuthStore()
    watch(
      () => authStore.initialAuthCheckComplete, // Source to watch
      (newIsAuthenticated, oldIsAuthenticated) => {
        console.log(
          `[SocketStore] Auth state changed: ${oldIsAuthenticated} -> ${newIsAuthenticated}`
        )
        if (newIsAuthenticated && authStore.accessToken) {
          connectWebSocket()
        } else {
          disconnectWebSocket()
        }
      },
      { immediate: false } // `immediate: true` would run this on store initialization
      // Set to true if you want to attempt connection immediately if already authenticated
    )
  }

  // authStore.$subscribe((mutation, state) => {
  //   if (mutation.storeId === "auth") {
  //     const isAuthenticated = state.sessionState?.token;

  //     if (isAuthenticated) {
  //       logToPage(
  //         "debug",
  //         "Socket store reacting to authStateChange: Authenticated. Connecting WebSocket..."
  //       );
  //       connectWebSocket();
  //     } else {
  //       logToPage(
  //         "debug",
  //         "Socket store reacting to authStateChange: Unauthenticated. Disconnecting WebSocket..."
  //       );
  //       disconnectWebSocket();
  //     }
  //   }
  // });

  return {
    startWatchToSubscribe,
    status,
    // Expose state if needed
    // isConnected,
    // Expose actions if needed for manual control (less common)
    // connectWebSocket,
    // disconnectWebSocket,
  }
})

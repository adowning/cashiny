import { type Ref, computed, readonly, ref, watch } from 'vue'

// Ensure this path is correct
import { useEventManager } from '@/composables/EventManager'
import { useAnimationController } from '@/composables/useAnimationController'
import { useAuthStore } from '@/stores/auth.store'
// Ensure this path is correct
import { useNotificationStore } from '@/stores/notification.store'
import {
  type UseWebSocketReturn,
  type WebSocketStatus,
  createGlobalState,
  useDocumentVisibility,
  useOnline,
  useWebSocket,
} from '@vueuse/core'
import destr from 'destr'
import { type ZodType, z } from 'zod' // Assuming Zod is used for schema
import type { MessageSchemaType } from '@/../../server/src/sockets/types' // Adjust path if needed for server's MessageSchemaType

// Ensure this path is correct

export interface WsMessage {
  type: string
  payload: any
  meta: any
}

// Fetch the WebSocket URL from environment variables
const VITE_HONO_WEBSOCKET_URL = import.meta.env.VITE_HONO_WEBSOCKET_URL as string

if (!VITE_HONO_WEBSOCKET_URL) {
  console.error(
    'WebSocket: VITE_HONO_WEBSOCKET_URL is not defined in environment variables. WebSocket will not function.'
  )
}

// createGlobalState will ensure that the setup function (the arrow function below)
// is run only once, and its returned values are shared across all calls to useAppWebSocket().
export const useAppWebSocket = createGlobalState(() => {
  const authStore = useAuthStore()
  const animationController = useAnimationController()
  const notificationStore = useNotificationStore()
  const eventManager = useEventManager()

  const online = useOnline()
  const visibility = useDocumentVisibility()
  const attempt = ref(0)
  // Holds the reactive UseWebSocketReturn object from @vueuse/core
  const wsInstanceRef: Ref<UseWebSocketReturn<any> | null> = ref(null)
  const messageQueue = ref<any[]>([])
  // internalStatus reflects the WebSocket connection status
  const internalStatus = ref<WebSocketStatus>('CLOSED')
  const isAttemptingConnection = ref(false) // Tracks if a connection attempt is in progress
  const userClosedConnection = ref(false) // Flag to indicate if the user explicitly closed the connection

  // Expose reactive data and status
  const data = computed(() => wsInstanceRef.value?.data.value) // Last received message
  const status = readonly(internalStatus) // Publicly readable status
  const wsData = data // data from useWebSocket is last received message
  const wsStatus = status // status from useWebSocket
  const flushMessageQueue = () => {
    while (messageQueue.value.length > 0) {
      const message = messageQueue.value.shift()
      if (wsInstanceRef.value && internalStatus.value === 'OPEN') {
        console.log('WebSocket: Sending queued message:', message)
        wsInstanceRef.value.send(JSON.stringify(message))
      } else {
        // If not open, put it back and stop trying for now
        messageQueue.value.unshift(message)
        console.log('WebSocket: Queue flush paused, connection not OPEN.')
        break
      }
    }
  }
  function sendTypedMessage<S extends MessageSchemaType>(
    schema: S,
    payload: S['shape'] extends { payload: infer P }
      ? P extends ZodType
        ? z.infer<P>
        : unknown
      : unknown,
    meta?: S['shape'] extends { meta: infer M }
      ? M extends ZodType
        ? Partial<z.infer<M>>
        : Record<string, never>
      : Record<string, never>
  ): boolean {
    if (wsStatus.value !== 'OPEN') {
      console.warn('WebSocket not open. Cannot send message.')
      notificationStore.showError('Cannot send message: WebSocket is not connected.')
      return false
    }

    try {
      const typeDef = schema.shape.type._def
      // Ensure 'value' exists and is the correct property for literal types
      const messageType =
        'value' in typeDef && typeof typeDef.value === 'string' ? typeDef.value : undefined

      if (!messageType) {
        console.error(
          '[WS Send] Message schema does not have a valid literal string "type" property.'
        )
        notificationStore.showError('Internal Error: Invalid message schema type.')
        return false
      }

      const messageToSend: Record<string, any> = {
        // Use Record<string, any> for more flexible object assembly
        type: messageType,
        meta: {
          timestamp: Date.now(),
          ...(meta || {}), // Ensure meta is an object even if undefined initially
        },
      }

      // Conditionally add payload only if it's not undefined
      if (payload !== undefined) {
        messageToSend.payload = payload
      }

      const validationResult = schema.safeParse(messageToSend)

      if (!validationResult.success) {
        console.error(
          `[WS Send] Failed to validate message of type "${messageType}":`,
          validationResult.error.flatten().fieldErrors
        )
        notificationStore.showError(
          `WS Send Error: Invalid format for ${messageType}. ${validationResult.error.issues.map((i) => i.message).join(', ')}`
        )
        return false
      }

      const messageToSendString = JSON.stringify(validationResult.data)

      // Call the useWebSocket's 'send' function.
      // It expects a string, ArrayBuffer, or Blob for its single-argument version.
      const success = send(messageToSendString) // Directly use the 'send' from useWebSocket

      if (!success) {
        // This usually means the WebSocket isn't in the OPEN state,
        // though we check wsStatus.value above. It could also mean the send queue is full.
        console.warn(
          `[WS Send] send function returned false for message type "${messageType}". WebSocket might not be ready to send.`
        )
        notificationStore.showError('WebSocket busy or not ready to send. Please try again.')
        return false
      }

      // console.log('[WS Send] SENT WS MESSAGE:', validationResult.data);
      return true
    } catch (error) {
      console.error('[WS Send] Error constructing or sending message:', error)
      notificationStore.showError('Failed to send WebSocket message due to an internal error.')
      return false
    }
  }
  const connect = async () => {
    if (!VITE_HONO_WEBSOCKET_URL) {
      notificationStore.addNotification('error', 'WebSocket URL is not configured.')
      return
    }

    if ((wsInstanceRef.value && internalStatus.value === 'OPEN') || isAttemptingConnection.value) {
      console.log(
        'WebSocket: Connection attempt ignored. Already open or an attempt is in progress.'
      )
      return
    }

    const token = authStore.accessToken
    if (!token) {
      console.warn('WebSocket: No access token available. Connection aborted.')
      internalStatus.value = 'CLOSED' // Reflect that we can't connect
      eventManager.emit('wsError', 'Connection failed: Authentication token is missing.')
      return
    }

    isAttemptingConnection.value = true
    userClosedConnection.value = false // Reset user closed flag on new connect attempt
    internalStatus.value = 'CONNECTING'
    eventManager.emit('wsConnecting', true) // Notify UI or other services

    // If there's an old instance, ensure it's closed before creating a new one.
    // VueUse's useWebSocket with autoClose:true should handle this when the ref is replaced,
    // but being explicit can sometimes help, especially if the old one was stuck.
    if (wsInstanceRef.value) {
      wsInstanceRef.value.close()
    }

    const wsURL = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${VITE_HONO_WEBSOCKET_URL}/ws?token=${encodeURIComponent(token)}`
    console.log(`WebSocket: Attempting to connect to ${wsURL}`)
    attempt.value = attempt.value + 1
    // Create a new WebSocket connection instance using @vueuse/core
    const newWs = useWebSocket(wsURL, {
      heartbeat: {
        interval: 10000, // Send a ping every 10 seconds
        pongTimeout: 15000, // Expect a pong within 15 seconds
        message: JSON.stringify({ type: 'PING', meta: {}, payload: {} }),
      },
      autoReconnect: {
        retries: 5, // Number of automatic reconnection attempts
        delay: Math.min(attempt.value * 2000, 30000), // Exponential backoff, max 30s
        onFailed: () => {
          notificationStore.addNotification(
            'error',
            'WebSocket: Failed to connect after multiple retries.'
          )
          eventManager.emit('wsError', 'Connection failed definitively after retries.')
          internalStatus.value = 'CLOSED' // Final status after all retries failed
          isAttemptingConnection.value = false
        },
      },
      immediate: false, // We will call open() explicitly
      autoClose: true, // Automatically close when the composable's scope is disposed (app exits/reloads)
    })
    wsInstanceRef.value = newWs // Assign the new instance

    // --- Watchers for the new WebSocket instance ---

    // Watch the status of the WebSocket connection
    watch(
      newWs.status,
      (newWsStatus) => {
        console.log('WebSocket: Connection status changed to ->', newWsStatus)
        internalStatus.value = newWsStatus // Update our shared status

        if (newWsStatus === 'OPEN') {
          isAttemptingConnection.value = false
          eventManager.emit('wsConnected', true) // Notify that connection is established
          flushMessageQueue() // Send any messages that were queued
        } else if (newWsStatus === 'CLOSED') {
          isAttemptingConnection.value = false
          eventManager.emit('wsConnected', false) // Notify that connection is closed
          // autoReconnect will handle retries unless userClosedConnection is true.
        } else if (newWsStatus === 'CONNECTING') {
          isAttemptingConnection.value = true // Ensure this is set while connecting
        }
      },
      { immediate: true }
    ) // `immediate: true` ensures `internalStatus` is synced initially.

    // Watch for incoming data (messages)
    watch(newWs.data, (messageData) => {
      if (messageData) {
        try {
          const parsedMessage: WsMessage = destr(messageData) // Safely parse JSON
          console.log('WebSocket: Message received <-', parsedMessage)
          animationController.handleWebSocketMessage(parsedMessage)
          eventManager.emit('wsMessage', parsedMessage) // Broadcast the parsed message
        } catch (error) {
          console.error(
            'WebSocket: Error parsing incoming message:',
            error,
            '\nRaw data:',
            messageData
          )
          eventManager.emit('wsError', 'Failed to parse message from server.')
        }
      }
    })

    // Watch for WebSocket errors
    // watch(newWs.error, (errorEvent) => {
    //   console.error('WebSocket: An error occurred ->', errorEvent)
    //   eventManager.emit('wsError', errorEvent?.message || 'An unknown WebSocket error occurred.')
    //   // Note: `autoReconnect` in `useWebSocket` will typically handle reconnection on errors.
    // })

    // Explicitly open the connection if it's currently closed and not a user-initiated close
    if (newWs.status.value === 'CLOSED' && !userClosedConnection.value) {
      console.log('WebSocket: Manually initiating open() on new instance...')
      newWs.open()
    }
  }

  const close = (isUserInitiated = true) => {
    userClosedConnection.value = isUserInitiated // Mark if this was a deliberate close by the user/app
    if (wsInstanceRef.value) {
      console.log(`WebSocket: Closing connection (userInitiated: ${isUserInitiated})`)
      wsInstanceRef.value.close() // This will trigger the status watcher to update `internalStatus` to 'CLOSED'
    } else {
      // If no instance, ensure status reflects closure
      internalStatus.value = 'CLOSED'
    }
    isAttemptingConnection.value = false // Stop any connection attempts
    // eventManager.emit('wsConnected', false); // Watcher for status already does this.
  }

  const send = (
    messagePayload: any,
    p0: { tournamentId: string; topicType: 'updates' | 'leaderboard' }
  ) => {
    if (wsInstanceRef.value && internalStatus.value === 'OPEN') {
      wsInstanceRef.value.send(JSON.stringify(messagePayload))
    } else {
      messageQueue.value.push(messagePayload)
      console.log('WebSocket: Connection not open. Message queued.', messagePayload)
      // If not connecting and not explicitly closed by user, try to connect
      if (internalStatus.value !== 'CONNECTING' && !userClosedConnection.value) {
        console.log('WebSocket: Attempting to connect before sending queued message.')
        connect()
      }
    }
  }

  // Method for components to subscribe to WebSocket messages
  const onMessage = (callback: (message: WsMessage) => void) => {
    const unsubscribe = eventManager.on('wsMessage', callback)
    // It's the responsibility of the component calling `onMessage`
    // to call this unsubscribe function during its `onUnmounted` lifecycle hook.
    return unsubscribe
  }

  // --- Effects for network and visibility changes ---
  watch([online, visibility], ([isOnline, currentVisibility], [wasOnline, wasVisible]) => {
    console.log(`WebSocket: Online: ${isOnline}, Visible: ${currentVisibility}`)
    if (isOnline && currentVisibility === 'visible') {
      // If we came online, or became visible, and connection is closed & not user-initiated
      if (
        !userClosedConnection.value &&
        internalStatus.value === 'CLOSED' &&
        !isAttemptingConnection.value
      ) {
        console.log('WebSocket: System became online/visible. Attempting to reconnect.')
        connect()
      }
    } else if (!isOnline) {
      console.log('WebSocket: System is offline.')
      // If the connection is currently open, useWebSocket's autoReconnect should handle
      // the 'close' event triggered by network loss and attempt reconnections.
      // No need to explicitly call `close(false)` here as it might interfere with autoReconnect logic.
      // If wsInstanceRef.value exists and its status is OPEN, the browser/OS will eventually fire a close event on the socket.
    }
  })

  // The `useAppWebSocket` composable, when called, returns this object.
  // `createGlobalState` ensures this setup runs only once.
  return {
    connect,
    send,
    onMessage, // Method to subscribe to messages
    status: readonly(wsStatus), // Expose status (OPEN, CONNECTING, CLOSED)
    data: readonly(wsData), // Expose last received message data
    open, // Expose open function
    close, // Expose close function
    sendTypedMessage, // <<< EXPOSE THE VALIDATED SEND FUNCTION
  }
})

// How to use in your application (e.g., in App.vue or a boot file):
//

// In a setup function or <script setup>:
// const { status, connect, send, close, onMessage, data } = useAppWebSocket();

// onMounted(() => {
//   // Optionally connect automatically when the main app component mounts

//   const unsubscribe = onMessage((message) => {
//     console.log('Received message in component:', message);
//     // Handle the message based on its type and payload
//   });

//   onUnmounted(() => {
//     unsubscribe(); // Clean up the message listener
//     // close(); // Optionally close the WebSocket when the main app unmounts,
//     // though createGlobalState with autoClose:true in useWebSocket
//     // should handle WebSocket resource cleanup on app termination/reload.
//   });
// });
//
// // To send a message:
// // send({ type: 'MY_MESSAGE_TYPE', payload: { content: 'Hello Vue!' } });

// import { onMounted, onUnmounted, readonly, ref } from 'vue';

// import { WebSocketClient, WsMessage } from '@/utils/websocketClient';
// import { watchTriggerable } from '@vueuse/core';

// import { useEventManager } from './EventManager';

// export function useWebSocketService() {
//   const webSocketClient = WebSocketClient.getInstance();
//   const eventManager = useEventManager();
//   const internalStatus = ref<'connecting' | 'open' | 'closed'>('closed');
//   const status = readonly(internalStatus);

//   const connect = () => {
//     webSocketClient.connect();
//     internalStatus.value = 'connecting';
//   };

//   const send = (data: any) => {
//     webSocketClient.send(data);
//   };

//   const close = () => {
//     webSocketClient.close();
//     internalStatus.value = 'closed';
//   };

//   const onMessage = (callback: (message: WsMessage) => void) => {
//     eventManager.on('wsMessage', callback);
//   };

//   watchTriggerable(
//     () => webSocketClient.wsClient?.status.value,
//     (wsStatus) => {
//       if (wsStatus === 'OPEN') {
//         internalStatus.value = 'open';
//       } else if (wsStatus === 'CONNECTING') {
//         internalStatus.value = 'connecting';
//       } else {
//         internalStatus.value = 'closed';
//       }
//     },
//   );

//   onMounted(() => {
//     // You might want to connect automatically when the component is mounted
//     // connect();
//   });

//   onUnmounted(() => {
//     // Ensure the WebSocket connection is closed when the component is unmounted
//     close();
//     eventManager.removeAllEvent();
//   });

//   return {
//     connect,
//     send,
//     close,
//     status,
//     onMessage,
//   };
// }

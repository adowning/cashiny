// // apps/client/src/composables/useCashflowSocket.ts
// import {
//   ref,
//   shallowRef,
//   onUnmounted,
//   readonly,
//   computed,
// } from "vue";
// import {
//   connectTo,
//   ZilaConnection,
//   WSStatus,
//   type WSMessage,
//   type errorCallbackType,
// } from "@/utils/wsClient"; // Ensure this path is correct
// import { useAuthStore } from "@/stores/auth"; // To get the token

// // Types (as defined before)
// export type ZilaMessagePayload = any[] | any | null;
// export type ZilaComposableMessageCallback = (
//   payload: ZilaMessagePayload
// ) => void;
// export interface ZilaDecodedMessage {
//   /* ... */
// }
// // --- Module-level state for the primary WebSocket connection ---
// // These will hold the state for the "current" active WebSocket connection
// // managed by instances of this composable. This assumes one primary app WebSocket.
// let currentConnectionRef = shallowRef<ZilaConnection | null>(null);
// let currentStatusRef = ref<WSStatus>(WSStatus.CLOSED);
// let currentWsErrorRef = ref<string | null>(null);
// let currentWsUrlRef = ref<string | null>(null); // Store the URL it's connected/connecting to

// // Map to store listeners: Key is identifier, Value is a Set of callbacks
// // These listeners will be re-applied if the connection reconnects with a new URL.
// const globalIdentifierListenersMap = new Map<
//   string,
//   Set<ZilaComposableMessageCallback>
// >();
// let activeComposableInstances = 0; // Tracks instances of this composable

// export function useCashflowSocket() {
//   activeComposableInstances++;

//   const authStore = useAuthStore(); // To access the auth token

//   // --- Internal Event Handlers (called by ZilaConnection's local events) ---
//   const _onZilaStatusChange = (newZilaStatus: WSStatus) => {
//     console.log(
//       `useCashflowSocket: ZilaConnection reported status change -> ${WSStatus[newZilaStatus]} for URL: ${currentWsUrlRef.value}`
//     );
//     currentStatusRef.value = newZilaStatus;
//     if (newZilaStatus === WSStatus.OPEN) {
//       currentWsErrorRef.value = null;
//     } else if (newZilaStatus === WSStatus.ERROR && !currentWsErrorRef.value) {
//       currentWsErrorRef.value = "ZilaConnection entered ERROR state.";
//     }
//   };

//   const _onZilaMessageRecieved = (wsMessage: WSMessage) => {
//     const callbacks = globalIdentifierListenersMap.get(wsMessage.identifier);
//     if (callbacks) {
//       callbacks.forEach((callback) => {
//         try {
//           callback(wsMessage.message);
//         } catch (e) {
//           console.error(
//             `useCashflowSocket: Error in listener for '${wsMessage.identifier}':`,
//             e
//           );
//         }
//       });
//     }
//   };

//   const _onZilaError: errorCallbackType = (reason?: string) => {
//     const errorMessage =
//       reason ||
//       `Unknown error from ZilaConnection for ${currentWsUrlRef.value}`;
//     console.error(
//       `useCashflowSocket: ZilaConnection error callback: ${errorMessage}`
//     );
//     currentWsErrorRef.value = errorMessage;
//     if (currentStatusRef.value !== WSStatus.ERROR) {
//       currentStatusRef.value = WSStatus.ERROR;
//     }
//   };

//   // --- Public API Methods Exposed by the Composable ---
//   async function connectOrReconnect(
//     targetWsUrl: string, // The full URL to connect to, potentially with token
//     options?: {
//       autoReconnect?: boolean;
//       maxReconnectAttempts?: number;
//       reconnectInterval?: number;
//     }
//   ): Promise<void> {
//     // If already connected or connecting to the same target URL, do nothing
//     if (
//       currentConnectionRef.value &&
//       currentWsUrlRef.value === targetWsUrl &&
//       (currentStatusRef.value === WSStatus.OPEN ||
//         currentStatusRef.value === WSStatus.OPENING)
//     ) {
//       console.log(
//         `useCashflowSocket: Already connected or connecting to ${targetWsUrl}.`
//       );
//       return;
//     }

//     // If there's an existing connection (even to a different URL or a failed one), disconnect it first.
//     if (currentConnectionRef.value) {
//       console.log(
//         `useCashflowSocket: Disconnecting existing connection to ${currentWsUrlRef.value} before connecting to ${targetWsUrl}.`
//       );
//       await currentConnectionRef.value.disconnectAsync(); // Ensure it's fully closed
//       currentConnectionRef.value.removeEventListener(
//         "onStatusChange",
//         _onZilaStatusChange
//       );
//       currentConnectionRef.value.removeEventListener(
//         "onMessageRecieved",
//         _onZilaMessageRecieved
//       );
//       currentConnectionRef.value = null; // Clear old instance
//     }

//     console.log(
//       `useCashflowSocket: Initiating connection to ${targetWsUrl}...`
//     );
//     currentWsUrlRef.value = targetWsUrl; // Update the current URL
//     currentStatusRef.value = WSStatus.OPENING;
//     currentWsErrorRef.value = null;

//     try {
//       const newConnection = await connectTo(
//         targetWsUrl,
//         _onZilaError,
//         options?.autoReconnect ?? false,
//         options?.maxReconnectAttempts ?? 5,
//         options?.reconnectInterval ?? 3000
//       );

//       if (newConnection) {
//         currentConnectionRef.value = newConnection;
//         currentConnectionRef.value.addEventListener(
//           "onStatusChange",
//           _onZilaStatusChange
//         );
//         currentConnectionRef.value.addEventListener(
//           "onMessageRecieved",
//           _onZilaMessageRecieved
//         );

//         // Status should be updated by the event listener.
//         //@ts-ignore
//         if (currentStatusRef.value === WSStatus.OPEN) {
//           console.log(
//             `useCashflowSocket: Connection established to ${targetWsUrl}.`
//           );
//         } else {
//           console.warn(
//             `useCashflowSocket: connectTo for ${targetWsUrl} resolved, but reactive status is ${WSStatus[currentStatusRef.value]}. Error: ${currentWsErrorRef.value || "None"}`
//           );
//         }
//       } else {
//         console.error(
//           `useCashflowSocket: connectTo(${targetWsUrl}) returned null/undefined.`
//         );
//         if (currentStatusRef.value === WSStatus.OPENING)
//           currentStatusRef.value = WSStatus.ERROR;
//         if (!currentWsErrorRef.value)
//           currentWsErrorRef.value =
//             "Failed to get ZilaConnection from connectTo.";
//       }
//     } catch (error: any) {
//       console.error(
//         `useCashflowSocket: Exception during connectWebSocket(${targetWsUrl}):`,
//         error
//       );
//       if (!currentWsErrorRef.value) {
//         _onZilaError(
//           `Connection attempt failed for ${targetWsUrl}: ${error.message || String(error)}`
//         );
//       }
//       // Ensure connection ref is null if connectTo promise rejects hard
//       if (currentConnectionRef.value && currentWsUrlRef.value === targetWsUrl) {
//         currentConnectionRef.value.removeEventListener(
//           "onStatusChange",
//           _onZilaStatusChange
//         );
//         currentConnectionRef.value.removeEventListener(
//           "onMessageRecieved",
//           _onZilaMessageRecieved
//         );
//         currentConnectionRef.value = null;
//       }
//     }
//   }

//   async function disconnectWebSocket(): Promise<void> {
//     if (currentConnectionRef.value) {
//       console.log(
//         `useCashflowSocket: Disconnecting from ${currentWsUrlRef.value} (Reactive Status: ${WSStatus[currentStatusRef.value]})...`
//       );
//       const connToDisconnect = currentConnectionRef.value;
//       currentConnectionRef.value = null; // Prevent immediate re-connection attempts using old ref
//       currentWsUrlRef.value = null;

//       await connToDisconnect.disconnectAsync();
//       connToDisconnect.removeEventListener(
//         "onStatusChange",
//         _onZilaStatusChange
//       );
//       connToDisconnect.removeEventListener(
//         "onMessageRecieved",
//         _onZilaMessageRecieved
//       );

//       if (currentStatusRef.value !== WSStatus.CLOSED) {
//         currentStatusRef.value = WSStatus.CLOSED;
//       }
//     } else {
//       if (currentStatusRef.value !== WSStatus.CLOSED)
//         currentStatusRef.value = WSStatus.CLOSED;
//     }
//   }

//   function onMessage(
//     identifier: string,
//     callback: ZilaComposableMessageCallback
//   ): () => void {
//     if (!globalIdentifierListenersMap.has(identifier)) {
//       globalIdentifierListenersMap.set(identifier, new Set());
//     }
//     const callbacksSet = globalIdentifierListenersMap.get(identifier)!;
//     callbacksSet.add(callback);

//     return () => {
//       const currentCallbacksSet = globalIdentifierListenersMap.get(identifier);
//       if (currentCallbacksSet) {
//         currentCallbacksSet.delete(callback);
//         if (currentCallbacksSet.size === 0) {
//           globalIdentifierListenersMap.delete(identifier);
//         }
//       }
//     };
//   }

//   async function postMessage(
//     identifier: string,
//     ...payload: any[]
//   ): Promise<void> {
//     if (
//       currentConnectionRef.value &&
//       currentStatusRef.value === WSStatus.OPEN
//     ) {
//       try {
//         await currentConnectionRef.value.postMessage(identifier, ...payload);
//       } catch (error: any) {
//         _onZilaError(
//           `Failed to post message '${identifier}': ${error.message || String(error)}`
//         );
//         throw error;
//       }
//     } else {
//       const errorMsg = `useCashflowSocket: Cannot post message '${identifier}'. WebSocket not OPEN. Status: ${WSStatus[currentStatusRef.value]}`;
//       console.error(errorMsg);
//       return Promise.reject(new Error(errorMsg));
//     }
//   }

//   async function requestResponse(
//     identifier: string,
//     payload: any[] | any,
//     timeoutMs?: number
//   ): Promise<any[]> {
//     if (
//       currentConnectionRef.value &&
//       currentStatusRef.value === WSStatus.OPEN
//     ) {
//       try {
//         return await currentConnectionRef.value.requestResponse(
//           identifier,
//           payload,
//           timeoutMs
//         );
//       } catch (error: any) {
//         _onZilaError(
//           `Request-response failed for '${identifier}': ${error.message || String(error)}`
//         );
//         throw error;
//       }
//     } else {
//       const errorMsg = `useCashflowSocket: Cannot send request-response '${identifier}'. WebSocket not OPEN. Status: ${WSStatus[currentStatusRef.value]}`;
//       console.error(errorMsg);
//       return Promise.reject(new Error(errorMsg));
//     }
//   }

//   onUnmounted(() => {
//     activeComposableInstances--;
//     if (activeComposableInstances === 0) {
//       console.log(
//         `useCashflowSocket: All instances unmounted. Disconnecting primary WebSocket.`
//       );
//       disconnectWebSocket(); // Disconnect the shared connection
//       // Optionally clear globalIdentifierListenersMap if it should reset when no composables are active
//       // globalIdentifierListenersMap.clear(); // Consider if this is desired
//     }
//   });

//   return {
//     connectionStatus: readonly(currentStatusRef),
//     websocketError: readonly(currentWsErrorRef),
//     isConnected: computed(() => currentStatusRef.value === WSStatus.OPEN),
//     isConnecting: computed(() => currentStatusRef.value === WSStatus.OPENING),
//     isClosed: computed(
//       () =>
//         currentStatusRef.value === WSStatus.CLOSED ||
//         currentStatusRef.value === WSStatus.ERROR
//     ),

//     connectOrReconnect, // New method to handle dynamic URLs
//     disconnectWebSocket,
//     onMessage,
//     postMessage,
//     requestResponse,
//   };
// }

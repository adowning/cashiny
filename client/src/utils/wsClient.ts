// /**
//  * @file ZilaWS - Browser Compatible WebSocket Client
//  * @module ZilaWs
//  * @license MIT
//  * @description A WebSocket client class designed for browser environments,
//  * supporting message identifiers, request-response patterns,
//  * and local event emissions for status and messages.
//  */
// import { v4 as randomUUID } from "uuid"; // For generating unique callback IDs

// /**
//  * Standard and custom WebSocket close codes.
//  */
// export enum CloseCodes {
//   NORMAL = 1000,
//   GOING_AWAY = 1001, // e.g., browser tab closing
//   PROTOCOL_ERROR = 1002,
//   UNSUPPORTED_DATA = 1003,
//   // NO_STATUS_RECVD = 1005, // Reserved
//   // ABNORMAL_CLOSURE = 1006, // Reserved
//   INVALID_FRAME_PAYLOAD_DATA = 1007,
//   POLICY_VIOLATION = 1008,
//   MESSAGE_TOO_BIG = 1009,
//   MISSING_EXTENSION = 1010,
//   INTERNAL_SERVER_ERROR = 1011,
//   SERVICE_RESTART = 1012, // Or server restart
//   TRY_AGAIN_LATER = 1013,
//   // BAD_GATEWAY = 1014, // Used by gateways/proxies
//   TLS_HANDSHAKE_FAILED = 1015, // Cannot be sent by client JS

//   // Custom application codes (4000-4999 range is available for applications)
//   KICKED = 4001,
//   BANNED = 4002,
//   BAD_MESSAGE_FORMAT = 4003, // e.g. malformed JSON
//   UNAUTHORIZED = 4004, // Token invalid or missing
//   FORBIDDEN = 4005, // Token valid, but user not permitted for action
//   RATE_LIMIT_EXCEEDED = 4029,
// }

// /**
//  * Callback type for handling errors reported by ZilaConnection.
//  * @param reason Optional string describing the error.
//  */
// export type errorCallbackType = (reason?: string) => void;

// /**
//  * Callback type for handling messages received for a specific identifier.
//  * The arguments are the payload of the message.
//  */
// export type ZilaWSCallback = (...args: any[]) => any;

// /**
//  * Represents the connection status of the WebSocket.
//  */
// export enum WSStatus {
//   OPENING, // The connection is in the process of being established.
//   OPEN, // The connection is established and communication is possible.
//   CLOSED, // The connection has been closed.
//   ERROR, // An error occurred, which might also lead to a CLOSED state.
// }

// /**
//  * Structure for messages exchanged between client and server.
//  */
// export interface WSMessage {
//   identifier: string; // Event name or message type identifier.
//   message: any[] | any | null; // The actual payload of the message.
//   callbackId: string | null; // Unique ID for request-response, null for fire-and-forget.
// }

// /**
//  * Defines local events that a ZilaConnection instance can emit.
//  * These are for the instance's own lifecycle and message processing,
//  * not for server-sent message identifiers.
//  */
// interface ICallableLocalEvents {
//   /** Emitted when the WebSocket connection status changes. */
//   onStatusChange: (newStatus: WSStatus) => void;
//   /** Emitted after a server message is successfully parsed into a WSMessage. */
//   onMessageRecieved: (parsedMessage: WSMessage) => void;
//   /** Emitted when any raw data is received from the WebSocket before parsing. */
//   onRawDataRecieved: (data: string | ArrayBuffer | Blob) => void;
// }

// /**
//  * ZilaConnection provides a structured way to interact with a WebSocket server
//  * that uses identified messages and supports request-response patterns.
//  */
// export class ZilaConnection {
//   private nativeSocket!: WebSocket; // Native browser WebSocket, definitely assigned in _initSocket
//   private readonly url: string;
//   private currentStatus: WSStatus = WSStatus.CLOSED;
//   private registeredErrorCallback?: errorCallbackType;

//   // Listeners for server-sent messages, keyed by identifier
//   private serverMessageListeners: Map<string, Set<ZilaWSCallback>> = new Map();
//   private serverMessageOnceListeners: Map<string, Set<ZilaWSCallback>> =
//     new Map();

//   // Listeners for local ZilaConnection events (onStatusChange, etc.)
//   private localEventListeners: Map<
//     keyof ICallableLocalEvents | string,
//     Set<(...args: any[]) => any>
//   > = new Map();

//   // For request-response pattern
//   private responseCallbackMap: Map<
//     string,
//     { resolve: (args: any[]) => void; reject: (reason?: any) => void }
//   > = new Map();

//   // Reconnection properties
//   private currentReconnectAttempts: number = 0;
//   public autoReconnectEnabled: boolean = false;
//   public maxReconnectAttempts: number = 1;
//   public reconnectIntervalMs: number = 3000; // 3 seconds

//   constructor(wsUrl: string, errorCallback?: errorCallbackType) {
//     this.url = wsUrl;
//     if (errorCallback) {
//       this.registeredErrorCallback = errorCallback;
//     }
//   }

//   private _updateAndEmitStatus(newStatus: WSStatus): void {
//     if (this.currentStatus === newStatus) return;
//     this.currentStatus = newStatus;
//     this._emitLocalEvent("onStatusChange", newStatus);
//   }

//   private _emitLocalEvent(
//     eventName: keyof ICallableLocalEvents | string,
//     ...args: any[]
//   ): void {
//     const listeners = this.localEventListeners.get(eventName);
//     if (listeners) {
//       listeners.forEach((callback) => {
//         try {
//           callback(...args);
//         } catch (e) {
//           console.error(
//             `ZilaConnection (${this.url}): Error in local event listener for '${eventName}':`,
//             e
//           );
//         }
//       });
//     }
//   }

//   private _initializeWebSocket(): void {
//     if (typeof WebSocket === "undefined") {
//       const errMsg =
//         "ZilaConnection: WebSocket API not available in this environment.";
//       console.error(errMsg);
//       this.registeredErrorCallback?.(errMsg);
//       this._updateAndEmitStatus(WSStatus.ERROR);
//       return;
//     }

//     if (
//       this.nativeSocket &&
//       (this.currentStatus === WSStatus.OPEN ||
//         this.currentStatus === WSStatus.OPENING)
//     ) {
//       // console.log(`ZilaConnection (${this.url}): Already connected or connecting.`);
//       return;
//     }

//     this._updateAndEmitStatus(WSStatus.OPENING);
//     this.nativeSocket = new WebSocket(this.url);

//     this.nativeSocket.onopen = () => {
//       this._updateAndEmitStatus(WSStatus.OPEN);
//       this.currentReconnectAttempts = 0; // Reset on successful connection
//       // console.log(`ZilaConnection (${this.url}): WebSocket connection established.`);
//     };

//     this.nativeSocket.onmessage = (event: MessageEvent) => {
//       this._emitLocalEvent("onRawDataRecieved", event.data);

//       if (typeof event.data === "string") {
//         try {
//           const parsedMessage: WSMessage = JSON.parse(event.data);
//           this._emitLocalEvent("onMessageRecieved", parsedMessage); // Emit full parsed message

//           // Handle request-response
//           if (
//             parsedMessage.callbackId &&
//             this.responseCallbackMap.has(parsedMessage.callbackId)
//           ) {
//             const { resolve } = this.responseCallbackMap.get(
//               parsedMessage.callbackId
//             )!;
//             resolve(
//               Array.isArray(parsedMessage.message)
//                 ? parsedMessage.message
//                 : [parsedMessage.message]
//             );
//             this.responseCallbackMap.delete(parsedMessage.callbackId);
//             return; // Message handled as a response
//           }

//           // Handle regular listeners and once-listeners
//           const messageArgs = Array.isArray(parsedMessage.message)
//             ? parsedMessage.message
//             : [parsedMessage.message];

//           const onceCbs = this.serverMessageOnceListeners.get(
//             parsedMessage.identifier
//           );
//           if (onceCbs) {
//             onceCbs.forEach((cb) => cb(...messageArgs));
//             this.serverMessageOnceListeners.delete(parsedMessage.identifier); // Clear after firing
//           }

//           const listeners = this.serverMessageListeners.get(
//             parsedMessage.identifier
//           );
//           if (listeners) {
//             listeners.forEach((cb) => cb(...messageArgs));
//           }
//         } catch (e) {
//           console.error(
//             `ZilaConnection (${this.url}): Error parsing message or in message handler:`,
//             e,
//             "Raw data:",
//             event.data
//           );
//           this.registeredErrorCallback?.(
//             "Error parsing incoming JSON message."
//           );
//         }
//       } else {
//         console.warn(
//           `ZilaConnection (${this.url}): Received non-string message (Blob/ArrayBuffer). Raw data handling not fully implemented for general listeners.`,
//           event.data
//         );
//         // If you need to support binary data for general listeners, you'd add logic here.
//       }
//     };

//     this.nativeSocket.onerror = (event: Event) => {
//       console.error(
//         `ZilaConnection (${this.url}): WebSocket error observed. Event:`,
//         event
//       );
//       this._updateAndEmitStatus(WSStatus.ERROR);
//       // Browser's 'error' event is not very descriptive. The 'close' event often provides more info.
//       this.registeredErrorCallback?.(
//         "WebSocket error occurred. Check close event for details."
//       );
//     };

//     this.nativeSocket.onclose = (event: CloseEvent) => {
//       console.log(
//         `ZilaConnection (${this.url}): WebSocket closed. Code: ${event.code}, Reason: '${event.reason}', WasClean: ${event.wasClean}`
//       );

//       // Reject pending request-response promises
//       this.responseCallbackMap.forEach(({ reject }) =>
//         reject(
//           new Error(
//             `WebSocket closed while awaiting response. Code: ${event.code}`
//           )
//         )
//       );
//       this.responseCallbackMap.clear();

//       if (
//         event.code === CloseCodes.NORMAL ||
//         (event.code === CloseCodes.GOING_AWAY && event.wasClean)
//       ) {
//         this._updateAndEmitStatus(WSStatus.CLOSED);
//       } else {
//         // Treat other closes (especially if not clean) as errors.
//         this._updateAndEmitStatus(WSStatus.ERROR);
//         this.registeredErrorCallback?.(
//           event.reason || `WebSocket closed abnormally (Code: ${event.code})`
//         );
//       }

//       if (
//         this.autoReconnectEnabled &&
//         this.currentReconnectAttempts < this.maxReconnectAttempts &&
//         event.code !== CloseCodes.KICKED && // Don't reconnect if kicked/banned
//         event.code !== CloseCodes.BANNED &&
//         event.code !== CloseCodes.UNAUTHORIZED && // Don't reconnect if token issue
//         event.code !== CloseCodes.NORMAL // Don't reconnect on explicit normal close by client
//       ) {
//         this.currentReconnectAttempts++;
//         console.log(
//           `ZilaConnection (${this.url}): Attempting reconnect ${this.currentReconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectIntervalMs / 1000}s...`
//         );
//         setTimeout(() => this._initializeWebSocket(), this.reconnectIntervalMs);
//       } else if (
//         this.autoReconnectEnabled &&
//         this.currentStatus !== WSStatus.CLOSED
//       ) {
//         // If autoReconnect was on but we stopped trying
//         console.warn(
//           `ZilaConnection (${this.url}): Auto-reconnect disabled or max attempts reached. Final state: ${WSStatus[this.currentStatus]}`
//         );
//         if (this.currentStatus !== WSStatus.ERROR)
//           this._updateAndEmitStatus(WSStatus.ERROR); // Mark as error if not already closed normally
//         if (this.currentReconnectAttempts >= this.maxReconnectAttempts)
//           this.registeredErrorCallback?.("Max reconnect attempts reached.");
//       }
//     };
//   }

//   /**
//    * Initiates the WebSocket connection.
//    * Call this after instantiating ZilaConnection.
//    */
//   public connect(): void {
//     this._initializeWebSocket();
//   }

//   /** Returns the current status of the WebSocket connection. */
//   public getStatus(): WSStatus {
//     return this.currentStatus;
//   }

//   /**
//    * Registers a callback to listen for messages with a specific identifier from the server.
//    * @param identifier The message identifier.
//    * @param callback The function to call with the message payload.
//    */
//   public listen(identifier: string, callback: ZilaWSCallback): void {
//     if (!this.serverMessageListeners.has(identifier)) {
//       this.serverMessageListeners.set(identifier, new Set());
//     }
//     this.serverMessageListeners.get(identifier)!.add(callback);
//   }

//   /**
//    * Registers a callback to listen for only the next message with a specific identifier.
//    * @param identifier The message identifier.
//    * @param callback The function to call with the message payload.
//    */
//   public once(identifier: string, callback: ZilaWSCallback): void {
//     if (!this.serverMessageOnceListeners.has(identifier)) {
//       this.serverMessageOnceListeners.set(identifier, new Set());
//     }
//     this.serverMessageOnceListeners.get(identifier)!.add(callback);
//   }

//   /**
//    * Removes a message listener.
//    * If callback is not provided, all listeners for the identifier are removed.
//    */
//   public removeListener(identifier: string, callback?: ZilaWSCallback): void {
//     if (callback) {
//       this.serverMessageListeners.get(identifier)?.delete(callback);
//       this.serverMessageOnceListeners.get(identifier)?.delete(callback);
//     } else {
//       this.serverMessageListeners.delete(identifier);
//       this.serverMessageOnceListeners.delete(identifier);
//     }
//   }

//   /**
//    * Sends a fire-and-forget message to the server.
//    * @param identifier The message identifier.
//    * @param payload The data to send (can be a single value or spread as arguments).
//    */
//   public async postMessage(
//     identifier: string,
//     ...payload: any[]
//   ): Promise<void> {
//     if (this.currentStatus !== WSStatus.OPEN || !this.nativeSocket) {
//       const errorMsg = `ZilaConnection (${this.url}): WebSocket not open (Status: ${WSStatus[this.currentStatus]}). Cannot post message '${identifier}'.`;
//       console.error(errorMsg);
//       return Promise.reject(new Error(errorMsg));
//     }

//     const wsMessage: WSMessage = {
//       identifier: identifier,
//       message:
//         payload.length === 1 && !Array.isArray(payload[0])
//           ? payload[0]
//           : payload, // Handle single non-array payload correctly
//       callbackId: null,
//     };

//     try {
//       this.nativeSocket.send(JSON.stringify(wsMessage));
//     } catch (error: any) {
//       const errorMsg = `ZilaConnection (${this.url}): Failed to send message '${identifier}': ${error.message || error}`;
//       console.error(errorMsg);
//       this.registeredErrorCallback?.(errorMsg);
//       this._updateAndEmitStatus(WSStatus.ERROR); // Sending error often means connection issue
//       return Promise.reject(new Error(errorMsg));
//     }
//   }

//   /**
//    * Sends a message and expects a response from the server.
//    * @param identifier The message identifier.
//    * @param payload The data to send.
//    * @param timeoutMs Timeout for waiting for a response (default: 10 seconds).
//    * @returns A Promise that resolves with the server's response payload (as an array of arguments).
//    */
//   public async requestResponse(
//     identifier: string,
//     payload: any[] | any,
//     timeoutMs: number = 10000
//   ): Promise<any[]> {
//     if (this.currentStatus !== WSStatus.OPEN || !this.nativeSocket) {
//       return Promise.reject(
//         new Error(
//           `ZilaConnection (${this.url}): WebSocket not open (Status: ${WSStatus[this.currentStatus]})`
//         )
//       );
//     }
//     const callbackId = randomUUID();
//     const wsMessage: WSMessage = {
//       identifier,
//       message: payload,
//       callbackId,
//     };

//     return new Promise((resolve, reject) => {
//       const timeout = setTimeout(() => {
//         this.responseCallbackMap.delete(callbackId);
//         reject(
//           new Error(
//             `ZilaConnection (${this.url}): Timeout waiting for response to '${identifier}' (callbackId: ${callbackId})`
//           )
//         );
//       }, timeoutMs);

//       this.responseCallbackMap.set(callbackId, {
//         resolve: (args: any[]) => {
//           clearTimeout(timeout);
//           resolve(args);
//         },
//         reject: (reason?: any) => {
//           clearTimeout(timeout);
//           reject(reason);
//         },
//       });

//       try {
//         this.nativeSocket.send(JSON.stringify(wsMessage));
//       } catch (error: any) {
//         clearTimeout(timeout);
//         this.responseCallbackMap.delete(callbackId);
//         const errorMsg = `ZilaConnection (${this.url}): Failed to send request-response message '${identifier}': ${error.message || error}`;
//         console.error(errorMsg);
//         this.registeredErrorCallback?.(errorMsg);
//         this._updateAndEmitStatus(WSStatus.ERROR);
//         reject(new Error(errorMsg));
//       }
//     });
//   }

//   // --- Local Event Emitter Methods (for onStatusChange, onMessageRecieved etc.) ---
//   public addEventListener(
//     eventName: keyof ICallableLocalEvents | string,
//     callback: (...args: any[]) => any
//   ): void {
//     if (!this.localEventListeners.has(eventName)) {
//       this.localEventListeners.set(eventName, new Set());
//     }
//     this.localEventListeners.get(eventName)!.add(callback);
//   }

//   public onceEventListener(
//     eventName: keyof ICallableLocalEvents | string,
//     callback: (...args: any[]) => any
//   ): void {
//     const onceWrapper = (...args: any[]) => {
//       callback(...args);
//       this.removeEventListener(eventName, onceWrapper);
//     };
//     this.addEventListener(eventName, onceWrapper);
//   }

//   public removeEventListener(
//     eventName: keyof ICallableLocalEvents | string,
//     callback?: (...args: any[]) => any
//   ): void {
//     if (callback) {
//       this.localEventListeners.get(eventName)?.delete(callback);
//     } else {
//       this.localEventListeners.delete(eventName);
//     }
//   }

//   /**
//    * Sets or updates the global error handler for this connection instance.
//    */
//   public async setErrorHandler(callback: errorCallbackType): Promise<void> {
//     this.registeredErrorCallback = callback;
//   }

//   /**
//    * Closes the WebSocket connection intentionally.
//    * Auto-reconnect will be disabled.
//    */
//   public disconnect(
//     code: number = CloseCodes.NORMAL,
//     reason: string = "Client initiated disconnect"
//   ): void {
//     this.autoReconnectEnabled = false; // Prevent reconnecting on manual disconnect
//     if (this.nativeSocket) {
//       // Check if OPEN or OPENING before trying to close to avoid errors on already closing/closed sockets
//       if (
//         this.nativeSocket.readyState === WebSocket.OPEN ||
//         this.nativeSocket.readyState === WebSocket.CONNECTING
//       ) {
//         this.nativeSocket.close(code, reason);
//       } else {
//         // If already closing or closed, ensure our reactive status reflects it.
//         if (this.currentStatus !== WSStatus.CLOSED)
//           this._updateAndEmitStatus(WSStatus.CLOSED);
//       }
//     } else {
//       // No socket instance, ensure status is CLOSED
//       if (this.currentStatus !== WSStatus.CLOSED)
//         this._updateAndEmitStatus(WSStatus.CLOSED);
//     }
//   }

//   /**
//    * Asynchronously closes the WebSocket connection and resolves when closed.
//    * Auto-reconnect will be disabled.
//    */
//   public disconnectAsync(
//     code: number = CloseCodes.NORMAL,
//     reason: string = "Client initiated disconnect (async)"
//   ): Promise<void> {
//     this.autoReconnectEnabled = false;
//     return new Promise((resolve) => {
//       if (!this.nativeSocket || this.currentStatus === WSStatus.CLOSED) {
//         if (this.currentStatus !== WSStatus.CLOSED)
//           this._updateAndEmitStatus(WSStatus.CLOSED);
//         resolve();
//         return;
//       }

//       if (
//         this.nativeSocket.readyState !== WebSocket.OPEN &&
//         this.nativeSocket.readyState !== WebSocket.CONNECTING
//       ) {
//         // Socket is already closing or closed
//         if (this.currentStatus !== WSStatus.OPENING)
//           this._updateAndEmitStatus(WSStatus.CLOSED);
//         resolve();
//         return;
//       }

//       this.onceEventListener("onStatusChange", (statusVal) => {
//         if (statusVal === WSStatus.CLOSED) {
//           resolve();
//         }
//       });
//       this.nativeSocket.close(code, reason);
//     });
//   }
// }

// /**
//  * Factory function to create and initiate a ZilaConnection for the browser.
//  * @param wsUrl The URL for the WebSocket server.
//  * @param errorCallback Optional callback for connection errors.
//  * @param autoReconnect Enables/disables auto-reconnection (default: false).
//  * @param maxReconnectAttempts Maximum attempts for auto-reconnection (default: 5).
//  * @param reconnectIntervalMs Interval in milliseconds between reconnect attempts (default: 3000).
//  * @returns A Promise that resolves with the ZilaConnection instance once the *initial* connection attempt is OPEN,
//  * or rejects if the *initial* connection attempt fails definitively.
//  */
// export async function connectTo(
//   wsUrl: string,
//   errorCallback?: errorCallbackType,
//   autoReconnect: boolean = false,
//   maxReconnectAttempts: number = 5,
//   reconnectIntervalMs: number = 3000
// ): Promise<ZilaConnection> {
//   return new Promise((resolve, reject) => {
//     if (typeof WebSocket === "undefined") {
//       const errMsg =
//         "ZilaConnection: WebSocket API not available in this browser/environment.";
//       console.error(errMsg);
//       errorCallback?.(errMsg);
//       return reject(new Error(errMsg));
//     }

//     const zilaConnection = new ZilaConnection(wsUrl, errorCallback);
//     zilaConnection.autoReconnectEnabled = autoReconnect;
//     zilaConnection.maxReconnectAttempts = maxReconnectAttempts;
//     zilaConnection.reconnectIntervalMs = reconnectIntervalMs;

//     const tempStatusListener = (newStatus: WSStatus) => {
//       if (newStatus === WSStatus.OPEN) {
//         zilaConnection.removeEventListener(
//           "onStatusChange",
//           tempStatusListener
//         );
//         resolve(zilaConnection);
//       } else if (
//         newStatus === WSStatus.ERROR ||
//         (newStatus === WSStatus.CLOSED &&
//           !zilaConnection.autoReconnectEnabled &&
//           zilaConnection.getStatus() !== WSStatus.OPENING)
//       ) {
//         // If it errors or closes definitively during the *initial* connection attempt
//         zilaConnection.removeEventListener(
//           "onStatusChange",
//           tempStatusListener
//         );
//         const reason =
//           newStatus === WSStatus.ERROR
//             ? zilaConnection.getStatus() === WSStatus.ERROR
//               ? "Connection error during initial connect"
//               : "Unknown connection error"
//             : "Connection closed during initial connect";
//         console.warn(
//           `connectTo (${wsUrl}): Initial connection failed. Status: ${WSStatus[newStatus]}. Reason: ${reason}`
//         );
//         reject(new Error(reason));
//       }
//     };

//     zilaConnection.addEventListener("onStatusChange", tempStatusListener);

//     try {
//       zilaConnection.connect(); // Call the public connect method to start the process
//     } catch (e: any) {
//       // This catch is for immediate synchronous errors from zilaConnection.connect(),
//       // which is unlikely if connect() just calls _initializeWebSocket().
//       zilaConnection.removeEventListener("onStatusChange", tempStatusListener);
//       const errMsg =
//         e.message ||
//         `Exception during zilaConnection.connect() call for ${wsUrl}`;
//       errorCallback?.(errMsg);
//       reject(new Error(errMsg));
//     }
//   });
// }

// // Export WSMessage again for convenience if it's used by consuming modules.
// export type { WSMessage as ZilaWSMessage };

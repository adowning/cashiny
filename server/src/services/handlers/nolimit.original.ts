// import { Hono } from 'hono' // For Hono app structure
// import { randomUUID } from 'crypto' // For generating unique IDs

// // Bun's WebSocket types (subset used here, Bun provides ServerWebSocket, WebSocket)
// type ServerWebSocket<T = undefined> = WebSocket & {
//   data: T
//   readyState: number
//   send(message: string | BufferSource, compress?: boolean): number
//   publish(topic: string, message: string | BufferSource, compress?: boolean): number
//   close(code?: number, reason?: string): void
// }
// type WebSocketData = string | BufferSource // Bun's message data type

// // --- Configuration ---
// const PROXY_PORT = 8080 // Port for your proxy server to listen on
// const NOLIMIT_FS_URL = 'https://demo.nolimitcity.com/EjsFrontWeb/fs'
// // const NOLIMIT_WS_BASE_URL = 'wss://demo.nolimitcity.com/EjsGameWeb/ws/game?data='; // Base URL if needed

// const packageInfo = {
//   name: 'your-proxy-app', // From your package.json
//   version: '1.0.0', // From your package.json
// }
// const protocol = `${packageInfo.name}@${packageInfo.version}`

// interface InitPayloadContent {
//   type: string
//   bet?: any
// }
// interface InitPayload {
//   id: string // Made mandatory
//   type: string
//   content: InitPayloadContent
//   protocol: string
//   gameClientVersion?: string
//   data?: any // For rememberedData like extPlayerKey
// }

// // --- RC4 Implementation (from your rc4.js) ---
// const HEX_CHARACTERS = '0123456789abcdef'

// function toHex(byteArray: number[]): string {
//   const hex: string[] = []
//   byteArray.forEach(function (b) {
//     hex.push(HEX_CHARACTERS.charAt((b >> 4) & 0xf))
//     hex.push(HEX_CHARACTERS.charAt(b & 0xf))
//   })
//   return hex.join('')
// }

// function fromHex(str: string): number[] {
//   if (typeof str !== 'string') {
//     return []
//   }
//   const byteArray: number[] = []
//   const characters = str.split('')
//   for (let i = 0; i < characters.length; i += 2) {
//     byteArray.push(
//       (HEX_CHARACTERS.indexOf(characters[i]) << 4) | HEX_CHARACTERS.indexOf(characters[i + 1])
//     )
//   }
//   return byteArray
// }

// function rc4Logic(keyByteArray: number[], inputByteArray: number[]): number[] {
//   let s: number[] = [],
//     i: number,
//     j: number,
//     x: number,
//     outputByteArray: number[] = []

//   for (i = 0; i < 256; i++) {
//     s[i] = i
//   }

//   for (i = 0, j = 0; i < 256; i++) {
//     j = (j + s[i] + keyByteArray[i % keyByteArray.length]) % 256
//     x = s[i]
//     s[i] = s[j]
//     s[j] = x
//   }

//   for (let y = 0, i = 0, j = 0; y < inputByteArray.length; y++) {
//     i = (i + 1) % 256
//     j = (j + s[i]) % 256
//     x = s[i]
//     s[i] = s[j]
//     s[j] = x
//     outputByteArray.push(inputByteArray[y] ^ s[(s[i] + s[j]) % 256])
//   }
//   return outputByteArray
// }

// function stringToByteArray(str: string): number[] {
//   const encoded = encodeURIComponent(str)
//   const characters = encoded.split('')
//   const byteArray: number[] = []
//   for (let i = 0; i < characters.length; i++) {
//     if (characters[i] === '%') {
//       byteArray.push(
//         (HEX_CHARACTERS.indexOf(characters[i + 1].toLowerCase()) << 4) |
//           HEX_CHARACTERS.indexOf(characters[i + 2].toLowerCase())
//       )
//       i += 2
//     } else {
//       byteArray.push(characters[i].charCodeAt(0))
//     }
//   }
//   return byteArray
// }

// function byteArrayToString(byteArray: number[]): string {
//   let encoded = ''
//   for (let i = 0; i < byteArray.length; i++) {
//     encoded +=
//       '%' +
//       HEX_CHARACTERS.charAt((byteArray[i] >> 4) & 0xf) +
//       HEX_CHARACTERS.charAt(byteArray[i] & 0xf)
//   }
//   return decodeURIComponent(encoded)
// }

// const rc4Api = {
//   encrypt: function (key: string, str: string): string {
//     // Returns hex string
//     return toHex(rc4Logic(stringToByteArray(key), stringToByteArray(str)))
//   },
//   decrypt: function (key: string, hexStr: string): string {
//     // Expects hex string
//     return byteArrayToString(rc4Logic(stringToByteArray(key), fromHex(hexStr)))
//   },
// }

// // LZW Decoding function (from your provided file)
// function lzwDecode(input: string): string {
//   if (input.startsWith('lzw:')) {
//     input = input.substring('lzw:'.length)
//   } else {
//     return input // Not LZW encoded
//   }
//   const dict: { [key: number]: string } = {}
//   let currChar = input.substring(0, 1)
//   let oldPhrase = currChar
//   let code = 256
//   const out = [currChar]
//   for (let i = 1; i < input.length; i++) {
//     const currentCode = input.charCodeAt(i)
//     let phrase: string
//     if (currentCode < 256) {
//       phrase = input.substring(i, 1)
//     } else if (dict[currentCode]) {
//       phrase = dict[currentCode]
//     } else {
//       phrase = oldPhrase + currChar
//     }
//     out.push(phrase)
//     currChar = phrase.substring(0, 1)
//     dict[code] = oldPhrase + currChar
//     code++
//     oldPhrase = phrase
//   }
//   return out.join('')
// }

// // --- WebSocket Proxy Server with Hono and Bun ---
// const app = new Hono()

// // To keep track of client-remote WebSocket pairs and session data
// interface ConnectionInfo {
//   remoteWs: WebSocket // Standard WebSocket for client-side connection
//   sessionKey: string
//   proxySessionId: string
//   messageCounter: number
//   rememberedData: { extPlayerKey?: string }
//   clientWs: ServerWebSocket<any> // Bun's server-side WebSocket
// }
// // Using proxySessionId as key for simplicity, as clientWs object might change reference slightly with Bun's server.
// const activeConnections = new Map<string, ConnectionInfo>()

// app.get('/ws', async (c) => {
//   // Upgrade the HTTP request to a WebSocket connection
//   // Bun's `server.upgrade()` is typically called within Bun.serve's fetch handler
//   // Hono might require a specific way to handle this or you might integrate Bun.serve directly.
//   // For this example, we'll assume Hono allows access to the underlying upgrade mechanism
//   // or we structure it directly with Bun.serve.
//   // This route is more of a placeholder for where the WS connection would be initiated.
//   // The actual WebSocket logic will be in Bun.serve's websocket handlers.
//   return c.text('WebSocket endpoint. Please connect via WebSocket protocol.')
// })

// console.log(`WebSocket Proxy Server attempting to listen on port ${PROXY_PORT}`)

// Bun.serve<{ proxySessionId: string }>({
//   // Added type for websocket data context
//   port: PROXY_PORT,
//   fetch(req, server) {
//     // Handle HTTP requests or upgrade to WebSocket
//     const url = new URL(req.url)
//     if (url.pathname === '/ws') {
//       // Define a specific path for WebSocket upgrades
//       const proxySessionId = randomUUID() // Generate unique ID for this connection attempt
//       const upgraded = server.upgrade(req, {
//         data: { proxySessionId }, // Pass data to websocket handlers
//       })
//       if (upgraded) {
//         console.log(`[Proxy][${proxySessionId}] HTTP connection upgraded to WebSocket.`)
//         return // Bun handles the response for successful upgrade
//       }
//       return new Response('WebSocket upgrade failed', { status: 500 })
//     }
//     // Fallback for other HTTP requests (e.g., Hono router or static files)
//     // return new Response("Not a WebSocket endpoint", { status: 404 });
//     return app.fetch(req, server) // Or delegate to Hono for other routes
//   },
//   websocket: {
//     async open(clientWs: ServerWebSocket<{ proxySessionId: string }>) {
//       const { proxySessionId } = clientWs.data
//       const clientIp = clientWs.remoteAddress // Bun provides remoteAddress
//       console.log(`[Proxy][${proxySessionId}] Client WebSocket opened from ${clientIp}`)

//       let connectionInfo: ConnectionInfo | undefined

//       try {
//         // TODO: Extract dynamic parameters for fsRequestBody (e.g. from clientWs.data if passed during upgrade)
//         // For example, if client connects to /ws?gameCode=...&clientString=...
//         // These would need to be parsed from the initial HTTP request in `fetch` and passed to `server.upgrade`.

//         const fsRequestBody = new URLSearchParams({
//           action: 'open_game',
//           clientString: 'FANPAGE_DEMO', // Placeholder
//           language: 'en', // Placeholder
//           gameCodeString: 'BruteForce%40mobile', // Placeholder
//         }).toString()

//         console.log(
//           `[Proxy][${proxySessionId}] Fetching session key from NoLimit City... Body: ${fsRequestBody}`
//         )
//         const fsResponse = await fetch(NOLIMIT_FS_URL, {
//           // Bun's global fetch
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
//             Accept: 'application/json',
//             Origin: 'https://nolimitcity.com',
//             'User-Agent':
//               'Mozilla/5.0 (Bun Runtime) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
//           },
//           body: fsRequestBody,
//         })

//         if (!fsResponse.ok) {
//           const errorText = await fsResponse.text()
//           throw new Error(
//             `Failed to fetch session key: ${fsResponse.status} ${fsResponse.statusText} - ${errorText}`
//           )
//         }

//         const fsData = (await fsResponse.json()) as {
//           key: string
//           url?: string
//           extPlayerKey?: string
//           [key: string]: any
//         }
//         if (!fsData.key) {
//           throw new Error('No session key (fsData.key) received from NoLimit City FS endpoint.')
//         }

//         const sessionKey = fsData.key
//         const rememberedData: { extPlayerKey?: string } = {}
//         if (fsData.extPlayerKey) {
//           rememberedData.extPlayerKey = fsData.extPlayerKey
//         }

//         const wsUrlPath = fsData.url
//           ? fsData.url.replace(/^http(s?):\/\/[^/]+/, '').replace('/gs?data=', '/ws/game?data=')
//           : '/EjsGameWeb/ws/game?data='
//         const remoteWsDomain = fsData.url
//           ? new URL(fsData.url).origin.replace(/^http/, 'ws')
//           : NOLIMIT_WS_BASE_URL.split('/EjsGameWeb')[0]
//         const remoteWsUrl = remoteWsDomain + wsUrlPath + sessionKey

//         console.log(
//           `[Proxy][${proxySessionId}] Session key obtained. Connecting to remote WebSocket: ${remoteWsUrl}`
//         )

//         const remoteWs = new WebSocket(remoteWsUrl) // Standard WebSocket client for outgoing

//         connectionInfo = {
//           clientWs, // Store Bun's ServerWebSocket
//           remoteWs,
//           sessionKey,
//           proxySessionId,
//           messageCounter: 0,
//           rememberedData,
//         }
//         activeConnections.set(proxySessionId, connectionInfo)

//         // --- Remote WebSocket Event Handlers ---
//         remoteWs.onopen = () => {
//           console.log(
//             `[Proxy][${proxySessionId}] Connected to remote NoLimit City WebSocket server.`
//           )
//           if (!connectionInfo) return // Should not happen if open fires after setup

//           connectionInfo.messageCounter = 0
//           const initialPayload: InitPayload = {
//             id: `${proxySessionId}-${connectionInfo.messageCounter}`,
//             type: 'init',
//             content: { type: 'init' },
//             protocol,
//             data: connectionInfo.rememberedData,
//           }

//           try {
//             const stringifiedPayload = JSON.stringify(initialPayload)
//             console.log(
//               `[Proxy][${proxySessionId}] Sending INIT_PAYLOAD to remote (plaintext): ${stringifiedPayload.substring(0, 150)}...`
//             )
//             const encryptedInitialPayload = rc4Api.encrypt(sessionKey, stringifiedPayload)
//             remoteWs.send(encryptedInitialPayload)
//             console.log(
//               `[Proxy][${proxySessionId}] Sent INIT_PAYLOAD to remote server (encrypted): ${encryptedInitialPayload.substring(0, 100)}...`
//             )
//           } catch (e: any) {
//             console.error(`[Proxy][${proxySessionId}] Error sending INIT_PAYLOAD:`, e.message)
//           }
//         }

//         remoteWs.onmessage = (event: MessageEvent) => {
//           const ci = activeConnections.get(proxySessionId)
//           if (!ci || ci.clientWs.readyState !== 1 /* WebSocket.OPEN for Bun ServerWebSocket */)
//             return

//           const rawRemoteMessage = event.data.toString()
//           console.log(
//             `[Proxy][${proxySessionId}] Received from Remote (raw): ${rawRemoteMessage.substring(0, 150)}${rawRemoteMessage.length > 150 ? '...' : ''}`
//           )

//           let finalPayloadForLog = '[Failed to fully process remote message]'
//           try {
//             const rc4Decrypted = rc4Api.decrypt(sessionKey, rawRemoteMessage)
//             finalPayloadForLog = lzwDecode(rc4Decrypted)
//             console.log(
//               `[Proxy][${proxySessionId}] Decrypted & LZW Decoded from Remote (for logging): ${finalPayloadForLog.substring(0, 150)}${finalPayloadForLog.length > 150 ? '...' : ''}`
//             )

//             try {
//               const parsedPayload = JSON.parse(finalPayloadForLog)
//               if (parsedPayload && parsedPayload.extPlayerKey && ci.rememberedData) {
//                 ci.rememberedData.extPlayerKey = parsedPayload.extPlayerKey
//                 console.log(
//                   `[Proxy][${proxySessionId}] Updated remembered extPlayerKey: ${parsedPayload.extPlayerKey}`
//                 )
//               }
//             } catch (parseError) {
//               /* Ignore */
//             }
//           } catch (e: any) {
//             console.error(
//               `[Proxy][${proxySessionId}] Error processing message from remote:`,
//               e.message
//             )
//           }

//           if (ci.clientWs.readyState === 1 /* OPEN */) {
//             ci.clientWs.send(event.data as WebSocketData) // Forward original raw message
//           }
//         }

//         remoteWs.onclose = (event: CloseEvent) => {
//           console.log(
//             `[Proxy][${proxySessionId}] Remote WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`
//           )
//           const ci = activeConnections.get(proxySessionId)
//           if (ci && ci.clientWs.readyState === 1 /* OPEN */) {
//             ci.clientWs.close(event.code, event.reason)
//           }
//           activeConnections.delete(proxySessionId) // Cleanup
//         }

//         remoteWs.onerror = (event: Event) => {
//           console.error(`[Proxy][${proxySessionId}] Remote WebSocket error:`, event)
//           const ci = activeConnections.get(proxySessionId)
//           if (ci && ci.clientWs.readyState === 1 /* OPEN */) {
//             ci.clientWs.close(1011, 'Remote server connection error')
//           }
//           activeConnections.delete(proxySessionId) // Cleanup
//         }
//       } catch (error: any) {
//         console.error(
//           `[Proxy][${proxySessionId}] Error in client connection setup:`,
//           error.message,
//           error.stack
//         )
//         if (clientWs.readyState === 1 /* OPEN */) {
//           clientWs.close(1011, 'Proxy setup error')
//         }
//         activeConnections.delete(proxySessionId) // Ensure cleanup
//       }
//     },
//     message(clientWs: ServerWebSocket<{ proxySessionId: string }>, message: WebSocketData) {
//       const { proxySessionId } = clientWs.data
//       const connectionInfo = activeConnections.get(proxySessionId)

//       if (!connectionInfo) {
//         console.warn(
//           `[Proxy][${proxySessionId}] Received message from client but connection info is missing. Ignoring.`
//         )
//         return
//       }
//       const { remoteWs, sessionKey } = connectionInfo

//       const rawClientMessage = message.toString()
//       console.log(
//         `[Proxy][${proxySessionId}] Received from Client (raw): ${rawClientMessage.substring(0, 150)}${rawClientMessage.length > 150 ? '...' : ''}`
//       )

//       let decryptedForLogging = '[Decryption Failed or Not Attempted for client message]'
//       try {
//         decryptedForLogging = rc4Api.decrypt(sessionKey, rawClientMessage)
//         console.log(
//           `[Proxy][${proxySessionId}] Decrypted from Client (for logging): ${decryptedForLogging.substring(0, 150)}${decryptedForLogging.length > 150 ? '...' : ''}`
//         )
//       } catch (e: any) {
//         console.error(
//           `[Proxy][${proxySessionId}] Error decrypting message from client for logging:`,
//           e.message,
//           'Raw message:',
//           rawClientMessage.substring(0, 50)
//         )
//       }

//       if (remoteWs && remoteWs.readyState === WebSocket.OPEN) {
//         // Forward the original raw message from client to remote
//         remoteWs.send(message)
//         console.log(`[Proxy][${proxySessionId}] Forwarded original message from Client to Remote.`)
//       } else {
//         console.warn(
//           `[Proxy][${proxySessionId}] Remote WebSocket not open. Cannot forward message from client.`
//         )
//       }
//     },
//     close(
//       clientWs: ServerWebSocket<{ proxySessionId: string }>,
//       code: number,
//       reasonMessage: Buffer
//     ) {
//       const { proxySessionId } = clientWs.data
//       const reason = reasonMessage.toString()
//       console.log(
//         `[Proxy][${proxySessionId}] Client WebSocket closed. Code: ${code}, Reason: ${reason}`
//       )
//       const connectionInfo = activeConnections.get(proxySessionId)
//       if (connectionInfo && connectionInfo.remoteWs.readyState === WebSocket.OPEN) {
//         connectionInfo.remoteWs.close(code, reason)
//       }
//       activeConnections.delete(proxySessionId) // Cleanup
//     },
//     error(clientWs: ServerWebSocket<{ proxySessionId: string }>, error: Error) {
//       const { proxySessionId } = clientWs.data
//       console.error(`[Proxy][${proxySessionId}] Client WebSocket error:`, error)
//       const connectionInfo = activeConnections.get(proxySessionId)
//       if (connectionInfo && connectionInfo.remoteWs.readyState === WebSocket.OPEN) {
//         connectionInfo.remoteWs.close(1011, 'Client connection error')
//       }
//       activeConnections.delete(proxySessionId) // Cleanup
//     },
//   },
//   error(error: Error) {
//     console.error('[Proxy] Server error:', error)
//     return new Response('Proxy server error', { status: 500 })
//   },
// })

// console.log(`Bun WebSocket server started on port ${PROXY_PORT}`)

// // Note: Hono app isn't directly used for WS serving with Bun.serve's websocket handler.
// // If you need Hono for other HTTP routes, it can coexist.
// // For example, the `fetch` in `Bun.serve` could route non-WS requests to `app.fetch(req)`.

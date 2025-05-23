import { ErrorLike, Server } from 'bun'
import { ExecutionContext } from 'hono'

import { auth } from './auth' // Adjust path as needed
import createApp from './create-app' // Adjust path as needed
import { WebSocketRouter, AppWsData } from './routes/socket.router' // Use AppWsData from router
import { PgRealtimeClientOptions } from './services/dbupdates/types' // Adjust path
import { handleJoinRoom, handleSendMessage } from './services/handlers/chat.handler' // Adjust path
import { handlePing } from './services/handlers/heartbeat.handler' // Adjust path
import { RealtimeService } from './services/realtime.service' // Adjust path
import * as Schema from './sockets/schema' // Adjust path
// import { WsData } from './sockets/types'; // WsData is now part of AppWsData from router
import {
  nolimitProxyOpenHandler,
  nolimitProxyCloseHandler,
  // nolimitProxyMessageHandler is handled inside WebSocketRouter now
} from './services/handlers/nolimit-proxy.handler' // Adjust path
// import { router as httpRouter } from './routes' // Assuming your Hono router is exported as 'router'

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 6589
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0'

const pgOptions: PgRealtimeClientOptions = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  database: process.env.DB_NAME || 'devinatory',
  channel: process.env.DB_LISTEN_CHANNEL || 'spec_data_change',
  onError: (error: Error) => console.error('[DB Listener Error]', error),
}

// --- Initialization ---
const realtimeService = new RealtimeService(pgOptions)
// Use AppWsData with WebSocketRouter
const wsRouter = new WebSocketRouter<AppWsData>()

try {
  // Register standard message handlers
  wsRouter.onMessage(Schema.JoinRoom, handleJoinRoom)
  wsRouter.onMessage(Schema.SendMessage, handleSendMessage)
  wsRouter.onMessage(Schema.Ping, handlePing)

  // Register NoLimit Proxy lifecycle handlers
  // These will be invoked if ws.data.isNoLimitProxy is true (set during upgrade)
  // or if the router's open/close handlers internally check this flag.
  // For this setup, we'll rely on the modified router to call these or handle proxy logic.
  // The `nolimitProxyOpenHandler` will be the primary `onOpen` for proxy connections.
  // The `nolimitProxyMessageHandler` is now called *inside* the router's main message handler.
  // The `nolimitProxyCloseHandler` will be the primary `onClose` for proxy connections.

  // It's cleaner if the router's onOpen/onClose can distinguish
  // For now, let's assume the main onOpen/onClose in the router will call these if ws.data.isNoLimitProxy is true
  // Or, we register them and the handlers themselves check the flag.
  // Let's register them: the router's handleOpen will call all registered open handlers.
  // The nolimitProxyOpenHandler should then check ws.data.isNoLimitProxy if needed,
  // but since it's registered for a specific upgrade path, it will only run for those.

  // This registration implies that `nolimitProxyOpenHandler` and `nolimitProxyCloseHandler`
  // will be called for *all* WebSocket connections if not filtered by path during registration,
  // which is not what we want. The router needs to support path-specific handlers or the
  // handlers themselves need to check `ws.data.isNoLimitProxy`.
  // The current WebSocketRouter calls ALL registered open/close handlers.
  // The distinction will happen at the `server.upgrade` point by setting `isNoLimitProxy`.
  // The `nolimitProxyOpenHandler` will then proceed with its logic.
  // The `nolimitProxyMessageHandler` is called *within* the router's `handleMessage`.
  wsRouter.onOpen(nolimitProxyOpenHandler) // This will be called for all connections, handler needs to check ws.data.isNoLimitProxy
  wsRouter.onClose(nolimitProxyCloseHandler) // Same as above
} catch (error) {
  console.error('[Server] FATAL: Error registering WebSocket handlers:', error)
  process.exit(1)
}

const websocketHandler = wsRouter.websocket
let serverInstance: Server

try {
  serverInstance = Bun.serve<AppWsData, {}>({
    // Use AppWsData here
    port: PORT,
    hostname: HOSTNAME,
    async fetch(req, server) {
      const url = new URL(req.url)

      // Specific path for NoLimit Proxy WebSocket upgrade
      if (url.pathname === '/games/nolimit/ws/game' || url.pathname === '/nolimit-proxy-ws') {
        // Added a more generic proxy path
        console.log(`[Server] Attempting WebSocket upgrade for: ${url.pathname}`)
        // For NoLimit proxy, we might not have a session/user immediately,
        // or auth happens differently. The proxy handler will manage NLC auth.
        // We pass parameters from the client's connection request to the proxy handler via ws.data
        const gameCodeString =
          url.searchParams.get('game') || url.searchParams.get('gameCodeString')
        const clientString =
          url.searchParams.get('operator') || url.searchParams.get('clientString')
        const language = url.searchParams.get('lang') || url.searchParams.get('language')
        const nlcToken = url.searchParams.get('token') // NLC specific token

        const upgradeData: Partial<AppWsData> = {
          isNoLimitProxy: true,
          // Pass NLC specific params if available from client query
          ...(gameCodeString && { nolimitGameCodeString: gameCodeString }),
          ...(clientString && { nolimitClientString: clientString }),
          ...(language && { nolimitLanguage: language }),
          ...(nlcToken && { nolimitToken: nlcToken }),
          // userId might be added here if your own platform's user is already authenticated
          // For a pure game proxy, userId might be derived/managed differently or not used by proxy itself.
        }

        const upgradeResponse = wsRouter.upgrade({
          server,
          request: req,
          data: upgradeData as Omit<AppWsData, 'clientId'>, // Cast because clientId is added by router
        })
        if (upgradeResponse instanceof Response) return upgradeResponse
        return new Response(null, { status: 101 }) // Should be handled by Bun if upgrade successful
      }

      // Standard WebSocket upgrade path (e.g., /ws for chat)
      if (url.pathname === '/ws') {
        console.log(`[Server] Attempting WebSocket upgrade for standard WS: ${url.pathname}`)
        const sessionId = url.searchParams.get('token')
        if (!sessionId) {
          return new Response('Unauthorized: Authentication token required.', { status: 401 })
        }
        req.headers.set('Authorization', `Bearer ${sessionId}`) // Standardize for auth lib

        try {
          const session = await auth.api.getSession({ headers: req.headers })
          const user = session?.user
          if (!session || !user || !user.id) {
            return new Response('Unauthorized: Invalid session.', { status: 401 })
          }
          const upgradeResponse = wsRouter.upgrade({
            server,
            request: req,
            data: { userId: user.id, key: url.searchParams.get('data') || undefined },
          })
          if (upgradeResponse instanceof Response) return upgradeResponse
          return new Response(null, { status: 101 })
        } catch (error: any) {
          if (error?.message === 'AUTH_INVALID_SESSION_ID') {
            return new Response('Unauthorized: Invalid session.', { status: 401 })
          }
          console.error('[Server] Error during standard WS upgrade:', error)
          return new Response('Internal Server Error during upgrade.', { status: 500 })
        }
      }

      // Fallback to Hono for other HTTP requests
      try {
        // Pass serverInstance to Hono context if needed by HTTP handlers
        // (Not standard Hono practice, but possible if Hono app is adapted)
        // For now, assuming Hono app created by createApp() doesn't strictly need it for basic routing.
        return await createApp().fetch(req, { serverInstance }, {} as ExecutionContext)
      } catch (error) {
        console.error('[Hono Fetch Error]', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    },
    websocket: websocketHandler, // This uses the router's handlers
    error(error: ErrorLike): Response | Promise<Response> {
      console.error('[Bun Server Error]', error)
      return new Response(`Server error: ${error.message || 'Unknown error'}`, { status: 500 })
    },
  })

  // --- Post-Initialization ---
  wsRouter.setServer(serverInstance)
  realtimeService.setServer(serverInstance)
  realtimeService.startListening().catch((err) => {
    console.error('[Server] FATAL: Failed to start RealtimeService listening, exiting.', err)
    serverInstance.stop(true) // Ensure clean shutdown
    process.exit(1)
  })

  console.log(`Server running at http://${serverInstance.hostname}:${serverInstance.port}`)
} catch (error) {
  console.error('[Server] FATAL: Failed to start:', error)
  process.exit(1)
}

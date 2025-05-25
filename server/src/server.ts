import { BunRequest, ErrorLike, Server } from 'bun'
import { ExecutionContext } from 'hono'
import { auth } from './auth' // Adjust path as needed
import createApp from './create-app' // Adjust path as needed
import { WebSocketRouter, AppWsData } from './socket.router' // Use AppWsData from router
import { PgRealtimeClientOptions } from './services/dbupdates/types' // Adjust path
// import { handleJoinRoom, handleSendMessage } from './services/handlers/chat.handler' // Adjust path
// import { handlePing } from './services/handlers/heartbeat.handler' // Adjust path
import { RealtimeService } from './services/realtime.service' // Adjust path
import { setupTournamentWebSocketListeners } from './services/handlers/tournament.handler'
// import { initTournamentScheduler } from './services/tournament.service'
import * as tournamentService from './services/tournament.service' // For initTournamentScheduler
import {
  nolimitProxyCloseHandler,
  nolimitProxyOpenHandler,
} from './services/handlers/nolimit-proxy.handler'
import {
  kagamingProxyCloseHandler,
  kagamingProxyOpenHandler,
} from './services/handlers/kagaming-proxy.handler'
import { rtgSettings, rtgSpin } from './services/game.service'

// import * as Schema from './sockets/schema' // Adjust path
// // import { WsData } from './sockets/types'; // WsData is now part of AppWsData from router
// import {
//   nolimitProxyOpenHandler,
//   nolimitProxyCloseHandler,
//   // nolimitProxyMessageHandler is handled inside WebSocketRouter now
// } from './services/handlers/nolimit-proxy.handler' // Adjust path
// // import { router as httpRouter } from './routes' // Assuming your Hono router is exported as 'router'

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
  // wsRouter.onMessage(Schema.JoinRoom, handleJoinRoom)
  // wsRouter.onMessage(Schema.SendMessage, handleSendMessage)
  // wsRouter.onMessage(Schema.Ping, handlePing)
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
  // wsRouter.onOpen(nolimitProxyOpenHandler) // This will be called for all connections, handler needs to check ws.data.isNoLimitProxy
  // wsRouter.onClose(nolimitProxyCloseHandler) // Same as above
} catch (error) {
  console.error('[Server] FATAL: Error registering WebSocket handlers:', error)
  process.exit(1)
}

const websocketHandler = wsRouter.websocket
let serverInstance: Server

async function handleWsUpgrade(req: Request, server: Server): Promise<Response> {
  let sessionId: string | null = null
  const parsedUrl = new URL(req.url)
  sessionId = parsedUrl.searchParams.get('token')
  const key = parsedUrl.searchParams.get('data')
  if (!sessionId) {
    return new Response('Unauthorized: Authentication required.', {
      status: 401,
    })
  }
  req.headers.set('Authorization', sessionId as string)

  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })
    const user = session!.user
    if (!session || !user || !user.id) {
      return new Response('Unauthorized: Invalid session.', {
        status: 401,
      })
    }
    const upgradeResponse = wsRouter.upgrade({
      server,
      request: req,
      data: { userId: user.id, key },
    })
    if (upgradeResponse instanceof Response) return upgradeResponse
    return new Response(null, { status: 101 })
  } catch (error: any) {
    if (error?.message === 'AUTH_INVALID_SESSION_ID') {
      return new Response('Unauthorized: Invalid session.', {
        status: 401,
      })
    }
    return new Response('Internal Server Error during upgrade.', {
      status: 500,
    })
  }
}
async function handleGameRequest(req: Request, server: Server): Promise<Response> {
  const parsedUrl = new URL(req.url)
  const tokenAndGame = parsedUrl.pathname.substring(
    parsedUrl.pathname.indexOf('platform/') + 9,
    parsedUrl.pathname.lastIndexOf('/game')
  )
  const token = tokenAndGame?.split('/')[0]
  const game = tokenAndGame?.split('/')[1]
  const command = parsedUrl.pathname.split('/game/')[1]
  console.log(typeof command)
  if (token) req.headers.set('Authorization', `Bearer ${token}`)
  // const honoEnv = { serverInstance: server }
  const session = await auth.api.getSession({
    headers: req.headers,
  })
  // console.log(typeof session)

  try {
    // Route the request
    switch (command) {
      case 'settings':
        return await rtgSettings(req, session, game)
        break
      case 'spin':
        return await rtgSpin(req, session, game)
        break
      default:
        break
    }
    return await rtgSettings(req, session, game)
  } catch (error) {
    console.log(error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

function handlePublicAsset(req: Request): Response {
  const parsedUrl = new URL(req.url)
  const token = parsedUrl.searchParams.get('token')
  if (token) req.headers.set('Authorization', `Bearer ${token}`)
  let fp = __dirname + parsedUrl.pathname
  if (fp.endsWith('/')) {
    fp += 'index.html'
  }
  return new Response(Bun.file(fp))
}
function handleKaGamingUpgrade(req: Request, server: Server) {
  //?g=GangsterOverlord&p=demo&u=875802063&t=1238&ak=accessKey&cr=USD&loc=en
  const url = new URL(req.url)
  const gameCodeString = url.searchParams.get('g')
  const mode = url.searchParams.get('p')
  const sessionId = url.searchParams.get('u')
  const gameId = url.searchParams.get('ak')
  const currency = url.searchParams.get('cr')
  const location = url.searchParams.get('loc')
  const kaToken = url.searchParams.get('t')
  console.log(gameCodeString, mode, sessionId, gameId, currency, location, kaToken)

  const upgradeData: Partial<AppWsData> = {
    isKaGamingProxy: true,
    isNoLimitProxy: false,
    // Pass NLC specific params if available from client query
    ...(gameCodeString && { kaGamingGameCodeString: gameCodeString }),
    ...(mode && { kaGamingClientString: mode }),
    ...(gameId && { nkaGamingLanguage: gameId }),
    ...(kaToken && { kaGamingToken: kaToken }),
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
function handleNoLimitUpgrade(req: Request, server: Server) {
  const url = new URL(req.url)
  // Added a more generic proxy path
  console.log(`[Server] Attempting WebSocket upgrade for: ${url.pathname}`)
  // For NoLimit proxy, we might not have a session/user immediately,
  // or auth happens differently. The proxy handler will manage NLC auth.
  // We pass parameters from the client's connection request to the proxy handler via ws.data
  const gameCodeString = url.searchParams.get('game') || url.searchParams.get('gameCodeString')
  const clientString = url.searchParams.get('operator') || url.searchParams.get('clientString')
  const language = url.searchParams.get('lang') || url.searchParams.get('language')
  const nlcToken = url.searchParams.get('token') // NLC specific token

  const upgradeData: Partial<AppWsData> = {
    isKaGamingProxy: false,
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
  console.log(upgradeResponse)
  if (upgradeResponse instanceof Response) return upgradeResponse
  return new Response(null, { status: 101 }) // Should be handled by Bun if upgrade successful
}

try {
  serverInstance = Bun.serve<AppWsData, {}>({
    // Use AppWsData here
    port: PORT,
    hostname: HOSTNAME,
    async fetch(req, server) {
      // Define route handlers
      console.log(req.url)
      const routes: Record<string, (req: Request, server: Server) => Response | Promise<Response>> =
        {
          '/games/nolimit/ws/game': handleNoLimitUpgrade,
          '/games/kagaming/ws/game': handleKaGamingUpgrade,
          'game/': handleGameRequest,
          'php/': handleGameRequest,
          '/public': handlePublicAsset,
          '/ws': handleWsUpgrade,
          // '/games': handlePublicAsset,
        }

      // Route the request
      for (const pattern in routes) {
        if (req.url.includes(pattern) || req.url === pattern) {
          console.log(pattern)
          return routes[pattern](req, server)
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
  // wsRouter.setServer(serverInstance) // Important: Ensure WebSocketRouter has the server instance
  setupTournamentWebSocketListeners(serverInstance) // Call the new setup function
  tournamentService.initTournamentScheduler() // Initialize the scheduler from tournament.service
  wsRouter.addOpenHandler(nolimitProxyOpenHandler)
  wsRouter.addOpenHandler(kagamingProxyOpenHandler)
  wsRouter.addCloseHandler(nolimitProxyCloseHandler)
  wsRouter.addCloseHandler(kagamingProxyCloseHandler)

  console.log(`Server running at http://${serverInstance.hostname}:${serverInstance.port}`)
} catch (error) {
  console.error('[Server] FATAL: Failed to start:', error)
  process.exit(1)
}

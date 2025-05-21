import { ErrorLike, Server } from 'bun'
import { ExecutionContext } from 'hono'

import { auth } from './auth'
import createApp from './create-app'
import { WebSocketRouter } from './routes/socket.router'
import { PgRealtimeClientOptions } from './services/dbupdates/types'
import { handleJoinRoom, handleSendMessage } from './services/handlers/chat.handler'
import { handlePing } from './services/handlers/heartbeat.handler'
import { RealtimeService } from './services/realtime.service'
import * as Schema from './sockets/schema'
import { WsData } from './sockets/types'
import { handleOpenProxy } from './services/handlers/nolimit-proxy.handler'
import { registerRoutes, router } from './routes'

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

// ... handler and schema imports ...

// --- Initialization ---

// Initialize service WITHOUT server instance
const realtimeService = new RealtimeService(pgOptions) // CORRECT: Only pass options
// const app = createApp()
// Initialize router WITHOUT server instance
export type AppWsData = Omit<WsData, 'clientId'> & { userId: string }
const wsRouter = new WebSocketRouter<AppWsData>() // CORRECT

try {
  wsRouter.onMessage(Schema.JoinRoom, handleJoinRoom)
  wsRouter.onMessage(Schema.SendMessage, handleSendMessage)
  wsRouter.onMessage(Schema.Ping, handlePing)
  wsRouter.onOpen(handleOpenProxy)

  // wsRouter.onMessage(Schema.Subscribe, handleSubscribe);
  // wsRouter.onMessage(Schema.RoomList, handleRoomList); // Register other handlers
} catch (error) {
  //console.error('[Server] FATAL: Error registering WebSocket handlers:', error);
  process.exit(1)
}
// --- Register WebSocket Message Handlers ---
// ... wsRouter.onMessage(...) registrations ...
// wsRouter.onMessage()
// --- Define the WebSocket Handler Object ---
const websocketHandler = wsRouter.websocket

// --- Start Bun Server ---
let serverInstance: Server
type InferredType =
  | string
  | boolean
  | number
  | null
  | undefined
  | Record<string, unknown>
  | Array<InferredType>

const NUMERIC_CHARS = '0123456789.' as const
function isNumber(value: string): boolean {
  return NUMERIC_CHARS.includes(value)
}

function isNumberString(value: string) {
  return value.split('').every(isNumber)
}

function inferType(value: string): InferredType {
  if (value === 'null') {
    return null
  }
  if (value === 'undefined') {
    return undefined
  }
  if (value === undefined || value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
  if (
    (value.startsWith('[') && value.endsWith(']')) ||
    (value.startsWith('{') && value.endsWith('}'))
  ) {
    return JSON.parse(value)
  }
  if (value.split(',').length > 1) {
    return value.split(',').map(inferType)
  }
  if (isNumberString(value)) {
    return Number(value)
  }
  return value
}

function parseArg(arg: string): Record<string, InferredType> {
  const [key, value] = arg.split('=')
  return { [key.replaceAll('--', '')]: inferType(value) }
}

export function parse(args: readonly string[]): Record<string, InferredType> {
  return args.reduce((acc, arg) => ({ ...acc, ...parseArg(arg) }), {})
}

try {
  serverInstance = Bun.serve<AppWsData, {}>({
    port: PORT,
    hostname: HOSTNAME,
    fetch: async (req, server) => {
      const url = req.url

      // add Access-Control-Allow-Headers if needed

      // Define route handlers
      const routes: Record<string, (req: Request, server: Server) => Response | Promise<Response>> =
        {
          '/ws': handleWsUpgrade,
          '/games/nolimit/ws/game': handleWsUpgrade,
          'game/': handleGameRequest,
          'php/': handleGameRequest,
          '/public': handlePublicAsset,
          // '/games': handlePublicAsset,
        }

      // Route the request
      for (const pattern in routes) {
        if (url.includes(pattern) || url === pattern) {
          return routes[pattern](req, server)
        }
      }

      // Default: Regular HTTP Request Handling

      try {
        return await createApp().request(req)
      } catch (error) {
        //console.error('[Hono Fetch Error]', error);
        return new Response('Internal Server Error', { status: 500 })
      }

      // --- Route Handlers ---
      async function handleWsUpgrade(req: Request, server: Server): Promise<Response> {
        let sessionId: string | null = null
        const parsedUrl = new URL(url)
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
        const parsedUrl = new URL(url)
        let token = parsedUrl.pathname.split('game/')[1]
        token = token?.split('/')[0]
        if (token) req.headers.set('Authorization', `Bearer ${token}`)
        const honoEnv = { serverInstance: server }
        try {
          const executionContext: ExecutionContext = {
            waitUntil() {},
            passThroughOnException() {},
          }

          return await router.fetch(req, honoEnv, executionContext)
        } catch (error) {
          return new Response('Internal Server Error', { status: 500 })
        }
      }

      function handlePublicAsset(req: Request, server: Server): Response {
        const parsedUrl = new URL(url)
        const token = parsedUrl.searchParams.get('token')
        if (token) req.headers.set('Authorization', `Bearer ${token}`)
        let fp = __dirname + parsedUrl.pathname
        if (fp.endsWith('/')) {
          fp += 'index.html'
        }
        return new Response(Bun.file(fp))
      }
    },
    websocket: websocketHandler,
    error(error: ErrorLike): Response | Promise<Response> {
      //console.error('[Bun Server Error]', error);
      return new Response(`Server error: ${error.message || 'Unknown error'}`, {
        status: 500,
      })
    },
  })

  // --- Post-Initialization ---
  wsRouter.setServer(serverInstance) // Inject server instance
  realtimeService.setServer(serverInstance) // Inject server instance
  realtimeService.startListening().catch((err) => {
    // Start listening AFTER server is set
    //console.error('[Server] FATAL: Failed to start RealtimeService listening, exiting.', err);
    serverInstance.stop(true)
    process.exit(1)
  })
  // registerRoutes(app);
} catch (error) {
  //console.error('[Server] FATAL: Failed to start:', error);
  process.exit(1)
}

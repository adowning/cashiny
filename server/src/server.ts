// // import { Hono } from "hono";
// // import { cors } from "hono/cors";
// // import { logger } from "hono/logger";
// // const app = new Hono();
// // // Middleware
// // app.use(logger());
// // app.use(cors());
// // // Routes
// // app.get("/", (c) => c.text("Hono Backend!"));
// // app.get("/games", (c) => {
// //   const games = [
// //     { id: 1, name: "Slot Game 1", provider: "Provider A" },
// //     { id: 2, name: "Poker Game 1", provider: "Provider B" },
// //     { id: 3, name: "Roulette Game 1", provider: "Provider C" },
// //   ];
// //   return c.json(games);
// // });
// // // 404 Handler
// // app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));
// // export default app;
// import type { ErrorLike, Server } from "bun";
// import { ExecutionContext } from "hono";
// import { auth } from "./routes/auth.route";
// import createApp from "./create-app";
// import { PgRealtimeClientOptions } from "./rest/services/dbupdates/types";
// // Import ACTUAL Handler Functions
// import { handleJoinRoom, handleSendMessage } from "./sockets/handlers/chat.handler";
// import { handlePing } from "./sockets/handlers/heartbeat.handler";
// // Local Imports
// import { WebSocketRouter } from "./sockets/router";
// // Import Schemas (needed for registration keys)
// import * as Schema from "./sockets/schema";
// import { RealtimeService } from "./sockets/services/realtime.service";
// // Use the single router
// import type { WsData } from "./sockets/types";
// // --- Configuration ---
// // --- Initialization ---

// const app = createApp();
// const realtimeService = new RealtimeService(pgOptions);
// type AppWsData = Omit<WsData, "clientId"> & { userId: string };
// const wsRouter = new WebSocketRouter<AppWsData>(); // Initialize WITHOUT server yet
// // --- Register WebSocket Message Handlers ---
// // Directly register the imported handler functions

// try {
//   wsRouter.onMessage(Schema.JoinRoom, handleJoinRoom);
//   wsRouter.onMessage(Schema.SendMessage, handleSendMessage);
//   wsRouter.onMessage(Schema.Ping, handlePing);
//   // wsRouter.onMessage(Schema.Subscribe, handleSubscribe);
//   // wsRouter.onMessage(Schema.RoomList, handleRoomList); // Register other handlers

// } catch (error) {
//   console.error("[Server] FATAL: Error registering WebSocket handlers:", error);
//   process.exit(1);
// }
// // --- Define the WebSocket Handler Object ---
// const websocketHandler = wsRouter.websocket;
// // --- Start Bun Server ---

// let serverInstance: Server;
// try {
//   serverInstance = Bun.serve<AppWsData, {}>({
//     port: PORT,
//     hostname: HOSTNAME,
//     async fetch(req, server): Promise<Response> {
//       const url = new URL(req.url);
//       // WebSocket Upgrade Handling
//       if (url.pathname === "/ws") {

//         let sessionId: string | null = null;
//         const authHeader = req.headers.get("Authorization");
//         if (authHeader?.startsWith("Bearer "))
//           sessionId = authHeader.substring(7);
//         if (!sessionId) {
//           console.warn("[WS Upgrade] Denied: No session ID found.");
//           return new Response("Unauthorized: Authentication required.", {
//             status: 401,
//           });
//         }
//         try {
//           // const { session, user } = await validateSession(sessionId);
//           const session = await auth.api.getSession({
//             headers: req.headers,
//           });
//           const user = session!.user;
//           if (!session || !user || !user.id) {
//             console.warn(`[WS Upgrade] Denied: Invalid session ID.`);
//             return new Response("Unauthorized: Invalid session.", {
//               status: 401,
//             });
//           }

//           const upgradeResponse = wsRouter.upgrade({
//             server, // Pass the server instance from THIS context
//             request: req,
//             data: { userId: user.id },
//           });
//           if (upgradeResponse instanceof Response) return upgradeResponse;
//           return new Response(null, { status: 101 }); // Handled by Bun
//         } catch (error: any) {
//           if (error?.message === "AUTH_INVALID_SESSION_ID") {
//             console.warn(
//               `[WS Upgrade] Denied: Invalid session ID (validation error)`
//             );
//             return new Response("Unauthorized: Invalid session.", {
//               status: 401,
//             });
//           }
//           console.error("[WS Upgrade] Error:", error);
//           return new Response("Internal Server Error during upgrade.", {
//             status: 500,
//           });
//         }
//       }
//       // Regular HTTP Request Handling
//       const honoEnv = { serverInstance: server };
//       try {
//         // Provide a minimal ExecutionContext implementation
//         const executionContext: ExecutionContext = {
//           waitUntil(promise: Promise<any>) {
//             // Optionally handle background tasks here
//           },
//           passThroughOnException() {
//             // Optionally handle pass-through logic here
//           },
//         };
//         return await app.fetch(req, honoEnv, executionContext);
//       } catch (error) {
//         console.error("[Hono Fetch Error]", error);
//         return new Response("Internal Server Error", { status: 500 });
//       }
//     },
//     websocket: websocketHandler,
//     error(error: ErrorLike): Response | Promise<Response> {
//       console.error("[Bun Server Error]", error);
//       return new Response(`Server error: ${error.message || "Unknown error"}`, {
//         status: 500,
//       });
//     },
//   });
//   // --- Post-Initialization ---

//   wsRouter.setServer(serverInstance); // Inject server instance into router
//   realtimeService.setServer(serverInstance); // Inject server instance into service

//   realtimeService.startListening().catch((err) => {
//     console.error(
//       "[Server] FATAL: Failed to start RealtimeService listening, exiting.",
//       err
//     );
//     serverInstance.stop(true);
//     process.exit(1);
//   });

//     `🚀 Server listening on http://${serverInstance.hostname}:${serverInstance.port}`
//   );
// } catch (error) {
//   console.error("[Server] FATAL: Failed to start:", error);
//   process.exit(1);
// }
// // --- Graceful Shutdown ---
// const shutdown = async (signal: string) => {

//   try {
//     if (realtimeService) await realtimeService.stopListening();
//     if (serverInstance) serverInstance.stop(true);

//     process.exit(0);
//   } catch (error) {
//     console.error("[Server] Error during graceful shutdown:", error);
//     process.exit(1);
//   }
// };
// process.on("SIGINT", () => shutdown("SIGINT"));
// process.on("SIGTERM", () => shutdown("SIGTERM"));
// // Export Hono app type
// export type CashflowServerAppType = typeof app;
// function validateSession(
//   sessionId: string
// ): { session: any; user: any } | PromiseLike<{ session: any; user: any }> {
//   throw new Error("Function not implemented.");
// }
// ... other imports ...
import { ErrorLike, Server } from 'bun';
import { ExecutionContext } from 'hono';

import { auth } from './auth';
import createApp from './create-app';
import { WebSocketRouter } from './routes/socket.router';
import { PgRealtimeClientOptions } from './services/dbupdates/types';
import { handleJoinRoom, handleSendMessage } from './services/handlers/chat.handler';
import { handlePing } from './services/handlers/heartbeat.handler';
import { RealtimeService } from './services/realtime.service';
// CORRECT
import * as Schema from './sockets/schema';
import { WsData } from './sockets/types';
import { NETWORK_CONFIG } from '@cashflow/types';
import { proxyWebsocket, rtgSettings } from './services/game.service';
import { handleOpenProxy } from './services/handlers/nolimit-proxy.handler';
import { ur } from '@faker-js/faker';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 6589;
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
const pgOptions: PgRealtimeClientOptions = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  database: process.env.DB_NAME || 'devinatory',
  channel: process.env.DB_LISTEN_CHANNEL || 'spec_data_change',
  onError: (error: Error) => console.error('[DB Listener Error]', error),
};

// ... handler and schema imports ...

// --- Initialization ---
const app = createApp();

// Initialize service WITHOUT server instance
const realtimeService = new RealtimeService(pgOptions); // CORRECT: Only pass options

// Initialize router WITHOUT server instance
export type AppWsData = Omit<WsData, 'clientId'> & { userId: string };
const wsRouter = new WebSocketRouter<AppWsData>(); // CORRECT

try {
  wsRouter.onMessage(Schema.JoinRoom, handleJoinRoom);
  wsRouter.onMessage(Schema.SendMessage, handleSendMessage);
  wsRouter.onMessage(Schema.Ping, handlePing);
  wsRouter.onOpen(handleOpenProxy);

  // wsRouter.onMessage(Schema.Subscribe, handleSubscribe);
  // wsRouter.onMessage(Schema.RoomList, handleRoomList); // Register other handlers
} catch (error) {
  console.error('[Server] FATAL: Error registering WebSocket handlers:', error);
  process.exit(1);
}
// --- Register WebSocket Message Handlers ---
// ... wsRouter.onMessage(...) registrations ...
// wsRouter.onMessage()
// --- Define the WebSocket Handler Object ---
const websocketHandler = wsRouter.websocket;

// --- Start Bun Server ---
let serverInstance: Server;
type InferredType =
  | string
  | boolean
  | number
  | null
  | undefined
  | Record<string, unknown>
  | Array<InferredType>;

const NUMERIC_CHARS = '0123456789.' as const;
function isNumber(value: string): boolean {
  return NUMERIC_CHARS.includes(value);
}

function isNumberString(value: string) {
  return value.split('').every(isNumber);
}

function inferType(value: string): InferredType {
  if (value === 'null') {
    return null;
  }
  if (value === 'undefined') {
    return undefined;
  }
  if (value === undefined || value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  if (
    (value.startsWith('[') && value.endsWith(']')) ||
    (value.startsWith('{') && value.endsWith('}'))
  ) {
    return JSON.parse(value);
  }
  if (value.split(',').length > 1) {
    return value.split(',').map(inferType);
  }
  if (isNumberString(value)) {
    return Number(value);
  }
  return value;
}

function parseArg(arg: string): Record<string, InferredType> {
  const [key, value] = arg.split('=');
  return { [key.replaceAll('--', '')]: inferType(value) };
}

/**
 * @example
 * ```bash
 * bun cli.ts
 * ```
 * ```typescript
 * // cli.ts
 * parse(process.argv.slice(2) // ['--hello=world', 'num=1.23', '--truthy', '--falsy=false', '--nullish=null', '--list=0,1,foo,null,10,undefined', --json='{"hello": "world"}' --array='[1,{"key":"value"},3]']
 * {
 *   hello: "world",
 *   num: 1.23,
 *   truthy: true,
 *   falsy: false,
 *   nullish: null,
 *   list: [ 0, 1, "foo", null, 10, undefined ],
 *   json: {
 *     hello: "world"
 *   },
 *   array: [1, { key: "value" }, 3]
 * }
 * ```
 */
export function parse(args: readonly string[]): Record<string, InferredType> {
  return args.reduce((acc, arg) => ({ ...acc, ...parseArg(arg) }), {});
}
const {
  directory = process.argv.slice(2)[0] ?? '.',
  port = 3000,
  hostname = '0.0.0.0',
  development = process.env.NODE_ENV !== 'production',
  lowMemoryMode = false,
  dhParamsFile,
  key,
  passphrase,
} = parse(process.argv.slice(2));
try {
  serverInstance = Bun.serve<AppWsData, {}>({
    port: PORT,
    hostname: HOSTNAME,
    fetch: async (req, server) => {
      const url = new URL(req.url);
      if (url.pathname.includes('php/')) {
        let token = url.pathname.split('php/')[1];

        token = token.split('/')[0];

        if (token) req.headers.set('Authorization', `Bearer ${token}`);
        // return new Response('PHP is not supported', { status: 404 });
      }
      if (url.pathname.includes('game/')) {
        // return new Response('RTG is not supported', { status: 404 });

        // let token = url.searchParams.get('token');

        let token = url.pathname.split('game/')[1];

        token = token.split('/')[0];

        if (token) req.headers.set('Authorization', `Bearer ${token}`);
        const honoEnv = { serverInstance: server };
        const executionContext: ExecutionContext = {
          waitUntil() {},
          passThroughOnException() {},
        };
        app.fetch(req, honoEnv, executionContext);
        if (token) {
          req.headers.set('Authorization', `Bearer ${token}`);
          // next();
          const honoEnv = { serverInstance: server };
          try {
            const executionContext: ExecutionContext = {
              waitUntil() {},
              passThroughOnException() {},
            };
            return await app.fetch(req, honoEnv, executionContext);
          } catch (error) {
            console.error('[Hono Fetch Error]', error);
            return new Response('Internal Server Error', { status: 500 });
          }
        }
      }

      if (url.pathname.includes('/public')) {
        const token = url.searchParams.get('token');
        if (token) req.headers.set('Authorization', `Bearer ${token}`);
      }
      if (url.pathname.includes('/public') || url.pathname.includes('/games')) {
        let fp = directory + new URL(req.url).pathname;
        if (fp.endsWith('/')) {
          fp += 'index.html';
        }
        return new Response(Bun.file(fp));
      }
      // WebSocket Upgrade Handling

      if (url.pathname === '/ws' || url.pathname === '/games/nolimit/ws/game') {
        let sessionId: string | null = null;
        // const authHeader = req.headers.get('Authorization');
        sessionId = url.searchParams.get('token');
        const key = url.searchParams.get('data');
        // if (authHeader?.startsWith('Bearer ')) sessionId = authHeader.substring(7);
        if (!sessionId) {
          console.warn('[WS Upgrade] Denied: No session ID found.');
          return new Response('Unauthorized: Authentication required.', {
            status: 401,
          });
        }
        req.headers.set('Authorization', sessionId as string);

        try {
          const session = await auth.api.getSession({
            headers: req.headers,
          });
          const user = session!.user;
          if (!session || !user || !user.id) {
            console.warn(`[WS Upgrade] Denied: Invalid session ID.`);
            return new Response('Unauthorized: Invalid session.', {
              status: 401,
            });
          }
          const upgradeResponse = wsRouter.upgrade({
            server,
            request: req,
            data: { userId: user.id, key },
          });
          if (upgradeResponse instanceof Response) return upgradeResponse;
          return new Response(null, { status: 101 });
        } catch (error: any) {
          if (error?.message === 'AUTH_INVALID_SESSION_ID') {
            console.warn(`[WS Upgrade] Denied: Invalid session ID (validation error)`);
            return new Response('Unauthorized: Invalid session.', {
              status: 401,
            });
          }
          console.error('[WS Upgrade] Error:', error);
          return new Response('Internal Server Error during upgrade.', {
            status: 500,
          });
        }
      }

      // Regular HTTP Request Handling
      const honoEnv = { serverInstance: server };
      try {
        const executionContext: ExecutionContext = {
          waitUntil() {},
          passThroughOnException() {},
        };
        return await app.fetch(req, honoEnv, executionContext);
      } catch (error) {
        console.error('[Hono Fetch Error]', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    },
    websocket: websocketHandler,
    error(error: ErrorLike): Response | Promise<Response> {
      console.error('[Bun Server Error]', error);
      return new Response(`Server error: ${error.message || 'Unknown error'}`, {
        status: 500,
      });
    },
  });

  // --- Post-Initialization ---
  wsRouter.setServer(serverInstance); // Inject server instance
  realtimeService.setServer(serverInstance); // Inject server instance
  realtimeService.startListening().catch((err) => {
    // Start listening AFTER server is set
    console.error('[Server] FATAL: Failed to start RealtimeService listening, exiting.', err);
    serverInstance.stop(true);
    process.exit(1);
  });
  // registerRoutes(app);
} catch (error) {
  console.error('[Server] FATAL: Failed to start:', error);
  process.exit(1);
}

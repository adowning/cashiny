import type { HeadersInit, Server, ServerWebSocket } from 'bun'
import { z, ZodObject, ZodType, ZodTypeAny, ZodLiteral } from 'zod'
import { type MessageMetadataSchema } from './schema' // Assuming schema.ts is in the same directory

// Context object passed to message handlers
export type MessageHandlerContext<
  Schema extends MessageSchemaType,
  Data extends AppWsData = AppWsData, // Changed WsData to AppWsData
> = {
  ws: ServerWebSocket<Data>
  meta: z.infer<Schema['shape']['meta']>
  send: SendFunction
  server: Server
} & (Schema['shape'] extends { payload: infer P }
  ? P extends ZodTypeAny
    ? { payload: z.infer<P> }
    : {}
  : {})

// Base WsData structure
export interface WsData {
  clientId: string // Automatically added by the router
  userId?: string // Made optional for flexibility (e.g. proxy before auth)
  key?: string // Generic key, purpose defined by handler (e.g. client's original 'data' param)
  currentRoomId?: string
  [key: string]: unknown // Allow other properties
}

// Application-specific WebSocket data, extending WsData
export type AppWsData = WsData & {
  // userId: string; // If userId is always expected after auth for non-proxy

  // NoLimit Proxy specific fields
  isNoLimitProxy?: boolean
  nolimitSessionKey?: string // Key from NLC FS for RC4
  nolimitRemoteWs?: WebSocket // WebSocket connection to NLC server
  nolimitMessageCounter?: number
  nolimitRememberedData?: { extPlayerKey?: string }
  // Parameters passed from client for NLC FS request
  nolimitGameCodeString?: string
  nolimitClientString?: string
  nolimitLanguage?: string
  nolimitToken?: string // For real money play
}

// Base type for Zod message schemas used in the router
export type MessageSchemaType = ZodObject<{
  type: ZodLiteral<string>
  meta: ZodType<z.infer<typeof MessageMetadataSchema>>
  payload?: ZodTypeAny
}>

// Type for the 'send' function provided to handlers
export type SendFunction = <Schema extends MessageSchemaType>(
  schema: Schema,
  payload: Schema['shape'] extends { payload: infer P }
    ? P extends ZodTypeAny
      ? z.infer<P>
      : unknown
    : unknown,
  meta?: Partial<Omit<z.infer<Schema['shape']['meta']>, 'clientId' | 'timestamp'>>
) => void

// Type signature for a message handler function
export type MessageHandler<Schema extends MessageSchemaType, Data extends AppWsData = AppWsData> = (
  context: MessageHandlerContext<Schema, Data>
) => void | Promise<void>

// Context for the 'open' event handler
export interface OpenHandlerContext<Data extends AppWsData = AppWsData> {
  ws: ServerWebSocket<Data>
  send: SendFunction
}

// Type signature for the 'open' handler
export type OpenHandler<Data extends AppWsData = AppWsData> = (
  context: OpenHandlerContext<Data>
) => void | Promise<void>

// Context for the 'close' event handler
export interface CloseHandlerContext<Data extends AppWsData = AppWsData> {
  ws: ServerWebSocket<Data>
  code: number
  reason?: string
  send: SendFunction
}

// Type signature for the 'close' handler
export type CloseHandler<Data extends AppWsData = AppWsData> = (
  context: CloseHandlerContext<Data>
) => void | Promise<void>

// Structure to hold schema and handler pairs internally in the router
export interface MessageHandlerEntry<Data extends AppWsData = AppWsData> {
  schema: MessageSchemaType
  handler: MessageHandler<MessageSchemaType, Data>
}

// Options for the WebSocketRouter constructor
export interface WebSocketRouterOptions {
  server?: Server
}

// Options specifically for the upgrade request handling
export interface UpgradeRequestOptions<T extends Omit<AppWsData, 'clientId'>> {
  // Changed to AppWsData
  server: Server
  request: Request
  data?: T
  headers?: HeadersInit
}

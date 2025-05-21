import type { Server, ServerWebSocket } from 'bun';
import { z, ZodObject, ZodType, ZodTypeAny, ZodLiteral } from 'zod';
import { messageSchema, type MessageMetadataSchema } from './schema'; // Assuming schema.ts is in the same directory

// Context object passed to message handlers
export type MessageHandlerContext<
  Schema extends MessageSchemaType,
  Data extends WsData = WsData,
> = {
  ws: ServerWebSocket<Data>;
  meta: z.infer<Schema['shape']['meta']>;
  send: SendFunction;
  server: Server; // Keep the server instance
} & (Schema['shape'] extends { payload: infer P } // If payload exists in schema shape
  ? P extends ZodTypeAny // And it's a Zod type
    ? { payload: z.infer<P> } // Then add { payload: <inferred type> }
    : {} // Otherwise (e.g., payload shape exists but isn't Zod), add empty object
  : {}); // If no payload shape in schema, add empty object

// Define the data structure attached to each WebSocket connection
// Ensure this includes everything needed, like userId obtained during auth.
export interface WsData {
  clientId: string; // Automatically added by the router
  userId?: string;
  key?: string;

  currentRoomId?: string; // Example: track the room the user is in
  // Add other relevant session data associated with the connection
  [key: string]: unknown;
}

// Base type for Zod message schemas used in the router
// Enforces structure: type literal, meta object, optional payload
export type MessageSchemaType = ZodObject<{
  type: ZodLiteral<string>;
  meta: ZodType<z.infer<typeof MessageMetadataSchema>>; // Ensure meta schema is compatible
  payload?: ZodTypeAny;
}>;

// Type for the 'send' function provided to handlers
// It ensures messages sent back match their Zod schemas
export type SendFunction = <Schema extends MessageSchemaType>(
  schema: Schema,
  payload: Schema['shape'] extends { payload: infer P }
    ? P extends ZodTypeAny
      ? z.infer<P>
      : unknown
    : unknown,
  // Allow overriding parts of the meta, clientId/timestamp are added automatically
  meta?: Partial<Omit<z.infer<Schema['shape']['meta']>, 'clientId' | 'timestamp'>>
) => void;

// Type signature for a message handler function
export type MessageHandler<Schema extends MessageSchemaType, Data extends WsData = WsData> = (
  context: MessageHandlerContext<Schema, Data>
) => void | Promise<void>;

// Context for the 'open' event handler
export interface OpenHandlerContext<Data extends WsData = WsData> {
  ws: ServerWebSocket<Data>;
  send: SendFunction;
}

// Type signature for the 'open' handler
export type OpenHandler<Data extends WsData = WsData> = (
  context: OpenHandlerContext<Data>
) => void | Promise<void>;

// Context for the 'close' event handler
export interface CloseHandlerContext<Data extends WsData = WsData> {
  ws: ServerWebSocket<Data>;
  code: number;
  reason?: string;
  send: SendFunction; // Might be less useful here, but potentially for last words
}

// Type signature for the 'close' handler
export type CloseHandler<Data extends WsData = WsData> = (
  context: CloseHandlerContext<Data>
) => void | Promise<void>;

// Structure to hold schema and handler pairs internally in the router
export interface MessageHandlerEntry<Data extends WsData = WsData> {
  schema: MessageSchemaType;
  handler: MessageHandler<MessageSchemaType, Data>;
}

// Options for the WebSocketRouter constructor
export interface WebSocketRouterOptions {
  server?: Server; // Optional: Pass Bun server instance if needed (e.g., for pub/sub)
  // Add any other router-level config if necessary
}

// Options specifically for the upgrade request handling
export interface UpgradeRequestOptions<T extends Omit<WsData, 'clientId'>> {
  server: Server;
  request: Request;
  data?: T; // Data to attach to the connection (userId MUST be included here)
  headers?: HeadersInit;
}

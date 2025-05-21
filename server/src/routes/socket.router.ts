/**
 * WebSocket Router (`apps/server/src/sockets/router.ts`)
 * Refactored Version
 */
// Adjust path if needed
import { UserLeft } from '@/sockets/schema';
import {
  CloseHandler,
  CloseHandlerContext,
  MessageHandler,
  MessageHandlerContext,
  MessageHandlerEntry,
  MessageSchemaType,
  OpenHandler,
  OpenHandlerContext,
  SendFunction,
  UpgradeRequestOptions,
  WsData,
} from '@/sockets/types';
import type { Server, ServerWebSocket, WebSocketHandler } from 'bun';
import { v4 as randomUUIDv7 } from 'uuid';
import { z } from 'zod';

// import type {
//   WsData,
//   MessageSchemaType,
//   MessageHandler,
//   MessageHandlerEntry,
//   OpenHandler,
//   CloseHandler,
//   SendFunction,
//   UpgradeRequestOptions,
//   MessageHandlerContext,
//   OpenHandlerContext,
//   CloseHandlerContext,
// } from "./types"; // Adjust path if needed
import { publish } from '../utils';
import { validateAndSend } from '../utils/ws.utils';
import { safeJsonParse, subscribeToTopic, unsubscribeFromTopic } from '../utils/ws.utils';

export class WebSocketRouter<T extends Omit<WsData, 'clientId'> = Record<string, never>> {
  // Server instance will be set after Bun.serve() returns
  private server!: Server; // Use definite assignment assertion `!`
  private isServerSet: boolean = false;

  private readonly openHandlers: OpenHandler<WsData & T>[] = [];
  private readonly closeHandlers: CloseHandler<WsData & T>[] = [];
  private readonly messageHandlers = new Map<string, MessageHandlerEntry<WsData & T>>();

  constructor(/* No server instance here initially */) {
    console.log('[WebSocketRouter] Initialized.');
    // Initialization without server instance
  }

  /**
   * Injects the Bun Server instance after it has been created.
   * This is crucial for enabling publish operations.
   */
  public setServer(server: Server): void {
    if (!server) {
      throw new Error('[WebSocketRouter] Invalid Server instance provided.');
    }
    if (this.isServerSet) {
      console.warn('[WebSocketRouter] Server instance is already set.');
      return;
    }
    this.server = server;
    this.isServerSet = true;
    console.log('[WebSocketRouter] Server instance has been set.');
  }

  /**
   * Registers a handler for the WebSocket 'open' event.
   */
  public onOpen(handler: OpenHandler<WsData & T>): this {
    this.openHandlers.push(handler);
    return this;
  }

  /**
   * Registers a handler for the WebSocket 'close' event.
   */
  public onClose(handler: CloseHandler<WsData & T>): this {
    this.closeHandlers.push(handler);
    return this;
  }

  /**
   * Registers a handler for a specific message type.
   */
  public onMessage<Schema extends MessageSchemaType>(
    schema: Schema,
    handler: MessageHandler<Schema, WsData & T>
  ): this {
    const messageType = schema.shape.type._def.value;
    if (!messageType || typeof messageType !== 'string') {
      console.error(
        "[WS Router] Schema must have a literal string 'type'. Invalid schema:",
        schema
      );
      return this;
    }
    if (this.messageHandlers.has(messageType)) {
      console.warn(`[WS Router] Overwriting handler for message type "${messageType}".`);
    }
    this.messageHandlers.set(messageType, {
      schema,
      handler: handler as MessageHandler<MessageSchemaType, WsData & T>,
    });
    return this;
  }

  /**
   * Handles the HTTP upgrade request. Requires the server instance.
   */
  public upgrade(options: UpgradeRequestOptions<T>) {
    // Ensure server instance is passed correctly during the actual upgrade process
    const { server, request, data, headers } = options;
    if (!server) {
      console.error('[WS Upgrade] Failed: Server instance missing in upgrade options.');
      return new Response('WebSocket upgrade configuration error', {
        status: 500,
      });
    }
    const clientId = randomUUIDv7();

    if (!data?.userId) {
      console.warn('[WS Upgrade] Denied: userId is missing in upgrade data.');
      return new Response('Unauthorized: userId required.', { status: 401 });
    }

    const wsData: WsData & T = { ...(data as T), clientId };

    const upgraded = server.upgrade(request, {
      data: wsData,
      headers: { 'X-Client-ID': clientId, ...headers },
    });

    if (!upgraded) {
      console.error('[WS Upgrade] Failed. Server did not upgrade request.');
      return new Response('WebSocket upgrade failed', { status: 500 });
    }
    // console.log(`[WS Upgrade] Successful for user ${wsData.userId}, client ${clientId}`);
    return undefined; // Bun handles the 101 response
  }

  // --- Private Handler Methods Bound to Bun's Websocket Interface ---

  private handleOpen(ws: ServerWebSocket<WsData & T>) {
    const { clientId, userId, isNoLimitProxy } = ws.data;
    console.log(`[WS OPEN] Connection opened: Client ${clientId}, User ${userId}`);

    if (!this.isServerSet) {
      console.error(
        `[WS OPEN] Server instance not set for Client ${clientId}. Cannot fully handle open event.`
      );
      // Optionally close the connection if server is required immediately
      // ws.close(1011, "Server configuration error");
      // return;
    }

    const send = this.createSendFunction(ws);
    // Subscribe user to their dedicated updates topic
    if (userId) {
      const userTopic = `user_${userId}_updates`;
      subscribeToTopic(ws, userTopic);
    } else {
      console.warn(
        `[WS OPEN] Cannot subscribe to user topic: userId missing for client ${clientId}`
      );
    }

    // Execute registered open handlers
    const context: OpenHandlerContext<WsData & T> = { ws, send };
    console.log(this.openHandlers);
    this.openHandlers.forEach((handler) => {
      try {
        // Add server to context if needed by specific open handlers
        // context.server = this.server;
        const result = handler(context);
        // console.log(result);
        if (result instanceof Promise) {
          result.catch((error) =>
            console.error(`[WS OPEN] Error in async open handler for ${clientId}:`, error)
          );
        }
      } catch (error) {
        console.error(`[WS OPEN] Error in sync open handler for ${clientId}:`, error);
      }
    });
  }

  private handleClose(ws: ServerWebSocket<WsData & T>, code: number, reason?: string) {
    const { clientId, userId, currentRoomId } = ws.data;
    console.log(
      `[WS CLOSE] Connection closed: Client ${clientId}, User ${userId}. Code: ${code}, Reason: ${reason || 'N/A'}`
    );

    // Ensure server instance is available for potential publish
    if (!this.isServerSet) {
      console.error(
        `[WS CLOSE] Server instance not set for Client ${clientId}. Cannot publish UserLeft.`
      );
    }

    // Unsubscribe user from their topic
    if (userId) {
      const userTopic = `user_${userId}_updates`;
      unsubscribeFromTopic(ws, userTopic, 'socketClosing');
    }

    // If user was in a room, unsubscribe and notify others
    if (this.isServerSet && userId && currentRoomId) {
      unsubscribeFromTopic(ws, currentRoomId, 'socketClosing');
      // Use the central publish utility, requires the server instance
      publish(ws, this.server, currentRoomId, UserLeft, {
        roomId: currentRoomId,
        userId,
      });
    } else if (userId && currentRoomId) {
      console.warn(
        `[WS CLOSE] Cannot publish UserLeft for user ${userId} in room ${currentRoomId}: Server instance not set yet.`
      );
    }

    // Execute registered close handlers
    const send = this.createSendFunction(ws);
    const context: CloseHandlerContext<WsData & T> = { ws, code, reason, send };
    this.closeHandlers.forEach((handler) => {
      try {
        // context.server = this.server; // Add if needed
        const result = handler(context);
        if (result instanceof Promise) {
          result.catch((error) =>
            console.error(`[WS CLOSE] Error in async close handler for ${clientId}:`, error)
          );
        }
      } catch (error) {
        console.error(`[WS CLOSE] Error in sync close handler for ${clientId}:`, error);
      }
    });
  }

  private handleMessage(ws: ServerWebSocket<WsData & T>, message: string | Buffer) {
    const { clientId } = ws.data;

    // Ensure server instance is set before processing messages if handlers need it
    if (!this.isServerSet) {
      console.error(
        `[WS MSG] Received message from Client ${clientId}, but server instance not set. Cannot process.`
      );
      // Optionally close or send an error
      // ws.close(1011, "Server not ready");
      return;
    }

    const parseResult = safeJsonParse(message);
    if (!parseResult.success || !parseResult.data) {
      console.warn(`[WS MSG] Failed parsing message from client ${clientId}`, parseResult.error);
      return;
    }

    const parsedMessage = parseResult.data;
    const messageType = parsedMessage.type as string;
    const handlerEntry = this.messageHandlers.get(messageType);

    if (!handlerEntry) {
      console.warn(`[WS MSG] No handler found for type "${messageType}" from client ${clientId}.`);
      return;
    }

    const { schema, handler } = handlerEntry;
    const validationResult = schema.safeParse(parsedMessage);

    if (!validationResult.success) {
      console.error(
        `[WS MSG] Validation failed for type "${messageType}" from client ${clientId}:`,
        validationResult.error.flatten()
      );
      return;
    }

    const validatedData = validationResult.data;
    const send = this.createSendFunction(ws);

    // Construct context, **including the server instance**
    // Construct the context object for the handler
    const context: MessageHandlerContext<MessageSchemaType, WsData & T> = {
      ws,
      meta: validatedData.meta,
      send,
      server: this.server, // <<<<< ADD THIS LINE >>>>>
      ...(validatedData.payload !== undefined && {
        payload: validatedData.payload,
      }),
    };
    try {
      const result = handler(context as any); // Cast needed due to generic handler storage
      if (result instanceof Promise) {
        result.catch((error) => {
          console.error(
            `[WS MSG] Unhandled rejection in handler for type "${messageType}" from client ${clientId}:`,
            error
          );
        });
      }
    } catch (error) {
      console.error(
        `[WS MSG] Error in handler for type "${messageType}" from client ${clientId}:`,
        error
      );
    }
  }

  /** Creates a validated `send` function scoped to a specific WebSocket connection. */
  private createSendFunction(ws: ServerWebSocket<WsData & T>): SendFunction {
    return <Schema extends MessageSchemaType>(
      schema: Schema,
      payload: Schema['shape'] extends { payload: infer P }
        ? P extends z.ZodTypeAny
          ? z.infer<P>
          : unknown
        : unknown,
      meta: Partial<Omit<z.infer<Schema['shape']['meta']>, 'clientId' | 'timestamp'>> = {}
    ) => {
      validateAndSend(ws, schema, payload, meta);
    };
  }

  /** Returns the WebSocket handler object required by `Bun.serve`. */
  public get websocket(): WebSocketHandler<WsData & T> {
    return {
      open: this.handleOpen.bind(this),
      close: this.handleClose.bind(this),
      message: this.handleMessage.bind(this),
    };
  }
}

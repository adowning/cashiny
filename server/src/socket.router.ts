/**
 * WebSocket Router (`apps/server/src/sockets/router.ts`)
 * Refactored Version to support NoLimit Proxy
 */
import type { Server, ServerWebSocket, WebSocketHandler } from 'bun'
import { v4 as randomUUIDv7 } from 'uuid' // Changed from uuid to v4
import { z } from 'zod'

import { UserLeft } from '@/sockets/schema' // Adjust path as needed
import type {
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
} from '@/sockets/types' // Adjust path as needed

import { publish } from './utils' // Adjust path as needed
import {
  validateAndSend,
  safeJsonParse,
  subscribeToTopic,
  unsubscribeFromTopic,
} from './utils/ws.utils' // Adjust path as needed
import {
  NoLimitProxyWsData,
  nolimitProxyMessageHandler,
} from './services/handlers/nolimit-proxy.handler' // Import proxy specific types and message handler

// Define a more specific type for AppWsData if it's consistent across your app
// This should include fields added by auth (userId) and potentially by proxy (isNoLimitProxy, etc.)
export type AppWsData = WsData & {
  userId?: string // Made optional as proxy might not have it initially or if auth fails
  key?: string // From original client request if any
  // NoLimit Proxy specific fields
  isNoLimitProxy?: boolean
  nolimitSessionKey?: string
  nolimitRemoteWs?: WebSocket // Standard WebSocket for outgoing
  nolimitMessageCounter?: number
  nolimitRememberedData?: { extPlayerKey?: string }
  nolimitGameCodeString?: string
  nolimitClientString?: string
  nolimitLanguage?: string
  nolimitToken?: string
}

export class WebSocketRouter<T extends AppWsData = AppWsData> {
  private server!: Server
  private isServerSet: boolean = false

  private readonly openHandlers: OpenHandler<T>[] = []
  private readonly closeHandlers: CloseHandler<T>[] = []
  private readonly messageHandlers = new Map<string, MessageHandlerEntry<T>>()

  constructor() {
    console.log('[WebSocketRouter] Initialized.')
  }

  public setServer(server: Server): void {
    if (!server) throw new Error('[WebSocketRouter] Invalid Server instance.')
    if (this.isServerSet) {
      console.warn('[WebSocketRouter] Server instance already set.')
      return
    }
    this.server = server
    this.isServerSet = true
    console.log('[WebSocketRouter] Server instance has been set.')
  }

  // public onOpen(handler: OpenHandler<T>): this {
  //   this.openHandlers.push(handler)
  //   return this
  // }

  // public onClose(handler: CloseHandler<T>): this {
  //   this.closeHandlers.push(handler)
  //   return this
  // }

  // public onMessage<Schema extends MessageSchemaType>(
  //   schema: Schema,
  //   handler: MessageHandler<Schema, T>
  // ): this {
  //   const messageType = schema.shape.type._def.value
  //   if (typeof messageType !== 'string') {
  //     console.error("[WS Router] Schema must have a literal string 'type'. Invalid schema:", schema)
  //     return this
  //   }
  //   if (this.messageHandlers.has(messageType)) {
  //     console.warn(`[WS Router] Overwriting handler for message type "${messageType}".`)
  //   }
  //   this.messageHandlers.set(messageType, {
  //     schema,
  //     handler: handler as MessageHandler<MessageSchemaType, T>,
  //   })
  //   return this
  // }

  public upgrade(options: UpgradeRequestOptions<Omit<T, 'clientId'>>) {
    const { server, request, data, headers } = options
    if (!server) {
      console.error('[WS Upgrade] Failed: Server instance missing.')
      return new Response('WebSocket upgrade configuration error', { status: 500 })
    }
    const clientId = randomUUIDv7() // Use v4 from uuid

    const wsData: T = { clientId, ...data } as T

    const upgraded = server.upgrade(request, {
      data: wsData,
      headers: { 'X-Client-ID': clientId, ...headers },
    })

    if (!upgraded) {
      console.error('[WS Upgrade] Failed. Server did not upgrade request.')
      return new Response('WebSocket upgrade failed', { status: 500 })
    }
    return undefined
  }

  private handleOpen(ws: ServerWebSocket<T>) {
    const { clientId, userId, isNoLimitProxy } = ws.data
    console.log(
      `[WS OPEN] Connection opened: Client ${clientId}, User ${userId}, Proxy: ${!!isNoLimitProxy}`
    )

    if (!this.isServerSet) {
      console.error(`[WS OPEN] Server instance not set for Client ${clientId}.`)
    }

    const send = this.createSendFunction(ws)
    if (userId && !isNoLimitProxy) {
      // Standard user topic subscription, not for proxy during its own setup
      subscribeToTopic(ws, `user_${userId}_updates`)
    }

    const context: OpenHandlerContext<T> = { ws, send }
    this.openHandlers.forEach((handler) => {
      try {
        const result = handler(context)
        if (result instanceof Promise) {
          result.catch((error) =>
            console.error(`[WS OPEN] Error in async open handler for ${clientId}:`, error)
          )
        }
      } catch (error) {
        console.error(`[WS OPEN] Error in sync open handler for ${clientId}:`, error)
      }
    })
  }

  // Updated handleClose signature to match Bun's WebSocketHandler type
  private handleClose(ws: ServerWebSocket<T>, code: number, reasonMessage: string) {
    const { clientId, userId, currentRoomId, isNoLimitProxy } = ws.data
    const displayReason = reasonMessage || 'N/A' // Use the string reason, provide default if empty
    console.log(
      `[WS CLOSE] Conn closed: Client ${clientId}, User ${userId}, Proxy: ${!!isNoLimitProxy}. Code: ${code}, Reason: ${displayReason}`
    )

    if (!this.isServerSet) {
      console.error(`[WS CLOSE] Server instance not set for Client ${clientId}.`)
    }

    if (userId && !isNoLimitProxy) {
      // Standard unsubscribe, not for proxy during its own teardown
      unsubscribeFromTopic(ws, `user_${userId}_updates`, 'socketClosing')
    }
    if (this.isServerSet && userId && currentRoomId && !isNoLimitProxy) {
      // Only for non-proxy chat rooms
      unsubscribeFromTopic(ws, currentRoomId, 'socketClosing')
      publish(ws, this.server, currentRoomId, UserLeft, { roomId: currentRoomId, userId })
    }

    const send = this.createSendFunction(ws)
    // Pass the string reason to the context
    const context: CloseHandlerContext<T> = { ws, code, reason: displayReason, send }
    this.closeHandlers.forEach((handler) => {
      try {
        const result = handler(context)
        if (result instanceof Promise) {
          result.catch((error) =>
            console.error(`[WS CLOSE] Error in async close handler for ${clientId}:`, error)
          )
        }
      } catch (error) {
        console.error(`[WS CLOSE] Error in sync close handler for ${clientId}:`, error)
      }
    })
  }

  private handleMessage(ws: ServerWebSocket<T>, message: string | Buffer) {
    const { clientId, isNoLimitProxy } = ws.data

    if (!this.isServerSet) {
      console.error(
        `[WS MSG] Received from Client ${clientId}, but server instance not set. Cannot process.`
      )
      return
    }

    // --- Conditional handling for NoLimit Proxy ---
    if (isNoLimitProxy) {
      // Ensure nolimitProxyMessageHandler is compatible with ServerWebSocket<NoLimitProxyWsData>
      // The cast here assumes that if isNoLimitProxy is true, ws.data conforms to NoLimitProxyWsData
      nolimitProxyMessageHandler(ws as ServerWebSocket<NoLimitProxyWsData>, message)
      return
    }
    // --- End of NoLimit Proxy specific handling ---

    // --- Standard Schema-based message handling ---
    const parseResult = safeJsonParse(message)
    if (!parseResult.success || !parseResult.data) {
      console.warn(
        `[WS MSG] Failed parsing JSON message from client ${clientId}`,
        parseResult.error
      )
      return
    }

    const parsedMessage = parseResult.data
    const messageType = parsedMessage.type as string
    const handlerEntry = this.messageHandlers.get(messageType)

    if (!handlerEntry) {
      console.warn(`[WS MSG] No handler for type "${messageType}" from client ${clientId}.`)
      return
    }

    const { schema, handler } = handlerEntry
    const validationResult = schema.safeParse(parsedMessage)

    if (!validationResult.success) {
      console.error(
        `[WS MSG] Validation failed for type "${messageType}" from client ${clientId}:`,
        validationResult.error.flatten()
      )
      return
    }

    const validatedData = validationResult.data
    const send = this.createSendFunction(ws)
    const context: MessageHandlerContext<MessageSchemaType, T> = {
      ws,
      meta: validatedData.meta,
      send,
      server: this.server,
      ...(validatedData.payload !== undefined && { payload: validatedData.payload }),
    }

    try {
      const result = handler(context as any) // Cast needed due to generic handler storage
      if (result instanceof Promise) {
        result.catch((error) =>
          console.error(
            `[WS MSG] Unhandled rejection in handler for "${messageType}" from ${clientId}:`,
            error
          )
        )
      }
    } catch (error) {
      console.error(`[WS MSG] Error in handler for "${messageType}" from ${clientId}:`, error)
    }
  }

  private createSendFunction(ws: ServerWebSocket<T>): SendFunction {
    return <Schema extends MessageSchemaType>(
      schema: Schema,
      payload: Schema['shape'] extends { payload: infer P }
        ? P extends z.ZodTypeAny
          ? z.infer<P>
          : unknown
        : unknown,
      meta: Partial<Omit<z.infer<Schema['shape']['meta']>, 'clientId' | 'timestamp'>> = {}
    ) => {
      validateAndSend(ws, schema, payload, meta)
    }
  }

  public get websocket(): WebSocketHandler<T> {
    return {
      open: this.handleOpen.bind(this),
      close: this.handleClose.bind(this), // This now matches the expected type
      message: this.handleMessage.bind(this),
    }
  }
}

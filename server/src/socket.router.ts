import type { Server, ServerWebSocket, WebSocketHandler } from 'bun'
import { v4 as randomUUIDv7 } from 'uuid'
import { z } from 'zod'
import {
  UserLeft,
  Ping,
  JoinRoom,
  SendMessage,
  SubscribeToTournamentTopic,
  UnsubscribeFromTournamentTopic,
  SubscribeToGeneralTournaments,
  UnsubscribeFromGeneralTournaments,
  GenericWsResponse,
} from '@/sockets/schema' //
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
} from '@/sockets/types' //
import {
  validateAndSend,
  safeJsonParse,
  subscribeToTopic, // Correct: No 'util' prefix
  unsubscribeFromTopic, // Correct: No 'util' prefix, and this is the function to use
} from './utils/ws.utils' //
import {
  NoLimitProxyWsData,
  nolimitProxyMessageHandler,
} from './services/handlers/nolimit-proxy.handler' //

import { handlePing } from './services/handlers/heartbeat.handler' //
import { handleJoinRoom, handleSendMessage } from './services/handlers/chat.handler' //
import {
  kagamingProxyOpenHandler,
  KaGamingProxyWsData,
} from './services/handlers/kagaming-proxy.handler'

export type AppWsData = WsData & {
  userId?: string
  username?: string
  key?: string
  isNoLimitProxy?: boolean
  nolimitSessionKey?: string
  nolimitRemoteWs?: WebSocket
  nolimitMessageCounter?: number
  nolimitRememberedData?: { extPlayerKey?: string }
  nolimitGameCodeString?: string
  nolimitClientString?: string
  nolimitLanguage?: string
  nolimitToken?: string
  subscribedTournamentTopics?: Set<string>
  mode?: string
  gameCodeString?: string
  kaToken?: string
  gameId?: string
  isKaGamingProxy?: boolean
}

// --- Tournament Topic Subscription Handlers ---

function handleSubscribeToTournamentTopic(
  context: MessageHandlerContext<typeof SubscribeToTournamentTopic, AppWsData>
) {
  const { ws, payload, send } = context
  const topic = `tournament:${payload.tournamentId}:${payload.topicType}`
  subscribeToTopic(ws, topic) // Corrected
  if (!ws.data.subscribedTournamentTopics) {
    ws.data.subscribedTournamentTopics = new Set()
  }
  ws.data.subscribedTournamentTopics.add(topic)
  console.log(`User ${ws.data.userId || ws.data.clientId} subscribed to ${topic}`)
  send(GenericWsResponse, { success: true, message: `Subscribed to ${topic}` })
}

function handleUnsubscribeFromTournamentTopic(
  context: MessageHandlerContext<typeof UnsubscribeFromTournamentTopic, AppWsData>
) {
  const { ws, payload, send } = context
  const topic = `tournament:${payload.tournamentId}:${payload.topicType}`
  unsubscribeFromTopic(ws, topic, 'Client request') // Corrected, using the correct function
  ws.data.subscribedTournamentTopics?.delete(topic)
  console.log(`User ${ws.data.userId || ws.data.clientId} unsubscribed from ${topic}`)
  send(GenericWsResponse, { success: true, message: `Unsubscribed from ${topic}` })
}

function handleSubscribeToGeneralTournaments(
  context: MessageHandlerContext<typeof SubscribeToGeneralTournaments, AppWsData>
) {
  const { ws, send } = context
  const topic = `tournaments:general`
  subscribeToTopic(ws, topic) // Corrected
  if (!ws.data.subscribedTournamentTopics) {
    ws.data.subscribedTournamentTopics = new Set()
  }
  ws.data.subscribedTournamentTopics.add(topic)
  console.log(`User ${ws.data.userId || ws.data.clientId} subscribed to ${topic}`)
  send(GenericWsResponse, { success: true, message: `Subscribed to ${topic}` })
}

function handleUnsubscribeFromGeneralTournaments(
  context: MessageHandlerContext<typeof UnsubscribeFromGeneralTournaments, AppWsData>
) {
  const { ws, send } = context
  const topic = `tournaments:general`
  unsubscribeFromTopic(ws, topic, 'Client request') // Corrected, using the correct function
  ws.data.subscribedTournamentTopics?.delete(topic)
  console.log(`User ${ws.data.userId || ws.data.clientId} unsubscribed from ${topic}`)
  send(GenericWsResponse, { success: true, message: `Unsubscribed from ${topic}` })
}

export class WebSocketRouter<T extends AppWsData = AppWsData> {
  private server: Server | null = null
  private messageHandlers: Map<string, MessageHandlerEntry<T>> = new Map()
  private openHandlers: OpenHandler<T>[] = []
  private closeHandlers: CloseHandler<T>[] = []

  constructor() {
    this.registerMessageHandler(Ping, handlePing as MessageHandler<typeof Ping, T>)
    this.registerMessageHandler(JoinRoom, handleJoinRoom as MessageHandler<typeof JoinRoom, T>)
    this.registerMessageHandler(
      SendMessage,
      handleSendMessage as MessageHandler<typeof SendMessage, T>
    )
    this.registerMessageHandler(
      SubscribeToTournamentTopic,
      handleSubscribeToTournamentTopic as MessageHandler<typeof SubscribeToTournamentTopic, T>
    )
    this.registerMessageHandler(
      UnsubscribeFromTournamentTopic,
      handleUnsubscribeFromTournamentTopic as MessageHandler<
        typeof UnsubscribeFromTournamentTopic,
        T
      >
    )
    this.registerMessageHandler(
      SubscribeToGeneralTournaments,
      handleSubscribeToGeneralTournaments as MessageHandler<typeof SubscribeToGeneralTournaments, T>
    )
    this.registerMessageHandler(
      UnsubscribeFromGeneralTournaments,
      handleUnsubscribeFromGeneralTournaments as MessageHandler<
        typeof UnsubscribeFromGeneralTournaments,
        T
      >
    )

    this.addOpenHandler(this.defaultOpenHandler.bind(this))
    this.addCloseHandler(this.defaultCloseHandler.bind(this))
  }

  public setServer(server: Server): void {
    this.server = server
  }

  public registerMessageHandler<Schema extends MessageSchemaType>(
    schema: Schema,
    handler: MessageHandler<Schema, T>
  ): void {
    const messageType = schema.shape.type.value
    if (this.messageHandlers.has(messageType)) {
      console.warn(`Message handler for type "${messageType}" is being overwritten.`)
    }
    this.messageHandlers.set(messageType, {
      schema: schema as MessageSchemaType,
      handler: handler as MessageHandler<MessageSchemaType, T>,
    })
  }

  public addOpenHandler(handler: OpenHandler<T>): void {
    this.openHandlers.push(handler)
  }

  public addCloseHandler(handler: CloseHandler<T>): void {
    this.closeHandlers.push(handler)
  }

  public upgrade(options: UpgradeRequestOptions<Omit<T, 'clientId'>>): string | null {
    const { server, request, data, headers } = options
    const clientId = randomUUIDv7()
    const success = server.upgrade(request, {
      data: { ...data, clientId, subscribedTournamentTopics: new Set() } as T,
      headers,
    })
    return success ? clientId : null
  }

  private async defaultOpenHandler(context: OpenHandlerContext<T>): Promise<void> {
    const { ws } = context
    console.log(`WebSocket opened: ${ws.data.clientId}, UserID: ${ws.data.userId || 'Guest'}`)
    subscribeToTopic(ws, 'global') // Corrected
    if (ws.data.userId) {
      subscribeToTopic(ws, `user:${ws.data.userId}`) // Corrected
    }
  }

  private async defaultCloseHandler(context: CloseHandlerContext<T>): Promise<void> {
    const { ws, reason } = context // Ensure 'reason' is destructured
    // Unsubscribe from all tracked topics on close
    if (ws.data.subscribedTournamentTopics) {
      ws.data.subscribedTournamentTopics.forEach((topic) => {
        unsubscribeFromTopic(ws, topic, reason || 'Connection closed') // Corrected, using correct function and reason
      })
      ws.data.subscribedTournamentTopics.clear()
    }
    unsubscribeFromTopic(ws, 'global', reason || 'Connection closed') // Corrected
    if (ws.data.userId) {
      unsubscribeFromTopic(ws, `user:${ws.data.userId}`, reason || 'Connection closed') // Corrected
    }

    if (ws.data.currentRoomId && ws.data.userId && this.server && ws.data.username) {
      this.server.publish(
        ws.data.currentRoomId,
        JSON.stringify({
          type: UserLeft.shape.type.value,
          payload: { userId: ws.data.userId, username: ws.data.username },
          meta: { timestamp: new Date().toISOString() },
        })
      )
    }
  }

  private async handleOpen(ws: ServerWebSocket<T>): Promise<void> {
    const send = this.createSendFunction(ws)
    const context: OpenHandlerContext<T> = { ws, send }
    for (const handler of this.openHandlers) {
      try {
        await handler(context)
      } catch (error) {
        console.error(`Error in open handler for ${ws.data.clientId}:`, error)
      }
    }
  }

  private async handleClose(
    ws: ServerWebSocket<T>,
    code: number,
    reasonMessage: string
  ): Promise<void> {
    console.log(
      `WebSocket closed: ${ws.data.clientId}, UserID: ${ws.data.userId || 'Guest'}, Code: ${code}, Reason: ${reasonMessage}`
    )
    const send = this.createSendFunction(ws)
    // Pass the actual reason message from the close event to the context
    const context: CloseHandlerContext<T> = { ws, code, reason: reasonMessage, send }

    for (const handler of this.closeHandlers) {
      try {
        await handler(context)
      } catch (error) {
        console.error(`Error in close handler for ${ws.data.clientId}:`, error)
      }
    }
  }

  private async handleMessage(ws: ServerWebSocket<T>, message: string | Buffer): Promise<void> {
    if (ws.data.isNoLimitProxy && typeof nolimitProxyMessageHandler === 'function') {
      nolimitProxyMessageHandler(ws as ServerWebSocket<NoLimitProxyWsData>, message)
      return
    }
    console.log('message')
    if (ws.data.isKaGamingProxy && typeof kagamingProxyOpenHandler === 'function') {
      kagamingProxyOpenHandler(ws as ServerWebSocket<KaGamingProxyWsData>, message)
      return
    }
    const messageString = message instanceof Buffer ? message.toString() : message
    const parseResult = safeJsonParse(messageString)

    if (!parseResult.success || !parseResult.data) {
      console.warn(
        `Received malformed or unparseable WebSocket message from ${ws.data.clientId}: ${messageString}`,
        parseResult.error
      )
      const send = this.createSendFunction(ws)
      send(GenericWsResponse, {
        success: false,
        message: 'Malformed WebSocket message.',
        details: { error: parseResult.error?.message },
      })
      return
    }

    const actualMessageData = parseResult.data

    if (typeof actualMessageData.type !== 'string') {
      console.warn(
        `Parsed WebSocket message from ${ws.data.clientId} lacks a string 'type' property:`,
        actualMessageData
      )
      const send = this.createSendFunction(ws)
      send(GenericWsResponse, {
        success: false,
        message: "Message 'type' property is missing or not a string.",
      })
      return
    }

    const entry = this.messageHandlers.get(actualMessageData.type)
    if (entry) {
      try {
        const validatedMessage = entry.schema.parse(actualMessageData)

        const send = this.createSendFunction(ws)
        const context: MessageHandlerContext<MessageSchemaType, T> = {
          ws,
          ...(validatedMessage as any),
          send,
          server: this.server!,
        }
        await entry.handler(context)
      } catch (error) {
        console.error(
          `Error processing WebSocket message type ${actualMessageData.type} from ${ws.data.clientId}:`,
          error
        )
        const send = this.createSendFunction(ws)
        if (error instanceof z.ZodError) {
          send(GenericWsResponse, {
            success: false,
            message: 'Invalid message structure or payload.',
            details: error.flatten(),
          })
        } else if (error instanceof Error) {
          send(GenericWsResponse, {
            success: false,
            message: error.message || 'Failed to process message.',
          })
        } else {
          send(GenericWsResponse, {
            success: false,
            message: 'An unknown error occurred while processing the message.',
          })
        }
      }
    } else {
      console.warn(
        `No WebSocket message handler registered for type "${actualMessageData.type}" from ${ws.data.clientId}`
      )
      const send = this.createSendFunction(ws)
      send(GenericWsResponse, {
        success: false,
        message: `Unknown message type: ${actualMessageData.type}`,
      })
    }
  }

  private createSendFunction(ws: ServerWebSocket<T>): SendFunction {
    return (schema, payload, meta) => {
      validateAndSend(ws, schema, payload, meta)
    }
  }

  public get websocket(): WebSocketHandler<T> {
    return {
      open: (ws) => this.handleOpen(ws as ServerWebSocket<T>),
      message: (ws, message) => this.handleMessage(ws as ServerWebSocket<T>, message),
      close: (ws, code, reason) => this.handleClose(ws as ServerWebSocket<T>, code, reason),
    }
  }
}

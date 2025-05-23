// apps/server/src/services/realtime.service.ts
import { PendingEvent, PgRealtimeClientOptions } from '@/services/dbupdates/types'
import PgRealtimeClient from '@/services/update.service'
import type { Server } from 'bun'

import { DatabaseUpdate } from '../sockets/schema'
import { validateAndPublish } from '../utils/ws.utils'

export class RealtimeService {
  private pgClient: PgRealtimeClient
  // Server instance is needed for publish, use definite assignment `!`
  private server!: Server
  private isServerSet: boolean = false // Track if server has been set

  // MODIFIED CONSTRUCTOR: Only takes options now
  constructor(options: PgRealtimeClientOptions) {
    console.log('[RealtimeService] Initializing PgRealtimeClient...')
    this.pgClient = new PgRealtimeClient(options)
    this._registerPgClientErrorHandlers() // Register error handlers early
  }

  /**
   * Injects the Bun Server instance after it has been created.
   */
  public setServer(server: Server): void {
    if (!server) {
      throw new Error('[RealtimeService] Invalid Server instance provided.')
    }
    if (this.isServerSet) {
      console.warn('[RealtimeService] Server instance is already set.')
      return
    }
    this.server = server
    this.isServerSet = true
    console.log('[RealtimeService] Server instance has been set.')
  }

  private _registerPgClientErrorHandlers(): void {
    // Register error handlers for the underlying client
    if (this.pgClient?.subscriber?.events) {
      this.pgClient.subscriber.events.on('error', (err) => {
        console.error('[RealtimeService] pg-listen subscriber error:', err)
      })
    } else {
      console.warn(
        '[RealtimeService] Cannot register subscriber error handler - subscriber not ready.'
      )
    }
    if (this.pgClient?.pool) {
      this.pgClient.pool.on('error', (err) => {
        console.error('[RealtimeService] pg pool error:', err)
      })
    } else {
      console.warn('[RealtimeService] Cannot register pool error handler - pool not ready.')
    }
  }

  /**
   * Connects to the database and starts listening for notifications.
   * Should be called AFTER setServer has been called.
   */
  public async startListening(): Promise<void> {
    // Ensure server instance is set before proceeding
    if (!this.isServerSet) {
      console.error('[RealtimeService] Cannot start listening: Server instance not set.')
      throw new Error(
        'RealtimeService requires the server instance to be set before starting listeners.'
      )
    }
    try {
      console.log('[RealtimeService] Connecting and setting up DB listeners...')
      this._setupTableListeners() // Define listeners
      await this.pgClient.listen() // Connect and listen to channel
      console.log(`[RealtimeService] Listening for DB changes on channel: ${this.pgClient.channel}`)
    } catch (error) {
      console.error('[RealtimeService] Failed to start listening:', error)
      throw error
    }
  }

  // ... (rest of the methods: _setupTableListeners, _handleRawDbEvent, publishDbUpdate, stopListening)
  // Ensure publishDbUpdate uses `this.server` and checks `this.isServerSet`

  private _setupTableListeners(): void {
    // ... listeners using this.pgClient.table(...).on(...) ...
    this.pgClient.table('user', { schema: 'public' }).on('*', (event) => {
      if (Array.isArray(event)) {
        event.forEach((e) => this._handleRawDbEvent(e as PendingEvent))
      } else {
        this._handleRawDbEvent(event as PendingEvent)
      }
    })
    this.pgClient.table('Profile', { schema: 'public' }).on('*', (event) => {
      if (Array.isArray(event)) {
        event.forEach((e) => this._handleRawDbEvent(e as PendingEvent))
      } else {
        this._handleRawDbEvent(event as PendingEvent)
      }
    })
  }

  private _handleRawDbEvent(event: PendingEvent): void {
    // ... logic to extract userId and create updatePayload ...
    let userId: string | undefined

    // Extract userId based on event.table
    switch (event.table) {
      case 'user':
        userId = event.primaryKeyData?.id ?? event.data?.id
        break
      case 'Profile':
        userId = event.data?.userId ?? event.primaryKeyData?.userId
        break
      default:
        console.warn(`[RealtimeService] No userId extraction logic for table: ${event.table}`)
        return
    }

    if (!userId) {
      console.warn(`[RealtimeService] Could not determine userId for event:`, event)
      return
    }
    const columnNamesChanged = event?.columnNamesChanged?.filter(function (item) {
      return item !== 'updatedAt'
    })
    const updatePayload = {
      table: event.table,
      operation: event.operation,
      recordId: event.primaryKeyData?.id ?? event.data?.id ?? 'unknown',
      data: event.data,
      columnNamesChanged,
    }
    // let message: any;

    // const message = updatePayload;

    this.publishDbUpdate(userId, updatePayload)
  }

  private publishDbUpdate(
    userId: string,
    payload: any //z.infer<typeof DatabaseUpdate.shape>
  ): void {
    if (!this.isServerSet) {
      console.error(
        `[RealtimeService] Cannot publish update for user ${userId}: Server instance not set.`
      )
      return
    }

    const userTopic = `user_${userId}_updates`
    try {
      const messageType = 'DATABASE_UPDATE'
      validateAndPublish(this.server, userTopic, DatabaseUpdate, messageType, payload, {
        timestamp: Date.now(),
      })
      //  (validatedMessage) => {
      //   this.server.publish(userTopic, JSON.stringify(validatedMessage));
      // });
    } catch (error) {
      console.error(`[RealtimeService] Error publishing to topic "${userTopic}":`, error)
    }
  }

  public async stopListening(): Promise<void> {
    console.log('[RealtimeService] Stopping database listeners...')
    try {
      // pg-listen v9 doesn't require explicit subscriber closing like older versions might have.
      // Closing the pool should handle underlying connections. Check pg-listen docs if issues arise.
      if (this.pgClient?.pool) {
        await this.pgClient.pool.end() // Close the database connection pool
      }
      console.log('[RealtimeService] Listeners stopped.')
    } catch (error) {
      console.error('[RealtimeService] Error stopping listeners:', error)
    }
  }
}

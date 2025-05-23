import { PendingEvent, PgRealtimeClientOptions } from '@/services/dbupdates/types'
import PgRealtimeClient from '@/services/update.service'
import type { ServerWebSocket } from 'bun'

export class DBListenerService<T extends Record<string, unknown>> {
  private pgClient: PgRealtimeClient
  private connectedClients: Map<string, ServerWebSocket<T>> = new Map()

  constructor(options: PgRealtimeClientOptions) {
    this.pgClient = new PgRealtimeClient(options)
    this.setupListeners()

    // Initialize deposit expiration job
    import('@/services/transactions/deposit.service')
      .then(({ initDepositExpirationJob }) => {
        initDepositExpirationJob()
      })
      .catch((err) => {
        console.error('Failed to initialize deposit expiration:', err)
      })
  }

  private setupListeners(): void {
    try {
      this.pgClient._createSubscriber()

      // Listen to user table updates
      this.pgClient
        .table('user', { schema: 'public' })
        .onUpdate((data: unknown) => this.handleDatabaseUpdate(data))

      // Listen to profiles table updates
      this.pgClient
        .table('profiles', { schema: 'public' })
        .onUpdate((data: unknown) => this.handleDatabaseUpdate(data))

      this.pgClient.listen()
    } catch (error) {
      console.error('Failed to setup database listeners:', error)
      throw error
    }
  }

  public addClient(ws: ServerWebSocket<T>): void {
    if (ws.data.userId) {
      this.connectedClients.set(ws.data.userId as string, ws)
    }
  }

  public removeClient(userId: string): void {
    this.connectedClients.delete(userId)
  }

  private handleDatabaseUpdate(data: unknown): void {
    const event = data as PendingEvent

    if (event.table === 'user') {
      const userId = event.primaryKeyData['id']
      const client = this.connectedClients.get(userId)
      client?.send(JSON.stringify(data))
    } else if (event.table === 'profiles') {
      const userId = event.data.userId
      const client = this.connectedClients.get(userId)
      client?.send(JSON.stringify(data))
    }
  }

  public async close(): Promise<void> {
    try {
      // Properly clean up Postgres connection
      if (this.pgClient) {
        // Close the subscriber connection
        await this.pgClient.subscriber.close()
        // End the connection pool
        await this.pgClient.pool.end()
      }
      this.connectedClients.clear()
    } catch (error) {
      console.error('Error closing DBListenerService:', error)
    }
  }
}

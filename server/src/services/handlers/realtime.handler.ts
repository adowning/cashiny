// apps/server/src/services/realtime.service.ts
import { PgRealtimeClientOptions } from '@/services/dbupdates/types';
import PgRealtimeClient from '@/services/update.service';
import { DatabaseUpdate } from '@/sockets/schema';
import type { Server } from 'bun';
import { z } from 'zod';

// Define a type for the payload received from pg_notify
// Matches the structure in your SQL functions
interface DbNotificationPayload {
  timestamp: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  data: Record<string, any>; // The new/deleted row data as JSON
  primaryKeyData: { id: string | number }; // Assuming 'id' is always the PK here
  columnNamesChanged?: string[]; // Only for UPDATE
}

export class RealtimeService {
  private pgClient: PgRealtimeClient;
  private server!: Server;
  private isServerSet: boolean = false;
  private notificationChannel: string; // Store the channel name

  constructor(options: PgRealtimeClientOptions) {
    console.log('[RealtimeService] Initializing PgRealtimeClient...');
    // Ensure channel is provided in options, use default if necessary
    this.notificationChannel = options.channel || 'spec_data_change'; // Match SQL
    options.channel = this.notificationChannel; // Ensure options passed to client have it
    this.pgClient = new PgRealtimeClient(options);
    this._registerPgClientErrorHandlers();
  }

  public setServer(server: Server): void {
    if (!server) throw new Error('[RealtimeService] Invalid Server instance.');
    if (this.isServerSet) {
      console.warn('[RealtimeService] Server instance already set.');
      return;
    }
    this.server = server;
    this.isServerSet = true;
    console.log('[RealtimeService] Server instance has been set.');
  }

  private _registerPgClientErrorHandlers(): void {
    // ... (same error handling as before) ...
    if (this.pgClient?.subscriber?.events) {
      this.pgClient.subscriber.events.on('error', (err: any) =>
        console.error('[RealtimeService] pg-listen subscriber error:', err)
      );
    }
    if (this.pgClient?.pool) {
      this.pgClient.pool.on('error', (err: any) =>
        console.error('[RealtimeService] pg pool error:', err)
      );
    }
  }

  /**
   * Connects to the database and starts listening for notifications on the specified channel.
   */
  public async startListening(): Promise<void> {
    if (!this.isServerSet) {
      throw new Error(
        'RealtimeService requires the server instance to be set before starting listeners.'
      );
    }
    try {
      console.log(
        `[RealtimeService] Setting up listener for channel: ${this.notificationChannel}...`
      );

      // Remove the old _setupTableListeners() call

      // Register the notification handler for the specific channel
      this.pgClient.subscriber.notifications.on(this.notificationChannel, (payload: unknown) => {
        // Payload from pg_notify is initially unknown
        this._handleDbNotification(payload as DbNotificationPayload);
      });

      // Connect the subscriber and listen (pgClient.listen handles both)
      await this.pgClient.listen();

      console.log(
        `[RealtimeService] Successfully listening for DB changes on channel: ${this.notificationChannel}`
      );
    } catch (error) {
      console.error('[RealtimeService] Failed to start listening:', error);
      throw error;
    }
  }

  /**
   * Handles raw notification payloads received from the database channel.
   */
  private _handleDbNotification(payload: DbNotificationPayload | unknown): void {
    // console.log("[RealtimeService] Received raw DB notification:", payload); // Debugging

    // Basic type guard to ensure payload is likely what we expect
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('table' in payload) ||
      !('operation' in payload) ||
      !('data' in payload)
    ) {
      console.warn('[RealtimeService] Received unexpected notification payload format:', payload);
      return;
    }

    const notification = payload as DbNotificationPayload; // Cast after check
    let userId: string | undefined;

    try {
      // Determine userId based on the table name from the notification payload
      switch (notification.table) {
        case 'user':
          // Check primaryKeyData first, then data
          userId = notification.primaryKeyData?.id?.toString() ?? notification.data?.id?.toString();
          break;
        case 'profiles': // Assuming your table name is 'profiles' based on SQL
          // Check data for userId first (common pattern), then primaryKeyData if Profile ID = User ID
          userId =
            notification.data?.userId?.toString() ?? notification.primaryKeyData?.id?.toString();
          break;
        // Add cases for other tables if they use the same notification channel
        default:
          console.warn(
            `[RealtimeService] No userId extraction logic configured for table: ${notification.table}`
          );
          return;
      }

      if (!userId) {
        console.warn(
          `[RealtimeService] Could not determine userId for notification:`,
          notification
        );
        return;
      }

      // Construct the payload for the WebSocket DATABASE_UPDATE message
      const updatePayload: z.infer<typeof DatabaseUpdate.shape.data> = {
        table: notification.table,
        operation: notification.operation,
        // Use primary key from notification if available, otherwise fallback
        recordId: notification.primaryKeyData?.id ?? 'unknown',
        // Pass the actual row data. Filter sensitive fields if needed.
        data: notification.data,
        // Optional: Include changed columns if needed by client
        // changedColumns: notification.columnNamesChanged,
      };

      // Publish the validated update to the specific user's topic
      this.publishDbUpdate(userId, updatePayload);
    } catch (error) {
      console.error(
        '[RealtimeService] Error processing DB notification:',
        error,
        'Payload:',
        notification
      );
    }
  }

  // publishDbUpdate remains the same - validates against DatabaseUpdate schema and publishes
  private publishDbUpdate(
    userId: string,
    payload: z.infer<typeof DatabaseUpdate.shape.data>
  ): void {
    if (!this.isServerSet) {
      console.error(
        `[RealtimeService] Cannot publish update for user ${userId}: Server instance not set.`
      );
      return;
    }
    const message = {
      type: 'DATABASE_UPDATE',
      meta: { timestamp: Date.now() },
      payload,
    };
    const validationResult = DatabaseUpdate.safeParse(message);

    if (!validationResult.success) {
      console.error(
        `[RealtimeService]x Failed to validate DATABASE_UPDATE for userId ${userId}:`,
        validationResult.error.flatten()
      );
      return;
    }
    const userTopic = `user_${userId}_updates`;
    try {
      const publishedBytes = this.server.publish(userTopic, JSON.stringify(validationResult.data));
    } catch (error) {
      console.error(`[RealtimeService] Error publishing to topic "${userTopic}":`, error);
    }
  }

  // stopListening remains the same
  public async stopListening(): Promise<void> {
    // ... (same as before) ...
    console.log('[RealtimeService] Stopping database listeners...');
    try {
      if (this.pgClient?.pool) {
        await this.pgClient.pool.end();
      }
      console.log('[RealtimeService] Listeners stopped.');
    } catch (error) {
      console.error('[RealtimeService] Error stopping listeners:', error);
    }
  }
}

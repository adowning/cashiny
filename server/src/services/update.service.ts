import { Pool } from 'pg';
import createSubscriber, { Subscriber } from 'pg-listen';

import config from './dbupdates/config';
import logger from './dbupdates/logger';
import Table from './dbupdates/table';
import {
  PendingEvent,
  PgRealtimeClientOptions,
  StringKeyMap,
  TableOptions,
} from './dbupdates/types';
import { formatTablePath } from './dbupdates/utils/formatters';

const DEFAULT_OPTIONS = {
  user: config.defaults.DB_USER,
  password: config.defaults.DB_PASSWORD,
  host: config.defaults.DB_HOST,
  port: config.defaults.DB_P0RT,
  database: config.defaults.DB_NAME,
  minPoolConnections: config.defaults.MIN_POOL_CONNECTIONS,
  maxPoolConnections: config.defaults.MAX_POOL_CONNECTIONS,
  channel: config.defaults.CHANNEL,
  bufferInterval: config.defaults.BUFFER_INTERVAL,
  maxBufferSize: config.defaults.MAX_BUFFER_SIZE,
  onError: (err: Error) => {},
};

/**
 * Pg Realtime Client.
 *
 * A Javascript client for subscribing to realtime changes in
 * your Postgres tables broadcasted by the triggers Pg adds.
 */
export default class PgRealtimeClient {
  options: PgRealtimeClientOptions;

  pool: Pool;

  subscriber: Subscriber;

  tables: { [key: string]: Table };

  get connectionConfig(): StringKeyMap {
    const { user, password, host, port, database } = this.options;
    return { user, password, host, port, database };
  }

  get defaultTableOptions(): TableOptions {
    const { bufferInterval, maxBufferSize, onError } = this.options;
    return {
      schema: config.defaults.TABLE_SCHEMA,
      bufferInterval,
      maxBufferSize,
      onError,
    };
  }

  get channel(): string {
    return this.options.channel!;
  }

  /**
   * Create a new client instance.
   */
  constructor(options?: PgRealtimeClientOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...(options || {}) };
    this.pool = this._createConnectionPool();
    this.subscriber = this._createSubscriber();
    this.tables = {};
  }

  /**
   * Subscribe to the configured Postgres notification channel.
   */
  async listen() {
    try {
      await this.subscriber.connect();
      await this.subscriber.listenTo(this.channel);
      console.log(`Realtime connnection succeeded`);
    } catch (err) {
      logger.error(`Realtime connection error: ${err}`);
      this._onError(err as Error);
    }
  }

  /**
   * Create and return a new table reference.
   */
  table(name: string, options?: TableOptions): Table {
    options = { ...this.defaultTableOptions, ...(options || {}) };
    const path = formatTablePath(options.schema!, name);

    let table = this.tables[path];
    if (table) return table;

    table = new Table(name, this.pool, options);
    this.tables[path] = table;

    return table;
  }

  _createSubscriber(): Subscriber {
    const subscriber = createSubscriber(this.connectionConfig);

    // Register error handler.
    subscriber.events.on('error', (err) => {
      logger.error(`Realtime table event error: ${err}`);
      this._onError(err);
    });

    // Register event handler.
    subscriber.notifications.on(this.channel, (event) => event && this._onEvent(event));

    return subscriber;
  }

  _createConnectionPool(): Pool {
    // Create new connection pool with min/max config.
    const pool = new Pool({
      ...this.connectionConfig,
      min: this.options.minPoolConnections!,
      max: this.options.maxPoolConnections!,
    });

    // Register error handler.
    pool.on('error', (err) => {
      logger.error(`Realtime pg pool error: ${err}`);
      this._onError(err);
    });

    return pool;
  }

  _onEvent(event: PendingEvent) {
    console.log('_onEvent ', event);
    let path = formatTablePath(event.schema, event.table);
    let tweakedTable = event.table;
    if (tweakedTable.charAt(tweakedTable.length - 1) == 's')
      tweakedTable = tweakedTable.slice(0, tweakedTable.length - 1);
    event.table = tweakedTable;
    path = formatTablePath(event.schema, event.table);
    const table = this.tables[path];
    table && table._newPendingEvent(event);
  }

  _onError(err: Error) {
    const handler = this.options.onError;
    handler && handler(err);
  }
}

// import { Client } from "pg";
// import * as dotenv from "dotenv"; // For loading environment variables
// import { Database } from "bun:sqlite"; // Bun's built-in SQLite support
// import * as path from "path"; // For resolving file paths
// import { Subject } from "rxjs"; // Import Subject from RxJS
// import { debounceTime } from "rxjs/operators"; // Import debounceTime operator
// // import ZilaClient from "../core/ZilaClient";/
// import { server } from "../server";

// dotenv.config(); // Load environment variables from .env file

// // Database connection configuration for PostgreSQL
// const pgConfig = {
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT || "5434", 10),
//   database: process.env.DB_NAME,
// };

// // SQLite database configuration
// const sqliteDbPath = path.resolve(__dirname, "updates.sqlite"); // Path to your SQLite database file
// let db: any; // Variable to hold the SQLite database instance

// const channelName = "stats_updates"; // Must match the channel name(s) in the trigger(s)

// // --- Reactive Changes Source ---
// // Use a Subject to push updates whenever changes occur
// const changesSubject = new Subject<any>(); // Subject that emits the updated 'changes' object

// // --- Debounced Observable ---
// // Create an observable from the Subject and apply the debounceTime operator
// export const debouncedChanges$ = changesSubject.pipe(
//   debounceTime(500) // Debounce for 500 milliseconds
// );

// // --- Object to accumulate changes ---
// // This object will temporarily hold changes before they are emitted by the debounced observable
// export const changes: { user: any[]; profile: any[] } = {
//   user: [],
//   profile: [],
// };
// export const changeMap: Map<string, { user: any[]; profile: any[] }> = new Map<
//   string,
//   { user: any[]; profile: any[] }
// >();
// export const clientMap: Map<string, ZilaClient> = new Map<string, ZilaClient>();

// // Map to store subscribers for each user ID
// const subscribers = new Map<string, Subject<any>>();

// function initializeSqliteDb() {
//   db = new Database(sqliteDbPath);

//   // Create tables if they don't exist
//   db.exec(`
//     CREATE TABLE IF NOT EXISTS listener_state (
//       key TEXT PRIMARY KEY,
//       last_event_id INTEGER
//     );

//     CREATE TABLE IF NOT EXISTS event_log (
//       id INTEGER PRIMARY KEY,
//       table_name TEXT NOT NULL,
//       row_id TEXT NOT NULL,
//       operation TEXT NOT NULL,
//       payload TEXT NOT NULL
//     );
//   `);
//   console.log("SQLite database initialized with required tables.");
// }

// // Function to get the last processed event ID from SQLite
// async function getLastProcessedEventId(): Promise<number> {
//   try {
//     const row = db.prepare("SELECT last_event_id FROM listener_state WHERE key = ?").get("lastProcessedEventId");
//     return row ? row.last_event_id : 0; // Return the stored ID or 0 if not found
//   } catch (error) {
//     console.error("Error fetching last processed event ID from SQLite:", error);
//     return 0; // Return 0 in case of error to attempt catch-up from the beginning
//   }
// }

// // Function to save the last processed event ID to SQLite
// async function saveLastProcessedEventId(eventId: number): Promise<void> {
//   try {
//     // Use INSERT OR REPLACE to handle both initial insertion and updates
//     db.prepare("INSERT OR REPLACE INTO listener_state (key, last_event_id) VALUES (?, ?)").run(
//       "lastProcessedEventId",
//       eventId
//     );
//   } catch (error) {
//     console.error("Error saving last processed event ID to SQLite:", error);
//     // Implement retry logic or alert mechanism if saving fails
//   }
// }

// // Function to connect to the PostgreSQL database and set up the listener
// let pgClient: Client | null = null;

// async function connectAndListen() {
//   if (pgClient) {
//     console.log("Already connected to PostgreSQL database.");
//     return;
//   }

//   pgClient = new Client(pgConfig);

//   try {
//     await pgClient.connect();
//     console.log("Connected to PostgreSQL database.");

//     // --- Durability: Catch up on missed events ---
//     const lastId = await getLastProcessedEventId();
//     console.log(`Last processed event ID: ${lastId}`);

//     // Query the event_log table for events that occurred since the last processed ID
//     const catchUpQuery = `SELECT id, table_name, row_id, operation, payload FROM event_log WHERE id > $1 ORDER BY id ASC`;
//     const catchUpResult = await pgClient.query(catchUpQuery, [lastId]);

//     console.log(`Found ${catchUpResult.rows.length} missed events.`);

//     // Process missed events
//     for (const event of catchUpResult.rows) {
//       console.log(`Processing missed event (ID: ${event.id}):`, event);
//       subscribers.forEach((subscriber, userId) => {
//         console.log(`Processing missed event (ID: ${event.id}) for user ${userId}:`, event);
//         processEvent(event, userId); // Pass userId to processEvent
//       });

//       // Update last processed ID after successfully processing each event
//       await saveLastProcessedEventId(event.id);
//     }
//     if (catchUpResult.rows.length > 0) {
//       console.log("Finished processing missed events.");
//     }
//     // --- End Durability Catch-up ---

//     // Start listening for new notifications
//     await pgClient.query(`LISTEN ${channelName}`);
//     console.log(`Listening on channel "${channelName}"`);

//     // Handle incoming notifications
//     pgClient.on("notification", async (msg) => {
//       console.log("Received notification:", msg);

//       try {
//         const payload = JSON.parse(msg.payload || "{}");
//         const eventId = payload.event_id; // Get the event ID from the payload

//         if (eventId === undefined) {
//           console.warn("Received notification without event_id in payload, skipping:", payload);
//           return;
//         }

//         // Ensure we don't re-process an event we just caught up on (belt-and-suspenders)
//         const currentLastId = await getLastProcessedEventId();
//         if (eventId <= currentLastId) {
//           console.log(`Received old notification for event ID ${eventId}, skipping.`);
//           return;
//         }

//         // Process the event for all subscribers
//         subscribers.forEach((subscriber, userId) => {
//           console.log(`Processing real-time event (ID: ${eventId}) for user ${userId}:`, payload);
//           processEvent(payload, userId); // Pass userId to processEvent
//         });

//         // After successfully processing the notification, save the event ID
//         await saveLastProcessedEventId(eventId);
//         console.log(`Successfully processed event ID: ${eventId}`);
//       } catch (error) {
//         console.error("Error processing notification:", error);
//         // Implement robust error handling and potentially retry logic for processing
//       }
//     });

//     // Handle PostgreSQL connection errors
//     pgClient.on("error", (err) => {
//       console.error("PostgreSQL database connection error:", err);
//       pgClient = null;
//       // Attempt to reconnect after a delay
//       setTimeout(connectAndListen, 5000); // Retry after 5 seconds
//     });

//     // Handle PostgreSQL connection end (e.g., server restart, manual disconnect)
//     pgClient.on("end", () => {
//       console.warn("PostgreSQL database connection ended.");
//       pgClient = null;
//       // Attempt to reconnect after a delay
//       setTimeout(connectAndListen, 5000); // Retry after 5 seconds
//     });
//   } catch (err) {
//     console.error("Failed to connect to PostgreSQL database:", err);
//     pgClient = null;
//     // Attempt to reconnect after a delay if connection fails initially
//     setTimeout(connectAndListen, 5000); // Retry after 5 seconds
//   }
// }

// // --- Event Processing Function ---
// // This function contains the logic for handling events from different tables/operations.
// // It's called for both missed events during catch-up and real-time notifications.
// async function processEvent(
//   event: {
//     table: string;
//     id?: number;
//     table_name: string;
//     row_id: string;
//     operation: string;
//     payload: any;
//   },
//   userId: string // Add userId parameter
// ) {
//   // Ensure table_name is set correctly from either 'table_name' or 'table' in the payload
//   if (!event.table_name && event.payload && event.payload.table) {
//     event.table_name = event.payload.table;
//   } else if (!event.table_name && event.table) {
//     // Handle if 'table' is a direct property of event
//     event.table_name = event.table;
//   }

//   console.log(
//     `Processing event from table: ${event.table_name}, operation: ${event.operation}, row ID: ${event.row_id} for user ${userId}`
//   );

//   const client = clientMap.get(userId);
//   console.log("client");
//   console.log(client?.id);
//   if (client === undefined) return;
//   console.log(client.id);
//   // const _changes = changeMap.get(userId);

//   // if (_changes === undefined) return;
//   // console.log(_changes.profile);

//   switch (event.table_name) {
//     case "user":
//       console.log(`Handling User table change for user ${userId}.`);
//       // Accumulate user changes
//       // if (event.payload.id === userId) {
//       // _changes?.user.push(event);
//       // changeMap.set(userId, _changes);
//       // console.log("sendidng changes to client with userId ", userId);
//       server.send(client, "StatsUpdate", event, true);

//       // }
//       break;
//     case "Profile":
//       console.log(`Handling Profile table change for user ${userId}.`);
//       // Accumulate profile changes
//       // if (event.payload.user_id === userId) {
//       // _changes?.profile.push(event);
//       // changeMap.set(userId, _changes);
//       // console.log("sendidng changes to client with userId ", userId);
//       server.send(client, "StatsUpdate", event, true);
//       // }
//       break;
//     // Add cases for other tables you are monitoring
//     default:
//       console.warn(`Received event for unhandled table: ${event.table_name} for user ${userId}`);
//       break;
//   }

//   // --- Push the accumulated changes to the Subject ---
//   // This will trigger the debounced observable if no new changes are pushed within the debounceTime
//   changesSubject.next(changes);
//   changesSubject.next(changeMap);
// }

// // Function to add a new subscriber
// export function addSubscriber(userId: string, client: ZilaClient) {
//   if (!subscribers.has(userId)) {
//     console.log(`Adding subscriber for user ID: ${userId}`);
//     subscribers.set(userId, new Subject<any>());
//     clientMap.set(userId, client);
//     return changeMap.get(userId);
//   } else {
//     subscribers.delete(userId);
//     subscribers.set(userId, new Subject<any>());
//     clientMap.delete(userId);
//     clientMap.set(userId, client);
//     console.log(`Subscriber already exists for user ID: ${userId}`);
//     console.log(`Adding subscriber for user ID: ${userId}`);
//   }
// }

// // Start the SQLite database and then the PostgreSQL listener
// initializeSqliteDb();
// connectAndListen();

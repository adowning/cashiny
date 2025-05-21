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

// import { envConfig, isTest } from 'env.js';
// import { ForbiddenError } from 'errors.js';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

// import { KyselySchema } from './schema';

export function createDbClient() {
  // if (isTest())
  //   throw new ForbiddenError(
  //     'createDbClient cannot be used in test environment use createTestDbClient instead.',
  //   );
  // const dbClient = new Kysely<KyselySchema>({
  //   dialect: new PostgresDialect({
  //     pool: new Pool({
  //       connectionString: process.env.DATABASE_URL,
  //       max: 50, // Set maximum <number> of client(s) in the pool
  //       connectionTimeoutMillis: 1000, // return an error after <number> second(s) if connection could not be established
  //       idleTimeoutMillis: 0, // close idle clients after <number> second(s)
  //     }),
  //   }),
  // });
  // return dbClient;
}

/**
 * This is a helper function to create a database client for testing purposes only.
 */
// export function createTestDbClient() {
//   const dbClient = new Kysely<KyselySchema>({
//     dialect: new PostgresDialect({
//       pool: new pg.Pool({
//         // connectionString: envConfig.TEST_DB_URL,
//         max: 50, // Set maximum <number> of client(s) in the pool
//         connectionTimeoutMillis: 1000, // return an error after <number> second(s) if connection could not be established
//         idleTimeoutMillis: 0, // close idle clients after <number> second(s)
//       }),
//     }),
//   });

//   return dbClient;
// }

export type DbClient = ReturnType<typeof createDbClient>; //| ReturnType<typeof createTestDbClient>;

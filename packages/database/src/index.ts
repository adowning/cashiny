// export const db =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
//   });
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
// import { Kysely, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler } from 'kysely';
// import kyselyExtension from 'prisma-extension-kysely';
// import type { DB } from './generated/kysely/types';
// export const prisma = globalThis.prisma || new PrismaClient();
// if (process.env['NODE_ENV'] !== 'production') globalThis.prisma = prisma;
// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient;
// };
// export * from '../generated/prisma';
// export const db =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
//   });
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
// const userWithProfile = Prisma.validator<Prisma.UserDefaultArgs>()({
//   include: { profile: true, wallets: true },
// });
// type userWithProfile = Prisma.UserGetPayload<typeof userWithProfile>;
// export interface UserWithProfile extends userWithProfile {}
import { PrismaClient } from '../client'
import { User as PrismaUser } from './prisma'

// import {IUser} from './generated/prisma/interfaces';

export * from '../client'
// export * from './interfaces';
// export type Prisma = PrismaClient;
// import { PrismaClient } from '../generated/prisma';
// declare global {
//   // eslint-disable-next-line no-var
//   var prisma: PrismaClient | undefined;
//   // eslint-disable-next-line no-var
//   var db: PrismaClient | undefined;
// }

// export * from './schema';
// export * from './generated/prisma/index';

export { createDbClient } from './create-db-client'

declare global {
   
  var db: PrismaClient | undefined
  var basePrisma: PrismaClient
   
  // var createDbClient: Kysely<DB> | undefined;
   
}

export const basePrisma = new PrismaClient({
  // log: [
  //   {
  //     emit: 'event',
  //     level: 'query',
  //   },
  //   {
  //     emit: 'stdout',
  //     level: 'error',
  //   },
  //   {
  //     emit: 'stdout',
  //     level: 'info',
  //   },
  //   {
  //     emit: 'stdout',
  //     level: 'warn',
  //   },
  // ],
})
export const db = basePrisma
// basePrisma.$on('query', (e) => {
//   console.log('Query: ' + e.query);
//   console.log('Params: ' + e.params);
//   console.log('Duration: ' + e.duration + 'ms');
// });

// export const db = basePrisma.$extends(
//   kyselyExtension({
//     kysely: (driver) =>
//       new Kysely<DB>({
//         dialect: {
//           createAdapter: () => new PostgresAdapter(),
//           createDriver: () => driver,
//           createIntrospector: (db) => new PostgresIntrospector(db),
//           createQueryCompiler: () => new PostgresQueryCompiler(),
//         },
//       }),
//   }),
// ) as unknown as PrismaClient;

// export const prisma = globalThis.prisma || new PrismaClient();
// if (process.env['NODE_ENV'] !== 'production') globalThis.prisma = prisma;
// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient;
// };

export type User = PrismaUser //{
//   profile: Profile | null;
// }
// export type User = UserWithProfile;

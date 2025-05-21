// import type { Env, Hono } from 'hono';
// import type { auth } from './auth';
// import type { BASE_PATH } from './constans';
// import { Prisma } from '@cashflow/database/src/generated/prisma';
// import { Profile as PrismaProfile, User as PrismaUser } from '@cashflow/database';
// import { User } from './prisma/types';
// Or, if you have them re-exported in your own types package:
// import type { User as PrismaUser, Profile as PrismaProfile } from '../prisma/interfaces'; // Adjust path as needed
import { Profile, User } from './prisma/types';

export type { Transaction, Product } from './prisma/interfaces';
/**
 * Represents a User object fully populated with its associated Profile.
 * The profile can be null if a user might not have one.
 */
export type UserWithProfile = User & {
  profile: Profile; // Or PrismaProfile if a profile is always expected
};
// export type User = PrismaUser;

export * from './interface/index';
// export type Achievement = import('./prisma/interfaces').Achievement;
// export type ChatMessage = import('./prisma/interfaces').ChatMessage;
// export type Currency = import('./prisma/interfaces').Currency;
// export type GameProvider = import('./prisma/interfaces').GameProvider;
// export type GameSession = import('./prisma/interfaces').GameSession;
// export type Operator = import('./prisma/interfaces').OperatorAccess;
// // export type Tournamententry = import('./prisma/interfaces').Tou;
// // export type VipInfo = import('./prisma/interfaces').VipInfo;
// // export type ChatMessage = import('./prisma/interfaces').ChatMessage;
// export type Gender = import('./prisma/interfaces').Gender;
// export type FriendshipStatus = import('./prisma/interfaces').FriendshipStatus;
// export type NotificationType = import('./prisma/interfaces').NotificationType;
// export type TransactionStatus = import('./prisma/interfaces').TransactionStatus;
// export type TransactionType = import('./prisma/interfaces').TransactionType;
// export type UserStatus = import('./prisma/interfaces').UserStatus;
// export type GameCategory = import('./prisma/interfaces').GameCategory;
// export type Role = import('./prisma/interfaces').Role;
// export type KeyMode = import('./prisma/interfaces').KeyMode;
// // export type Profile = import('./prisma/interfaces').Profile;
// export type Product = import('./prisma/interfaces').Product;
// export type Transaction = import('./prisma/interfaces').Transaction;
// export type User = import('./prisma/interfaces').User;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}
export type GenericApiResponse<T = any> = {
  code: number;
  data: T;
  message: string;
};
export * from './interface/auth.interface';
export * from './interface/auth.socket-interface';
export * from './interface/routes';

export type Fetcher = {
  fetch: (request: Request | URL | string) => Promise<Response>;
};

// const userWithProfile = Prisma.validator<Prisma.UserDefaultArgs>()({
//   include: { profile: true },
// });

// type userWithProfile = Prisma.UserGetPayload<typeof userWithProfile>;

// export interface UserWithProfile extends userWithProfile {}

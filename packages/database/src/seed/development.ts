// Path: packages/database/src/seed/development.ts
// (Or wherever your seed script is located, adjust import paths accordingly)

import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

// These are now imported from external files you've created
import loadGames from './loadgames.js'; // Assuming .js extension or your TS setup handles .ts
import loadProducts from './seedProducts.js'; // Assuming .js extension

import {
  PrismaClient,
  Prisma, // For JsonNull, etc.
  // Import actual Prisma Enums for runtime values
  Role as PrismaRoleEnum,
  UserStatus as PrismaUserStatusEnum,
  TransactionType as PrismaTransactionTypeEnum,
  TransactionStatus as PrismaTransactionStatusEnum,
  ProductType as PrismaProductTypeEnum, // This is the ENUM for product types
  GameCategory as PrismaGameCategoryEnum,
  // GameProvider is a model, not an enum of providers
  KeyMode as PrismaKeyModeEnum,
  // AccountType as PrismaAccountTypeEnum, // <<<< ENSURE THIS ENUM IS IN YOUR SCHEMA
  RewardType as PrismaRewardTypeEnum, // <<<< ADDED (ensure in schema)
  RewardStatus as PrismaRewardStatusEnum, // <<<< ADDED (ensure in schema)
  VipTaskType as PrismaVipTaskTypeEnum, // <<<< ADDED (ensure in schema)
  // Import Prisma Model Types for type checking
  User as PrismaUser,
  Currency as PrismaCurrency,
  Product as PrismaProductModel, // Aliasing to avoid conflict with ProductType enum
  Game as PrismaGame,
  GameProvider as PrismaGameProviderModel, // GameProvider is a model
  VipInfo as PrismaVipInfo,
  Wallet as PrismaWallet,
  Transaction as PrismaTransaction,
  XpEvent as PrismaXpEvent,
  OperatorAccess as PrismaOperatorAccess,
  Account as PrismaAccount, // Added Account model type
  Profile as PrismaProfile,
  Session as PrismaSession, // <<<< ADDED
  GameSession as PrismaGameSession, // <<<< ADDED
  GameSpin as PrismaGameSpin, // <<<< ADDED
  VipTask as PrismaVipTask, // <<<< ADDED
  UserVipTaskProgress as PrismaUserVipTaskProgress, // <<<< ADDED
  UserReward as PrismaUserReward, // <<<< ADDED
  Achievement as PrismaAchievement, // <<<< ADDED
  UserAchievement as PrismaUserAchievement, // <<<< ADDED
} from '../../client'; // User-provided path

// Configuration
const MAX_REGULAR_USERS = 9; // 1 admin + 9 regular users = MAX_USERS
const MAX_OPERATORS = 2;
const MAX_CURRENCIES = 3;
const TRANSACTIONS_PER_USER = 5;
const XP_EVENTS_PER_USER = 5;

// --- START OF NEW CONFIGURATION CONSTANTS ---
const SESSIONS_PER_USER_MIN = 2;
const SESSIONS_PER_USER_MAX = 5;
const GAME_SESSIONS_PER_SESSION_MIN = 2;
const GAME_SESSIONS_PER_SESSION_MAX = 10;
const SPINS_PER_GAME_SESSION_MIN = 5;
const SPINS_PER_GAME_SESSION_MAX = 100;
const MAX_VIP_TASKS_TO_SEED = 5;
const MAX_ACHIEVEMENTS_TO_SEED = 10;
const USER_ACHIEVEMENTS_TO_ASSIGN_MIN = 0;
const USER_ACHIEVEMENTS_TO_ASSIGN_MAX = 3;
const USER_REWARDS_PER_USER_MIN = 1;
const USER_REWARDS_PER_USER_MAX = 5;
// --- END OF NEW CONFIGURATION CONSTANTS ---

const prisma = new PrismaClient();

// Global arrays to hold created entities
let createdCurrencies: PrismaCurrency[] = [];
let createdOperators: PrismaOperatorAccess[] = [];
let createdUsers: PrismaUser[] = []; // Will include the admin user
let createdWallets: PrismaWallet[] = [];
let createdProducts: PrismaProductModel[] = [];
let createdGameProviders: PrismaGameProviderModel[] = [];
let createdGames: PrismaGame[] = []; // Populated by seedGamesInternal via loadGames
let createdVipTasks: PrismaVipTask[] = []; // <<<< ADDED
let createdAchievements: PrismaAchievement[] = []; // <<<< ADDED

function getRandomItem<T>(arr: T[]): T {
  if (arr.length === 0) {
    console.error(
      'Attempted to get random item from an empty array. This might indicate a problem with previous seeding steps (e.g., games not loaded).'
    );
    throw new Error('Cannot get random item from an empty array.');
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- START OF NEW HELPER ---
function getRandomNumber(min: number, max: number): number {
  return faker.number.int({ min, max });
}
// --- END OF NEW HELPER ---

function getRandomSubset<T>(arr: T[], count: number): T[] {
  if (arr.length === 0) return [];
  const actualCount = Math.min(count, arr.length);
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, actualCount);
}

async function clearDatabase(): Promise<void> {
  console.log('🧹 Clearing existing data (order matters due to relations)...');

  // --- START OF NEW DELETIONS (adjust order as per your schema's cascade rules) ---
  await prisma.gameSpin
    .deleteMany()
    .catch((e) => console.error('Error clearing gameSpin:', e.message));
  await prisma.gameSession
    .deleteMany()
    .catch((e) => console.error('Error clearing gameSession:', e.message));
  await prisma.session
    .deleteMany()
    .catch((e) => console.error('Error clearing session:', e.message));
  await prisma.userVipTaskProgress
    .deleteMany()
    .catch((e) => console.error('Error clearing userVipTaskProgress:', e.message));
  await prisma.vipTask
    .deleteMany()
    .catch((e) => console.error('Error clearing vipTask:', e.message));
  await prisma.userReward
    .deleteMany()
    .catch((e) => console.error('Error clearing userReward:', e.message)); // Was already there, good.
  await prisma.userAchievement
    .deleteMany()
    .catch((e) => console.error('Error clearing userAchievement:', e.message));
  await prisma.achievement
    .deleteMany()
    .catch((e) => console.error('Error clearing achievement:', e.message));
  // --- END OF NEW DELETIONS ---

  await prisma.xpEvent
    .deleteMany()
    .catch((e) => console.error('Error clearing xpEvent:', e.message));
  await prisma.transaction
    .deleteMany()
    .catch((e) => console.error('Error clearing transaction:', e.message));
  await prisma.wallet.deleteMany().catch((e) => console.error('Error clearing wallet:', e.message));
  await prisma.vipInfo
    .deleteMany()
    .catch((e) => console.error('Error clearing vipInfo:', e.message));
  await prisma.account
    .deleteMany()
    .catch((e) => console.error('Error clearing account:', e.message));
  await prisma.profile
    .deleteMany()
    .catch((e) => console.error('Error clearing profile:', e.message));
  await prisma.rebateTransaction
    .deleteMany()
    .catch(() => console.log('RebateTransaction table might not exist or no data to delete.'));
  await prisma.product
    .deleteMany()
    .catch((e) => console.error('Error clearing product:', e.message));
  await prisma.game.deleteMany().catch((e) => console.error('Error clearing game:', e.message));
  // await prisma.gameProvider.deleteMany(); // Your script had this commented, keeping it so. If Game model depends on it, it should be cleared after Game.
  // The line below from your script was trying to delete Account again, it should be GameProvider.
  // await prisma.gameProvider
  //   .deleteMany()
  //   .catch((e) => console.error('Error clearing gameProvider:', e.message)); // Corrected from prisma.account
  await prisma.currency
    .deleteMany()
    .catch((e) => console.error('Error clearing currency:', e.message));
  await prisma.operatorAccess
    .deleteMany()
    .catch((e) => console.error('Error clearing operatorAccess:', e.message));
  await prisma.user.deleteMany().catch((e) => console.error('Error clearing user:', e.message));
  console.log('✅ Data cleared.');
}
const hashedPassword = await Bun.password.hash('password123'); // This is top-level await, ensure your execution env supports it or move into async function

async function seedCurrenciesInternal(): Promise<void> {
  console.log('🌱 Seeding Currencies...');
  const currenciesData = [
    {
      id: 'USD',
      name: 'US Dollar',
      symbol: '$',
      type: 'FIAT',
      precision: 2,
      isActive: true,
      isDefault: true,
    },
    {
      id: 'EUR',
      name: 'Euro',
      symbol: '€',
      type: 'FIAT',
      precision: 2,
      isActive: true,
      isDefault: false,
    },
    {
      id: 'JPY',
      name: 'Japanese Yen',
      symbol: '¥',
      type: 'FIAT',
      precision: 0,
      isActive: true,
      isDefault: false,
    },
    {
      id: 'BTC',
      name: 'Bitcoin',
      symbol: '₿',
      type: 'CRYPTO',
      precision: 8,
      isActive: true,
      isDefault: false,
    },
    {
      id: 'ETH',
      name: 'Ethereum',
      symbol: 'Ξ',
      type: 'CRYPTO',
      precision: 18,
      isActive: true,
      isDefault: false,
    },
    {
      id: 'FUN',
      name: 'Fun Bucks',
      symbol: 'FB',
      type: 'VIRTUAL',
      precision: 0,
      isActive: true,
      isDefault: false,
    },
  ];

  const tempCreatedCurrencies: PrismaCurrency[] = [];
  for (const data of currenciesData.slice(0, MAX_CURRENCIES)) {
    const currency = await prisma.currency.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
    tempCreatedCurrencies.push(currency);
  }
  createdCurrencies = tempCreatedCurrencies;
  console.log(`🌱 Seeded ${createdCurrencies.length} currencies.`);
}

async function seedOperatorsInternal(): Promise<void> {
  console.log('🌱 Seeding Operators...');
  const tempCreatedOperators: PrismaOperatorAccess[] = [];
  for (let i = 0; i < MAX_OPERATORS; i++) {
    const operatorData = {
      name: faker.company.name() + ` ${i + 1}`,
      operator_secret: faker.string.alphanumeric(32),
      callback_url: faker.internet.url(),
      operator_access: faker.string.alphanumeric(16),
      description: faker.company.catchPhrase(),
    };
    const operator = await prisma.operatorAccess.upsert({
      where: { name: operatorData.name },
      update: operatorData,
      create: operatorData,
    });
    tempCreatedOperators.push(operator);
  }
  createdOperators = tempCreatedOperators;
  console.log(`🌱 Seeded ${createdOperators.length} operators.`);
}

async function createFullUser(
  userData: Prisma.UserCreateInput,
  isAdmin: boolean = false
): Promise<PrismaUser> {
  const user = await prisma.user.create({ data: userData });

  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id, // As per your script
      providerId: 'credentials', // As per your script
      // type: PrismaAccountTypeEnum.EMAIL, // Ensure this enum exists and is imported
      password: userData.passwordHash, // As per your script, if UserCreateInput contains passwordHash for Account
    },
  });

  const firstOperatorId = createdOperators.length > 0 ? createdOperators[0].id : undefined;
  const defaultCurrencyId =
    createdCurrencies.find((c) => c.isDefault)?.id ||
    (createdCurrencies.length > 0 ? createdCurrencies[0].id : undefined);

  if (!firstOperatorId && createdOperators.length > 0)
    console.warn('Profile Warning: No firstOperatorId, but operators exist.');
  if (!defaultCurrencyId && createdCurrencies.length > 0)
    console.warn('Profile Warning: No defaultCurrencyId, but currencies exist.');

  await prisma.profile.create({
    data: {
      userId: user.id,
      operatorAccessId: firstOperatorId,
      activeCurrencyType: defaultCurrencyId, // Your script uses this, assumes it's currency ID string
      role: isAdmin ? 'ADMIN' : 'USER', // As per your script
    },
  });

  if (defaultCurrencyId) {
    const userInitialWallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        currencyId: defaultCurrencyId,
        balance: isAdmin ? 100000000 : faker.number.int({ min: 10000, max: 5000000 }),
        bonusBalance: isAdmin ? 1000000 : faker.number.int({ min: 0, max: 500000 }),
        lockedBalance: 0,
      },
    });
    createdWallets.push(userInitialWallet);
  }

  const totalXp = isAdmin ? 100000 : faker.number.int({ min: 0, max: 50000 });
  const levelConfig = getVipLevelByTotalXp(totalXp);
  await prisma.vipInfo.create({
    data: {
      userId: user.id,
      level: levelConfig.level,
      currentLevelXp: totalXp - levelConfig.cumulativeXpToReach,
      totalXp: totalXp,
      nextLevelXpRequired: levelConfig.xpRequired,
      cashbackPercentage: levelConfig.cashbackPercentage, // Prisma.Decimal or Float
      prioritySupport: levelConfig.prioritySupport,
      specialBonusesAvailable: isAdmin ? 10 : faker.number.int({ min: 0, max: 5 }),
    },
  });
  //@ts-ignore
  return user; // Your script had @ts-ignore here. It's because PrismaUser type doesn't include relations by default.
  // A better fix is to type the return as Promise<User & { relations... if needed elsewhere}> or just User
}

async function seedUsersInternal(): Promise<void> {
  if (createdCurrencies.length === 0 || createdOperators.length === 0) {
    console.warn('⚠️ Currencies or Operators not seeded. Skipping user seeding.');
    return;
  }
  console.log('🌱 Seeding Users, Accounts, Profiles, Wallets, and VipInfo...');
  const tempUsers: PrismaUser[] = [];

  const adminPassword = 'passwordADMIN123!';
  // const adminPasswordHash = await Bun.password.hash(adminPassword); // Moved hashedPassword to top level
  const adminUser = await createFullUser(
    {
      email: 'admin@cashflow.com',
      username: 'superadmin',
      cashtag: '$cfadmin',
      passwordHash: hashedPassword,
      name: `Super Admin`,
      role: PrismaRoleEnum.ADMIN,
      status: PrismaUserStatusEnum.ACTIVE,
      emailVerified: true,
      firstName: 'Super',
      lastName: 'Admin',
      avatarUrl: 'https://i.pravatar.cc/150?u=admin',
      dob: new Date('1980-01-01'),
      // preferredCurrencyId is set in createFullUser from defaults
    },
    true
  );
  tempUsers.push(adminUser);
  console.log(`👤 Created special ADMIN user: ${adminUser.email}`);

  for (let i = 0; i < MAX_REGULAR_USERS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const regularUser = await createFullUser({
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      username: faker.internet.userName({ firstName, lastName }),
      cashtag: `$${faker.lorem.word().toLowerCase()}${faker.number.int({ min: 100, max: 999 })}`,
      passwordHash: hashedPassword,
      name: `${firstName} ${lastName}`,
      role: PrismaRoleEnum.USER,
      status: PrismaUserStatusEnum.ACTIVE,
      emailVerified: true,
      firstName,
      lastName,
      avatarUrl: faker.image.avatar(),
      dob: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      // preferredCurrencyId: getRandomItem(createdCurrencies).id, // Set in createFullUser
    });
    tempUsers.push(regularUser);
  }
  createdUsers = tempUsers;
  console.log(`🌱 Seeded ${createdUsers.length} total users.`);
}

// Your existing seedGameProvidersInternal (commented out in your script, I'll make a simple one)
// async function seedGameProvidersInternal(): Promise<void> {
//   console.log('🌱 Seeding Game Providers...');
//   const providerData = [
//     { name: 'NetEntDemoSeed', description: 'Premium gaming solutions.' }, // Added DemoSeed to avoid potential unique conflicts if loadGames creates same
//     { name: 'PragmaticPlayDemoSeed', description: 'Leading content provider.' },
//     { name: 'EvolutionDemoSeed', description: 'Leader in live casino.' },
//   ];
//   const tempCreatedProviders: PrismaGameProviderModel[] = [];
//   for (const data of providerData) {
//     // const provider = await prisma.gameProvider.upsert({
//     //   where: { name: data.name },
//     //   update: { description: data.description, isActive: true },
//     //   create: { ...data, isActive: true },
//     // });
//     // tempCreatedProviders.push(provider);
//   }
//   createdGameProviders = tempCreatedProviders;
//   console.log(`🌱 Seeded ${createdGameProviders.length} game providers.`);
// }

// MINIMAL MODIFICATION to ensure createdGames is populated globally
async function seedGamesInternal(): Promise<void> {
  if (createdOperators.length === 0) {
    console.warn('⚠️ No operators seeded, cannot run loadGames. Skipping game seeding.');
    return;
  }
  // if (createdGameProviders.length === 0) {
  //   console.warn('⚠️ No game providers seeded for loadGames. Skipping game seeding.');
  //   // It's better if loadGames can create providers if they don't exist, or we seed them robustly first.
  //   // For now, let loadGames attempt with potentially no providers if createdGameProviders is empty.
  // }
  console.log('🌱 Seeding Games via loadGames script...');
  try {
    const gamesFromScript = await loadGames(prisma, createdOperators[0].id); // Pass createdGameProviders
    if (Array.isArray(gamesFromScript)) {
      createdGames = gamesFromScript; // Populate global createdGames
      console.log(`🌱 Populated ${createdGames.length} games into global array from loadGames.`);
    } else {
      console.warn(
        `⚠️ loadGames did not return an array. Global createdGames might be empty. Attempting fallback.`
      );
      createdGames = await prisma.game.findMany({ take: 50 }); // Fallback
      if (createdGames.length > 0)
        console.log(`🌱 Fetched ${createdGames.length} games as fallback for session seeding.`);
    }
  } catch (error: any) {
    console.error('Error during loadGames execution:', error.message);
  }
}

// Your existing seedProductsInternal
async function seedProductsInternal(): Promise<void> {
  if (createdOperators.length === 0 || createdCurrencies.length === 0) {
    console.warn(
      '⚠️ No operators or currencies seeded, cannot run loadProducts. Skipping product seeding.'
    );
    return;
  }
  console.log('🌱 Seeding Products via loadProducts script...');
  try {
    const tempProducts = await loadProducts(
      prisma,
      createdOperators[0].id,
      createdCurrencies[0].id
    );
    if (Array.isArray(tempProducts)) {
      createdProducts = tempProducts;
      console.log(`🌱 Seeded ${createdProducts.length} products via loadProducts.`);
    } else {
      console.warn('⚠️ loadProducts did not return an array of products.');
    }
  } catch (error: any) {
    console.error('Error during loadProducts execution:', error.message);
  }
}

// Your existing seedTransactionsInternal
async function seedTransactionsInternal(): Promise<void> {
  if (createdUsers.length === 0 || createdWallets.length === 0 || createdCurrencies.length === 0) {
    console.warn('⚠️ Users, Wallets, or Currencies not seeded. Skipping transaction seeding.');
    return;
  }
  console.log('🌱 Seeding Transactions...');

  const tempCreatedTransactions: PrismaTransaction[] = [];
  // const status = getRandomItem( // This status was defined but not used later in the loop
  //   Object.values(PrismaTransactionStatusEnum).filter(
  //     (s) => s !== PrismaTransactionStatusEnum.PENDING
  //   )
  // );
  // console.log(status); // From your script
  for (const user of createdUsers) {
    const userWallets = createdWallets.filter((w) => w.userId === user.id);
    if (userWallets.length === 0) continue;

    for (let i = 0; i < TRANSACTIONS_PER_USER; i++) {
      const originatorWallet = getRandomItem(userWallets);
      console.log('1');
      const transactionType = getRandomItem(Object.values(PrismaTransactionTypeEnum));
      console.log('2');
      const currentStatus = getRandomItem(
        // Renamed from status to avoid conflict
        Object.values(PrismaTransactionStatusEnum).filter(
          (s) => s !== PrismaTransactionStatusEnum.PENDING
        )
      );
      console.log('3');

      let amountInCents = faker.number.int({ min: 100, max: 50000 }); // Cents
      let description = `Transaction: ${faker.finance.transactionDescription()}`;
      let productId: string | undefined = undefined;
      let receiverUserId: string | undefined = undefined; // From your script

      switch (transactionType) {
        case PrismaTransactionTypeEnum.DEPOSIT:
          description = 'User deposit';
          if (createdProducts.length > 0 && Math.random() < 0.3) {
            const product = getRandomItem(
              createdProducts.filter(
                (p) =>
                  p.currencyId === originatorWallet.currencyId &&
                  p.productType === PrismaProductTypeEnum.DEPOSIT_PACKAGE // Using type from Product model
              )
            );
            if (product) {
              amountInCents = product.priceInCents; // Assuming Product.price is in cents
              productId = product.id;
              description = `Deposit for product: ${product.title}`; // Assuming Product.name
            }
          }
          break;
        case PrismaTransactionTypeEnum.WITHDRAWAL:
          description = 'User withdrawal';
          amountInCents = faker.number.int({
            min: 1000,
            max: originatorWallet.balance > 1000 ? originatorWallet.balance : 1000,
          });
          break;
        case PrismaTransactionTypeEnum.INTERNAL_TRANSFER: // From your script
          if (createdUsers.length > 1) {
            console.log(createdUsers.filter((u) => u.id !== user.id));
            let tempReceiver = getRandomItem(createdUsers.filter((u) => u.id !== user.id));
            if (tempReceiver) {
              receiverUserId = tempReceiver.id;
              description = `Transfer to ${tempReceiver.username || tempReceiver.email}`;
            } else continue;
          } else continue;
          break;
      }

      try {
        const transaction = await prisma.transaction.create({
          data: {
            originatorUserId: user.id,
            receiverUserId: receiverUserId, // As per your script's variable
            walletId: originatorWallet.id,
            type: transactionType,
            status: currentStatus, // Use currentStatus
            amount: amountInCents,
            currencyId: originatorWallet.currencyId,
            description,
            provider:
              currentStatus === PrismaTransactionStatusEnum.COMPLETED
                ? transactionType === PrismaTransactionTypeEnum.DEPOSIT
                  ? 'CashAppMock'
                  : 'System'
                : undefined,
            providerTxId:
              currentStatus === PrismaTransactionStatusEnum.COMPLETED
                ? `mock_${faker.string.alphanumeric(10)}`
                : undefined,
            productId: productId,
            processedAt:
              currentStatus === PrismaTransactionStatusEnum.COMPLETED
                ? faker.date.recent({ days: 7 })
                : undefined,
            balanceBefore: originatorWallet.balance,
            balanceAfter:
              transactionType === PrismaTransactionTypeEnum.DEPOSIT ||
              transactionType === PrismaTransactionTypeEnum.BET_WIN
                ? originatorWallet.balance + amountInCents
                : originatorWallet.balance - amountInCents,
          },
        });
        tempCreatedTransactions.push(transaction);
      } catch (e: any) {
        console.error(
          `Failed to create transaction for user ${user.id} (Type: ${transactionType}): ${e.message}`
        );
      }
    }
  }
  console.log(`🌱 Seeded ${tempCreatedTransactions.length} transactions.`);
}

// Your existing seedXpEventsInternal function
async function seedXpEventsInternal(): Promise<void> {
  if (createdUsers.length === 0) {
    console.warn('⚠️ Users not seeded. Skipping XP event seeding.');
    return;
  }
  console.log('🌱 Seeding XP Events...');
  const tempCreatedXpEvents: PrismaXpEvent[] = [];
  const xpSources = ['GAME_PLAY', 'DAILY_LOGIN', 'CHALLENGE_COMPLETE', 'PROMO_REWARD'];

  for (const user of createdUsers) {
    for (let i = 0; i < XP_EVENTS_PER_USER; i++) {
      const xpEvent = await prisma.xpEvent.create({
        data: {
          userId: user.id,
          points: faker.number.int({ min: 10, max: 500 }),
          source: getRandomItem(xpSources),
          sourceId: faker.string.uuid(),
          meta: { reason: faker.lorem.sentence() } as Prisma.JsonObject,
        },
      });
      tempCreatedXpEvents.push(xpEvent);
    }
  }
  console.log(`🌱 Seeded ${tempCreatedXpEvents.length} XP events.`);
}

// --- START OF NEW SEEDING FUNCTIONS (Appended) ---

async function seedUserSessionsAndGameActivityInternal(): Promise<void> {
  if (createdUsers.length === 0) {
    console.warn('⚠️ Users not seeded. Skipping session and game activity seeding.');
    return;
  }
  if (createdGames.length === 0) {
    console.warn(
      "⚠️ 'createdGames' array is empty (possibly due to 'loadGames' not populating it or no games in DB). Skipping game activity seeding."
    );
    return; // Exit if no games are available, as game sessions/spins depend on them
  }
  if (createdCurrencies.length === 0) {
    console.warn('⚠️ Currencies not seeded. Game spins cannot be properly created. Skipping.');
    return;
  }

  console.log('🌱 Seeding User Sessions, Game Sessions, and Game Spins...');

  for (const user of createdUsers) {
    const numSessions = getRandomNumber(SESSIONS_PER_USER_MIN, SESSIONS_PER_USER_MAX);
    for (let i = 0; i < numSessions; i++) {
      const sessionStartTime = faker.date.recent({ days: 30 });
      const sessionDurationMinutes = getRandomNumber(30, 240); // 30 mins to 4 hours
      const sessionEndTime = new Date(sessionStartTime.getTime() + sessionDurationMinutes * 60000);

      const session = await prisma.session.create({
        data: {
          userId: user.id,
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
          startTime: sessionStartTime,
          endTime: sessionEndTime,
          token: faker.string.uuid(),
          expiresAt: new Date(sessionEndTime.getTime() + 1000 * 60 * 60 * 24 * 30), // 30 days from end time
          lastActivityAt: sessionStartTime, // Initial last activity, will be updated by game sessions
        },
      });

      const numGameSessions = getRandomNumber(
        GAME_SESSIONS_PER_SESSION_MIN,
        GAME_SESSIONS_PER_SESSION_MAX
      );
      const gamesForThisUserSession = getRandomSubset(createdGames, numGameSessions);

      for (const game of gamesForThisUserSession) {
        const gameSessionStartTime = faker.date.between({
          from: session.startTime,
          to: session.endTime!,
        });
        // Ensure game session duration fits within user session
        const maxPossibleGameSessionDurationMs =
          session.endTime!.getTime() + 5 * 60 * 1000 - gameSessionStartTime.getTime();
        console.log(maxPossibleGameSessionDurationMs);
        console.log(Math.min(60, Math.floor(maxPossibleGameSessionDurationMs / 60000)));

        const gameSessionDurationMinutes = getRandomNumber(
          5,
          Math.min(60, Math.floor(maxPossibleGameSessionDurationMs / 60000))
        );

        if (gameSessionDurationMinutes < 5) continue; // Skip if not enough time for a meaningful game session

        const gameSessionEndTime = new Date(
          gameSessionStartTime.getTime() + gameSessionDurationMinutes * 60000
        );

        const gameSession = await prisma.gameSession.create({
          data: {
            sessionId: session.id,
            userId: user.id,
            gameId: game.id,
            startTime: gameSessionStartTime,
            endTime: gameSessionEndTime,
            totalWagered: 0, // Will be updated by spins (in cents)
            totalWon: 0, // Will be updated by spins (in cents)
            // currencyId will be determined by the first spin or a default
          },
        });

        const numSpins = getRandomNumber(SPINS_PER_GAME_SESSION_MIN, SPINS_PER_GAME_SESSION_MAX);
        let gameSessionAggregatedWagered = 0;
        let gameSessionAggregatedWon = 0;
        let gameSessionUsedCurrencyId: string | null = null;

        for (let k = 0; k < numSpins; k++) {
          const spinCurrency = getRandomItem(createdCurrencies);
          if (!gameSessionUsedCurrencyId) gameSessionUsedCurrencyId = spinCurrency.id;

          const wagerAmountCents = faker.number.int({ min: 10, max: 5000 }); // 0.10 to 50.00 in cents
          // console.log('winAmountCents');

          const winAmountCents =
            Math.random() > 0.4
              ? faker.number.int({ min: 0, max: wagerAmountCents * getRandomNumber(0, 20) })
              : 0;
          // console.log(winAmountCents);
          // console.log(session.id);
          await prisma.gameSpin.create({
            data: {
              gameSessionId: gameSession.id,
              sessionId: session.id,
              wagerAmount: wagerAmountCents,
              grossWinAmount: winAmountCents,
              currencyId: spinCurrency.id, // Each spin can theoretically have its own currency if needed by schema
              spinData: {
                symbols: ['A', 'K', 'Q'],
                lines: [[0, 1, 2]],
                payout: winAmountCents,
                details: faker.lorem.words(5),
              } as Prisma.JsonObject,
              timeStamp:
                gameSession.startTime && gameSession.endTime
                  ? faker.date.between({
                      from: gameSession.startTime,
                      to: gameSession.endTime,
                    })
                  : new Date(),
            },
          });
          gameSessionAggregatedWagered += wagerAmountCents;
          gameSessionAggregatedWon += winAmountCents;
        }

        if (gameSessionUsedCurrencyId) {
          // Only update if spins occurred
          await prisma.gameSession.update({
            where: { id: gameSession.id },
            data: {
              totalWagered: gameSessionAggregatedWagered,
              totalWon: gameSessionAggregatedWon,
              currencyId: gameSessionUsedCurrencyId, // Set the currency for the session
            },
          });
        }
        await prisma.session.update({
          // Update session's lastActivityAt
          where: { id: session.id },
          data: { lastActivityAt: gameSession.endTime },
        });
      }
    }
  }
  console.log(`🌱 Seeded user sessions, game sessions, and game spins.`);
}

async function seedVipTasksAndProgressInternal(): Promise<void> {
  console.log('🌱 Seeding VIP Tasks and User Progress...');
  const taskTypesArray = Object.values(PrismaVipTaskTypeEnum);
  const tempCreatedVipTasks: PrismaVipTask[] = [];

  for (let i = 0; i < MAX_VIP_TASKS_TO_SEED; i++) {
    const taskType = getRandomItem(taskTypesArray);
    let title = `${taskType.replace(/_/g, ' ')} Challenge ${i + 1}`;
    let description = `Achieve the ${taskType.toLowerCase().replace(/_/g, ' ')} goal for great rewards!`;
    let targetValue: number | undefined; // Integer (cents or count)

    switch (taskType) {
      case PrismaVipTaskTypeEnum.WAGER_AMOUNT:
        targetValue = faker.number.int({ min: 10000, max: 1000000 }); // Cents
        description = `Wager a total of ${targetValue / 100} in any game.`;
        break;
      case PrismaVipTaskTypeEnum.LOGIN_STREAK:
        targetValue = faker.number.int({ min: 3, max: 7 }); // Days
        description = `Log in for ${targetValue} consecutive days.`;
        break;
      case PrismaVipTaskTypeEnum.DEPOSIT_STREAK: // From your enum list
        targetValue = faker.number.int({ min: 2, max: 5 }); // Number of deposits
        description = `Make a deposit on ${targetValue} different days.`;
        break;
      case PrismaVipTaskTypeEnum.PROFILE_COMPLETION:
        title = 'Complete Your Profile';
        description = 'Fill out all your profile details for a reward.';
        targetValue = 1; // 1 step to complete
        break;
      // Add cases for other VipTaskTypes from your enum if they need specific target logic
      default:
        targetValue = Math.floor(faker.number.int({ min: 1, max: 10 }));
        description = `Perform ${targetValue} of action: ${taskType.toLowerCase().replace(/_/g, ' ')}.`;
        break;
    }

    const vipTask = await prisma.vipTask.create({
      data: {
        taskType,
        title,
        description,
        xpReward: faker.datatype.boolean(0.7)
          ? Math.floor(faker.number.int({ min: 50, max: 500 }))
          : null,
        bonusRewardAmount: faker.datatype.boolean(0.5)
          ? Math.floor(faker.number.int({ min: 100, max: 10000 }))
          : null, // Cents
        bonusCurrencyId:
          createdCurrencies.length > 0 && faker.datatype.boolean(0.5)
            ? getRandomItem(createdCurrencies).id
            : null,
        targetValue: targetValue,
        durationDays: Math.floor(faker.number.int({ min: 1, max: 30 })),
        isActive: true,
        requiredVipLevel: faker.number.int({ min: 1, max: 3 }),
        resetCycle: getRandomItem(['DAILY', 'WEEKLY', 'MONTHLY', 'NEVER', null]),
      },
    });
    tempCreatedVipTasks.push(vipTask);
  }
  createdVipTasks = tempCreatedVipTasks;

  if (createdUsers.length > 0 && createdVipTasks.length > 0) {
    for (const user of getRandomSubset(createdUsers, Math.ceil(createdUsers.length * 0.7))) {
      for (const task of getRandomSubset(createdVipTasks, getRandomNumber(1, 3))) {
        const progress = task.targetValue ? getRandomNumber(0, task.targetValue) : 0;
        const isCompleted = task.targetValue
          ? progress >= task.targetValue
          : faker.datatype.boolean();
        await prisma.userVipTaskProgress
          .create({
            data: {
              userId: user.id,
              taskId: task.id,
              progress: progress,
              isCompleted,
              rewardClaimedAt:
                isCompleted && faker.datatype.boolean(0.5) ? faker.date.recent({ days: 7 }) : null,
              lastProgressAt: faker.date.recent({ days: 10 }),
            },
          })
          .catch((e) =>
            console.error(
              `Error creating task progress for user ${user.id}, task ${task.id}: ${e.message}`
            )
          );
      }
    }
  }
  console.log(`🌱 Seeded ${createdVipTasks.length} VIP tasks and user progress.`);
}

async function seedAchievementsAndUserUnlocksInternal(): Promise<void> {
  console.log('🌱 Seeding Achievements...');
  const tempCreatedAchievements: PrismaAchievement[] = [];
  const achievementBaseNames = [
    'First Deposit Maker',
    'Game Explorer',
    'Loyal Patron',
    'High Roller',
    'Streak King',
    'Profile Guru',
    'Task Master',
    'Welcome Aboard',
    'Rising Star',
    'Platform Veteran',
  ];
  for (let i = 0; i < Math.min(MAX_ACHIEVEMENTS_TO_SEED, achievementBaseNames.length); i++) {
    const achievementData: Prisma.AchievementCreateInput = {
      name: `${achievementBaseNames[i]} Award`,
      description: faker.lorem.sentence(getRandomNumber(5, 10)),
      iconUrl: faker.image.urlPicsumPhotos({
        width: 128,
        height: 128,
        grayscale: faker.datatype.boolean(),
        blur: getRandomItem([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) as
          | 1
          | 2
          | 3
          | 4
          | 5
          | 6
          | 7
          | 8
          | 9
          | 10,
      }),
      blur: getRandomItem([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) as
        | 1
        | 2
        | 3
        | 4
        | 5
        | 6
        | 7
        | 8
        | 9
        | 10,
      xpReward: faker.number.int({ min: 100, max: 1000 }),
      // category: getRandomItem(["GENERAL", "GAMING", "SOCIAL", "FINANCIAL"]), // Add if category exists
    };
    const achievement = await prisma.achievement.create({ data: achievementData }).catch((e) => {
      console.error(`Error creating achievement ${achievementData.name}: ${e.message}`);
      return null;
    });
    if (achievement) tempCreatedAchievements.push(achievement);
  }
  createdAchievements = tempCreatedAchievements;

  if (createdUsers.length > 0 && createdAchievements.length > 0) {
    console.log('🌱 Seeding User Achievements...');
    for (const user of createdUsers) {
      const numAchievementsToUnlock = getRandomNumber(
        USER_ACHIEVEMENTS_TO_ASSIGN_MIN,
        USER_ACHIEVEMENTS_TO_ASSIGN_MAX
      );
      const achievementsToUnlock = getRandomSubset(createdAchievements, numAchievementsToUnlock);
      for (const ach of achievementsToUnlock) {
        await prisma.userAchievement
          .create({
            data: {
              userId: user.id,
              achievementId: ach.id,
              unlockedAt: faker.date.recent({ days: 60 }),
              metaData: {
                source: 'Seeded Unlock',
                reason: faker.lorem.words(3),
              } as Prisma.JsonObject,
            },
          })
          .catch((e) =>
            console.error(`Error assigning achievement ${ach.id} to user ${user.id}: ${e.message}`)
          );
      }
    }
  }
  console.log(`🌱 Seeded ${createdAchievements.length} achievements and user unlocks.`);
}

async function seedUserRewardsInternal(): Promise<void> {
  if (createdUsers.length === 0 || createdCurrencies.length === 0) {
    console.warn('⚠️ Users or Currencies not seeded. Skipping UserReward seeding.');
    return;
  }
  console.log('🌱 Seeding User Rewards (available and some claimed)...');
  const rewardTypesArray = Object.values(PrismaRewardTypeEnum);
  const rewardStatusArray = Object.values(PrismaRewardStatusEnum);

  for (const user of createdUsers) {
    const numRewards = getRandomNumber(USER_REWARDS_PER_USER_MIN, USER_REWARDS_PER_USER_MAX);
    for (let i = 0; i < numRewards; i++) {
      const rewardType = getRandomItem(rewardTypesArray);
      const currency = getRandomItem(createdCurrencies);
      const status = getRandomItem(
        rewardStatusArray.filter((s) => s !== PrismaRewardStatusEnum.PENDING)
      );
      const availableFrom = faker.date.recent({ days: 10 });
      let expiresAt: Date | null = null;
      if (
        status === PrismaRewardStatusEnum.AVAILABLE ||
        status === PrismaRewardStatusEnum.EXPIRED
      ) {
        expiresAt = faker.date.future({ years: 0.1, refDate: availableFrom }); // Approx 1 month
        if (status === PrismaRewardStatusEnum.EXPIRED && expiresAt > new Date()) {
          expiresAt = faker.date.past({ years: 0.05, refDate: availableFrom }); // Ensure expired is truly in the past
        }
      }
      const claimedAt =
        status === PrismaRewardStatusEnum.CLAIMED
          ? faker.date.between({ from: availableFrom, to: expiresAt || new Date() })
          : null;

      let amount: number | undefined = undefined; // Integer cents or count
      let currentCurrencyId: string | undefined = undefined;

      // Example logic for amount based on reward type
      if (
        (
          [
            PrismaRewardTypeEnum.DEPOSIT_BONUS,
            PrismaRewardTypeEnum.LEVEL_UP,
            PrismaRewardTypeEnum.PROMO_CODE,
            PrismaRewardTypeEnum.REGISTRATION_BONUS,
            PrismaRewardTypeEnum.TOURNAMENT_PRIZE,
            PrismaRewardTypeEnum.OTHER,
            PrismaRewardTypeEnum.BET_REBATE,
            PrismaRewardTypeEnum.DAILY_SIGN_IN,
            PrismaRewardTypeEnum.WEEKLY_CYCLE,
            PrismaRewardTypeEnum.MONTHLY_CYCLE,
          ] as (typeof rewardType)[]
        ).includes(rewardType)
      ) {
        amount = faker.number.int({ min: 100, max: 20000 }); // Cents
        currentCurrencyId = currency.id;
      } else if (rewardType === PrismaRewardTypeEnum.FREE_SPINS) {
        amount = faker.number.int({ min: 5, max: 50 }); // Number of free spins
        currentCurrencyId = undefined;
      } else if (
        rewardType === PrismaRewardTypeEnum.VIP_TASK_COMPLETION ||
        rewardType === PrismaRewardTypeEnum.ACHIEVEMENT_UNLOCKED
      ) {
        // These rewards might have their amounts/xp defined on the task/achievement itself.
        // Here we can seed a generic UserReward record representing the claim.
        amount = faker.datatype.boolean() ? faker.number.int({ min: 50, max: 5000 }) : undefined;
        if (amount) currentCurrencyId = currency.id;
      }

      await prisma.userReward
        .create({
          data: {
            userId: user.id,
            rewardType,
            description: `${rewardType.replace(/_/g, ' ')} - ${faker.lorem.words(getRandomNumber(2, 5))}`,
            status,
            amount: amount,
            currencyId: currentCurrencyId,
            metaData: {
              source: 'Seeded Reward',
              details: faker.lorem.sentence(),
            } as Prisma.JsonObject,
            claimedAt,
            expiresAt,
            availableFrom,
            vipLevelRequirement: faker.datatype.boolean(0.3) ? getRandomNumber(1, 3) : null,
          },
        })
        .catch((e) =>
          console.error(
            `Error creating user reward for user ${user.id} of type ${rewardType}: ${e.message}`
          )
        );
    }
  }
  console.log(`🌱 Seeded user rewards.`);
}
// --- END OF NEW SEEDING FUNCTIONS ---

// Define LevelConfig interface (should match your server/src/config/leveling.config.ts)
interface LevelConfig {
  level: number;
  name: string;
  xpRequired: number;
  cumulativeXpToReach: number;
  cashbackPercentage: number; // Float, e.g., 0.01 for 1%
  prioritySupport: boolean;
  benefits: any[];
  initialSpecialBonuses: number;
  levelUpRewards: any[];
}

// Placeholder - IMPORTANT: Replace with import from your actual leveling.config.ts
function getVipLevelByTotalXp(totalXp: number): LevelConfig {
  const VIP_LEVEL_CONFIGS_PLACEHOLDER: LevelConfig[] = [
    {
      level: 1,
      name: 'Rookie',
      xpRequired: 1000,
      cumulativeXpToReach: 0,
      cashbackPercentage: 0.01,
      prioritySupport: false,
      benefits: [],
      initialSpecialBonuses: 0,
      levelUpRewards: [],
    },
    {
      level: 2,
      name: 'Apprentice',
      xpRequired: 2500,
      cumulativeXpToReach: 1000,
      cashbackPercentage: 0.015,
      prioritySupport: false,
      benefits: [],
      initialSpecialBonuses: 1,
      levelUpRewards: [],
    },
    {
      level: 3,
      name: 'Adept',
      xpRequired: 5000,
      cumulativeXpToReach: 3500,
      cashbackPercentage: 0.02,
      prioritySupport: true,
      benefits: [],
      initialSpecialBonuses: 2,
      levelUpRewards: [],
    },
  ];
  for (let i = VIP_LEVEL_CONFIGS_PLACEHOLDER.length - 1; i >= 0; i--) {
    if (totalXp >= VIP_LEVEL_CONFIGS_PLACEHOLDER[i].cumulativeXpToReach) {
      return VIP_LEVEL_CONFIGS_PLACEHOLDER[i];
    }
  }
  return (
    VIP_LEVEL_CONFIGS_PLACEHOLDER[0] || {
      level: 0,
      name: 'Unranked',
      xpRequired: 100,
      cumulativeXpToReach: 0,
      cashbackPercentage: 0,
      prioritySupport: false,
      benefits: [],
      initialSpecialBonuses: 0,
      levelUpRewards: [],
    }
  );
}

async function main() {
  console.log('🚀 Starting database seed...');
  await clearDatabase();

  await seedOperatorsInternal();
  await seedCurrenciesInternal();
  await seedUsersInternal(); // This now creates Users, Accounts, Profiles, Wallets, VipInfo

  // await seedGameProvidersInternal(); // Creates global createdGameProviders

  // Ensure createdGameProviders is populated before calling seedGamesInternal
  if (createdOperators.length > 0) {
    await seedGamesInternal(); // Uses loadGames, populates global createdGames
  } else {
    console.warn('⚠️ Insufficient data (operators or game providers) for game seeding.');
  }

  if (createdOperators.length > 0 && createdCurrencies.length > 0) {
    await seedProductsInternal(); // Uses loadProducts, populates global createdProducts
  } else {
    console.warn('⚠️ Insufficient data (operators or currencies) for product seeding.');
  }

  await seedTransactionsInternal();
  await seedXpEventsInternal();

  // --- Call new seed functions ---
  await seedUserSessionsAndGameActivityInternal();
  await seedVipTasksAndProgressInternal();
  await seedAchievementsAndUserUnlocksInternal();
  await seedUserRewardsInternal();
  // --- End of new seed function calls ---

  console.log('✅ Database seed finished successfully.');
}

export default async function seedDev(): Promise<void> {
  main()
    .catch(async (e) => {
      console.error('Seeding failed:');
      console.error(e instanceof Error ? e.message : e);
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma Error Code:', e.code);
        if (e.meta) console.error('Meta:', e.meta);
      }
      await prisma.$disconnect();
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
// // Path: packages/database/src/seed/development.ts
// // (Or wherever your seed script is located, adjust import paths accordingly)

// import { faker } from '@faker-js/faker';
// import fs from 'fs';
// import path from 'path';

// // These are now imported from external files you've created
// import loadGames from './loadgames.js'; // Assuming .js extension or your TS setup handles .ts
// import loadProducts from './seedProducts.js'; // Assuming .js extension

// import {
//   PrismaClient,
//   Prisma, // For JsonNull, etc.
//   // Import actual Prisma Enums for runtime values
//   Role as PrismaRoleEnum,
//   UserStatus as PrismaUserStatusEnum,
//   TransactionType as PrismaTransactionTypeEnum,
//   TransactionStatus as PrismaTransactionStatusEnum,
//   ProductType as PrismaProductTypeEnum,
//   GameCategory as PrismaGameCategoryEnum,
//   // GameProvider is a model, not an enum of providers
//   KeyMode as PrismaKeyModeEnum,
//   // Account as PrismaAccountTypeEnum, // Assuming AccountType enum exists for Account model
//   // Import Prisma Model Types for type checking
//   User as PrismaUser,
//   Currency as PrismaCurrency,
//   Product as PrismaProductModel,
//   Game as PrismaGame,
//   GameProvider as PrismaGameProviderModel,
//   VipInfo as PrismaVipInfo,
//   Wallet as PrismaWallet,
//   Transaction as PrismaTransaction,
//   XpEvent as PrismaXpEvent,
//   OperatorAccess as PrismaOperatorAccess,
//   Account as PrismaAccount, // Added Account model type
//   Profile as PrismaProfile,
// } from '../../client'; // IMPORTANT: Adjust this path to your actual Prisma Client export location
// // e.g., '../generated/prisma', or '@prisma/client' if setup that way

// // Configuration
// const MAX_REGULAR_USERS = 9; // 1 admin + 9 regular users = MAX_USERS
// const MAX_OPERATORS = 2;
// const MAX_CURRENCIES = 3;
// const TRANSACTIONS_PER_USER = 5;
// const XP_EVENTS_PER_USER = 5;

// const prisma = new PrismaClient();

// // Global arrays to hold created entities
// let createdCurrencies: PrismaCurrency[] = [];
// let createdOperators: PrismaOperatorAccess[] = [];
// let createdUsers: PrismaUser[] = []; // Will include the admin user
// let createdWallets: PrismaWallet[] = [];
// let createdProducts: PrismaProductModel[] = [];
// let createdGameProviders: PrismaGameProviderModel[] = [];

// function getRandomItem<T>(arr: T[]): T {
//   if (arr.length === 0) throw new Error('Cannot get random item from an empty array.');
//   return arr[Math.floor(Math.random() * arr.length)];
// }

// function getRandomSubset<T>(arr: T[], count: number): T[] {
//   if (arr.length === 0) return [];
//   return [...arr].sort(() => 0.5 - Math.random()).slice(0, Math.min(count, arr.length));
// }

// async function clearDatabase(): Promise<void> {
//   console.log('🧹 Clearing existing data (order matters due to relations)...');
//   // Start from models that don't depend on others or whose dependents are deleted first
//   await prisma.xpEvent
//     .deleteMany()
//     .catch((e) => console.error('Error clearing xpEvent:', e.message));
//   await prisma.transaction
//     .deleteMany()
//     .catch((e) => console.error('Error clearing transaction:', e.message));
//   await prisma.wallet.deleteMany().catch((e) => console.error('Error clearing wallet:', e.message));
//   await prisma.vipInfo
//     .deleteMany()
//     .catch((e) => console.error('Error clearing vipInfo:', e.message));
//   await prisma.account
//     .deleteMany()
//     .catch((e) => console.error('Error clearing account:', e.message)); // Account depends on User
//   await prisma.profile
//     .deleteMany()
//     .catch((e) => console.error('Error clearing profile:', e.message)); // Profile depends on User & OperatorAccess

//   await prisma.userReward
//     .deleteMany()
//     .catch(() => console.log('UserReward table might not exist or no data to delete.'));
//   await prisma.userVipTaskProgress
//     .deleteMany()
//     .catch(() => console.log('UserVipTaskProgress table might not exist or no data to delete.'));
//   await prisma.rebateTransaction
//     .deleteMany()
//     .catch(() => console.log('RebateTransaction table might not exist or no data to delete.'));

//   await prisma.product
//     .deleteMany()
//     .catch((e) => console.error('Error clearing product:', e.message));
//   await prisma.game.deleteMany().catch((e) => console.error('Error clearing game:', e.message));
//   await prisma.account
//     .deleteMany()
//     .catch((e) => console.error('Error clearing gameProvider:', e.message));
//   await prisma.currency
//     .deleteMany()
//     .catch((e) => console.error('Error clearing currency:', e.message));
//   await prisma.operatorAccess
//     .deleteMany()
//     .catch((e) => console.error('Error clearing operatorAccess:', e.message));
//   await prisma.user.deleteMany().catch((e) => console.error('Error clearing user:', e.message));
//   console.log('✅ Data cleared.');
// }
// const hashedPassword = await Bun.password.hash('password123');
// async function seedCurrenciesInternal(): Promise<void> {
//   console.log('🌱 Seeding Currencies...');
//   const currenciesData = [
//     {
//       id: 'USD',
//       name: 'US Dollar',
//       symbol: '$',
//       type: 'FIAT',
//       precision: 2,
//       isActive: true,
//       isDefault: true,
//     },
//     {
//       id: 'EUR',
//       name: 'Euro',
//       symbol: '€',
//       type: 'FIAT',
//       precision: 2,
//       isActive: true,
//       isDefault: false,
//     },
//     {
//       id: 'JPY',
//       name: 'Japanese Yen',
//       symbol: '¥',
//       type: 'FIAT',
//       precision: 0,
//       isActive: true,
//       isDefault: false,
//     },
//     {
//       id: 'BTC',
//       name: 'Bitcoin',
//       symbol: '₿',
//       type: 'CRYPTO',
//       precision: 8,
//       isActive: true,
//       isDefault: false,
//     },
//     {
//       id: 'ETH',
//       name: 'Ethereum',
//       symbol: 'Ξ',
//       type: 'CRYPTO',
//       precision: 18,
//       isActive: true,
//       isDefault: false,
//     },
//     {
//       id: 'FUN',
//       name: 'Fun Bucks',
//       symbol: 'FB',
//       type: 'VIRTUAL',
//       precision: 0,
//       isActive: true,
//       isDefault: false,
//     },
//   ];

//   const tempCreatedCurrencies: PrismaCurrency[] = [];
//   for (const data of currenciesData.slice(0, MAX_CURRENCIES)) {
//     const currency = await prisma.currency.upsert({
//       where: { id: data.id },
//       update: data,
//       create: data,
//     });
//     tempCreatedCurrencies.push(currency);
//   }
//   createdCurrencies = tempCreatedCurrencies;
//   console.log(`🌱 Seeded ${createdCurrencies.length} currencies.`);
// }

// async function seedOperatorsInternal(): Promise<void> {
//   console.log('🌱 Seeding Operators...');
//   const tempCreatedOperators: PrismaOperatorAccess[] = [];
//   for (let i = 0; i < MAX_OPERATORS; i++) {
//     const operatorData = {
//       name: faker.company.name() + ` ${i + 1}`, // Ensure unique names for upsert
//       operator_secret: faker.string.alphanumeric(32),
//       callback_url: faker.internet.url(),
//       operator_access: faker.string.alphanumeric(16),
//       description: faker.company.catchPhrase(),
//     };
//     const operator = await prisma.operatorAccess.upsert({
//       where: { name: operatorData.name },
//       update: operatorData,
//       create: operatorData,
//     });
//     tempCreatedOperators.push(operator);
//   }
//   createdOperators = tempCreatedOperators;
//   console.log(`🌱 Seeded ${createdOperators.length} operators.`);
// }

// // Function to create a single user with associated account, profile, wallet, vipInfo
// async function createFullUser(
//   userData: Prisma.UserCreateInput,
//   isAdmin: boolean = false
// ): Promise<PrismaUser> {
//   const user = await prisma.user.create({ data: userData });

//   // Create Account (using the same password hash concept as User)
//   // Ensure your Account model has a passwordHash field if this is intended.
//   // Or, Account might not store passwordHash itself if auth is tied to User.
//   // For this example, I'll assume Account is more for linking User to provider details or type.
//   await prisma.account.create({
//     data: {
//       userId: user.id,
//       accountId: user.id,
//       providerId: 'credentials',
//       // type: PrismaAccountTypeEnum.EMAIL, // Default to email, or make it dynamic
//       // provider: 'credentials', // Or 'email'
//       // providerAccountId: user.email, // Use email as providerAccountId for 'credentials' type
//       password: hashedPassword, // Only if Account model stores its own hash
//       // Other Account fields like access_token, expires_at, etc. would be null or set by auth flows
//     },
//   });

//   // Create Profile
//   await prisma.profile.create({
//     data: {
//       userId: user.id,
//       operatorAccessId: createdOperators[0].id, // Default to first operator
//       activeCurrencyType: createdCurrencies.find((c) => c.isDefault)?.id || createdCurrencies[0].id, // Default or first currency
//       role: isAdmin ? 'ADMIN' : 'USER', // Reflecting user's role in Profile if schema supports
//       // bio: faker.person.bio(),
//       // countryCode: faker.location.countryCode('alpha-2'),
//     },
//   });

//   // Create Wallets
//   const defaultWalletCurrency = createdCurrencies.find((c) => c.isDefault) || createdCurrencies[0];
//   const userInitialWallet = await prisma.wallet.create({
//     data: {
//       userId: user.id,
//       currencyId: defaultWalletCurrency.id,
//       balance: isAdmin ? 100000000 : faker.number.int({ min: 10000, max: 5000000 }), // Admin gets 1M cents
//       bonusBalance: isAdmin ? 1000000 : faker.number.int({ min: 0, max: 500000 }), // Cents
//       lockedBalance: 0,
//     },
//   });
//   createdWallets.push(userInitialWallet); // Add to global list

//   // Create VipInfo
//   const totalXp = isAdmin ? 100000 : faker.number.int({ min: 0, max: 50000 });
//   const levelConfig = getVipLevelByTotalXp(totalXp);
//   await prisma.vipInfo.create({
//     data: {
//       userId: user.id,
//       level: levelConfig.level,
//       currentLevelXp: totalXp - levelConfig.cumulativeXpToReach,
//       totalXp: totalXp,
//       nextLevelXpRequired: levelConfig.xpRequired,
//       cashbackPercentage: levelConfig.cashbackPercentage,
//       prioritySupport: levelConfig.prioritySupport,
//       specialBonusesAvailable: isAdmin ? 10 : faker.number.int({ min: 0, max: 5 }),
//     },
//   });
//   //@ts-ignore
//   return user;
// }

// async function seedUsersInternal(): Promise<void> {
//   if (createdCurrencies.length === 0 || createdOperators.length === 0) {
//     console.warn('⚠️ Currencies or Operators not seeded. Skipping user seeding.');
//     return;
//   }
//   console.log('🌱 Seeding Users, Accounts, Profiles, Wallets, and VipInfo...');
//   const tempUsers: PrismaUser[] = [];

//   // Create Special Admin User
//   const adminPassword = 'passwordADMIN123!'; // In real app, use env var and hash it
//   const adminFirstName = 'Super';
//   const adminLastName = 'Admin';
//   const adminUser = await createFullUser(
//     {
//       email: 'admin@cashflow.com',
//       username: 'superadmin',
//       cashtag: '$cfadmin',
//       passwordHash: hashedPassword, // IMPORTANT: HASH THIS IN A REAL APP!
//       name: `${adminFirstName} ${adminLastName}`,
//       role: PrismaRoleEnum.ADMIN,
//       status: PrismaUserStatusEnum.ACTIVE,
//       emailVerified: true,
//       firstName: adminFirstName,
//       lastName: adminLastName,
//       avatarUrl: 'https://i.pravatar.cc/150?u=admin',
//       dob: new Date('1980-01-01'),
//       // preferredCurrencyId: createdCurrencies.find(c => c.isDefault)?.id || createdCurrencies[0].id,
//     },
//     true
//   );
//   tempUsers.push(adminUser);
//   console.log(`👤 Created special ADMIN user: ${adminUser.email}`);

//   // Create Regular Users
//   for (let i = 0; i < MAX_REGULAR_USERS; i++) {
//     const firstName = faker.person.firstName();
//     const lastName = faker.person.lastName();
//     const regularUser = await createFullUser({
//       email: faker.internet.email({ firstName, lastName }).toLowerCase(),
//       username: faker.internet.userName({ firstName, lastName }),
//       cashtag: `$${faker.lorem.word().toLowerCase()}${faker.number.int({ min: 100, max: 999 })}`,
//       passwordHash: hashedPassword, // HASH THIS!
//       name: `${firstName} ${lastName}`,
//       role: PrismaRoleEnum.USER,
//       status: PrismaUserStatusEnum.ACTIVE,
//       emailVerified: true,
//       firstName,
//       lastName,
//       avatarUrl: faker.image.avatar(),
//       dob: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
//       // preferredCurrencyId: getRandomItem(createdCurrencies).id,
//     });
//     tempUsers.push(regularUser);
//   }
//   createdUsers = tempUsers;
//   console.log(`🌱 Seeded ${createdUsers.length} total users.`);
// }

// // async function seedGameProvidersInternal(): Promise<void> {
// //   console.log('🌱 Seeding Game Providers...');
// //   const providerData = [
// //     { name: 'NetEntDemo', description: 'Premium gaming solutions.' },
// //     { name: 'PragmaticPlayDemo', description: 'Leading content provider to the iGaming Industry.' },
// //     { name: 'EvolutionDemo', description: 'Leader in live casino.' },
// //   ];
// //   const tempCreatedProviders: PrismaGameProviderModel[] = [];
// //   for (const data of providerData) {
// //     const provider = await prisma.gameProvider.upsert({
// //       where: { name: data.name }, // Assuming name is unique for providers
// //       update: { description: data.description, isActive: true },
// //       create: { ...data, isActive: true },
// //     });
// //     tempCreatedProviders.push(provider);
// //   }
// //   createdGameProviders = tempCreatedProviders;
// //   console.log(`🌱 Seeded ${createdGameProviders.length} game providers.`);
// // }

// async function seedGamesInternal(): Promise<void> {
//   if (createdOperators.length === 0) {
//     console.warn('⚠️ No operators seeded, cannot run loadGames. Skipping game seeding.');
//     return;
//   }
//   console.log('🌱 Seeding Games via loadGames script...');
//   try {
//     // Assuming loadGames returns the created games or handles logging
//     // Pass createdGameProviders if your loadGames function needs it
//     await loadGames(prisma, createdOperators[0].id);
//   } catch (error: any) {
//     console.error('Error during loadGames execution:', error.message);
//   }
// }

// async function seedProductsInternal(): Promise<void> {
//   if (createdOperators.length === 0 || createdCurrencies.length === 0) {
//     console.warn(
//       '⚠️ No operators or currencies seeded, cannot run loadProducts. Skipping product seeding.'
//     );
//     return;
//   }
//   console.log('🌱 Seeding Products via loadProducts script...');
//   try {
//     // Assuming loadProducts returns the created products
//     const tempProducts = await loadProducts(
//       prisma,
//       createdOperators[0].id,
//       createdCurrencies[0].id
//     );
//     if (Array.isArray(tempProducts)) {
//       createdProducts = tempProducts; // Assign to global
//       console.log(`🌱 Seeded ${createdProducts.length} products via loadProducts.`);
//     } else {
//       console.warn('⚠️ loadProducts did not return an array of products.');
//     }
//   } catch (error: any) {
//     console.error('Error during loadProducts execution:', error.message);
//   }
// }

// async function seedTransactionsInternal(): Promise<void> {
//   if (createdUsers.length === 0 || createdWallets.length === 0 || createdCurrencies.length === 0) {
//     console.warn('⚠️ Users, Wallets, or Currencies not seeded. Skipping transaction seeding.');
//     return;
//   }
//   console.log('🌱 Seeding Transactions...');

//   const tempCreatedTransactions: PrismaTransaction[] = [];
//   const status = getRandomItem(
//     Object.values(PrismaTransactionStatusEnum).filter(
//       (s) => s !== PrismaTransactionStatusEnum.PENDING
//     )
//   );
//   console.log(status);
//   for (const user of createdUsers) {
//     const userWallets = createdWallets.filter((w) => w.userId === user.id);
//     if (userWallets.length === 0) continue;
//     // console.log(Object.values(PrismaTransactionTypeEnum));
//     // console.log(PrismaTransactionTypeEnum);
//     console.log(
//       Object.values(PrismaTransactionStatusEnum).filter(
//         (s) => s !== PrismaTransactionStatusEnum.PENDING
//       )
//     );
//     for (let i = 0; i < TRANSACTIONS_PER_USER; i++) {
//       const originatorWallet = getRandomItem(userWallets);
//       const transactionType = getRandomItem(Object.values(PrismaTransactionTypeEnum));
//       const status = getRandomItem(
//         Object.values(PrismaTransactionStatusEnum).filter(
//           (s) => s !== PrismaTransactionStatusEnum.PENDING
//         )
//       );

//       let amountInCents = faker.number.int({ min: 100, max: 50000 }); // Cents
//       let description = `Transaction: ${faker.finance.transactionDescription()}`;
//       let productId: string | undefined = undefined;
//       let receiverUserId: string | undefined = undefined;

//       switch (transactionType) {
//         case PrismaTransactionTypeEnum.DEPOSIT:
//           description = 'User deposit';
//           if (createdProducts.length > 0 && Math.random() < 0.3) {
//             const product = getRandomItem(
//               createdProducts.filter(
//                 (p) =>
//                   p.currencyId === originatorWallet.currencyId &&
//                   p.productType === PrismaProductTypeEnum.DEPOSIT_PACKAGE
//               )
//             );
//             if (product) {
//               amountInCents = product.priceInCents; // price is in cents (Product.price)
//               productId = product.id;
//               description = `Deposit for product: ${product.title}`; // name on Product model
//             }
//           }
//           break;
//         case PrismaTransactionTypeEnum.WITHDRAWAL:
//           description = 'User withdrawal';
//           amountInCents = faker.number.int({
//             min: 1000,
//             max: originatorWallet.balance > 1000 ? originatorWallet.balance : 1000,
//           });
//           break;
//         case PrismaTransactionTypeEnum.INTERNAL_TRANSFER:
//           if (createdUsers.length > 1) {
//             let tempReceiver = getRandomItem(createdUsers);
//             while (tempReceiver.id === user.id) {
//               // Ensure receiver is not the originator
//               tempReceiver = getRandomItem(createdUsers);
//             }
//             receiverUserId = tempReceiver.id;
//             description = `Transfer to ${tempReceiver.username || tempReceiver.email}`;
//           } else {
//             // Skip if no other user to transfer to
//             continue;
//           }
//           break;
//       }

//       try {
//         const transaction = await prisma.transaction.create({
//           data: {
//             originatorUserId: user.id,
//             receiverUserId: receiverUserId,
//             walletId: originatorWallet.id,
//             type: transactionType,
//             status,
//             amount: amountInCents,
//             currencyId: originatorWallet.currencyId,
//             description,
//             provider:
//               status === PrismaTransactionStatusEnum.COMPLETED
//                 ? transactionType === PrismaTransactionTypeEnum.DEPOSIT
//                   ? 'CashAppMock'
//                   : 'System'
//                 : undefined,
//             providerTxId:
//               status === PrismaTransactionStatusEnum.COMPLETED
//                 ? `mock_${faker.string.alphanumeric(10)}`
//                 : undefined,
//             productId: productId,
//             processedAt:
//               status === PrismaTransactionStatusEnum.COMPLETED
//                 ? faker.date.recent({ days: 7 })
//                 : undefined,
//             balanceBefore: originatorWallet.balance,
//             balanceAfter:
//               transactionType === PrismaTransactionTypeEnum.DEPOSIT ||
//               transactionType === PrismaTransactionTypeEnum.BET_WIN
//                 ? originatorWallet.balance + amountInCents
//                 : originatorWallet.balance - amountInCents, // Simplistic for seed
//           },
//         });
//         tempCreatedTransactions.push(transaction);
//       } catch (e: any) {
//         console.error(
//           `Failed to create transaction for user ${user.id} (Type: ${transactionType}): ${e.message}`
//         );
//       }
//     }
//   }
//   console.log(`🌱 Seeded ${tempCreatedTransactions.length} transactions.`);
// }

// async function seedXpEventsInternal(): Promise<void> {
//   if (createdUsers.length === 0) {
//     console.warn('⚠️ Users not seeded. Skipping XP event seeding.');
//     return;
//   }
//   console.log('🌱 Seeding XP Events...');
//   const tempCreatedXpEvents: PrismaXpEvent[] = [];
//   const xpSources = ['GAME_PLAY', 'DAILY_LOGIN', 'CHALLENGE_COMPLETE', 'PROMO_REWARD'];

//   for (const user of createdUsers) {
//     for (let i = 0; i < XP_EVENTS_PER_USER; i++) {
//       const xpEvent = await prisma.xpEvent.create({
//         data: {
//           userId: user.id,
//           points: faker.number.int({ min: 10, max: 500 }),
//           source: getRandomItem(xpSources),
//           sourceId: faker.string.uuid(),
//           meta: { reason: faker.lorem.sentence() } as Prisma.JsonObject,
//         },
//       });
//       tempCreatedXpEvents.push(xpEvent);
//     }
//   }
//   console.log(`🌱 Seeded ${tempCreatedXpEvents.length} XP events.`);
// }

// // Define LevelConfig interface (should match your server/src/config/leveling.config.ts)
// interface LevelConfig {
//   level: number;
//   name: string;
//   xpRequired: number; // XP to complete this level (bar length)
//   cumulativeXpToReach: number; // Total XP to enter this level
//   cashbackPercentage: number; // Store as float e.g. 0.01 for 1%
//   prioritySupport: boolean;
//   benefits: any[];
//   initialSpecialBonuses: number;
//   levelUpRewards: any[];
// }

// // Placeholder - IMPORTANT: Replace with import from your actual leveling.config.ts
// function getVipLevelByTotalXp(totalXp: number): LevelConfig {
//   const VIP_LEVEL_CONFIGS_PLACEHOLDER: LevelConfig[] = [
//     {
//       level: 1,
//       name: 'Rookie',
//       xpRequired: 1000,
//       cumulativeXpToReach: 0,
//       cashbackPercentage: 0.01,
//       prioritySupport: false,
//       benefits: [],
//       initialSpecialBonuses: 0,
//       levelUpRewards: [],
//     },
//     {
//       level: 2,
//       name: 'Apprentice',
//       xpRequired: 2500,
//       cumulativeXpToReach: 1000,
//       cashbackPercentage: 0.015,
//       prioritySupport: false,
//       benefits: [],
//       initialSpecialBonuses: 1,
//       levelUpRewards: [],
//     },
//     {
//       level: 3,
//       name: 'Adept',
//       xpRequired: 5000,
//       cumulativeXpToReach: 3500,
//       cashbackPercentage: 0.02,
//       prioritySupport: true,
//       benefits: [],
//       initialSpecialBonuses: 2,
//       levelUpRewards: [],
//     },
//   ];
//   for (let i = VIP_LEVEL_CONFIGS_PLACEHOLDER.length - 1; i >= 0; i--) {
//     if (totalXp >= VIP_LEVEL_CONFIGS_PLACEHOLDER[i].cumulativeXpToReach) {
//       return VIP_LEVEL_CONFIGS_PLACEHOLDER[i];
//     }
//   }
//   return (
//     VIP_LEVEL_CONFIGS_PLACEHOLDER[0] || {
//       level: 0,
//       name: 'Unranked',
//       xpRequired: 100,
//       cumulativeXpToReach: 0,
//       cashbackPercentage: 0,
//       prioritySupport: false,
//       benefits: [],
//       initialSpecialBonuses: 0,
//       levelUpRewards: [],
//     }
//   );
// }

// async function main() {
//   console.log('🚀 Starting database seed...');
//   await clearDatabase();

//   await seedOperatorsInternal();
//   await seedCurrenciesInternal();
//   await seedUsersInternal(); // This now creates Users, Accounts, Profiles, Wallets, VipInfo

//   // await seedGameProvidersInternal(); // Creates global createdGameProviders

//   // if (createdOperators.length > 0 && createdGameProviders.length > 0) {
//   await seedGamesInternal(); // Uses loadGames and needs createdOperators, createdGameProviders
//   // } else {
//   //   console.warn('⚠️ Insufficient data (operators or game providers) for game seeding.');
//   // }

//   // if (createdOperators.length > 0 && createdCurrencies.length > 0) {
//   await seedProductsInternal(); // Uses loadProducts and needs createdOperators, createdCurrencies. Populates global createdProducts.
//   // } else {
//   //   console.warn('⚠️ Insufficient data (operators or currencies) for product seeding.');
//   // }

//   await seedTransactionsInternal();
//   await seedXpEventsInternal();

//   console.log('✅ Database seed finished successfully.');
// }

// main()
//   .catch(async (e) => {
//     console.error('Seeding failed:');
//     console.error(e instanceof Error ? e.message : e);
//     if (e instanceof Prisma.PrismaClientKnownRequestError) {
//       console.error('Prisma Error Code:', e.code);
//       if (e.meta) console.error('Meta:', e.meta);
//     }
//     await prisma.$disconnect();
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
// // console.warn("⚠️
// // // Path: packages/database/src/seed/development.ts
// // // (Or wherever your seed script is located, adjust import paths accordingly)

// // import { faker } from '@faker-js/faker';
// // import fs from 'fs';
// // import loadGames from './loadgames.js';
// // import loadProducts from './seedProducts.js';
// // import path from 'path';
// // import {
// //   PrismaClient,
// //   Prisma, // For Prisma.Decimal (if any floats remain like percentages) and JsonNull
// //   // Import actual Prisma Enums for runtime values
// //   Role as PrismaRoleEnum,
// //   UserStatus as PrismaUserStatusEnum,
// //   TransactionType as PrismaTransactionTypeEnum,
// //   TransactionStatus as PrismaTransactionStatusEnum,
// //   Product as PrismaProductTypeEnum,
// //   GameCategory as PrismaGameCategoryEnum, // Assuming this is an enum
// //   GameProvider as PrismaGameProviderEnum, // Assuming this is an enum
// //   KeyMode as PrismaKeyModeEnum, // Assuming this is an enum
// //   // Import Prisma Model Types for type checking
// //   User as PrismaUser,
// //   Currency as PrismaCurrency,
// //   Product as PrismaProduct,
// //   Game as PrismaGame,
// //   VipInfo as PrismaVipInfo,
// //   Wallet as PrismaWallet,
// //   Transaction as PrismaTransaction,
// //   XpEvent as PrismaXpEvent,
// //   OperatorAccess as PrismaOperatorAccess,
// //   // Add other necessary model types
// // } from '../../client'; // Adjust this path to your actual Prisma client export
// // import { create } from 'domain';

// // // Configuration (Keep these or adjust as needed)
// // const MAX_USERS = 10; // Increased for more varied data
// // const MAX_OPERATORS = 2;
// // const MAX_CURRENCIES = 3; // e.g., USD, EUR, and a VIRTUAL currency
// // const MAX_GAMES_FROM_JSON = 20;
// // const MAX_PRODUCTS_FROM_JSON = 10;
// // const TRANSACTIONS_PER_USER = 5;
// // const XP_EVENTS_PER_USER = 5;
// // const hashedPassword = await Bun.password.hash('password123');
// // const prisma = new PrismaClient();

// // // Helper to get a random item from an array
// // function getRandomItem<T>(arr: T[]): T {
// //   return arr[Math.floor(Math.random() * arr.length)];
// // }

// // // Helper to get a random subset of items
// // function getRandomSubset<T>(arr: T[], count: number): T[] {
// //   return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
// // }

// // async function clearDatabase(): Promise<void> {
// //   console.log('🧹 Clearing existing data (order matters due to relations)...');
// //   // Delete in an order that respects foreign key constraints
// //   await prisma.xpEvent.deleteMany();
// //   await prisma.transaction.deleteMany(); // Depends on User, Wallet, Currency, Product
// //   await prisma.wallet.deleteMany(); // Depends on User, Currency
// //   await prisma.vipInfo.deleteMany(); // Depends on User
// //   await prisma.profile.deleteMany(); // Depends on User
// //   // Delete UserReward, UserVipTaskProgress, RebateTransaction if they exist and depend on User
// //   await prisma.userReward
// //     .deleteMany()
// //     .catch(() => console.log('UserReward table might not exist or no data to delete.'));
// //   await prisma.userVipTaskProgress
// //     .deleteMany()
// //     .catch(() => console.log('UserVipTaskProgress table might not exist or no data to delete.'));
// //   await prisma.rebateTransaction
// //     .deleteMany()
// //     .catch(() => console.log('RebateTransaction table might not exist or no data to delete.'));

// //   await prisma.product.deleteMany(); // Depends on Currency
// //   await prisma.game.deleteMany(); // Depends on GameProvider
// //   // await prisma.gameProvider.deleteMany();
// //   await prisma.currency.deleteMany();
// //   await prisma.operatorAccess.deleteMany();
// //   await prisma.user.deleteMany(); // Users last (or among the last)
// //   console.log('✅ Data cleared.');
// // }
// // const createdCurrencies: PrismaCurrency[] = [];

// // async function seedCurrencies(): Promise<PrismaCurrency[]> {
// //   console.log('🌱 Seeding Currencies...');
// //   const currenciesData = [
// //     {
// //       id: 'USD',
// //       name: 'US Dollar',
// //       symbol: '$',
// //       type: 'FIAT',
// //       precision: 2,
// //       isActive: true,
// //       isDefault: true,
// //     },
// //     { id: 'EUR', name: 'Euro', symbol: '€', type: 'FIAT', precision: 2, isActive: true },
// //     { id: 'JPY', name: 'Japanese Yen', symbol: '¥', type: 'FIAT', precision: 0, isActive: true }, // Precision 0
// //     { id: 'BTC', name: 'Bitcoin', symbol: '₿', type: 'CRYPTO', precision: 8, isActive: true }, // Precision 8 for Satoshis
// //     { id: 'ETH', name: 'Ethereum', symbol: 'Ξ', type: 'CRYPTO', precision: 18, isActive: true }, // Precision 18 for Wei
// //     { id: 'FUN', name: 'Fun Bucks', symbol: 'FB', type: 'VIRTUAL', precision: 0, isActive: true }, // Virtual currency, precision 0 or 2
// //   ];

// //   for (const data of currenciesData.slice(0, MAX_CURRENCIES)) {
// //     const currency = await prisma.currency.upsert({
// //       where: { id: data.id },
// //       update: data,
// //       create: data,
// //     });
// //     createdCurrencies.push(currency);
// //   }
// //   console.log(`🌱 Seeded ${createdCurrencies.length} currencies.`);
// //   return createdCurrencies;
// // }
// // const createdOperators: PrismaOperatorAccess[] = [];

// // async function seedOperators(): Promise<PrismaOperatorAccess[]> {
// //   console.log('🌱 Seeding Operators...');
// //   for (let i = 0; i < MAX_OPERATORS; i++) {
// //     const operatorName = faker.company.name();
// //     const operator = await prisma.operatorAccess.create({
// //       data: {
// //         name: operatorName,
// //         operator_secret: 'asdfasdf',
// //         callback_url: 'asdfasdf',
// //         operator_access: 'asdfasdf',
// //         description: faker.company.catchPhrase(),
// //         // Add other fields from your OperatorAccess model if necessary
// //       },
// //     });
// //     createdOperators.push(operator);
// //   }
// //   console.log(`🌱 Seeded ${createdOperators.length} operators.`);
// //   return createdOperators;
// // }

// // async function seedUsers(
// //   currencies: PrismaCurrency[],
// //   operators: PrismaOperatorAccess[]
// // ): Promise<PrismaUser[]> {
// //   console.log('🌱 Seeding Users, Profiles, Wallets, and VipInfo...');
// //   const users: PrismaUser[] = [];

// //   for (let i = 0; i < MAX_USERS; i++) {
// //     const firstName = faker.person.firstName();
// //     const lastName = faker.person.lastName();
// //     const email = faker.internet.email({ firstName, lastName }).toLowerCase();
// //     const username = faker.internet.userName({ firstName, lastName });
// //     const cashtag = `$${faker.lorem.word().toLowerCase()}${faker.number.int({ min: 100, max: 999 })}`;
// //     const preferredCurrency = getRandomItem(currencies);

// //     // Create User
// //     const user = await prisma.user.create({
// //       data: {
// //         email,
// //         username,
// //         cashtag,
// //         passwordHash: hashedPassword, // In a real app, hash this properly!
// //         name: `${firstName} ${lastName}`,
// //         role: i === 0 ? PrismaRoleEnum.ADMIN : PrismaRoleEnum.USER, // First user is an admin
// //         status: PrismaUserStatusEnum.ACTIVE,
// //         emailVerified: true,
// //         firstName,
// //         lastName,
// //         avatarUrl: faker.image.avatar(),
// //         dob: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
// //         preferredCurrencyId: preferredCurrency.id,
// //         // Profile will be created separately if your schema has it as a distinct model with one-to-one
// //         // VipInfo will be created below
// //       },
// //     });

// //     // Create Profile (if it's a separate model)
// //     await prisma.profile.create({
// //       data: {
// //         userId: user.id,
// //         operatorAccessId: createdOperators[0].id,
// //         activeCurrencyType: 'USD',
// //         role: 'USER',

// //         // operator:{
// //         //   connect:{
// //         //     id: createdOperators[0].id
// //         //   }
// //         // }

// //         // bio: faker.person.bio(),
// //         // countryCode: faker.location.countryCode('alpha-2'),
// //         // ... other profile fields
// //       },
// //     });

// //     // Create Wallets for the user (e.g., one for each available currency or a subset)
// //     for (const currency of getRandomSubset(
// //       currencies,
// //       faker.number.int({ min: 1, max: currencies.length })
// //     )) {
// //       await prisma.wallet.create({
// //         data: {
// //           userId: user.id,
// //           currencyId: currency.id,
// //           balance: faker.number.int({ min: 0, max: 5000000 }), // Balance in CENTS (e.g., up to 50,000.00)
// //           bonusBalance: faker.number.int({ min: 0, max: 500000 }), // Cents
// //           lockedBalance: 0,
// //         },
// //       });
// //     }

// //     // Create VipInfo for the user
// //     const totalXp = faker.number.int({ min: 0, max: 50000 }); // Total XP as Int
// //     const currentLevelConfig = getVipLevelByTotalXp(totalXp); // Use your config function
// //     const currentLevelXp = totalXp - currentLevelConfig.cumulativeXpToReach; // XP within the current level

// //     await prisma.vipInfo.create({
// //       data: {
// //         userId: user.id,
// //         level: currentLevelConfig.level,
// //         currentLevelXp: currentLevelXp, // XP in cents/smallest unit if XP is decimal, or just int
// //         totalXp: totalXp, // XP as Int
// //         nextLevelXpRequired: currentLevelConfig.xpRequired, // XP bar length for current level
// //         cashbackPercentage: currentLevelConfig.cashbackPercentage, // Assuming this is Float/Decimal
// //         prioritySupport: currentLevelConfig.prioritySupport,
// //         specialBonusesAvailable: faker.number.int({ min: 0, max: 5 }),
// //         // dailyBonusClaimedAt, weekly, monthly can be null initially
// //       },
// //     });
// //     //@ts-ignore
// //     users.push(user);
// //   }
// //   console.log(`🌱 Seeded ${users.length} users with profiles, wallets, and VIP info.`);
// //   return users;
// // }

// // async function seedGameProviders(): Promise<any[]> {
// //   console.log('🌱 Seeding Game Providers...');
// //   const providerNames = ['NetEnt', 'PragmaticPlay', 'Evolution', 'Microgaming', 'PlaynGO'];
// //   const createdProviders: any[] = [];
// //   for (const name of providerNames) {
// //     // const provider = await prisma.gameProvider.upsert({
// //     //   where: { name }, // Assuming name is unique for providers
// //     //   update: { description: `Top games from ${name}` },
// //     //   create: {
// //     //     name,
// //     //     description: `Top games from ${name}`,
// //     //     isActive: true,
// //     //   },
// //     // });
// //     // createdProviders.push(provider);
// //   }
// //   console.log(`🌱 Seeded ${createdProviders.length} game providers.`);
// //   return createdProviders;
// // }

// // async function seedGames() {
// //   console.log('🌱 Seeding Games...');
// //   const gamesDataPath = path.join(__dirname, 'games2.json'); // Ensure this path is correct
// //   let createdGames: PrismaGame[] = [];
// //   if (!fs.existsSync(gamesDataPath)) {
// //     console.warn(`⚠️ games2.json not found at ${gamesDataPath}. Skipping game seeding.`);
// //     return [];
// //   }

// //   try {
// //     const gamesJson = JSON.parse(fs.readFileSync(gamesDataPath, 'utf-8'));
// //     const gamesToSeed = Array.isArray(gamesJson) ? gamesJson : gamesJson.games || [];

// //     // for (const gameData of gamesToSeed.slice(0, MAX_GAMES_FROM_JSON)) {
// //     //   if (!gameData.name || !gameData.externalId) continue;
// //     // const provider = getRandomItem();
// //     try {
// //       if (gamesToSeed.length > 0) {
// //         try {
// //           // await prisma.game.createMany({
// //           //   data: gamesToSeed,
// //           //   skipDuplicates: true, // Still useful as a fallback
// //           // });
// //           createdGames = await loadGames(prisma, createdOperators[0].id);
// //           console.log(`Successfully seeded ${gamesToSeed.length} games for operator .`);
// //         } catch (e: any) {
// //           console.error(`Error seeding games for operator:`, e.message);
// //           if (e.code === 'P2002') {
// //             console.error('Details (Unique constraint failed):', e.meta?.target);
// //           }
// //         }
// //       } else {
// //         console.log(`No new games to seed for operator .`);
// //       }
// //       // });
// //       // createdGames.push(game);
// //     } catch (e: any) {
// //       if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
// //         // P2002 is unique constraint violation
// //         console.warn(`⚠️ Game with externalId or name likely already exists. Skipping.`);
// //       } else {
// //         console.error(`Error seeding game `, e.message);
// //       }
// //     }
// //     // }
// //     console.log(`🌱 Seeded ${createdGames.length} games.`);
// //   } catch (error) {
// //     console.error('Error reading or parsing games2.json:', error);
// //   }
// //   return createdGames;
// // }

// // async function seedProducts(currencies: PrismaCurrency[]): Promise<PrismaProduct[]> {
// //   console.log('🌱 Seeding Products...');
// //   const productsDataPath = path.join(__dirname, 'products.json'); // Ensure path is correct
// //   let createdProducts: PrismaProduct[] = [];

// //   if (!fs.existsSync(productsDataPath)) {
// //     console.warn(`⚠️ products.json not found at ${productsDataPath}. Skipping product seeding.`);
// //     return [];
// //   }

// //   try {
// //     // const productsJson = JSON.parse(fs.readFileSync(productsDataPath, 'utf-8'));
// //     // const productsToSeed = Array.isArray(productsJson) ? productsJson : productsJson.products || [];

// //     // for (const productData of productsToSeed.slice(0, MAX_PRODUCTS_FROM_JSON)) {
// //     //   if (
// //     //     !productData.name ||
// //     //     typeof productData.priceInCents !== 'number' ||
// //     //     !productData.currencyId
// //     //   ) {
// //     //     console.warn(
// //     //       'Skipping product with missing name, priceInCents, or currencyId:',
// //     //       productData
// //     //     );
// //     //     continue;
// //     //   }
// //     //   // Ensure the currency for the product exists, or skip/default
// //     //   const currencyExists = currencies.find((c) => c.id === productData.currencyId);
// //     //   if (!currencyExists) {
// //     //     console.warn(
// //     //       `Currency ${productData.currencyId} for product ${productData.name} not found in seeded currencies. Skipping.`
// //     //     );
// //     //     continue;
// //     //   }

// //     try {
// //       // const product = await prisma.product.create({
// //       //   data: {
// //       //     title: productData.name,
// //       //     description: productData.description || faker.commerce.productDescription(),
// //       //     type:
// //       //       (productData.type as PrismaProductTypeEnum) || PrismaProductTypeEnum.DEPOSIT_PACKAGE,
// //       //     category: productData.category || 'General',
// //       //     price: productData.priceInCents, // Stored as Integer (cents)
// //       //     currencyId: productData.currencyId,
// //       //     isActive: productData.isActive !== undefined ? productData.isActive : true,
// //       //     iconUrl: productData.iconUrl || faker.image.urlLoremFlickr({ category: 'technics' }),
// //       //     // valueAmount, valueCurrencyId, bonusAmount, xpGranted etc. from productData
// //       //     valueAmount: productData.valueAmountInCents, // In cents
// //       //     bonusAmount: productData.bonusAmountInCents, // In cents
// //       //     xpGranted: productData.xpGranted,
// //       //   },
// //       // });
// //       //   if (productsToCreate.length > 0) {
// //       // await prisma.product.createMany({
// //       //   data: productsToSeed,
// //       //   skipDuplicates: true,
// //       // });
// //       createdProducts = await loadProducts(prisma, createdOperators[0].id, createdCurrencies[0].id);
// //       console
// //         .log
// //         // `Successfully seeded ${productsToSeed.length} products for operator ${operator.name}.`
// //         ();
// //       // } else {
// //       //   console.log(`No new products to seed for operator ${operator.name}.`);
// //       // }
// //       // }
// //       // createdProducts.push(product);
// //     } catch (e: any) {
// //       if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
// //         // console.warn(`⚠️ Product with name ${productData.name} likely already exists. Skipping.`);
// //       } else {
// //         // console.error(`Error seeding product ${productData.name}:`, e.message);
// //       }
// //       // }
// //     }
// //     console.log(`🌱 Seeded ${createdProducts.length} products.`);
// //   } catch (error) {
// //     console.error('Error reading or parsing products.json:', error);
// //   }
// //   return createdProducts;
// // }

// // async function seedTransactions(
// //   users: PrismaUser[],
// //   wallets: PrismaWallet[],
// //   currencies: PrismaCurrency[],
// //   products: PrismaProduct[]
// // ): Promise<PrismaTransaction[]> {
// //   console.log('🌱 Seeding Transactions...');
// //   const createdTransactions: PrismaTransaction[] = [];

// //   for (const user of users) {
// //     const userWallets = wallets.filter((w) => w.userId === user.id);
// //     if (userWallets.length === 0) continue;

// //     for (let i = 0; i < TRANSACTIONS_PER_USER; i++) {
// //       const originatorWallet = getRandomItem(userWallets);
// //       const transactionType = getRandomItem(Object.values(PrismaTransactionTypeEnum)); // Get a random transaction type
// //       const status = getRandomItem(
// //         Object.values(PrismaTransactionStatusEnum).filter(
// //           (s) => s !== PrismaTransactionStatusEnum.PENDING
// //         )
// //       ); // Mostly non-pending

// //       let amountInCents = faker.number.int({ min: 100, max: 500000 }); // 1.00 to 5000.00 in cents
// //       let description = `Transaction: ${faker.finance.transactionDescription()}`;
// //       let receiver: PrismaUser | undefined = undefined;
// //       let productId: string | undefined = undefined;

// //       // Adjust amount/description/receiver based on type
// //       switch (transactionType) {
// //         case PrismaTransactionTypeEnum.DEPOSIT:
// //           description = 'User deposit';
// //           if (products.length > 0 && Math.random() < 0.3) {
// //             // 30% chance of deposit being for a product
// //             const product = getRandomItem(
// //               products.filter(
// //                 (p) =>
// //                   p.currencyId === originatorWallet.currencyId &&
// //                   p.productType === 'DEPOSIT_PACKAGE'
// //               )
// //             );
// //             if (product) {
// //               amountInCents = product.priceInCents; // Price is in cents
// //               productId = product.id;
// //               description = `Deposit for product: ${product.title}`;
// //             }
// //           }
// //           break;
// //         case PrismaTransactionTypeEnum.WITHDRAWAL:
// //           description = 'User withdrawal';
// //           amountInCents = faker.number.int({
// //             min: 1000,
// //             max: originatorWallet.balance > 1000 ? originatorWallet.balance : 1000,
// //           }); // Withdraw up to balance
// //           break;
// //         case PrismaTransactionTypeEnum.BET_PLACE:
// //           description = `Bet placed on game ${faker.lorem.word()}`;
// //           break;
// //         case PrismaTransactionTypeEnum.BET_WIN:
// //           description = `Win from game ${faker.lorem.word()}`;
// //           amountInCents = faker.number.int({ min: 1, max: 100000 }); // Win amount
// //           break;
// //         // Add more cases as needed for other transaction types
// //       }

// //       try {
// //         const transaction = await prisma.transaction.create({
// //           data: {
// //             originatorUserId: user.id,
// //             // receiverUserId: receiver?.id, // Only if receiver is defined and relevant
// //             walletId: originatorWallet.id,
// //             type: transactionType,
// //             status,
// //             amount: amountInCents,
// //             currencyId: originatorWallet.currencyId,
// //             description,
// //             provider:
// //               status === PrismaTransactionStatusEnum.COMPLETED
// //                 ? transactionType === PrismaTransactionTypeEnum.DEPOSIT
// //                   ? 'CashAppMock'
// //                   : 'System'
// //                 : undefined,
// //             providerTxId:
// //               status === PrismaTransactionStatusEnum.COMPLETED
// //                 ? `mock_${faker.string.alphanumeric(10)}`
// //                 : undefined,
// //             productId: productId,
// //             processedAt:
// //               status === PrismaTransactionStatusEnum.COMPLETED
// //                 ? faker.date.recent({ days: 7 })
// //                 : undefined,
// //             // balanceBefore/After would ideally be set accurately if simulating wallet updates
// //             // For seed, can be omitted or set approximately
// //             balanceBefore: originatorWallet.balance,
// //             balanceAfter:
// //               transactionType === PrismaTransactionTypeEnum.DEPOSIT ||
// //               transactionType === PrismaTransactionTypeEnum.BET_WIN
// //                 ? originatorWallet.balance + amountInCents
// //                 : originatorWallet.balance - amountInCents, // Simplistic update for seed
// //           },
// //         });
// //         createdTransactions.push(transaction);
// //       } catch (e: any) {
// //         console.error(`Failed to create transaction for user ${user.id}: ${e.message}`);
// //       }
// //     }
// //   }
// //   console.log(`🌱 Seeded ${createdTransactions.length} transactions.`);
// //   return createdTransactions;
// // }

// // async function seedXpEvents(users: PrismaUser[]): Promise<PrismaXpEvent[]> {
// //   console.log('🌱 Seeding XP Events...');
// //   const createdXpEvents: PrismaXpEvent[] = [];
// //   const xpSources = ['GAME_PLAY', 'DAILY_LOGIN', 'CHALLENGE_COMPLETE', 'PROMO_REWARD'];

// //   for (const user of users) {
// //     for (let i = 0; i < XP_EVENTS_PER_USER; i++) {
// //       const xpEvent = await prisma.xpEvent.create({
// //         data: {
// //           userId: user.id,
// //           points: faker.number.int({ min: 10, max: 500 }),
// //           source: getRandomItem(xpSources),
// //           sourceId: faker.string.uuid(),
// //           meta: { reason: faker.lorem.sentence() },
// //         },
// //       });
// //       createdXpEvents.push(xpEvent);
// //     }
// //   }
// //   console.log(`🌱 Seeded ${createdXpEvents.length} XP events.`);
// //   return createdXpEvents;
// // }

// // // Main Seed Function
// // async function main() {
// //   console.log('🚀 Starting database seed...');
// //   await clearDatabase();

// //   const operators = await seedOperators();
// //   const currencies = await seedCurrencies();
// //   const users = await seedUsers(currencies, operators); // Pass operators if needed by user/profile seeding

// //   // Fetch all wallets to pass to transaction seeder, or query within transaction seeder per user
// //   const allWallets = await prisma.wallet.findMany();

// //   // const gameProviders = await seedGameProviders();
// //   /*const games = */ await seedGames(); // Games might be used by other seeds later
// //   const products = await seedProducts(currencies);

// //   /*const transactions = */ await seedTransactions(users, allWallets, currencies, products);
// //   /*const xpEvents = */ await seedXpEvents(users);

// //   // Add other seed functions here: UserRewards, VipTasks, etc.

// //   console.log('✅ Database seed finished successfully.');
// // }

// // // Helper function from your original script (ensure it's compatible or adjust)
// // // This is used by seedUsers to determine initial VIP level from totalXp
// // function getVipLevelByTotalXp(totalXp: number): LevelConfig {
// //   // This needs to be imported or defined based on your actual leveling.config.ts
// //   // For now, a placeholder:
// //   const VIP_LEVEL_CONFIGS_PLACEHOLDER: LevelConfig[] = [
// //     {
// //       level: 1,
// //       name: 'Rookie',
// //       xpRequired: 1000,
// //       cumulativeXpToReach: 0,
// //       cashbackPercentage: 0.01,
// //       prioritySupport: false,
// //       benefits: [],
// //       initialSpecialBonuses: 0,
// //       levelUpRewards: [],
// //     },
// //     {
// //       level: 2,
// //       name: 'Apprentice',
// //       xpRequired: 2500,
// //       cumulativeXpToReach: 1000,
// //       cashbackPercentage: 0.015,
// //       prioritySupport: false,
// //       benefits: [],
// //       initialSpecialBonuses: 1,
// //       levelUpRewards: [],
// //     },
// //     {
// //       level: 3,
// //       name: 'Adept',
// //       xpRequired: 5000,
// //       cumulativeXpToReach: 3500,
// //       cashbackPercentage: 0.02,
// //       prioritySupport: true,
// //       benefits: [],
// //       initialSpecialBonuses: 2,
// //       levelUpRewards: [],
// //     },
// //   ];
// //   // Iterate downwards to find the highest level achieved
// //   for (let i = VIP_LEVEL_CONFIGS_PLACEHOLDER.length - 1; i >= 0; i--) {
// //     if (totalXp >= VIP_LEVEL_CONFIGS_PLACEHOLDER[i].cumulativeXpToReach) {
// //       return VIP_LEVEL_CONFIGS_PLACEHOLDER[i];
// //     }
// //   }
// //   return (
// //     VIP_LEVEL_CONFIGS_PLACEHOLDER[0] || {
// //       level: 0,
// //       name: 'Unranked',
// //       xpRequired: 100,
// //       cumulativeXpToReach: 0,
// //       cashbackPercentage: 0,
// //       prioritySupport: false,
// //       benefits: [],
// //       initialSpecialBonuses: 0,
// //       levelUpRewards: [],
// //     }
// //   );
// // }

// // // Define LevelConfig interface if not imported (should match your leveling.config.ts)
// // interface LevelConfig {
// //   level: number;
// //   name: string;
// //   xpRequired: number;
// //   cumulativeXpToReach: number;
// //   cashbackPercentage: number;
// //   prioritySupport: boolean;
// //   benefits: any[]; // Simplified for seed
// //   initialSpecialBonuses: number;
// //   levelUpRewards: any[]; // Simplified
// // }

// // // --- Run the seed ---
// // main()
// //   .catch(async (e) => {
// //     console.error('Seeding failed:');
// //     console.error(e instanceof Error ? e.message : e);
// //     if (e instanceof Prisma.PrismaClientKnownRequestError) {
// //       console.error('Prisma Error Code:', e.code);
// //       if (e.meta) console.error('Meta:', e.meta);
// //     }
// //     await prisma.$disconnect();
// //     process.exit(1);
// //   })
// //   .finally(async () => {
// //     await prisma.$disconnect();
// //   });

// // // Note: If you have `import { LEVEL_THRESHOLDS, calculateLevel } from "../config/leveling.config";`
// // // from your original script, ensure `leveling.config.ts` exports these and is compatible.
// // // The `getVipLevelByTotalXp` above is a more direct way if your config contains `cumulativeXpToReach`.
// // // // prisma/seed.ts (or development.ts as per your structure)
// // // import { faker } from '@faker-js/faker';
// // // import fs from 'fs';
// // // import path from 'path';

// // // import {
// // //   // Aliasing model type
// // //   GameCategory,
// // //   GameProvider,
// // //   KeyMode,
// // //   Prisma,
// // //   Achievement as PrismaAchievementModel, // Namespace for InputTypes, JsonNull etc.
// // //   PrismaClient, // Added for typing
// // //   Currency as PrismaCurrency, // Alias model type
// // //   OperatorAccess as PrismaOperatorAccess, // Added for Transaction seeding
// // //   User as PrismaUser, // Added for typing
// // //   Role, // Added for Transaction seeding
// // //   TransactionStatus,
// // //   TransactionType,
// // //   UserStatus,
// // // } from '../prisma';

// // // // Adjust path if this script is not in `project_root/prisma` or `project_root/scripts`
// // // // --- Configuration ---
// // // const MAX_USERS = 4;
// // // const MAX_OPERATORS = 2;
// // // const MAX_CURRENCIES = 3;
// // // const MAX_ACHIEVEMENTS = 5;
// // // const MAX_GAMES_FROM_JSON = 500; // Process up to 10 games from JSON per operator
// // // const MAX_PRODUCTS_FROM_JSON = 25; // Process up to 5 products from JSON per operator
// // // const SESSIONS_PER_USER = 10; // Target ~10 sessions per user (can be less if few games)
// // // const MAX_SPINS_PER_SESSION = 20;
// // // const MIN_SPINS_PER_SESSION = 1;

// // // async function clearDatabase(prisma: any): Promise<void> {
// // //   console.log('🧹 Clearing existing data...');
// // //   // Delete in reverse order of creation and dependency
// // //   await prisma.eventLog.deleteMany({});
// // //   await prisma.gameLaunchLink.deleteMany({});
// // //   await prisma.friendship.deleteMany({});
// // //   await prisma.chatMessage.deleteMany({});
// // //   await prisma.notification.deleteMany({});
// // //   await prisma.xpEvent.deleteMany({});
// // //   await prisma.userAchievement.deleteMany({});
// // //   await prisma.gameTransaction.deleteMany({});
// // //   await prisma.transaction.deleteMany({});
// // //   await prisma.gameSession.deleteMany({});
// // //   await prisma.comment.deleteMany({});
// // //   await prisma.post.deleteMany({});
// // //   await prisma.operatorAccess.deleteMany({});
// // //   await prisma.wallet.deleteMany({});
// // //   await prisma.settings.deleteMany({});
// // //   await prisma.profile.deleteMany({});
// // //   await prisma.user.deleteMany({});
// // //   await prisma.achievement.deleteMany({});
// // //   await prisma.game.deleteMany({});
// // //   await prisma.currency.deleteMany({});
// // //   console.log('🗑️ Database cleared.');
// // // }
// // // // Helper function to load JSON data
// // // function loadJsonData(filePath: string): any {
// // //   // Assuming JSON files are relative to the location of THIS seed script
// // //   const absolutePath = path.resolve(__dirname, filePath);
// // //   try {
// // //     const fileContent = fs.readFileSync(absolutePath, 'utf-8');
// // //     return JSON.parse(fileContent);
// // //   } catch (error) {
// // //     console.error(`Error loading JSON data from ${absolutePath}:`, error);
// // //     throw error;
// // //   }
// // // }

// // // const gamesDataJson = loadJsonData('./games2.json'); // Ensure this path is correct
// // // const productsDataJson = loadJsonData('./products.json'); // Ensure this path is correct

// // // async function seedGames(prisma: PrismaClient, operator: PrismaOperatorAccess) {
// // //   console.log(`Seeding games for operator: ${operator.name} (ID: ${operator.id})`);
// // //   const gamesToCreate: Prisma.GameUncheckedCreateInput[] = [];
// // //   let gameCount = 0;

// // //   const gameList = gamesDataJson.default || gamesDataJson; // Handle { default: [...] } or [...]

// // //   for (const rawGame of gameList) {
// // //     if (gameCount >= MAX_GAMES_FROM_JSON) break;

// // //     // Perform transformations on a mutable copy
// // //     const gameInput: any = { ...rawGame };

// // //     // Delete fields not in Prisma.GameUncheckedCreateInput or handled differently
// // //     const fieldsToDelete = [
// // //       'id',
// // //       'shop_id',
// // //       'jpg_id',
// // //       'label',
// // //       'device',
// // //       'gamebank',
// // //       'lines_percent_config_spin',
// // //       'lines_percent_config_spin_bonus',
// // //       'lines_percent_config_bonus',
// // //       'lines_percent_config_bonus_bonus',
// // //       'rezerv',
// // //       'cask',
// // //       'advanced',
// // //       'bet',
// // //       'scalemode',
// // //       'slotviewstate',
// // //       'view',
// // //       'denomination',
// // //       'category_temp',
// // //       'original_id',
// // //       'bids',
// // //       'stat_in',
// // //       'stat_out',
// // //       'standard_rtp',
// // //       'current_rtp',
// // //       'rtp_stat_in',
// // //       'rtp_stat_out',
// // //       'popularity',
// // //       'developer',
// // //       'type', // developer & type are mapped
// // //     ];
// // //     fieldsToDelete.forEach((field) => delete gameInput[field]);

// // //     // Map provider from 'developer'
// // //     const providerKey = rawGame.developer?.toUpperCase() as keyof typeof GameProvider;
// // //     const provider = GameProvider[providerKey] || GameProvider.INTERNAL;
// // //     console.log(provider);

// // //     // Map category from 'type'
// // //     const categoryKey = rawGame.type
// // //       ?.toUpperCase()
// // //       .replace(/\s+/g, '_') as keyof typeof GameCategory;
// // //     const category = GameCategory[categoryKey] || GameCategory.OTHER;

// // //     // Coerce booleans
// // //     const isActive = String(rawGame.active).toLowerCase() === 'true';
// // //     const featured = String(rawGame.featured).toLowerCase() === 'true';

// // //     // Handle JSON fields
// // //     let meta: any; // Prisma.InputJsonValue = null;
// // //     if (rawGame.meta) {
// // //       try {
// // //         meta = typeof rawGame.meta === 'string' ? JSON.parse(rawGame.meta) : rawGame.meta;
// // //       } catch {
// // //         meta = { raw: rawGame.meta };
// // //       } // Store as raw if unparsable
// // //     }

// // //     let goldsvetData: any;
// // //     if (rawGame.goldsvetData) {
// // //       try {
// // //         goldsvetData =
// // //           typeof rawGame.goldsvetData === 'string'
// // //             ? JSON.parse(rawGame.goldsvetData)
// // //             : rawGame.goldsvetData;
// // //       } catch {
// // //         goldsvetData = { raw: rawGame.goldsvetData };
// // //       }
// // //     }

// // //     // Handle tags
// // //     let tags: string[] = [];
// // //     if (rawGame.tags && typeof rawGame.tags === 'string') {
// // //       tags = rawGame.tags
// // //         .split(',')
// // //         .map((t: string) => t.trim())
// // //         .filter((t: string) => t);
// // //     } else if (Array.isArray(rawGame.tags)) {
// // //       tags = rawGame.tags.filter((t: any) => typeof t === 'string');
// // //     }

// // //     // Generate a unique slug for this seeding run
// // //     const baseSlug = String(
// // //       rawGame.slug ||
// // //         faker.helpers.slugify(rawGame.title || `game-${faker.string.alphanumeric(5)}`).toLowerCase()
// // //     );
// // //     const gameSlug = `${baseSlug}-${operator.id.slice(-4)}-${gameCount}`; // Add part of operatorId for better uniqueness

// // //     const gameCreateInput: Prisma.GameUncheckedCreateInput = {
// // //       name: String(rawGame.name || `Game ${faker.word.noun()}`),
// // //       title: String(rawGame.title || `Game Title ${faker.commerce.productName()}`),
// // //       slug: gameSlug,
// // //       provider: provider,
// // //       category: category,
// // //       tags: { set: tags }, // Use 'set' for array fields in UncheckedCreateInput
// // //       isActive: isActive,
// // //       thumbnailUrl: rawGame.thumbnailUrl || faker.image.urlPlaceholder(),
// // //       bannerUrl: rawGame.bannerUrl || faker.image.urlPlaceholder(),
// // //       meta: meta,
// // //       goldsvetData: goldsvetData,
// // //       featured: featured,
// // //       description: rawGame.description || faker.lorem.sentence(),
// // //       operatorId: operator.id,
// // //     };

// // //     const existingGameBySlug = await prisma.game.findFirst({
// // //       where: { slug: gameCreateInput.slug, operatorId: operator.id },
// // //     });
// // //     if (!existingGameBySlug) {
// // //       gamesToCreate.push(gameCreateInput);
// // //       gameCount++;
// // //     } else {
// // //       console.warn(
// // //         `Game with slug ${gameCreateInput.slug} for operator ${operator.id} already exists. Skipping.`
// // //       );
// // //     }
// // //   }

// // //   if (gamesToCreate.length > 0) {
// // //     try {
// // //       await prisma.game.createMany({
// // //         data: gamesToCreate,
// // //         skipDuplicates: true, // Still useful as a fallback
// // //       });
// // //       console.log(
// // //         `Successfully seeded ${gamesToCreate.length} games for operator ${operator.name}.`
// // //       );
// // //     } catch (e: any) {
// // //       console.error(`Error seeding games for operator ${operator.name}:`, e.message);
// // //       if (e.code === 'P2002') {
// // //         console.error('Details (Unique constraint failed):', e.meta?.target);
// // //       }
// // //     }
// // //   } else {
// // //     console.log(`No new games to seed for operator ${operator.name}.`);
// // //   }
// // // }

// // // async function seedProducts(prisma: PrismaClient, operator: PrismaOperatorAccess) {
// // //   console.log(`Seeding products for operator: ${operator.name}`);
// // //   const productsToCreate: Prisma.ProductUncheckedCreateInput[] = [];
// // //   let productCount = 0;
// // //   const productDataList = productsDataJson.default || productsDataJson;

// // //   for (const rawProduct of productDataList) {
// // //     if (productCount >= MAX_PRODUCTS_FROM_JSON) break;

// // //     // Ensure numeric fields are numbers and provide defaults
// // //     const amountToReceiveInCredits = Number(rawProduct.amountToReceiveInCredits || 0);
// // //     const totalDiscountInCents = Number(rawProduct.totalDiscountInCents || 0); // This was 0 in seedProducts.js logic
// // //     const bonusSpins = Number(rawProduct.bonusSpins || 0);
// // //     const priceInCents = Number(rawProduct.priceInCents || 0);
// // //     const bonusTotalInCredits = Number(rawProduct.bonusTotalInCredits || 0);
// // //     const bestValue = Number(rawProduct.bestValue || 0);
// // //     const discountInCents = Number(rawProduct.discountInCents || 0); // Field from Product model
// // //     const isPromo =
// // //       rawProduct.isPromo === undefined
// // //         ? false
// // //         : String(rawProduct.isPromo).toLowerCase() === 'true';

// // //     const createInput: Prisma.ProductUncheckedCreateInput = {
// // //       title: String(rawProduct.title || `Product ${faker.commerce.productName()}`),
// // //       description: String(rawProduct.description || faker.commerce.productDescription()),
// // //       url: String(rawProduct.url || faker.image.url()),
// // //       productType: String(rawProduct.productType || 'package'),
// // //       bonusCode: rawProduct.bonusCode || null,
// // //       bonusTotalInCredits: bonusTotalInCredits,
// // //       priceInCents: priceInCents,
// // //       amountToReceiveInCredits: amountToReceiveInCredits,
// // //       bestValue: bestValue,
// // //       discountInCents: discountInCents,
// // //       bonusSpins: bonusSpins,
// // //       isPromo: isPromo,
// // //       totalDiscountInCents: totalDiscountInCents,
// // //       shopId: operator.id, // operatorId is mapped to shopId on Product
// // //     };
// // //     productsToCreate.push(createInput);
// // //     productCount++;
// // //   }

// // //   if (productsToCreate.length > 0) {
// // //     await prisma.product.createMany({
// // //       data: productsToCreate,
// // //       skipDuplicates: true,
// // //     });
// // //     console.log(
// // //       `Successfully seeded ${productsToCreate.length} products for operator ${operator.name}.`
// // //     );
// // //   } else {
// // //     console.log(`No new products to seed for operator ${operator.name}.`);
// // //   }
// // // }

// // // async function main() {
// // //   const prisma = new PrismaClient({
// // //     // log: ['query', 'info', 'warn', 'error'], // Uncomment for detailed logs
// // //   });
// // //   await prisma.$connect();
// // //   console.log('Starting database seed...');
// // //   await clearDatabase(prisma);
// // //   // --- Optional: Clean up data (use with caution) ---
// // //   // console.log('Cleaning up existing data...');
// // //   // await prisma.gameSpin.deleteMany({});
// // //   // await prisma.gameSession.deleteMany({});
// // //   // await prisma.gameTransaction.deleteMany({});
// // //   // await prisma.transaction.deleteMany({});
// // //   // await prisma.userAchievement.deleteMany({});
// // //   // await prisma.notification.deleteMany({});
// // //   // await prisma.chatMessage.deleteMany({});
// // //   // await prisma.friendship.deleteMany({});
// // //   // await prisma.xpEvent.deleteMany({});
// // //   // await prisma.comment.deleteMany({});
// // //   // await prisma.post.deleteMany({});
// // //   // await prisma.wallet.deleteMany({});
// // //   // await prisma.settings.deleteMany({});
// // //   // await prisma.profile.deleteMany({});
// // //   // await prisma.session.deleteMany({});
// // //   // await prisma.account.deleteMany({});
// // //   // await prisma.operatorInvitation.deleteMany({});
// // //   // await prisma.gameLaunchLink.deleteMany({});
// // //   // await prisma.product.deleteMany({});
// // //   // await prisma.game.deleteMany({});
// // //   // await prisma.eventLog.deleteMany({});
// // //   // await prisma.operatorAccess.deleteMany({});
// // //   // await prisma.user.deleteMany({});
// // //   // await prisma.achievement.deleteMany({});
// // //   // await prisma.currency.deleteMany({});
// // //   // await prisma.verification.deleteMany({});
// // //   // console.log('Data cleanup finished.');

// // //   // 1. Seed Currencies
// // //   console.log('Seeding currencies...');
// // //   const currenciesData: Prisma.CurrencyCreateInput[] = [
// // //     {
// // //       code: 'USD',
// // //       name: 'US Dollar',
// // //       symbol: '$',
// // //       precision: 2,
// // //       type: 'FIAT',
// // //       isActive: true,
// // //     },
// // //     {
// // //       code: 'EUR',
// // //       name: 'Euro',
// // //       symbol: '€',
// // //       precision: 2,
// // //       type: 'FIAT',
// // //       isActive: true,
// // //     },
// // //     {
// // //       code: 'CREDITS',
// // //       name: 'Platform Credits',
// // //       symbol: 'CR',
// // //       precision: 0,
// // //       type: 'VIRTUAL',
// // //       isActive: true,
// // //     },
// // //   ];
// // //   const createdCurrencies: PrismaCurrency[] = [];
// // //   for (const currencyData of currenciesData.slice(0, MAX_CURRENCIES)) {
// // //     const currency = await prisma.currency.upsert({
// // //       where: { code: currencyData.code },
// // //       update: {},
// // //       create: currencyData,
// // //     });
// // //     createdCurrencies.push(currency);
// // //   }
// // //   console.log(`Seeded ${createdCurrencies.length} currencies.`);

// // //   // 2. Seed Users
// // //   console.log('Seeding users...');
// // //   const usersToCreate: Prisma.UserCreateInput[] = [];
// // //   const hashedPassword = await Bun.password.hash('password123');

// // //   for (let i = 0; i < MAX_USERS; i++) {
// // //     const uniqueSuffix = faker.string.alphanumeric(4);
// // //     const username = faker.internet.userName().toLowerCase() + `_${uniqueSuffix}`;
// // //     usersToCreate.push({
// // //       name: faker.person.fullName() + `_${uniqueSuffix}`,
// // //       username: username,
// // //       email: faker.internet.email({ firstName: username }).toLowerCase(), // Ensure unique emails
// // //       emailVerified: faker.datatype.boolean(0.7),
// // //       passwordHash: hashedPassword,
// // //       role: i === 0 ? Role.OWNER : i === 1 ? Role.ADMIN : Role.USER,
// // //       status: UserStatus.ACTIVE,
// // //       image: `avatar-${(i % 5) + 1}`,
// // //       isVerified: true,
// // //       displayUsername: faker.person.firstName() + `Gamer${uniqueSuffix}`,
// // //       phone: faker.phone.number(),
// // //       cashtag: `$${faker.lorem.word().slice(0, 10)}${uniqueSuffix}`.toLowerCase(),
// // //       referralCode: faker.string.uuid(), // Prisma default is cuid(), but explicit can be good
// // //     });
// // //   }
// // //   const createdUsers: PrismaUser[] = [];
// // //   for (const userData of usersToCreate) {
// // //     try {
// // //       const user = await prisma.user.create({ data: userData });
// // //       createdUsers.push(user);
// // //     } catch (e: any) {
// // //       if (e.code === 'P2002') {
// // //         console.warn(
// // //           `User with email ${userData.email} or username ${userData.username} likely already exists. Skipping.`
// // //         );
// // //       } else {
// // //         console.error('Error creating user:', userData.email, e);
// // //         throw e;
// // //       }
// // //     }
// // //   }
// // //   console.log(`Seeded ${createdUsers.length} users.`);
// // //   if (createdUsers.length === 0) {
// // //     console.error('No users were created. Aborting further seeding.');
// // //     await prisma.$disconnect();
// // //     return;
// // //   }

// // //   // 3. Seed OperatorAccess
// // //   console.log('Seeding operators (OperatorAccess)...');
// // //   const operatorsToCreate: Prisma.OperatorAccessUncheckedCreateInput[] = [];
// // //   for (let i = 0; i < Math.min(MAX_OPERATORS, createdUsers.length); i++) {
// // //     const owner = createdUsers[i]; // Assign distinct owners if possible
// // //     operatorsToCreate.push({
// // //       name: `Operator ${faker.company.name()} ${i + 1}`,
// // //       operator_secret: await Bun.password.hash(faker.string.alphanumeric(16)),
// // //       operator_access: 'internal_services',
// // //       callback_url: faker.internet.url(),
// // //       active: true,
// // //       permissions: {
// // //         set: [KeyMode.read, KeyMode.write, KeyMode.manage_users, KeyMode.launch_game],
// // //       },
// // //       ips: { set: [faker.internet.ip(), faker.internet.ip()] },
// // //       description: faker.lorem.sentence(),
// // //       ownedById: owner.id,
// // //     });
// // //   }
// // //   const createdOperators: PrismaOperatorAccess[] = [];
// // //   if (operatorsToCreate.length > 0) {
// // //     // Cannot use createMany if you need the returned objects immediately for relations, unless you query after
// // //     for (const opData of operatorsToCreate) {
// // //       const operator = await prisma.operatorAccess.create({ data: opData });
// // //       createdOperators.push(operator);
// // //     }
// // //   }
// // //   console.log(`Seeded ${createdOperators.length} operators.`);

// // //   // 4. Seed Games & Products (linked to Operators)
// // //   for (const operator of createdOperators) {
// // //     await seedGames(prisma, operator);
// // //     await seedProducts(prisma, operator);
// // //   }

// // //   const allSeededGames = await prisma.game.findMany({
// // //     where: { operatorId: { in: createdOperators.map((op) => op.id) } },
// // //   });
// // //   if (allSeededGames.length === 0 && createdOperators.length > 0) {
// // //     // Only warn if operators exist but no games
// // //     console.warn(
// // //       'No games were found/seeded for the created operators. Skipping GameSession and GameSpin seeding.'
// // //     );
// // //   }

// // //   // 5. Seed dependent entities (Profiles, Settings, Wallets)
// // //   console.log('Seeding profiles, settings, and wallets for users...');
// // //   for (const user of createdUsers) {
// // //     await prisma.profile.upsert({
// // //       where: { userId: user.id },
// // //       update: {},
// // //       create: {
// // //         userId: user.id,
// // //         balance: faker.number.int({ min: 0, max: 100000 }),
// // //         activeCurrencyType: 'CREDITS',
// // //         operatorAccessId:
// // //           createdOperators.length > 0 && user.role !== Role.OWNER
// // //             ? createdOperators[0].id // Link non-owners to the first operator by default
// // //             : undefined,
// // //         role: user.role,
// // //       },
// // //     });
// // //     await prisma.settings.upsert({
// // //       where: { userId: user.id },
// // //       update: {},
// // //       create: {
// // //         userId: user.id,
// // //         theme: faker.helpers.arrayElement(['light', 'dark']),
// // //         language: 'en',
// // //       },
// // //     });
// // //     for (const currency of createdCurrencies) {
// // //       if (currency.code === 'USD' || currency.code === 'CREDITS') {
// // //         await prisma.wallet.upsert({
// // //           where: {
// // //             userId_currencyCode: {
// // //               userId: user.id,
// // //               currencyCode: currency.code,
// // //             },
// // //           },
// // //           update: {},
// // //           create: {
// // //             userId: user.id,
// // //             currencyCode: currency.code,
// // //             balance:
// // //               currency.code === 'CREDITS'
// // //                 ? faker.number.float({ min: 100, max: 5000, precision: 2 })
// // //                 : faker.number.float({ min: 0, max: 1000, precision: 2 }),
// // //             address: currency.type === 'CRYPTO' ? faker.finance.bitcoinAddress() : null,
// // //           },
// // //         });
// // //       }
// // //     }
// // //   }
// // //   console.log('Seeded profiles, settings, and wallets.');

// // //   // 6. Seed GameSessions and GameSpins
// // //   if (createdUsers.length > 0 && allSeededGames.length > 0) {
// // //     console.log('Seeding game sessions and spins...');
// // //     for (const user of createdUsers) {
// // //       const numSessions = faker.number.int({ min: 0, max: SESSIONS_PER_USER }); // User can have 0 to SESSIONS_PER_USER sessions
// // //       for (let i = 0; i < numSessions; i++) {
// // //         const randomGame = faker.helpers.arrayElement(allSeededGames);
// // //         const sessionStartedAt = faker.date.recent({ days: 7 });
// // //         const sessionEndedAt = faker.datatype.boolean(0.8)
// // //           ? faker.date.between({ from: sessionStartedAt, to: new Date() })
// // //           : null;

// // //         const gameSession = await prisma.gameSession.create({
// // //           data: {
// // //             userId: user.id,
// // //             gameId: randomGame.id,
// // //             isActive: !sessionEndedAt,
// // //             startedAt: sessionStartedAt,
// // //             endedAt: sessionEndedAt,
// // //             ipAddress: faker.internet.ip(),
// // //             userAgent: faker.internet.userAgent(),
// // //             sessionData: {
// // //               entryPoint: 'direct',
// // //               deviceType: faker.helpers.arrayElement(['desktop', 'mobile']),
// // //             } as Prisma.InputJsonValue,
// // //           },
// // //         });

// // //         const numSpins = faker.number.int({
// // //           min: MIN_SPINS_PER_SESSION,
// // //           max: MAX_SPINS_PER_SESSION,
// // //         });
// // //         const spinsData: Prisma.GameSpinUncheckedCreateInput[] = [];
// // //         for (let j = 0; j < numSpins; j++) {
// // //           const betAmount = faker.number.int({ min: 10, max: 500 });
// // //           const winAmount = faker.datatype.boolean(0.4)
// // //             ? faker.number.int({ min: 0, max: betAmount * 10 })
// // //             : 0;
// // //           spinsData.push({
// // //             sessionId: gameSession.id,
// // //             betAmount: betAmount,
// // //             grossWinAmount: winAmount,
// // //             spinData: {
// // //               roundId: faker.string.uuid(),
// // //               symbols: [faker.word.sample(), faker.word.sample(), faker.word.sample()],
// // //               isFreeSpin: faker.datatype.boolean(0.1),
// // //             } as Prisma.InputJsonValue,
// // //             createdAt: faker.date.between({
// // //               from: gameSession.startedAt,
// // //               to: gameSession.endedAt || new Date(),
// // //             }),
// // //           });
// // //         }
// // //         if (spinsData.length > 0) {
// // //           await prisma.gameSpin.createMany({
// // //             data: spinsData,
// // //             skipDuplicates: true,
// // //           });
// // //         }
// // //       }
// // //       console.log(`Seeded game sessions and spins for user ${user.username || user.id}.`);
// // //     }
// // //   } else {
// // //     console.log('Skipping GameSession and GameSpin seeding as there are no users or no games.');
// // //   }

// // //   // 7. Seed Achievements
// // //   console.log('Seeding achievements...');
// // //   const achievementsData: Prisma.AchievementCreateInput[] = [
// // //     { name: 'First Login', description: 'Welcome aboard!', xpReward: 10 },
// // //     {
// // //       name: 'High Roller',
// // //       description: 'Placed a significant bet.',
// // //       xpReward: 100,
// // //     },
// // //     { name: 'Social Butterfly', description: 'Made 5 friends.', xpReward: 50 },
// // //     { name: 'Explorer', description: 'Tried 3 different games.', xpReward: 30 },
// // //     {
// // //       name: 'Sharpshooter',
// // //       description: 'Won a poker hand with a Straight Flush.',
// // //       xpReward: 250,
// // //       secret: true,
// // //     },
// // //   ];
// // //   const createdAchievements: PrismaAchievementModel[] = [];
// // //   for (const achData of achievementsData.slice(0, MAX_ACHIEVEMENTS)) {
// // //     const ach = await prisma.achievement.upsert({
// // //       where: { name: achData.name },
// // //       update: achData,
// // //       create: achData,
// // //     });
// // //     createdAchievements.push(ach);
// // //   }
// // //   console.log(`Seeded ${createdAchievements.length} achievements.`);

// // //   // 8. Seed UserAchievements
// // //   if (createdUsers.length > 0 && createdAchievements.length > 0) {
// // //     console.log('Seeding user achievements...');
// // //     const userAchievementsToCreate: Prisma.UserAchievementUncheckedCreateInput[] = [];
// // //     for (let i = 0; i < Math.min(createdUsers.length, 3); i++) {
// // //       for (let j = 0; j < Math.min(createdAchievements.length, 2); j++) {
// // //         userAchievementsToCreate.push({
// // //           userId: createdUsers[i].id,
// // //           achievementId: createdAchievements[j].id,
// // //           unlockedAt: faker.date.recent({ days: 30 }),
// // //         });
// // //       }
// // //     }
// // //     if (userAchievementsToCreate.length > 0) {
// // //       await prisma.userAchievement.createMany({
// // //         data: userAchievementsToCreate,
// // //         skipDuplicates: true,
// // //       });
// // //       console.log(`Seeded ${userAchievementsToCreate.length} user achievements.`);
// // //     }
// // //   }

// // //   // 9. Seed Posts & Comments
// // //   if (createdUsers.length > 0) {
// // //     console.log('Seeding posts and comments...');
// // //     const userForPosts = createdUsers[0];
// // //     for (let i = 0; i < 2; i++) {
// // //       const post = await prisma.post.create({
// // //         data: {
// // //           title: faker.lorem.sentence(5),
// // //           content: faker.lorem.paragraphs(3),
// // //           published: true,
// // //           authorId: userForPosts.id,
// // //           tags: { set: [faker.lorem.word(), faker.lorem.word()] },
// // //         },
// // //       });
// // //       if (createdUsers.length > 1) {
// // //         await prisma.comment.create({
// // //           data: {
// // //             content: faker.lorem.sentence(),
// // //             postId: post.id,
// // //             authorId: createdUsers[1].id,
// // //           },
// // //         });
// // //       }
// // //       await prisma.comment.create({
// // //         data: {
// // //           content: faker.lorem.sentence(),
// // //           postId: post.id,
// // //           authorId: userForPosts.id,
// // //         },
// // //       });
// // //     }
// // //     console.log('Seeded posts and comments.');
// // //   }

// // //   // 10. Seed Transactions (example deposits)
// // //   if (createdUsers.length > 0 && createdCurrencies.length > 0) {
// // //     console.log('Seeding example transactions...');
// // //     const usdCurrency = createdCurrencies.find((c) => c.code === 'USD');
// // //     if (usdCurrency) {
// // //       for (let i = 0; i < Math.min(createdUsers.length, 2); i++) {
// // //         const userWallet = await prisma.wallet.findUnique({
// // //           where: {
// // //             userId_currencyCode: {
// // //               userId: createdUsers[i].id,
// // //               currencyCode: usdCurrency.code,
// // //             },
// // //           },
// // //         });
// // //         if (userWallet) {
// // //           await prisma.transaction.create({
// // //             data: {
// // //               type: TransactionType.DEPOSIT,
// // //               status: TransactionStatus.COMPLETED,
// // //               amount: faker.number.float({ min: 50, max: 200, precision: 2 }),
// // //               description: 'Initial seed deposit',
// // //               walletId: userWallet.id,
// // //               userId: createdUsers[i].id,
// // //               currencyCode: usdCurrency.code,
// // //               referenceId: faker.string.uuid(),
// // //             },
// // //           });
// // //         }
// // //       }
// // //       console.log('Seeded example transactions.');
// // //     }
// // //   }

// // //   // 11. Seed OperatorInvitations
// // //   if (createdOperators.length > 0 && createdUsers.length > 1) {
// // //     console.log('Seeding operator invitations...');
// // //     const operatorToInviteTo = createdOperators[0];
// // //     const invitingUser =
// // //       createdUsers.find((u) => u.role === Role.OWNER || u.role === Role.ADMIN) || createdUsers[0];
// // //     const userToInviteEmail = faker.internet.email().toLowerCase();

// // //     await prisma.operatorInvitation.create({
// // //       data: {
// // //         operatorId: operatorToInviteTo.id,
// // //         email: userToInviteEmail,
// // //         role: Role.MEMBER,
// // //         token: faker.string.uuid(),
// // //         expiresAt: faker.date.future({ years: 1 }),
// // //         invitedById: invitingUser.id,
// // //       },
// // //     });
// // //     if (createdUsers.length > 2) {
// // //       // Ensure enough users for this scenario
// // //       const userToAccept = createdUsers[2];
// // //       const acceptedInvite = await prisma.operatorInvitation.create({
// // //         data: {
// // //           operatorId: operatorToInviteTo.id,
// // //           email: userToAccept.email,
// // //           role: Role.MEMBER,
// // //           token: faker.string.uuid(),
// // //           expiresAt: faker.date.future({ years: 1 }),
// // //           invitedById: invitingUser.id,
// // //           acceptedAt: new Date(),
// // //           // For the relation User[] @relation("ReceivedInvitations")
// // //           // Prisma expects a connect operation if linking to existing users.
// // //           // However, the model links via `invitedById` for who sent it.
// // //           // The `User[] @relation("ReceivedInvitations")` is a bit ambiguous without a clear join field
// // //           // on OperatorInvitation pointing to the invited User's ID *before* acceptance.
// // //           // Usually, an invitation is to an email, and acceptance links it to a User.
// // //           // The schema implies `OperatorInvitation` might be linked to `User` via email or token.
// // //           // For now, we assume acceptance means updating the Profile as before.
// // //         },
// // //       });
// // //       await prisma.profile.update({
// // //         where: { userId: userToAccept.id },
// // //         data: {
// // //           operatorAccessId: operatorToInviteTo.id,
// // //           role: acceptedInvite.role,
// // //         },
// // //       });
// // //       console.log(
// // //         `Created and accepted invitation for ${userToAccept.email} to operator ${operatorToInviteTo.name}`
// // //       );
// // //     }
// // //     console.log('Seeded operator invitations.');
// // //   }

// // //   console.log('Database seed finished successfully.');
// // //   await prisma.$disconnect();
// // // }

// // // const run = () => {
// // //   main()
// // //     .catch((e) => {
// // //       console.error('Seeding failed:');
// // //       console.error(e); // Log the full error
// // //       process.exit(1);
// // //     })
// // //     .finally(async () => {
// // //       // Prisma client should be disconnected in main's success or catch path
// // //       // No need to disconnect again here if main() handles it.
// // //     });
// // // };

// // // export default run; // If you call this from package.json "db:seed:dev": "bun run src/seed/development.ts"
// // // // or if you have an index.ts in seed that calls run() from specific environment files.

// // // // If this file is directly executed, you might want to call run() here:
// // // // run(); // Uncomment if you execute this file directly like `bun src/seed/development.ts`

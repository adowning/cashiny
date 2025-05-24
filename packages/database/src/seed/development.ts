// Path: packages/database/src/seed/development.ts
// (Or wherever your seed script is located, adjust import paths accordingly)

import { faker } from '@faker-js/faker'

// These are now imported from external files you've created
import loadGames from './loadgames.js' // Assuming .js extension or your TS setup handles .ts
import loadProducts from './seedProducts.js' // Assuming .js extension
import { UserWithProfile } from '@cashflow/types'
import {
  PrismaClient,
  Game,
  Currency,
  User,
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
} from '../../client' // User-provided path
import { generateUsernames } from './wutang.js'

// Configuration
const MAX_REGULAR_USERS = 40 // 1 admin + 9 regular users = MAX_USERS
const MAX_OPERATORS = 1
const MAX_CURRENCIES = 2
const TRANSACTIONS_PER_USER = 45
const XP_EVENTS_PER_USER = 75

// --- START OF NEW CONFIGURATION CONSTANTS ---
const SESSIONS_PER_USER_MIN = 1
const SESSIONS_PER_USER_MAX = 30
const GAME_SESSIONS_PER_SESSION_MIN = 2
const GAME_SESSIONS_PER_SESSION_MAX = 20
const SPINS_PER_GAME_SESSION_MIN = 1
const SPINS_PER_GAME_SESSION_MAX = 70
const total_potential_spins =
  MAX_REGULAR_USERS *
  SESSIONS_PER_USER_MAX *
  GAME_SESSIONS_PER_SESSION_MAX *
  SPINS_PER_GAME_SESSION_MAX
const MAX_VIP_TASKS_TO_SEED = 5
const MAX_ACHIEVEMENTS_TO_SEED = 10
const USER_ACHIEVEMENTS_TO_ASSIGN_MIN = 0
const USER_ACHIEVEMENTS_TO_ASSIGN_MAX = 10
const USER_REWARDS_PER_USER_MIN = 1
const USER_REWARDS_PER_USER_MAX = 15
// --- END OF NEW CONFIGURATION CONSTANTS ---

const prisma = new PrismaClient()
if (total_potential_spins > 200000)
  console.error(
    `Total number of potential spins is fucking high like ${total_potential_spins} high...`
  )

setTimeout(() => {}, 2000)

// Global arrays to hold created entities
let createdCurrencies: PrismaCurrency[] = []
let createdOperators: PrismaOperatorAccess[] = []
let createdUsers: PrismaUser[] = [] // Will include the admin user
let createdWallets: PrismaWallet[] = []
let createdProducts: PrismaProductModel[] = []
// let createdGameProviders: PrismaGameProviderModel[] = []
let createdGames: PrismaGame[] = [] // Populated by seedGamesInternal via loadGames
let createdVipTasks: PrismaVipTask[] = [] // <<<< ADDED
let createdAchievements: PrismaAchievement[] = [] // <<<< ADDED

function getRandomItem<T>(arr: T[]): T {
  if (arr.length === 0) {
    console.error(
      'Attempted to get random item from an empty array. This might indicate a problem with previous seeding steps (e.g., games not loaded).'
    )
    throw new Error('Cannot get random item from an empty array.')
  }
  return arr[Math.floor(Math.random() * arr.length)]
}

// --- START OF NEW HELPER ---
function getRandomNumber(min: number, max: number): number {
  return faker.number.int({ min, max })
}
// --- END OF NEW HELPER ---

function getRandomSubset<T>(arr: T[], count: number): T[] {
  if (arr.length === 0) return []
  const actualCount = Math.min(count, arr.length)
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, actualCount)
}

async function clearDatabase(): Promise<void> {
  console.log('🧹 Clearing existing data using TRUNCATE... (PostgreSQL CASCADE)')

  console.log('🧹 Clearing existing data using TRUNCATE ... RESTART IDENTITY CASCADE (PostgreSQL)')

  // Extract table names from your Prisma schema based on @@map or model name
  // IMPORTANT: Verify these against your actual database schema if unsure,
  // especially for models without an explicit @@map.
  // For PostgreSQL, quote table names to preserve case if they were created as such.
  const tableNames = [
    // Tables derived from @@map

    'currency',
    'users',
    'sessions',
    'account',
    'verifications',
    'profiles',
    'user_settings',
    'wallets',
    'operator_access_keys',
    'achievements',
    'games',
    'posts',
    'comments',
    'game_spins',
    'game_sessions',
    'user_achievements',
    'xp_events',
    'notifications',
    'chat_messages',
    'friendships',
    'transactions',
    'game_launch_links',
    'products',
    'event_logs',
    'operator_invitations',
    'vipinfos',
    'user_rewards',
    'vip_tasks',
    'user_vip_task_progress',
    'rebate_transactions',
    // Models without explicit @@map - assuming table name matches model name.
    // Quote them for case-sensitivity in PostgreSQL.
    // User should verify these if a global naming convention (e.g., snake_case) is applied by Prisma by default.
    // 'GameSpin',
    // 'UserVipTaskProgress',
    // 'VipTask',
    // 'UserReward',
    // 'RebateTransaction',
    // "GameProvider" // Was commented out in your original delete sequence; add if needed.
  ]

  if (tableNames.length === 0) {
    console.log('No table names derived for truncation. Please check the list.')
    return
  }

  // Construct the TRUNCATE command
  // Using JSON.stringify for each name ensures proper quoting for names that might need it.
  const tableNamesString = tableNames.map((name) => `${JSON.stringify(name)}`).join(', ')
  const truncateCommand = `TRUNCATE TABLE ${tableNamesString} RESTART IDENTITY CASCADE;`

  console.log(`Executing: ${truncateCommand}`)

  try {
    await prisma.$executeRawUnsafe(truncateCommand)
    console.log('✅ Data cleared successfully with TRUNCATE RESTART IDENTITY CASCADE.')
  } catch (e: any) {
    console.error('Error during TRUNCATE CASCADE operation:', e.message)
    console.error(
      'Details: Make sure the database user has TRUNCATE permissions. ' +
        'Verify that all listed table names are correct (including case and quotes if necessary) ' +
        'and exist in your public schema or the relevant search path.'
    )
    // Optionally, you could fall back to the slower deleteMany() method here if TRUNCATE fails,
    // though for a seeding script, often failing fast is preferable to indicate a schema/permission issue.
  }

  console.log('✅ Data cleared.')
}
const hashedPassword = await Bun.password.hash('password123') // This is top-level await, ensure your execution env supports it or move into async function

async function seedCurrenciesInternal(): Promise<void> {
  console.log('🌱 Seeding Currencies...')
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
  ]

  const tempCreatedCurrencies: PrismaCurrency[] = []
  for (const data of currenciesData.slice(0, MAX_CURRENCIES)) {
    const currency = await prisma.currency.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    })
    tempCreatedCurrencies.push(currency)
  }
  createdCurrencies = tempCreatedCurrencies
  console.log(`🌱 Seeded ${createdCurrencies.length} currencies.`)
}

async function seedOperatorsInternal(): Promise<void> {
  console.log('🌱 Seeding Operators...')
  const tempCreatedOperators: PrismaOperatorAccess[] = []
  for (let i = 0; i < MAX_OPERATORS; i++) {
    const operatorData = {
      name: faker.company.name() + ` ${i + 1}`,
      operator_secret: faker.string.alphanumeric(32),
      callbackUrl: faker.internet.url(),
      operator_access: faker.string.alphanumeric(16),
      description: faker.company.catchPhrase(),
    }
    const operator = await prisma.operatorAccess.upsert({
      where: { name: operatorData.name },
      update: operatorData,
      create: operatorData,
    })
    tempCreatedOperators.push(operator)
  }
  createdOperators = tempCreatedOperators
  console.log(`🌱 Seeded ${createdOperators.length} operators.`)
}

async function createFullUser(
  userData: Prisma.UserCreateInput,
  isAdmin: boolean = false
): Promise<PrismaUser> {
  const user = await prisma.user.create({ data: userData })

  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id, // As per your script
      providerId: 'credentials', // As per your script
      // type: PrismaAccountTypeEnum.EMAIL, // Ensure this enum exists and is imported
      password: userData.passwordHash, // As per your script, if UserCreateInput contains passwordHash for Account
    },
  })

  const firstOperatorId = createdOperators.length > 0 ? createdOperators[0].id : undefined
  const defaultCurrencyId =
    createdCurrencies.find((c) => c.isDefault)?.id ||
    (createdCurrencies.length > 0 ? createdCurrencies[0].id : undefined)

  if (!firstOperatorId && createdOperators.length > 0)
    console.warn('Profile Warning: No firstOperatorId, but operators exist.')
  if (!defaultCurrencyId && createdCurrencies.length > 0)
    console.warn('Profile Warning: No defaultCurrencyId, but currencies exist.')

  await prisma.profile.create({
    data: {
      userId: user.id,
      operatorAccessId: firstOperatorId,
      activeCurrencyType: defaultCurrencyId, // Your script uses this, assumes it's currency ID string
      role: isAdmin ? 'ADMIN' : 'USER', // As per your script
    },
  })

  if (defaultCurrencyId) {
    const userInitialWallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        currencyId: defaultCurrencyId,
        balance: isAdmin ? 100000000 : faker.number.int({ min: 10000, max: 5000000 }),
        bonusBalance: isAdmin ? 1000000 : faker.number.int({ min: 0, max: 500000 }),
        lockedBalance: 0,
      },
    })
    createdWallets.push(userInitialWallet)
  }

  const totalXp = isAdmin ? 100000 : faker.number.int({ min: 0, max: 50000 })
  const levelConfig = getVipLevelByTotalXp(totalXp)
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
  })
  //@ts-ignore
  return user // Your script had @ts-ignore here. It's because PrismaUser type doesn't include relations by default.
  // A better fix is to type the return as Promise<User & { relations... if needed elsewhere}> or just User
}

async function seedUsersInternal(): Promise<void> {
  if (createdCurrencies.length === 0 || createdOperators.length === 0) {
    console.warn('⚠️ Currencies or Operators not seeded. Skipping user seeding.')
    return
  }
  console.log('🌱 Seeding Users, Accounts, Profiles, Wallets, and VipInfo...')
  const tangNamesList = generateUsernames(MAX_REGULAR_USERS)
  console.log(tangNamesList)
  const tempUsers: PrismaUser[] = []

  const adminPassword = 'passwordADMIN123!'
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
  )
  console.log(tangNamesList.length)
  tempUsers.push(adminUser)
  console.log(`👤 Created special ADMIN user: ${adminUser.email}`)
  for (let i = 0; i < MAX_REGULAR_USERS; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const userName = tangNamesList[i] //getRandomItem(tangNamesList)
    console.log(userName)
    const avatarUrl = `avatar-${Math.floor(Math.random() * 30)}.webp`
    const regularUser = await createFullUser({
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      username: userName,
      cashtag: `$${faker.lorem.word().toLowerCase()}`,
      passwordHash: hashedPassword,
      name: userName,
      role: PrismaRoleEnum.USER,
      status: PrismaUserStatusEnum.ACTIVE,
      emailVerified: true,
      firstName,
      lastName,
      avatarUrl,
      dob: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      // preferredCurrencyId: getRandomItem(createdCurrencies).id, // Set in createFullUser
    })
    tempUsers.push(regularUser)
  }
  createdUsers = tempUsers
  console.log(`🌱 Seeded ${createdUsers.length} total users.`)
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
    console.warn('⚠️ No operators seeded, cannot run loadGames. Skipping game seeding.')
    return
  }
  // if (createdGameProviders.length === 0) {
  //   console.warn('⚠️ No game providers seeded for loadGames. Skipping game seeding.');
  //   // It's better if loadGames can create providers if they don't exist, or we seed them robustly first.
  //   // For now, let loadGames attempt with potentially no providers if createdGameProviders is empty.
  // }
  console.log('🌱 Seeding Games via loadGames script...')
  try {
    const gamesFromScript = await loadGames(prisma, { id: createdOperators[0].id }) // Pass createdGameProviders
    if (Array.isArray(gamesFromScript)) {
      createdGames = gamesFromScript // Populate global createdGames
      console.log(`🌱 Populated ${createdGames.length} games into global array from loadGames.`)
    } else {
      console.warn(
        `⚠️ loadGames did not return an array. Global createdGames might be empty. Attempting fallback.`
      )
      createdGames = await prisma.game.findMany({ take: 50 }) // Fallback
      if (createdGames.length > 0)
        console.log(`🌱 Fetched ${createdGames.length} games as fallback for session seeding.`)
    }
  } catch (error: any) {
    console.error('Error during loadGames execution:', error.message)
  }
}

// Your existing seedProductsInternal
async function seedProductsInternal(): Promise<void> {
  if (createdOperators.length === 0 || createdCurrencies.length === 0) {
    console.warn(
      '⚠️ No operators or currencies seeded, cannot run loadProducts. Skipping product seeding.'
    )
    return
  }
  console.log('🌱 Seeding Products via loadProducts script...')
  try {
    const tempProducts = await loadProducts(prisma, createdOperators[0].id, createdCurrencies[0].id)
    if (Array.isArray(tempProducts)) {
      createdProducts = tempProducts
      console.log(`🌱 Seeded ${createdProducts.length} products via loadProducts.`)
    } else {
      console.warn('⚠️ loadProducts did not return an array of products.')
    }
  } catch (error: any) {
    console.error('Error during loadProducts execution:', error.message)
  }
}

// Your existing seedTransactionsInternal
async function seedTransactionsInternal(): Promise<void> {

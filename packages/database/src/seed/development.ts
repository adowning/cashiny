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
    const avatarUrl = `avatar-${Math.random() * 30}.webp`
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
    const gamesFromScript = await loadGames(prisma, createdOperators[0].id) // Pass createdGameProviders
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
  if (createdUsers.length === 0 || createdWallets.length === 0 || createdCurrencies.length === 0) {
    console.warn('⚠️ Users, Wallets, or Currencies not seeded. Skipping transaction seeding.')
    return
  }
  console.log('🌱 Seeding Transactions...')

  const tempCreatedTransactions: PrismaTransaction[] = []
  // const status = getRandomItem( // This status was defined but not used later in the loop
  //   Object.values(PrismaTransactionStatusEnum).filter(
  //     (s) => s !== PrismaTransactionStatusEnum.PENDING
  //   )
  // );
  // console.log(status); // From your script
  for (const user of createdUsers) {
    const userWallets = createdWallets.filter((w) => w.userId === user.id)
    if (userWallets.length === 0) continue

    for (let i = 0; i < TRANSACTIONS_PER_USER; i++) {
      const originatorWallet = getRandomItem(userWallets)
      const transactionType = getRandomItem(Object.values(PrismaTransactionTypeEnum))
      const currentStatus = getRandomItem(
        // Renamed from status to avoid conflict
        Object.values(PrismaTransactionStatusEnum).filter(
          (s) => s !== PrismaTransactionStatusEnum.PENDING
        )
      )

      let amountInCents = faker.number.int({ min: 100, max: 50000 }) // Cents
      let description = `Transaction: ${faker.finance.transactionDescription()}`
      let productId: string | undefined = undefined
      let receiverUserId: string | undefined = undefined // From your script

      switch (transactionType) {
        case PrismaTransactionTypeEnum.DEPOSIT:
          description = 'User deposit'
          if (createdProducts.length > 0 && Math.random() < 0.3) {
            const product = getRandomItem(
              createdProducts.filter(
                (p) =>
                  p.currencyId === originatorWallet.currencyId &&
                  p.productType === PrismaProductTypeEnum.DEPOSIT_PACKAGE // Using type from Product model
              )
            )
            if (product) {
              amountInCents = product.priceInCents // Assuming Product.price is in cents
              productId = product.id
              description = `Deposit for product: ${product.title}` // Assuming Product.name
            }
          }
          break
        case PrismaTransactionTypeEnum.WITHDRAWAL:
          description = 'User withdrawal'
          amountInCents = faker.number.int({
            min: 1000,
            max: originatorWallet.balance > 1000 ? originatorWallet.balance : 1000,
          })
          break
        case PrismaTransactionTypeEnum.INTERNAL_TRANSFER: // From your script
          if (createdUsers.length > 1) {
            let tempReceiver = getRandomItem(createdUsers.filter((u) => u.id !== user.id))
            if (tempReceiver) {
              receiverUserId = tempReceiver.id
              description = `Transfer to ${tempReceiver.username || tempReceiver.email}`
            } else continue
          } else continue
          break
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
        })
        tempCreatedTransactions.push(transaction)
      } catch (e: any) {
        console.error(
          `Failed to create transaction for user ${user.id} (Type: ${transactionType}): ${e.message}`
        )
      }
    }
  }
  console.log(`🌱 Seeded ${tempCreatedTransactions.length} transactions.`)
}

// Your existing seedXpEventsInternal function
async function seedXpEventsInternal(): Promise<void> {
  if (createdUsers.length === 0) {
    console.warn('⚠️ Users not seeded. Skipping XP event seeding.')
    return
  }
  console.log('🌱 Seeding XP Events...')
  const tempCreatedXpEvents: PrismaXpEvent[] = []
  const xpSources = ['GAME_PLAY', 'DAILY_LOGIN', 'CHALLENGE_COMPLETE', 'PROMO_REWARD']

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
      })
      tempCreatedXpEvents.push(xpEvent)
    }
  }
  console.log(`🌱 Seeded ${tempCreatedXpEvents.length} XP events.`)
}

// --- START OF NEW SEEDING FUNCTIONS (Appended) ---
async function seedUserDataWithOptimization(
  createdUsers: User[],
  createdGames: Game[],
  createdCurrencies: Currency[]
) {
  for (const user of createdUsers) {
    console.log(`🌱 Seeding User ${user.username} Sessions, Game Sessions, and Game Spins...`)
    const numSessions = getRandomNumber(SESSIONS_PER_USER_MIN, SESSIONS_PER_USER_MAX)
    const userSessionProcessingPromises: Promise<void>[] = []

    for (let i = 0; i < numSessions; i++) {
      userSessionProcessingPromises.push(
        (async () => {
          const sessionStartTime = faker.date.recent({ days: 30 })
          const sessionDurationMinutes = getRandomNumber(30, 240)
          const sessionEndTime = new Date(
            sessionStartTime.getTime() + sessionDurationMinutes * 60000
          )

          const session = await prisma.session.create({
            data: {
              userId: user.id,
              ipAddress: faker.internet.ip(),
              userAgent: faker.internet.userAgent(),
              startTime: sessionStartTime,
              endTime: sessionEndTime, // This is a Date object
              token: faker.string.uuid(),
              expiresAt: new Date(sessionEndTime.getTime() + 1000 * 60 * 60 * 24 * 30),
              lastActivityAt: sessionStartTime,
            },
          })

          // Explicitly assert session.endTime is a Date if its Prisma type is Date | null
          const definiteSessionEndTime = session.endTime as Date // Or provide a fallback if it could truly be null by logic

          const numGameSessions = getRandomNumber(
            GAME_SESSIONS_PER_SESSION_MIN,
            GAME_SESSIONS_PER_SESSION_MAX
          )
          const gamesForThisUserSession = getRandomSubset(createdGames, numGameSessions)
          const gameSessionProcessingPromises: Promise<Date | null>[] = []

          for (const game of gamesForThisUserSession) {
            gameSessionProcessingPromises.push(
              (async () => {
                const gameSessionStartTime = faker.date.between({
                  from: session.startTime, // This is a Date
                  to: definiteSessionEndTime, // Use the asserted Date
                })

                const maxPossibleGameSessionDurationMs =
                  definiteSessionEndTime.getTime() - gameSessionStartTime.getTime()

                let gameSessionDurationMinutes = getRandomNumber(
                  5,
                  Math.max(5, Math.floor(maxPossibleGameSessionDurationMs / 60000))
                )

                if (gameSessionDurationMinutes < 5) {
                  console.warn(
                    `Skipping game session for game ${game.id} for user ${user.username} due to insufficient time window.`
                  )
                  return null
                }

                const gameSessionEndTime = new Date(
                  gameSessionStartTime.getTime() + gameSessionDurationMinutes * 60000
                )

                const gameSession = await prisma.gameSession.create({
                  data: {
                    sessionId: session.id,
                    userId: user.id,
                    gameId: game.id,
                    startTime: gameSessionStartTime,
                    endTime: gameSessionEndTime, // This is a Date object
                    totalWagered: 0,
                    totalWon: 0,
                  },
                })

                // Explicitly assert gameSession.endTime
                const definiteGameSessionEndTime = gameSession.endTime as Date

                const numSpins = getRandomNumber(
                  SPINS_PER_GAME_SESSION_MIN,
                  SPINS_PER_GAME_SESSION_MAX
                )
                const spinsToCreateData: Prisma.GameSpinCreateManyInput[] = []
                let gameSessionAggregatedWagered = 0
                let gameSessionAggregatedWon = 0
                let gameSessionUsedCurrencyId: string | null = null

                for (let k = 0; k < numSpins; k++) {
                  const spinCurrency = getRandomItem(createdCurrencies)
                  if (!gameSessionUsedCurrencyId && spinCurrency)
                    gameSessionUsedCurrencyId = spinCurrency.id

                  const wagerAmountCents = faker.number.int({ min: 10, max: 5000 })
                  const winAmountCents =
                    Math.random() > 0.4
                      ? faker.number.int({ min: 0, max: wagerAmountCents * getRandomNumber(0, 20) })
                      : 0

                  spinsToCreateData.push({
                    gameSessionId: gameSession.id,
                    sessionId: session.id,
                    wagerAmount: wagerAmountCents,
                    grossWinAmount: winAmountCents,
                    currencyId: spinCurrency.id,
                    spinData: {
                      symbols: ['A', 'K', 'Q'],
                      lines: [[0, 1, 2]],
                      payout: winAmountCents,
                      details: faker.lorem.words(3),
                    } as Prisma.JsonObject, // Correctly cast complex object to Prisma.JsonObject
                    timeStamp: faker.date.between({
                      from: gameSession.startTime as Date, // This is a Date
                      to: definiteGameSessionEndTime, // Use the asserted Date
                    }),
                  })
                  gameSessionAggregatedWagered += wagerAmountCents
                  gameSessionAggregatedWon += winAmountCents
                }

                if (spinsToCreateData.length > 0) {
                  await prisma.gameSpin.createMany({
                    data: spinsToCreateData,
                  })
                }

                if (gameSessionUsedCurrencyId && spinsToCreateData.length > 0) {
                  await prisma.gameSession.update({
                    where: { id: gameSession.id },
                    data: {
                      totalWagered: gameSessionAggregatedWagered,
                      totalWon: gameSessionAggregatedWon,
                      currencyId: gameSessionUsedCurrencyId,
                    },
                  })
                }
                return gameSession.endTime
              })()
            )
          }

          const gameSessionEndTimes = (await Promise.all(gameSessionProcessingPromises)).filter(
            (t) => t !== null
          ) as Date[]

          if (gameSessionEndTimes.length > 0) {
            const latestActivity = new Date(
              Math.max(...gameSessionEndTimes.map((d) => d.getTime()))
            )
            if (latestActivity > (session.lastActivityAt as Date)) {
              // Check if update is necessary
              await prisma.session.update({
                where: { id: session.id },
                data: { lastActivityAt: latestActivity },
              })
            }
          }
        })()
      )
    }
    await Promise.all(userSessionProcessingPromises)
    console.log(`✅ Finished seeding for user ${user.username}`)
  }
  console.log(`🌱 All user data seeding complete.`)
}
async function seedUserSessionsAndGameActivityInternal(): Promise<void> {
  if (createdUsers.length === 0) {
    console.warn('⚠️ Users not seeded. Skipping session and game activity seeding.')
    return
  }
  if (createdGames.length === 0) {
    console.warn(
      "⚠️ 'createdGames' array is empty (possibly due to 'loadGames' not populating it or no games in DB). Skipping game activity seeding."
    )
    return // Exit if no games are available, as game sessions/spins depend on them
  }
  if (createdCurrencies.length === 0) {
    console.warn('⚠️ Currencies not seeded. Game spins cannot be properly created. Skipping.')
    return
  }

  console.log('🌱 Seeding User Sessions, Game Sessions, and Game Spins...')
  seedUserDataWithOptimization(createdUsers, createdGames, createdCurrencies)
  //  for (const user of createdUsers) {
  //     console.log(`🌱 Seeding User ${user.username} Sessions, Game Sessions, and Game Spins...`);
  //     const numSessions = getRandomNumber(SESSIONS_PER_USER_MIN, SESSIONS_PER_USER_MAX);
  //     const userSessionProcessingPromises: Promise<void>[] = [];

  //     for (let i = 0; i < numSessions; i++) {
  //       userSessionProcessingPromises.push(
  //         (async () => {
  //           const sessionStartTime = faker.date.recent({ days: 30 });
  //           const sessionDurationMinutes = getRandomNumber(30, 240);
  //           const sessionEndTime = new Date(sessionStartTime.getTime() + sessionDurationMinutes * 60000);

  //           const session = await prisma.session.create({
  //             data: {
  //               userId: user.id,
  //               ipAddress: faker.internet.ip(),
  //               userAgent: faker.internet.userAgent(),
  //               startTime: sessionStartTime,
  //               endTime: sessionEndTime, // This is a Date object
  //               token: faker.string.uuid(),
  //               expiresAt: new Date(sessionEndTime.getTime() + 1000 * 60 * 60 * 24 * 30),
  //               lastActivityAt: sessionStartTime,
  //             },
  //           });

  //           // Explicitly assert session.endTime is a Date if its Prisma type is Date | null
  //           const definiteSessionEndTime = session.endTime as Date; // Or provide a fallback if it could truly be null by logic

  //           const numGameSessions = getRandomNumber(
  //             GAME_SESSIONS_PER_SESSION_MIN,
  //             GAME_SESSIONS_PER_SESSION_MAX
  //           );
  //           const gamesForThisUserSession = getRandomSubset(createdGames, numGameSessions);
  //           const gameSessionProcessingPromises: Promise<Date | null>[] = [];

  //           for (const game of gamesForThisUserSession) {
  //             gameSessionProcessingPromises.push(
  //               (async () => {
  //                 const gameSessionStartTime = faker.date.between({
  //                   from: session.startTime, // This is a Date
  //                   to: definiteSessionEndTime,   // Use the asserted Date
  //                 });

  //                 const maxPossibleGameSessionDurationMs =
  //                   definiteSessionEndTime.getTime() - gameSessionStartTime.getTime();

  //                 let gameSessionDurationMinutes = getRandomNumber(
  //                   5,
  //                   Math.max(5, Math.floor(maxPossibleGameSessionDurationMs / 60000))
  //                 );

  //                 if (gameSessionDurationMinutes < 5) {
  //                   console.warn(`Skipping game session for game ${game.id} for user ${user.username} due to insufficient time window.`);
  //                   return null;
  //                 }

  //                 const gameSessionEndTime = new Date(
  //                   gameSessionStartTime.getTime() + gameSessionDurationMinutes * 60000
  //                 );

  //                 const gameSession = await prisma.gameSession.create({
  //                   data: {
  //                     sessionId: session.id,
  //                     userId: user.id,
  //                     gameId: game.id,
  //                     startTime: gameSessionStartTime,
  //                     endTime: gameSessionEndTime, // This is a Date object
  //                     totalWagered: 0,
  //                     totalWon: 0,
  //                   },
  //                 });

  //                 // Explicitly assert gameSession.endTime
  //                 const definiteGameSessionEndTime = gameSession.endTime as Date;

  //                 const numSpins = getRandomNumber(SPINS_PER_GAME_SESSION_MIN, SPINS_PER_GAME_SESSION_MAX);
  //                 const spinsToCreateData: Prisma.GameSpinCreateManyInput[] = [];
  //                 let gameSessionAggregatedWagered = 0;
  //                 let gameSessionAggregatedWon = 0;
  //                 let gameSessionUsedCurrencyId: string | null = null;

  //                 for (let k = 0; k < numSpins; k++) {
  //                   const spinCurrency = getRandomItem(createdCurrencies);
  //                   if (!gameSessionUsedCurrencyId && spinCurrency) gameSessionUsedCurrencyId = spinCurrency.id;

  //                   const wagerAmountCents = faker.number.int({ min: 10, max: 5000 });
  //                   const winAmountCents =
  //                     Math.random() > 0.4
  //                       ? faker.number.int({ min: 0, max: wagerAmountCents * getRandomNumber(0, 20) })
  //                       : 0;

  //                   spinsToCreateData.push({
  //                     gameSessionId: gameSession.id,
  //                     sessionId: session.id,
  //                     wagerAmount: wagerAmountCents,
  //                     grossWinAmount: winAmountCents,
  //                     currencyId: spinCurrency.id,
  //                     spinData: {
  //                       symbols: ['A', 'K', 'Q'],
  //                       lines: [[0, 1, 2]],
  //                       payout: winAmountCents,
  //                       details: faker.lorem.words(3),
  //                     } as Prisma.JsonObject, // Correctly cast complex object to Prisma.JsonObject
  //                     timeStamp: faker.date.between({
  //                       from: gameSession.startTime, // This is a Date
  //                       to: definiteGameSessionEndTime, // Use the asserted Date
  //                     }),
  //                   });
  //                   gameSessionAggregatedWagered += wagerAmountCents;
  //                   gameSessionAggregatedWon += winAmountCents;
  //                 }

  //                 if (spinsToCreateData.length > 0) {
  //                   await prisma.gameSpin.createMany({
  //                     data: spinsToCreateData,
  //                   });
  //                 }

  //                 if (gameSessionUsedCurrencyId && spinsToCreateData.length > 0) {
  //                   await prisma.gameSession.update({
  //                     where: { id: gameSession.id },
  //                     data: {
  //                       totalWagered: gameSessionAggregatedWagered,
  //                       totalWon: gameSessionAggregatedWon,
  //                       currencyId: gameSessionUsedCurrencyId,
  //                     },
  //                   });
  //                 }
  //                 return gameSession.endTime;
  //               })()
  //             );
  //           }

  //           const gameSessionEndTimes = (await Promise.all(gameSessionProcessingPromises)).filter(t => t !== null) as Date[];

  //           if (gameSessionEndTimes.length > 0) {
  //             const latestActivity = new Date(Math.max(...gameSessionEndTimes.map(d => d.getTime())));
  //              if (latestActivity > session.lastActivityAt) { // Check if update is necessary
  //                 await prisma.session.update({
  //                     where: { id: session.id },
  //                     data: { lastActivityAt: latestActivity },
  //                 });
  //             }
  //           }
  //         })()
  //       );
  //     }
  //     await Promise.all(userSessionProcessingPromises);
  //     console.log(`✅ Finished seeding for user ${user.username}`);
  //   }
  console.log(`🌱 All user data seeding complete.`)
  // for (const user of createdUsers) {
  // console.log(`🌱 Seeding User ${user.username} Sessions, Game Sessions, and Game Spins...`)
  //   const numSessions = getRandomNumber(SESSIONS_PER_USER_MIN, SESSIONS_PER_USER_MAX)
  //   for (let i = 0; i < numSessions; i++) {
  //     const sessionStartTime = faker.date.recent({ days: 30 })
  //     const sessionDurationMinutes = getRandomNumber(30, 240) // 30 mins to 4 hours
  //     const sessionEndTime = new Date(sessionStartTime.getTime() + sessionDurationMinutes * 60000)

  //     const session = await prisma.session.create({
  //       data: {
  //         userId: user.id,
  //         ipAddress: faker.internet.ip(),
  //         userAgent: faker.internet.userAgent(),
  //         startTime: sessionStartTime,
  //         endTime: sessionEndTime,
  //         token: faker.string.uuid(),
  //         expiresAt: new Date(sessionEndTime.getTime() + 1000 * 60 * 60 * 24 * 30), // 30 days from end time
  //         lastActivityAt: sessionStartTime, // Initial last activity, will be updated by game sessions
  //       },
  //     })

  //     const numGameSessions = getRandomNumber(
  //       GAME_SESSIONS_PER_SESSION_MIN,
  //       GAME_SESSIONS_PER_SESSION_MAX
  //     )
  //     const gamesForThisUserSession = getRandomSubset(createdGames, numGameSessions)

  //     for (const game of gamesForThisUserSession) {
  //       const gameSessionStartTime = faker.date.between({
  //         from: session.startTime,
  //         to: session.endTime!,
  //       })
  //       // Ensure game session duration fits within user session
  //       const maxPossibleGameSessionDurationMs =
  //         session.endTime!.getTime() + 5 * 60 * 1000 - gameSessionStartTime.getTime()

  //       const gameSessionDurationMinutes = getRandomNumber(
  //         5,
  //         Math.min(60, Math.floor(maxPossibleGameSessionDurationMs / 60000))
  //       )

  //       if (gameSessionDurationMinutes < 5) continue // Skip if not enough time for a meaningful game session

  //       const gameSessionEndTime = new Date(
  //         gameSessionStartTime.getTime() + gameSessionDurationMinutes * 60000
  //       )

  //       const gameSession = await prisma.gameSession.create({
  //         data: {
  //           sessionId: session.id,
  //           userId: user.id,
  //           gameId: game.id,
  //           startTime: gameSessionStartTime,
  //           endTime: gameSessionEndTime,
  //           totalWagered: 0, // Will be updated by spins (in cents)
  //           totalWon: 0, // Will be updated by spins (in cents)
  //           // currencyId will be determined by the first spin or a default
  //         },
  //       })

  //       const numSpins = getRandomNumber(SPINS_PER_GAME_SESSION_MIN, SPINS_PER_GAME_SESSION_MAX)
  //       let gameSessionAggregatedWagered = 0
  //       let gameSessionAggregatedWon = 0
  //       let gameSessionUsedCurrencyId: string | null = null

  //       for (let k = 0; k < numSpins; k++) {
  //         const spinCurrency = getRandomItem(createdCurrencies)
  //         if (!gameSessionUsedCurrencyId) gameSessionUsedCurrencyId = spinCurrency.id

  //         const wagerAmountCents = faker.number.int({ min: 10, max: 5000 }) // 0.10 to 50.00 in cents

  //         const winAmountCents =
  //           Math.random() > 0.4
  //             ? faker.number.int({ min: 0, max: wagerAmountCents * getRandomNumber(0, 20) })
  //             : 0
  //         await prisma.gameSpin.create({
  //           data: {
  //             gameSessionId: gameSession.id,
  //             sessionId: session.id,
  //             wagerAmount: wagerAmountCents,
  //             grossWinAmount: winAmountCents,
  //             currencyId: spinCurrency.id, // Each spin can theoretically have its own currency if needed by schema
  //             spinData: {
  //               symbols: ['A', 'K', 'Q'],
  //               lines: [[0, 1, 2]],
  //               payout: winAmountCents,
  //               details: faker.lorem.words(5),
  //             } as Prisma.JsonObject,
  //             timeStamp:
  //               gameSession.startTime && gameSession.endTime
  //                 ? faker.date.between({
  //                     from: gameSession.startTime,
  //                     to: gameSession.endTime,
  //                   })
  //                 : new Date(),
  //           },
  //         })
  //         gameSessionAggregatedWagered += wagerAmountCents
  //         gameSessionAggregatedWon += winAmountCents
  //       }

  //       if (gameSessionUsedCurrencyId) {
  //         // Only update if spins occurred
  //         await prisma.gameSession.update({
  //           where: { id: gameSession.id },
  //           data: {
  //             totalWagered: gameSessionAggregatedWagered,
  //             totalWon: gameSessionAggregatedWon,
  //             currencyId: gameSessionUsedCurrencyId, // Set the currency for the session
  //           },
  //         })
  //       }
  //       await prisma.session.update({
  //         // Update session's lastActivityAt
  //         where: { id: session.id },
  //         data: { lastActivityAt: gameSession.endTime },
  //       })
  //     }
  //   }
  // }
  console.log(`🌱 Seeded user sessions, game sessions, and game spins.`)
}

async function seedVipTasksAndProgressInternal(): Promise<void> {
  console.log('🌱 Seeding VIP Tasks and User Progress...')
  const taskTypesArray = Object.values(PrismaVipTaskTypeEnum)
  const tempCreatedVipTasks: PrismaVipTask[] = []

  for (let i = 0; i < MAX_VIP_TASKS_TO_SEED; i++) {
    const taskType = getRandomItem(taskTypesArray)
    let title = `${taskType.replace(/_/g, ' ')} Challenge ${i + 1}`
    let description = `Achieve the ${taskType.toLowerCase().replace(/_/g, ' ')} goal for great rewards!`
    let targetValue: number | undefined // Integer (cents or count)

    switch (taskType) {
      case PrismaVipTaskTypeEnum.WAGER_AMOUNT:
        targetValue = faker.number.int({ min: 10000, max: 1000000 }) // Cents
        description = `Wager a total of ${targetValue / 100} in any game.`
        break
      case PrismaVipTaskTypeEnum.LOGIN_STREAK:
        targetValue = faker.number.int({ min: 3, max: 7 }) // Days
        description = `Log in for ${targetValue} consecutive days.`
        break
      case PrismaVipTaskTypeEnum.DEPOSIT_STREAK: // From your enum list
        targetValue = faker.number.int({ min: 2, max: 5 }) // Number of deposits
        description = `Make a deposit on ${targetValue} different days.`
        break
      case PrismaVipTaskTypeEnum.PROFILE_COMPLETION:
        title = 'Complete Your Profile'
        description = 'Fill out all your profile details for a reward.'
        targetValue = 1 // 1 step to complete
        break
      // Add cases for other VipTaskTypes from your enum if they need specific target logic
      default:
        targetValue = Math.floor(faker.number.int({ min: 1, max: 10 }))
        description = `Perform ${targetValue} of action: ${taskType.toLowerCase().replace(/_/g, ' ')}.`
        break
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
    })
    tempCreatedVipTasks.push(vipTask)
  }
  createdVipTasks = tempCreatedVipTasks

  if (createdUsers.length > 0 && createdVipTasks.length > 0) {
    for (const user of getRandomSubset(createdUsers, Math.ceil(createdUsers.length * 0.7))) {
      for (const task of getRandomSubset(createdVipTasks, getRandomNumber(1, 3))) {
        const progress = task.targetValue ? getRandomNumber(0, task.targetValue) : 0
        const isCompleted = task.targetValue
          ? progress >= task.targetValue
          : faker.datatype.boolean()
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
          )
      }
    }
  }
  console.log(`🌱 Seeded ${createdVipTasks.length} VIP tasks and user progress.`)
}

async function seedAchievementsAndUserUnlocksInternal(): Promise<void> {
  console.log('🌱 Seeding Achievements...')
  const tempCreatedAchievements: PrismaAchievement[] = []
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
  ]
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
    }
    const achievement = await prisma.achievement.create({ data: achievementData }).catch((e) => {
      console.error(`Error creating achievement ${achievementData.name}: ${e.message}`)
      return null
    })
    if (achievement) tempCreatedAchievements.push(achievement)
  }
  createdAchievements = tempCreatedAchievements

  if (createdUsers.length > 0 && createdAchievements.length > 0) {
    console.log('🌱 Seeding User Achievements...')
    for (const user of createdUsers) {
      const numAchievementsToUnlock = getRandomNumber(
        USER_ACHIEVEMENTS_TO_ASSIGN_MIN,
        USER_ACHIEVEMENTS_TO_ASSIGN_MAX
      )
      const achievementsToUnlock = getRandomSubset(createdAchievements, numAchievementsToUnlock)
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
          )
      }
    }
  }
  console.log(`🌱 Seeded ${createdAchievements.length} achievements and user unlocks.`)
}

async function seedUserRewardsInternal(): Promise<void> {
  if (createdUsers.length === 0 || createdCurrencies.length === 0) {
    console.warn('⚠️ Users or Currencies not seeded. Skipping UserReward seeding.')
    return
  }
  console.log('🌱 Seeding User Rewards (available and some claimed)...')
  const rewardTypesArray = Object.values(PrismaRewardTypeEnum)
  const rewardStatusArray = Object.values(PrismaRewardStatusEnum)

  for (const user of createdUsers) {
    const numRewards = getRandomNumber(USER_REWARDS_PER_USER_MIN, USER_REWARDS_PER_USER_MAX)
    for (let i = 0; i < numRewards; i++) {
      const rewardType = getRandomItem(rewardTypesArray)
      const currency = getRandomItem(createdCurrencies)
      const status = getRandomItem(
        rewardStatusArray.filter((s) => s !== PrismaRewardStatusEnum.PENDING)
      )
      const availableFrom = faker.date.recent({ days: 10 })
      let expiresAt: Date | null = null
      if (
        status === PrismaRewardStatusEnum.AVAILABLE ||
        status === PrismaRewardStatusEnum.EXPIRED
      ) {
        expiresAt = faker.date.future({ years: 0.1, refDate: availableFrom }) // Approx 1 month
        if (status === PrismaRewardStatusEnum.EXPIRED && expiresAt > new Date()) {
          expiresAt = faker.date.past({ years: 0.05, refDate: availableFrom }) // Ensure expired is truly in the past
        }
      }
      const claimedAt =
        status === PrismaRewardStatusEnum.CLAIMED
          ? faker.date.between({ from: availableFrom, to: expiresAt || new Date() })
          : null

      let amount: number | undefined = undefined // Integer cents or count
      let currentCurrencyId: string | undefined = undefined

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
        amount = faker.number.int({ min: 100, max: 20000 }) // Cents
        currentCurrencyId = currency.id
      } else if (rewardType === PrismaRewardTypeEnum.FREE_SPINS) {
        amount = faker.number.int({ min: 5, max: 50 }) // Number of free spins
        currentCurrencyId = undefined
      } else if (
        rewardType === PrismaRewardTypeEnum.VIP_TASK_COMPLETION ||
        rewardType === PrismaRewardTypeEnum.ACHIEVEMENT_UNLOCKED
      ) {
        // These rewards might have their amounts/xp defined on the task/achievement itself.
        // Here we can seed a generic UserReward record representing the claim.
        amount = faker.datatype.boolean() ? faker.number.int({ min: 50, max: 5000 }) : undefined
        if (amount) currentCurrencyId = currency.id
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
        )
    }
  }
  console.log(`🌱 Seeded user rewards.`)
}
// --- END OF NEW SEEDING FUNCTIONS ---

// Define LevelConfig interface (should match your server/src/config/leveling.config.ts)
interface LevelConfig {
  level: number
  name: string
  xpRequired: number
  cumulativeXpToReach: number
  cashbackPercentage: number // Float, e.g., 0.01 for 1%
  prioritySupport: boolean
  benefits: any[]
  initialSpecialBonuses: number
  levelUpRewards: any[]
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
  ]
  for (let i = VIP_LEVEL_CONFIGS_PLACEHOLDER.length - 1; i >= 0; i--) {
    if (totalXp >= VIP_LEVEL_CONFIGS_PLACEHOLDER[i].cumulativeXpToReach) {
      return VIP_LEVEL_CONFIGS_PLACEHOLDER[i]
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
  )
}

async function main() {
  console.log('🚀 Starting database seed...')
  await clearDatabase()

  await seedOperatorsInternal()
  await seedCurrenciesInternal()
  await seedUsersInternal() // This now creates Users, Accounts, Profiles, Wallets, VipInfo

  // await seedGameProvidersInternal(); // Creates global createdGameProviders

  // Ensure createdGameProviders is populated before calling seedGamesInternal
  if (createdOperators.length > 0) {
    await seedGamesInternal() // Uses loadGames, populates global createdGames
  } else {
    console.warn('⚠️ Insufficient data (operators or game providers) for game seeding.')
  }

  if (createdOperators.length > 0 && createdCurrencies.length > 0) {
    await seedProductsInternal() // Uses loadProducts, populates global createdProducts
  } else {
    console.warn('⚠️ Insufficient data (operators or currencies) for product seeding.')
  }

  await seedTransactionsInternal()
  await seedXpEventsInternal()

  // --- Call new seed functions ---
  await seedUserSessionsAndGameActivityInternal()
  await seedVipTasksAndProgressInternal()
  await seedAchievementsAndUserUnlocksInternal()
  await seedUserRewardsInternal()
  // --- End of new seed function calls ---

  console.log('✅ Database seed finished successfully.')
}

export default async function seedDev(): Promise<void> {
  main()
    .catch(async (e) => {
      console.error('Seeding failed:')
      console.error(e instanceof Error ? e.message : e)
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma Error Code:', e.code)
        if (e.meta) console.error('Meta:', e.meta)
      }
      await prisma.$disconnect()
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

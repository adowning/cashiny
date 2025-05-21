// import {
//   Achievement as AchievementModel,
//   Currency as CurrencyModel,
//   Game as GameModel, // GameSession ,
//   // OperatorAccess as OperatorAccessModel, // Post ,
//   // Remove TransactionStatus, TransactionType from here
//   User as UserModel, // ChatChannel,
// } from '@cashflow/types';
// import { faker } from '@faker-js/faker';
// // import {Bun} from 'bun';
// import { GameCategory, KeyMode, Role, UserStatus } from 'generated/kysely/types.js';
// import { $Enums, OperatorAccess, Product, Wallet } from 'generated/prisma/index.js';

// import { Prisma, PrismaClient } from '../generated/prisma/index.js';
// // import {
// //   $Enums,
// //   GameCategory,
// //   Gender,
// //   KeyMode,
// //   Prisma,
// //   PrismaClient,
// //   Role,
// //   UserStatus,
// //   Wallet as WalletModel,
// // } from '../generated/prisma';
// import loadGames from './loadgames.js';
// import loadProducts from './seedProducts.js';

// // Use Prisma enums for TransactionStatus and TransactionType
// const { TransactionStatus, TransactionType } = $Enums;

// // Adjust path if necessary

// const prisma = new PrismaClient();

// // Configuration for the number of items to generate
// const NUM_USERS = 10;
// const NUM_ADMINS = 1;
// // const NUM_GAMES = 50;
// const NUM_ACHIEVEMENTS = 20;
// const MAX_POSTS_PER_USER = 5;
// const MAX_COMMENTS_PER_POST = 10;
// const MAX_SESSIONS_PER_USER = 10;
// const MAX_TRANSACTIONS_PER_WALLET = 15;
// const MAX_NOTIFICATIONS_PER_USER = 5;
// const MAX_CHAT_MESSAGES = 100; // Total chat messages
// const MAX_XP_EVENTS_PER_USER = 20;

// // Helper to get a random element from an array
// const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
// const getRandomSubset = <T>(arr: T[], count?: number): T[] =>
//   faker.helpers.arrayElements(
//     arr,
//     faker.number.int({
//       min: 1,
//       max: count !== undefined && count < arr.length ? count : arr.length,
//     }),
//   );

// async function clearDatabase(): Promise<void> {
//   console.log('🧹 Clearing existing data...');
//   // Delete in reverse order of creation and dependency
//   await prisma.eventLog.deleteMany({});
//   await prisma.gameLaunchLink.deleteMany({});
//   await prisma.friendship.deleteMany({});
//   await prisma.chatMessage.deleteMany({});
//   await prisma.notification.deleteMany({});
//   await prisma.xpEvent.deleteMany({});
//   await prisma.userAchievement.deleteMany({});
//   await prisma.gameTransaction.deleteMany({});
//   await prisma.transaction.deleteMany({});
//   await prisma.gameSession.deleteMany({});
//   await prisma.comment.deleteMany({});
//   await prisma.post.deleteMany({});
//   await prisma.operatorAccess.deleteMany({});
//   await prisma.wallet.deleteMany({});
//   await prisma.settings.deleteMany({});
//   await prisma.profile.deleteMany({});
//   await prisma.user.deleteMany({});
//   await prisma.achievement.deleteMany({});
//   await prisma.game.deleteMany({});
//   await prisma.currency.deleteMany({});
//   console.log('🗑️ Database cleared.');
// }

// async function seedCurrencies(): Promise<Partial<CurrencyModel>[]> {
//   console.log('💰 Seeding currencies...');
//   const currenciesData: Prisma.CurrencyCreateInput[] = [
//     {
//       code: 'USD',
//       name: 'US Dollar',
//       symbol: '$',
//       precision: 2,
//       type: 'FIAT',
//       isActive: true,
//       meta: { info: 'Standard fiat currency' } as Prisma.JsonObject,
//     },
//     { code: 'EUR', name: 'Euro', symbol: '€', precision: 2, type: 'FIAT', isActive: true },
//     {
//       code: 'CREDITS',
//       name: 'Platform Credits',
//       symbol: 'CR',
//       precision: 0,
//       type: 'VIRTUAL',
//       isActive: true,
//     },
//     {
//       code: 'BTC',
//       name: 'Bitcoin',
//       symbol: '₿',
//       precision: 8,
//       type: 'CRYPTO',
//       isActive: true,
//       meta: { network: 'Bitcoin Mainnet' } as Prisma.JsonObject,
//     },
//   ];
//   for (const data of currenciesData) {
//     await prisma.currency.upsert({
//       where: { code: data.code },
//       update: {},
//       create: data,
//     });
//   }
//   const seededCurrencies = await prisma.currency.findMany();
//   console.log(`🪙 ${seededCurrencies.length} currencies seeded.`);
//   return seededCurrencies;
// }

// async function seedUsers(currencies: CurrencyModel[]): Promise<UserModel[]> {
//   console.log('👤 Seeding users, profiles, settings, and wallets...');
//   const createdUsers: UserModel[] = [];
//   const availableRoles: Role[] = [Role.USER, Role.VIP, Role.MODERATOR];

//   // Create Admin Users
//   for (let i = 0; i < NUM_ADMINS; i++) {
//     const hashedPassword = await Bun.password.hash('adminPass123!');
//     const email = faker.internet
//       .email({ firstName: 'admin', lastName: `${i + 1}`, provider: 'cashflow.dev' })
//       .toLowerCase();
//     const username = `admin${i + 1}`;

//     const admin = (await prisma.user.create({
//       data: {
//         username,
//         email,
//         emailVerified: false,
//         name: username,
//         passwordHash: hashedPassword,
//         role: Role.ADMIN,
//         status: UserStatus.ACTIVE,
//         totalXp: faker.number.int({ min: 1000, max: 50000 }),
//         currentLevel: faker.number.int({ min: 5, max: 50 }),
//         referralCode: faker.string.alphanumeric(8).toUpperCase(),
//         commissionRate: 0.1,
//         twoFactorEnabled: faker.datatype.boolean(0.3),
//         profile: {
//           create: {
//             // firstName: `Admin${i + 1}`,
//             // lastName: 'User',
//             // bio: faker.lorem.sentence(),
//             // avatarUrl: faker.image.avatarGitHub(),
//             // coverUrl: faker.image.urlPicsumPhotos(),
//             // countryCode: faker.location.countryCode('alpha-2'),
//             // gender: getRandomElement(Object.values(Gender)),
//             // birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
//             balance: faker.number.int({ min: 100, max: 10000 }),
//             totalXpFromOperator: faker.number.int({ min: 1000, max: 50000 }),
//           },
//         },
//         settings: {
//           create: {
//             theme: 'dark',
//             language: 'en',
//             emailNotifications: true,
//             smsNotifications: faker.datatype.boolean(0.2),
//             pushNotifications: true,
//           },
//         },
//         wallets: {
//           create: currencies.map(
//             (currency): Prisma.WalletCreateWithoutUserInput => ({
//               currency: { connect: { code: currency.code } },
//               balance: parseFloat(
//                 faker.finance.amount({ min: 10000, max: 500000, dec: currency.precision }),
//               ),
//               isActive: true,
//               address: currency.type === 'CRYPTO' ? faker.finance.bitcoinAddress() : null,
//             }),
//           ),
//         },
//       },
//     })) as any;
//     createdUsers.push(admin);
//   }

//   // Create Regular Users
//   for (let i = 0; i < NUM_USERS; i++) {
//     const firstName = faker.person.firstName();
//     const lastName = faker.person.lastName();
//     const hashedPassword = await Bun.password.hash('userPass123!');
//     const email = faker.internet
//       .email({ firstName, lastName, provider: `example${i}.com` })
//       .toLowerCase();
//     const username =
//       faker.internet.userName({ firstName, lastName }).toLowerCase() + faker.string.alphanumeric(3);

//     const user = (await prisma.user.create({
//       data: {
//         username,
//         email,
//         name: username,
//         emailVerified: false,
//         phone: faker.datatype.boolean(0.5) ? faker.phone.number() : null,
//         phoneVerified: faker.datatype.boolean(0.3) ? faker.date.past() : null,
//         passwordHash: hashedPassword,
//         role: getRandomElement(availableRoles),
//         status: getRandomElement(Object.values(UserStatus)),
//         totalXp: faker.number.int({ min: 0, max: 10000 }),
//         currentLevel: faker.number.int({ min: 1, max: 20 }),
//         referralCode: faker.string.alphanumeric(8).toUpperCase(),
//         commissionRate: faker.number.int({ min: 1, max: 5 }),
//         twoFactorEnabled: faker.datatype.boolean(0.1),
//         lastLogin: faker.datatype.boolean(0.9) ? faker.date.recent({ days: 30 }) : null,
//         lastIp: faker.datatype.boolean(0.9) ? faker.internet.ip() : null,
//         profile: {
//           create: {
//             // firstName,
//             // lastName,
//             balance: faker.number.int({ min: 100, max: 10000 }),
//             totalXpFromOperator: faker.number.int({ min: 1000, max: 50000 }),
//           },
//         },
//         settings: {
//           create: {
//             theme: getRandomElement(['light', 'dark', 'system']),
//             language: getRandomElement(['en', 'es', 'fr', 'de']),
//             emailNotifications: faker.datatype.boolean(),
//             smsNotifications: faker.datatype.boolean(0.1),
//             pushNotifications: faker.datatype.boolean(),
//             meta: {
//               preferredGameCategory: getRandomElement(Object.values(GameCategory)),
//             } as Prisma.JsonObject,
//           },
//         },
//         wallets: {
//           create: currencies.map(
//             (currency): Prisma.WalletCreateWithoutUserInput => ({
//               currency: { connect: { code: currency.code } },
//               balance: parseFloat(
//                 faker.finance.amount({ min: 0, max: 10000, dec: currency.precision }),
//               ),
//               isActive: true,
//               address: currency.type === 'CRYPTO' ? faker.finance.bitcoinAddress() : null,
//             }),
//           ),
//         },
//       },
//     })) as any;
//     createdUsers.push(user);
//   }
//   console.log(`👥 ${createdUsers.length} users with profiles, settings, and wallets seeded.`);
//   return createdUsers;
// }

// async function seedOperatorAccess(adminUsers: UserModel[]): Promise<Partial<OperatorAccess>[]> {
//   if (!adminUsers || adminUsers.length === 0) {
//     console.warn(
//       '⚠️ No admin users found to assign as OperatorAccess owner. Skipping OperatorAccess seeding.',
//     );
//     return [];
//   }
//   console.log('🔑 Seeding operator access keys...');
//   const operatorAccessData: Partial<OperatorAccess>[] = [];
//   for (let i = 0; i < 2; i++) {
//     const secret = faker.string.uuid();
//     const operatorKey = await prisma.operatorAccess.create({
//       data: {
//         name: `${faker.company.name()} API Key ${i + 1}`,
//         operator_secret: await Bun.password.hash(secret),
//         operator_access: 'ip_whitelist',
//         callback_url: faker.internet.url() + '/callback',
//         active: faker.datatype.boolean(0.9),
//         ownedById: getRandomElement(adminUsers).id,
//         permissions: getRandomSubset(Object.values(KeyMode), 3),
//         ips: [faker.internet.ip(), faker.internet.ip()],
//         description: faker.lorem.sentence(),
//         last_used_at: faker.datatype.boolean(0.5) ? faker.date.recent({ days: 10 }) : null,
//       },
//     });
//     operatorAccessData.push(operatorKey);
//   }
//   console.log(`🗝️ ${operatorAccessData.length} operator access keys seeded.`);
//   return operatorAccessData;
// }

// // async function seedGames(): Promise<GameModel[]> {
// //   return await loadGames(prisma);
// // }
// // async function seedProducts(): Promise<Product[]> {
// //   return await loadProducts(prisma);
// // }

// async function seedAchievements(): Promise<Partial<AchievementModel>[]> {
//   console.log('🏆 Seeding achievements...');
//   const achievementsInput: Prisma.AchievementCreateInput[] = [];
//   for (let i = 0; i < NUM_ACHIEVEMENTS; i++) {
//     achievementsInput.push({
//       name: faker.company.buzzPhrase() + ` Award ${i + 1}`,
//       description: faker.lorem.sentence(10),
//       xpReward: faker.number.int({ min: 50, max: 1000 }),
//       iconUrl: faker.image.urlLoremFlickr({ category: 'abstract' }),
//       secret: faker.datatype.boolean(0.1),
//     });
//   }
//   // Using loop with upsert to avoid issues if a unique name is regenerated by faker by chance,
//   // or use createMany with skipDuplicates if name is guaranteed unique by faker setup.
//   // For simplicity, let's assume createMany is fine if names are sufficiently unique.
//   await prisma.achievement.createMany({
//     data: achievementsInput,
//     skipDuplicates: true, // Requires @unique on name for this to work as intended
//   });
//   const seededAchievements = await prisma.achievement.findMany();
//   console.log(`🏅 ${seededAchievements.length} achievements seeded.`);
//   return seededAchievements;
// }

// // async function seedGames(): Promise<GameModel[]> {
// //   console.log('🎮 Seeding games...');
// //   const gamesInput: Prisma.GameCreateInput[] = [];
// //   const gameProvidersArray = Object.values(GameProvider);
// //   const gameCategoriesArray = Object.values(GameCategory);

// //   for (let i = 0; i < NUM_GAMES; i++) {
// //     gamesInput.push({
// //       name: faker.commerce.productName() + ` Deluxe ${i + 1}`,
// //       slug: faker.lorem.slug() + `-${i + 1}`,
// //       description: faker.lorem.paragraphs(2),
// //       provider: getRandomElement(gameProvidersArray),
// //       category: getRandomElement(gameCategoriesArray),
// //       tags: faker.helpers.arrayElements(faker.lorem.words(10).split(' '), 3),
// //       isActive: faker.datatype.boolean(0.95),
// //       thumbnailUrl: faker.image.urlPicsumPhotos({ width: 400, height: 300 }),
// //       bannerUrl: faker.image.urlPicsumPhotos({ width: 1280, height: 400 }),
// //       meta: {
// //         rtp: faker.number.float({ min: 0.85, max: 0.98, precision: 4 }),
// //         volatility: getRandomElement(['low', 'medium', 'high', 'very-high']),
// //         features: faker.helpers.arrayElements(
// //           ['free-spins', 'bonus-round', 'multipliers', 'jackpot'],
// //           2,
// //         ),
// //         releaseDate: faker.date.past({ years: 3 }).toISOString(),
// //       } as Prisma.JsonObject,
// //     });
// //   }
// //   await prisma.game.createMany({
// //     data: gamesInput,
// //     skipDuplicates: true, // Assumes slug is unique
// //   });
// //   const seededGames = await prisma.game.findMany();
// //   console.log(`🎲 ${seededGames.length} games seeded.`);
// //   return seededGames;
// // }

// async function seedUserSubItems(
//   users: UserModel[],
//   achievements: AchievementModel[],
//   games: GameModel[],
// ): Promise<void> {
//   console.log(
//     '📝 Seeding user-related sub-items (posts, comments, sessions, achievements, XP, notifications, messages, friendships)...',
//   );

//   for (const user of users) {
//     // --- Seed Posts for User ---
//     const numPosts = faker.number.int({ min: 0, max: MAX_POSTS_PER_USER });
//     for (let i = 0; i < numPosts; i++) {
//       const post = await prisma.post.create({
//         data: {
//           authorId: user.id,
//           title: faker.lorem.sentence(5),
//           content: faker.lorem.paragraphs(3),
//           published: faker.datatype.boolean(0.8),
//           tags: faker.helpers.arrayElements(faker.lorem.words(5).split(' '), 3),
//           viewCount: faker.number.int({ min: 0, max: 5000 }),
//           meta: { readingTime: faker.number.int({ min: 2, max: 15 }) } as Prisma.JsonObject,
//         },
//       });

//       // --- Seed Comments for Post ---
//       const numComments = faker.number.int({ min: 0, max: MAX_COMMENTS_PER_POST });
//       for (let j = 0; j < numComments; j++) {
//         await prisma.comment.create({
//           data: {
//             postId: post.id,
//             authorId: getRandomElement(users).id,
//             content: faker.lorem.paragraph(),
//           },
//         });
//       }
//     }

//     // --- Seed Game Sessions for User ---
//     const numGameSessions = faker.number.int({ min: 0, max: MAX_SESSIONS_PER_USER });
//     if (games.length > 0) {
//       for (let i = 0; i < numGameSessions; i++) {
//         const gameSession = await prisma.gameSession.create({
//           data: {
//             userId: user.id,
//             gameId: getRandomElement(games).id,
//             isActive: faker.datatype.boolean(0.2),
//             sessionData: { betHistory: [], lastSpin: null } as Prisma.JsonObject,
//             startedAt: faker.date.recent({ days: 60 }),
//             endedAt: faker.datatype.boolean(0.8) ? faker.date.recent({ days: 1 }) : null,
//             ipAddress: faker.internet.ip(),
//             userAgent: faker.internet.userAgent(),
//           },
//         });

//         // --- Seed Game Transactions for Session ---
//         const numGameTx = faker.number.int({ min: 0, max: 10 });
//         for (let k = 0; k < numGameTx; k++) {
//           await prisma.gameTransaction.create({
//             data: {
//               sessionId: gameSession.id,
//               userId: user.id,
//               type: getRandomElement(
//                 Object.values($Enums.TransactionType).filter((t) =>
//                   ['BET', 'WIN'].includes(t as string),
//                 ) as $Enums.TransactionType[],
//               ),
//               amount: faker.number.int({ min: 1, max: 1000 }),
//               currency: 'CREDITS',
//               transactionDetails: {
//                 roundId: faker.string.uuid(),
//                 action: 'spin_result',
//               } as Prisma.JsonObject,
//             },
//           });
//         }
//       }
//     }

//     // --- Seed User Achievements ---
//     const unlockedAchievements = getRandomSubset(achievements, 5);
//     for (const achievement of unlockedAchievements) {
//       await prisma.userAchievement.upsert({
//         where: { userId_achievementId: { userId: user.id, achievementId: achievement.id } },
//         update: {},
//         create: {
//           userId: user.id,
//           achievementId: achievement.id,
//           unlockedAt: faker.date.recent({ days: 100 }),
//           meta: { source: 'gameplay' } as Prisma.JsonObject,
//         },
//       });
//     }

//     // --- Seed XP Events for User ---
//     const numXpEvents = faker.number.int({ min: 0, max: MAX_XP_EVENTS_PER_USER });
//     for (let i = 0; i < numXpEvents; i++) {
//       await prisma.xpEvent.create({
//         data: {
//           userId: user.id,
//           points: faker.number.int({ min: 10, max: 500 }),
//           source: getRandomElement([
//             'POST_CREATED',
//             'GAME_WIN',
//             'ACHIEVEMENT_UNLOCKED',
//             'DAILY_LOGIN',
//           ]),
//           sourceId: faker.datatype.boolean(0.7) ? faker.string.uuid() : null,
//           meta: { reason: faker.lorem.words(3) } as Prisma.JsonObject,
//         },
//       });
//     }

//     // --- Seed Notifications for User ---
//     const numNotifications = faker.number.int({ min: 0, max: MAX_NOTIFICATIONS_PER_USER });
//     for (let i = 0; i < numNotifications; i++) {
//       await prisma.notification.create({
//         data: {
//           userId: user.id,
//           type: getRandomElement(
//             Object.values($Enums.NotificationType) as $Enums.NotificationType[],
//           ),
//           title: faker.lorem.sentence(4),
//           message: faker.lorem.paragraph(1),
//           isRead: faker.datatype.boolean(0.6),
//           readAt: faker.datatype.boolean(0.6) ? faker.date.recent({ days: 10 }) : null,
//           actionUrl: faker.datatype.boolean(0.3) ? faker.internet.url() : null,
//           meta: { icon: 'bell' } as Prisma.JsonObject,
//         },
//       });
//     }
//   }

//   // --- Seed Chat Messages ---
//   const chatChannels = ['global', 'support', ...games.slice(0, 3).map((g) => `game-${g.name}`)];
//   for (let i = 0; i < MAX_CHAT_MESSAGES; i++) {
//     await prisma.chatMessage.create({
//       data: {
//         authorId: getRandomElement(users).id,
//         channel: getRandomElement(chatChannels),
//         content: faker.hacker.phrase(),
//         mediaUrl: faker.datatype.boolean(0.05) ? faker.image.url() : null,
//         // readBy would be an array of user IDs or similar, complex to seed realistically for now
//       },
//     });
//   }

//   // --- Seed Friendships ---
//   for (const user of users) {
//     const numFriends = faker.number.int({ min: 0, max: 5 });
//     const potentialFriends = faker.helpers.shuffle(users.filter((u) => u.id !== user.id)); // Shuffle to randomize selection
//     const selectedFriends = potentialFriends.slice(0, numFriends); // Take the first 'numFriends'

//     for (const friend of selectedFriends) {
//       await prisma.friendship.upsert({
//         where: { userId_friendId: { requesterId: user.id, receiverId: friend.id } },
//         update: {
//           status: getRandomElement(
//             Object.values($Enums.FriendshipStatus) as $Enums.FriendshipStatus[],
//           ),
//         }, // Potentially update status if it exists
//         create: {
//           requesterId: user.id,
//           receiverId: friend.id,
//           status: getRandomElement(
//             Object.values($Enums.FriendshipStatus) as $Enums.FriendshipStatus[],
//           ),
//         },
//       });
//     }
//   }
// }

// // async function seedFinancialTransactions(
// //   users: UserModel[],
// //   // currencies: CurrencyModel[],
// // ): Promise<void> {
// //   console.log('💸 Seeding financial transactions...');

// //   for (const user of users) {
// //     const userWallets = await prisma.wallet.findMany({ where: { userId: user.id } });

// //     // Seed Transactions for User Wallets
// //     for (const wallet of userWallets) {
// //       const numTransactions = faker.number.int({ min: 0, max: MAX_TRANSACTIONS_PER_WALLET });
// //       for (let i = 0; i < numTransactions; i++) {
// //         await prisma.transaction.create({
// //           data: {
// //             walletId: wallet.id,
// //             type: getRandomElement(Object.values(TransactionType)),
// //             status: getRandomElement(Object.values(TransactionStatus)),
// //             amount: faker.number.float({ min: 1, max: 100, precision: 2 }),
// //             details: {
// //               description: faker.finance.transactionDescription(),
// //               referenceId: faker.string.uuid(),
// //             } as Prisma.JsonObject,
// //           },
// //         });
// //       }
// //     }
// //   }
// //   console.log('🏦 Financial transactions seeded.');
// // }

// async function seedFinancialTransactions(
//   users: UserModel[],
//   currencies: CurrencyModel[],
//   products: Product[],
// ): Promise<void> {
//   console.log('💸 Seeding financial transactions...');
//   let transactionCount = 0;
//   for (const user of users) {
//     const userWallets: Wallet[] = await prisma.wallet.findMany({ where: { userId: user.id } });
//     if (userWallets.length === 0) continue;

//     for (const wallet of userWallets) {
//       const numTransactions = faker.number.int({ min: 1, max: MAX_TRANSACTIONS_PER_WALLET });
//       for (let i = 0; i < numTransactions; i++) {
//         const txType = getRandomElement(
//           Object.values(TransactionType).filter((t) => !['BET', 'WIN'].includes(t)),
//         );
//         const currencyInfo = currencies.find((c) => c.code === wallet.currencyCode);
//         const precision = currencyInfo?.precision || 2;

//         await prisma.transaction.create({
//           data: {
//             walletId: wallet.id,
//             userId: user.id,
//             currencyCode: wallet.currencyCode,
//             type: txType,
//             productId: getRandomElement(products).id,
//             status: getRandomElement(Object.values(TransactionStatus)),
//             amount: parseFloat(
//               faker.finance.amount({
//                 min:
//                   txType === TransactionType.DEPOSIT ||
//                   txType === TransactionType.TRANSFER_RECEIVED ||
//                   txType === TransactionType.BONUS_AWARDED
//                     ? 10
//                     : 1,
//                 max:
//                   txType === TransactionType.DEPOSIT ||
//                   txType === TransactionType.TRANSFER_RECEIVED ||
//                   txType === TransactionType.BONUS_AWARDED
//                     ? 1000
//                     : 200,
//                 dec: precision,
//               }),
//             ),
//             description: faker.finance.transactionDescription(),
//             referenceId: faker.string.uuid(),
//             meta: {
//               payment_method: faker.finance.creditCardIssuer(),
//               ip_address: faker.internet.ip(),
//             } as Prisma.JsonObject,
//             targetUserId:
//               txType === TransactionType.TRANSFER_SENT ||
//               txType === TransactionType.TRANSFER_RECEIVED
//                 ? getRandomElement(users.filter((u) => u.id !== user.id))?.id
//                 : null,
//           },
//         });
//         transactionCount++;
//       }
//     }
//   }
//   console.log(`💳 ${transactionCount} financial transactions seeded.`);
// }

// async function seedGameLaunchLinks(
//   users: UserModel[],
//   games: GameModel[],
//   operatorKeys: OperatorAccess[],
//   currencies: CurrencyModel[],
// ): Promise<void> {
//   console.log('🔗 Seeding game launch links...');
//   if (!games || games.length === 0) {
//     console.warn(
//       '⚠️ No games found to create launch links for. Skipping game launch link seeding.',
//     );
//     return;
//   }
//   if (!users || users.length === 0) {
//     console.warn(
//       '⚠️ No users found to create launch links for. Skipping game launch link seeding.',
//     );
//     return;
//   }
//   if (!operatorKeys || operatorKeys.length === 0) {
//     console.warn(
//       '⚠️ No operator access keys found to create launch links with. Skipping game launch link seeding.',
//     );
//     return;
//   }
//   if (!currencies || currencies.length === 0) {
//     console.warn(
//       '⚠️ No currencies keys found to create launch links with. Skipping game launch link seeding.',
//     );
//     return;
//   }
//   for (let i = 0; users.length - 4; i++) {
//     const game = getRandomElement(games);
//     const user = users[i];
//     if (!game.id) throw new Error('Game id is undefined');
//     const numLinks = faker.number.int({ min: 0, max: 2 });
//     for (let i = 0; i < numLinks; i++) {
//       if (user) {
//         console.log(i, ' ', user.id, ' ', game.id);
//         await prisma.gameLaunchLink.create({
//           data: {
//             currency: getRandomElement(currencies).id,
//             mode: 'DEMO',
//             session_url: faker.internet.url(),
//             expires_at: faker.date.future(),
//             user: {
//               connect: {
//                 id: user.id,
//               },
//             },
//             operator: {
//               connect: {
//                 id: getRandomElement(operatorKeys).id,
//               },
//             },

//             game: {
//               connect: {
//                 id: game.id,
//               },
//             },
//             meta: {
//               affiliateCode: faker.string.alphanumeric(10),
//               campaignId: faker.string.alphanumeric(8),
//             } as Prisma.JsonObject,
//           },
//         });
//       }
//     }
//   }
//   console.log('🚀 Game launch links seeded.');
// }

// async function seedEventLogs(users: UserModel[]): Promise<void> {
//   console.log('📜 Seeding event logs...');
//   for (const user of users) {
//     const numLogs = faker.number.int({ min: 0, max: 5 });
//     for (let i = 0; i < numLogs; i++) {
//       console.log(user.username);
//       await prisma.eventLog.create({
//         data: {
//           actorId: user.id,
//           timestamp: faker.date.recent(),
//           action: faker.lorem.word(),
//           data: {
//             action: faker.lorem.sentence(),
//             value: faker.number.int({ min: 1, max: 100 }),
//           } as Prisma.JsonObject,
//         },
//       });
//     }
//   }
//   console.log('✅ Event logs seeded.');
// }

// export default async function seedDev(): Promise<void> {
//   console.log('🌱 Seeding the database...');
//   try {
//     await clearDatabase();
//     const currencies = (await seedCurrencies()) as CurrencyModel[];
//     const allUsers = await seedUsers(currencies);
//     const operatorKeys = (await seedOperatorAccess(allUsers.slice(0, 2))) as OperatorAccess[];
//     const games = await loadGames(prisma, operatorKeys[0]);
//     const products = await loadProducts(prisma, operatorKeys[0]);

//     const achievements = (await seedAchievements()) as AchievementModel[];
//     await seedUserSubItems(allUsers, achievements, games);
//     await seedFinancialTransactions(allUsers, currencies, products);
//     await seedEventLogs(allUsers);
//     await seedGameLaunchLinks(allUsers, games, operatorKeys, currencies);

//     console.log('🎉 Database seeding completed successfully!');
//   } catch (e) {
//     console.error('❌ Seeding failed:', e);
//     process.exit(1);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

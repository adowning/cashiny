// // apps/server/src/services/vip.logic.ts
// import {
//   Prisma, // For Decimal and transaction types
//   User as PrismaUser,
//    // UserVipTaskProgress as PrismaUserVipTaskProgress,
//   VipInfo, // VipRewardClaim as PrismaVipRewardClaim,
//   // VipTask as PrismaVipTask,
//   db,
// } from '@cashflow/database';
// import { PrismaClient, User, VipInfo as PrismaVipInfo } from '@cashflow/database';
// // Assuming @cashflow/types exports UserVipDetails or similar. If not, define it here or import.
// import type { LevelConfig,  } from '@cashflow/types'; // Or define below
// import {  calculateLevel, getVipLevelByTotalXp, getVipLevelConfiguration } from '../config/leveling.config'; // Assuming you have this

// // Individually import types from your @cashflow/types package
// // import type {
// //   BaseResponse, // Alias to avoid clash with Prisma model name
// //   VipBenefitItem,
// //   VipBetawardListData,
// //   VipHistoryItem,
// //   VipHistoryRequest, // Assuming this is for pagination { page, limit }
// //   // BaseResponse is implicitly handled by returning objects with code, message, data
// //   VipInfo,
// //   VipLevel as VipLevelInterface,
// //   VipLevelRewardHistoryData,
// //   VipLevelUpItem,
// //   VipLevelUpListData,
// //   VipLevelUpReceiveResponse,
// //   VipRebateHistoryData,
// //   VipSignInAwardItem,
// //   VipSignInData,
// //   VipTaskItem,
// //   VipTimesHistoryData,
// // } from '@cashflow/types';
// import { Decimal } from '@prisma/client/runtime/library';
// import { uuid } from 'short-uuid';

// // Adjust path as necessary

// // --- Helper to get start of day/week/month for cycle calculations ---
// // You might want to use a robust date library like date-fns or dayjs for this
// const getStartOfTodayUTC = () => {
//   const now = new Date();
//   return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
// };

// const getStartOfWeekUTC = (date: Date) => {
//   // Assuming week starts on Monday (ISO 8601)
//   const d = new Date(date);
//   const day = d.getUTCDay();
//   const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust if your week starts on Sunday
//   return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
// };

// const getStartOfMonthUTC = (date: Date) => {
//   return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
// };

// /**
//  * Helper: Transforms a Prisma VipLevel object to the VipLevelInterface for client.
//  */
// // function transformPrismaVipLevelToInterface(level: VipLevel): LevelConfig {
// //   return {
// //   level: 0,
// //   name: '',
// //   xpRequired: 0,
// //   cumulativeXpToReach: 0,
// //   cashbackPercentage: 0,
// //   prioritySupport: false,
// //   benefits: []
// // };
// // }

// /**
//  * Helper: Calculates and formats VipInfo.
//  */
// async function calculateAndFormatVipInfoLogic(
//   prisma: Prisma.TransactionClient, // Expect transaction client
//   user: PrismaUser,
//   // userVipProgress: PrismaUserVipProgress & { currentVipLevel: PrismaVipLevel }
// ): Promise<VipInfo> {

//   const userVipProgress = getVipLevelByTotalXp( user.totalXp);

//   // if (!userVipProgress?.currentVipLevel) {
//   //   throw new Error('Missing required VIP level data');
//   // }
//   // if (!userVipProgress.currentVipLevel) {
//   //   throw new Error('Current VIP level missing');
//   // }
//   // const currentLevelModel = userVipProgress.currentVipLevel;
//   const nextLevelModel = getVipLevelConfiguration( userVipProgress.level + 1)
//   // const nextLevelModel = await prisma.vipLevel.findUnique({
//   //   where: { level: currentLevelModel.level + 1 },
//   // });

//   let pointsToNextLevel = 0;
//   let progressPercentage = nextLevelModel ? 0 : 100; // Default to 100 if at max level, 0 otherwise to start

//   if (nextLevelModel && userVipProgress.xpRequired < nextLevelModel.xpRequired) {
//     const xpForNext = new Decimal(nextLevelModel.xpRequired);
//     const currentTotalXpForVip = new Decimal(userVipProgress.xpRequired.toString());
//     const xpAtCurrentLevelStart = new Decimal(userVipProgress.xpRequired);

//     const totalXpInCurrentLevelBracket = xpForNext.minus(xpAtCurrentLevelStart);
//     const xpEarnedInCurrentBracket = currentTotalXpForVip.minus(xpAtCurrentLevelStart);

//     pointsToNextLevel = Math.max(0, xpForNext.minus(currentTotalXpForVip).toNumber());

//     if (totalXpInCurrentLevelBracket.gt(0)) {
//       progressPercentage = Math.max(
//         0,
//         Math.min(
//           100,
//           xpEarnedInCurrentBracket.div(totalXpInCurrentLevelBracket).times(100).toNumber()
//         )
//       );
//     } else if (currentTotalXpForVip.gte(xpForNext)) {
//       progressPercentage = 100;
//     }
//   }

//   const vipInfo: VipInfo = {
//     id: uuid(),//userVipProgress.id,
//     level: userVipProgress.level,
//     totalXp: 0,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     userId: '',
//     currentLevelXp: 0,
//     nextLevelXpRequired: 0,
//     cashbackPercentage: 0,
//     prioritySupport: false,
//     specialBonusesAvailable: 0,
//     dailyBonusClaimedAt: null,
//     weeklyBonusClaimedAt: null,
//     monthlyBonusClaimedAt: null
//   };
//   return vipInfo;
// }

// // --- Exported Logic Functions ---

// const prisma = new PrismaClient();

// // If UserVipDetails is not in @cashflow/types, you can define it here:
// /*
// export interface UserVipDetails {
//   level: number;
//   currentLevelXp: number;
//   totalXp: number;
//   xpToNextLevel: number;
//   nextLevelXpRequired: number;
//   cashbackPercentage: number;
//   prioritySupport: boolean;
//   specialBonusesAvailable: number;
//   lastDailyBonusClaim?: Date | null;
//   lastWeeklyBonusClaim?: Date | null;
//   lastMonthlyBonusClaim?: Date | null;
// }
// */

// const DEFAULT_VIP_LEVEL = 1; // Or 0 if you prefer 0-indexed levels for base
// const DEFAULT_CASHBACK_PERCENTAGE = 0.01; // 1%
// const DEFAULT_PRIORITY_SUPPORT = false;

// /**
//  * Retrieves the VIP information for a given user.
//  * If no VIP information exists, it creates and returns default VIP information.
//  *
//  * @param userId - The ID of the user whose VIP information is to be fetched.
//  * @returns A Promise resolving to the UserVipDetails.
//  */
// export async function fetchUserVipInfo(userId: string): Promise<UserVipDetails> {
//   if (!userId) {
//     throw new Error('User ID must be provided to fetch VIP information.');
//   }

//   let vipInfo: PrismaVipInfo | null = await prisma.vipInfo.findUnique({
//     where: { userId },
//   });

//   const now = new Date();

//   if (!vipInfo) {
//     // User has no VipInfo record, create a default one
//     const defaultLevelConfig = getLevelConfigByLevel(DEFAULT_VIP_LEVEL);
//     if (!defaultLevelConfig) {
//       // This should ideally not happen if leveling.config is comprehensive
//       console.error(`Default VIP level ${DEFAULT_VIP_LEVEL} configuration not found.`);
//       // Fallback to very basic defaults if config is missing
//       const basicDefault: UserVipDetails = {
//         level: DEFAULT_VIP_LEVEL,
//         currentLevelXp: 0,
//         totalXp: 0,
//         xpToNextLevel: 100, // Arbitrary if config fails
//         nextLevelXpRequired: 100, // Arbitrary
//         cashbackPercentage: DEFAULT_CASHBACK_PERCENTAGE,
//         prioritySupport: DEFAULT_PRIORITY_SUPPORT,
//         specialBonusesAvailable: 0,
//         lastDailyBonusClaim: null,
//         lastWeeklyBonusClaim: null,
//         lastMonthlyBonusClaim: null,
//       };
//       // Optionally, try to persist this very basic default if critical
//       // await prisma.vipInfo.create(...)
//       return basicDefault;
//     }

//     const newVipData = {
//       userId,
//       level: DEFAULT_VIP_LEVEL,
//       currentLevelXp: 0,
//       totalXp: 0, // Start with 0 total XP
//       nextLevelXpRequired: defaultLevelConfig.xpRequired, // XP for this level
//       cashbackPercentage: defaultLevelConfig.cashbackPercentage || DEFAULT_CASHBACK_PERCENTAGE,
//       prioritySupport: defaultLevelConfig.prioritySupport || DEFAULT_PRIORITY_SUPPORT,
//       specialBonusesAvailable: defaultLevelConfig.initialSpecialBonuses || 0,
//       // Ensure other required fields in your PrismaVipInfo model have defaults
//       // dailyBonusClaimedAt, weeklyBonusClaimedAt, monthlyBonusClaimedAt could be null
//     };

//     try {
//       vipInfo = await prisma.vipInfo.create({
//         data: newVipData,
//       });
//       console.log(`Created default VIP info for user ${userId}`);
//     } catch (error) {
//       console.error(`Failed to create default VIP info for user ${userId}:`, error);
//       // If creation fails, return conceptual defaults without persisting
//       return {
//         level: newVipData.level,
//         currentLevelXp: newVipData.currentLevelXp,
//         totalXp: newVipData.totalXp,
//         xpToNextLevel: newVipData.nextLevelXpRequired,
//         nextLevelXpRequired: newVipData.nextLevelXpRequired,
//         cashbackPercentage: newVipData.cashbackPercentage,
//         prioritySupport: newVipData.prioritySupport,
//         specialBonusesAvailable: newVipData.specialBonusesAvailable,
//         lastDailyBonusClaim: null,
//         lastWeeklyBonusClaim: null,
//         lastMonthlyBonusClaim: null,
//       };
//     }
//   }

//   // At this point, vipInfo is guaranteed to be non-null (either fetched or created)
//   // Calculate derived values based on existing or newly created vipInfo
//   const currentLevelConfig = getLevelConfigByLevel(vipInfo.level);
//   const xpForCurrentLevelStart = currentLevelConfig?.cumulativeXpToReach || 0;

//   // currentLevelXp should represent XP *within* the current level
//   // If your vipInfo.currentLevelXp already stores this, use it.
//   // Otherwise, if vipInfo.currentLevelXp stores totalXp, calculate it:
//   // const currentLevelXpProgress = vipInfo.totalXp - xpForCurrentLevelStart;
//   // For this example, let's assume vipInfo.currentLevelXp IS the progress within the level.
//   const currentLevelXpProgress = vipInfo.currentLevelXp;

//   const nextLevelThreshold = getNextLevelThreshold(vipInfo.level); // Total XP needed to reach next level
//   const xpRequiredForThisLevel = vipInfo.nextLevelXpRequired; // XP span of the current level

//   // XP points still needed to advance to the next level
//   const xpToNextLevel = Math.max(0, xpRequiredForThisLevel - currentLevelXpProgress);

//   return {
//     level: vipInfo.level,
//     currentLevelXp: currentLevelXpProgress, // XP within the current level
//     totalXp: vipInfo.totalXp, // User's total accumulated XP
//     xpToNextLevel: xpToNextLevel, // XP remaining for next level-up
//     nextLevelXpRequired: xpRequiredForThisLevel, // Total XP requirement for the current level bar
//     cashbackPercentage: vipInfo.cashbackPercentage,
//     prioritySupport: vipInfo.prioritySupport,
//     specialBonusesAvailable: vipInfo.specialBonusesAvailable,
//     lastDailyBonusClaim: vipInfo.dailyBonusClaimedAt,
//     lastWeeklyBonusClaim: vipInfo.weeklyBonusClaimedAt,
//     lastMonthlyBonusClaim: vipInfo.monthlyBonusClaimedAt,
//   };
// }

// /**
//  * Example of how you might update VIP info, e.g., when a bonus is claimed.
//  * This is NOT fetchUserVipInfo, but related.
//  */
// export async function claimDailyVipBonus(userId: string): Promise<PrismaVipInfo | null> {
//   // Logic to check if already claimed today
//   // ...

//   return prisma.vipInfo.update({
//     where: { userId },
//     data: {
//       dailyBonusClaimedAt: new Date(),
//       // Potentially update specialBonusesAvailable or other fields
//     },
//   });
// }

// // You would also need similar functions for weekly and monthly claims.
// // export async function fetchUserVipInfo(userId: string): Promise<Response> {
// //   try {
// //     const result = await db.$transaction(async (tx) => {
// //       const user = await tx.user.findUnique({
// //         where: { id: userId },
// //         include: {
// //           vipProgress: {
// //             include: {
// //               currentVipLevel: true,
// //             },
// //           },
// //         },
// //       });

// //       if (!user) {
// //         return { message: 'User not found', code: 404 };
// //       }

// //       // Get or create default VIP level 0 if it doesn't exist
// //       let defaultLevel = await tx.vipLevel.findUnique({ where: { level: 0 } });
// //       if (!defaultLevel) {
// //         defaultLevel = await tx.vipLevel.create({
// //           data: {
// //             level: 0,
// //             name: 'Bronze',
// //             rankName: 'Bronze',
// //             depositExpRequired: new Prisma.Decimal(0),
// //             betExpRequired: new Prisma.Decimal(0),
// //             protectionDays: 0,
// //             cycleAwardSwitch: false,
// //             levelAwardSwitch: false,
// //             signInAwardSwitch: false,
// //             betAwardSwitch: false,
// //             additionalBenefits: JSON.stringify([]),
// //           },
// //         });
// //       }

// //       // Create VIP progress if missing
// //       if (!user.vipProgress) {
// //         await tx.userVipProgress.create({
// //           data: {
// //             userId: user.id,
// //             currentVipLevelNumber: 0,
// //             currentVipLevelId: defaultLevel.id,
// //             lifetimeDepositExp: new Prisma.Decimal(0),
// //             lifetimeBetExp: new Prisma.Decimal(0),
// //             currentCycleDepositExp: new Prisma.Decimal(0),
// //             currentCycleBetExp: new Prisma.Decimal(0),
// //             totalXp: 0,
// //             expSwitchType: 3,
// //           },
// //         });
// //       }

// //       // Refresh user data with VIP progress
// //       const updatedUser = await tx.user.update({
// //         where: { id: userId },
// //         data:{
// //           vipProgress:{
// //             update:{
// //               currentVipLevelId: defaultLevel.id,
// //             }
// //           },

// //                 }
// //               }
// //             }
// //           }
// //         },
// //         include: {
// //           vipProgress: {
// //             include: {
// //               currentVipLevel: true,

// //             },
// //           },

// //         },
// //       });
// //       console.log('updatedUser', updatedUser);
// //       if (!updatedUser?.vipProgress?.currentVipLevel) {
// //         throw new Error('Failed to initialize VIP data');
// //       }

// //       const vipProgress = updatedUser.vipProgress as PrismaUserVipProgress & {
// //         currentVipLevel: PrismaVipLevel;
// //       };
// //       const vipInfo = await calculateAndFormatVipInfoLogic(tx, updatedUser, vipProgress);
// //       return vipInfo;
// //     });

// //     return new Response(JSON.stringify(result), {
// //       status: 200,
// //       headers: { 'Content-Type': 'application/json' },
// //     });
// //   } catch (error) {
// //     console.log(error);
// //     console.error('Failed to fetch deposit history:', error);
// //     return new Response(JSON.stringify({ message: 'Failed to fetch deposit history', code: 500 }), {
// //       status: 500,
// //     });
// //   }
// //   return new Response(JSON.stringify({ message: 'Failed to fetch deposit history', code: 500 }), {
// //     status: 500,
// //   });
// // }

// export async function fetchAllVipLevels() {

//   // const levels = await db.vipLevel.findMany({
//   //   orderBy: { level: 'asc' },
//   // });
//   // // return levels.map(transformPrismaVipLevelToInterface);
//   // return new Response(JSON.stringify(levels.map(transformPrismaVipLevelToInterface)));
// }

// export async function claimCycleReward(
//   userId: string,
//   type: number // 1 for weekly, 2 for monthly
// ) {
//   const response = db.$transaction(async (tx) => {
//     const userVipProgress = await tx.userVipProgress.findUnique({
//       where: { userId },
//       include: { currentVipLevel: true, user: true },
//     });

//     if (!userVipProgress || !userVipProgress.currentVipLevel || !userVipProgress.user) {
//       return { success: false, message: 'User VIP status or user data not found.' };
//     }

//     const currentLevel = userVipProgress.currentVipLevel;
//     let rewardAmount: Decimal | null | undefined;
//     let lastClaimedField: 'lastWeeklyBonusClaimedAt' | 'lastMonthlyBonusClaimedAt';
//     let rewardTypeString: 'WEEKLY_BONUS' | 'MONTHLY_BONUS';
//     let cycleConfig: { start: Date; end: Date };
//     const now = new Date();

//     if (type === 1) {
//       // Weekly
//       rewardAmount = currentLevel.weeklyBonusAmount;
//       lastClaimedField = 'lastWeeklyBonusClaimedAt';
//       rewardTypeString = 'WEEKLY_BONUS';
//       const startOfWeek = getStartOfWeekUTC(now);
//       const endOfWeek = new Date(startOfWeek);
//       endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
//       endOfWeek.setUTCHours(23, 59, 59, 999);
//       cycleConfig = { start: startOfWeek, end: endOfWeek };
//     } else if (type === 2) {
//       // Monthly
//       rewardAmount = currentLevel.monthlyBonusAmount;
//       lastClaimedField = 'lastMonthlyBonusClaimedAt';
//       rewardTypeString = 'MONTHLY_BONUS';
//       const startOfMonth = getStartOfMonthUTC(now);
//       const endOfMonth = new Date(startOfMonth);
//       endOfMonth.setUTCMonth(startOfMonth.getUTCMonth() + 1);
//       endOfMonth.setUTCDate(0);
//       endOfMonth.setUTCHours(23, 59, 59, 999);
//       cycleConfig = { start: startOfMonth, end: endOfMonth };
//     } else {
//       return { success: false, message: 'Invalid cycle reward type.' };
//     }

//     if (!rewardAmount || rewardAmount.isZero()) {
//       return {
//         success: false,
//         message: `No ${rewardTypeString.toLowerCase().replace('_', ' ')} configured for this level.`,
//       };
//     }

//     const lastClaimedDate = userVipProgress[lastClaimedField];
//     if (
//       lastClaimedDate &&
//       lastClaimedDate >= cycleConfig.start &&
//       lastClaimedDate <= cycleConfig.end
//     ) {
//       return {
//         success: false,
//         message: `${rewardTypeString.replace('_', ' ')} already claimed for this cycle.`,
//       };
//     }

//     // TODO: Actual crediting of rewardAmount to user's wallet.
//     // This will require your wallet/transaction logic. Example:
//     // await tx.transaction.create({ data: { userId, amount: rewardAmount, type: 'VIP_CYCLE_BONUS', currency: 'USD', ... } });
//     // await tx.wallet.update({ where: { userId_currency... }, data: { balance: { increment: rewardAmount } } });
//     console.log(`TODO: Credit ${rewardAmount} ${rewardTypeString} to user ${userId}`);

//     await tx.vipRewardClaim.create({
//       data: {
//         userId,
//         rewardType: rewardTypeString,
//         vipLevelAtClaim: currentLevel.level,
//         claimedAmount: rewardAmount,
//         currency: 'USD', // Example: Make this dynamic
//       },
//     });

//     const updatedVipProgress = await tx.userVipProgress.update({
//       where: { id: userVipProgress.id },
//       data: {
//         [lastClaimedField]: now,
//         // Consider resetting cycle-specific progress here if needed
//         // currentCycleDepositExp: 0,
//         // currentCycleBetExp: 0,
//         // cycleStartDate: now,
//       },
//       include: { currentVipLevel: true },
//     });
//     const refreshedVipInfo = await calculateAndFormatVipInfoLogic(
//       tx,
//       userVipProgress.user,
//       updatedVipProgress as any
//     );

//     return {
//       success: true,
//       message: `${rewardTypeString.replace('_', ' ')} claimed successfully!`,
//       data: { vipInfo: refreshedVipInfo },
//     };
//   });
//   return new Response(JSON.stringify(response));
// }

// export async function getVipSignInInfo(userId: string): Promise<Response> {
//   const userVipProgress = await db.userVipProgress.findUnique({
//     where: { userId },
//     include: { currentVipLevel: true },
//   });

//   if (!userVipProgress || !userVipProgress.currentVipLevel) {
//     return new Response(JSON.stringify({ message: 'VIP progress not found', code: 404 }), {
//       status: 404,
//     });
//   }
//   const currentLevel = userVipProgress.currentVipLevel;
//   const todayUTC = getStartOfTodayUTC();
//   const lastSignInUTC = userVipProgress.lastDailySignInDate ? getStartOfTodayUTC() : null; // Compare only dates

//   let isSignedToday = false;
//   if (lastSignInUTC && lastSignInUTC.getTime() === todayUTC.getTime()) {
//     isSignedToday = true;
//   }

//   // TODO: Implement logic to calculate `signin_day` (consecutive days)
//   // This usually involves checking if lastSignIn was yesterday, etc.
//   // For now, a placeholder:
//   const consecutiveSignInDays = 1; // Needs proper logic

//   // TODO: Define where `VipSignInAwardItem[]` comes from.
//   // It might be a fixed configuration, or stored in `VipLevel.additionalBenefits` or a separate table.
//   const signInRewardsConfig: VipSignInAwardItem[] = [
//     // Example static config
//     {
//       day: 1,
//       reward_type: 1,
//       reward_num: 10 * (currentLevel.dailySignInMultiplier?.toNumber() || 1),
//     },
//     {
//       day: 2,
//       reward_type: 1,
//       reward_num: 20 * (currentLevel.dailySignInMultiplier?.toNumber() || 1),
//     },
//     {
//       day: 3,
//       reward_type: 1,
//       reward_num: 30 * (currentLevel.dailySignInMultiplier?.toNumber() || 1),
//     },
//     // ... up to 7 or more days
//   ];

//   const response = {
//     award: signInRewardsConfig,
//     signin_day: consecutiveSignInDays,
//     is_signin: isSignedToday ? 1 : 0,
//     limited_bet: 0, // Placeholder - conditions for sign-in
//     limited_deposit: 0, // Placeholder
//     vip_level: userVipProgress.currentVipLevelNumber,
//   };
//   return new Response(JSON.stringify(response));
// }

// export async function claimDailySignIn(userId: string): Promise<Response> {
//   const response = db.$transaction(async (tx) => {
//     const userVipProgress = await tx.userVipProgress.findUnique({
//       where: { userId },
//       include: { currentVipLevel: true },
//     });

//     if (!userVipProgress || !userVipProgress.currentVipLevel) {
//       return { code: 404, message: 'User VIP status not found.' };
//     }

//     const todayUTC = getStartOfTodayUTC();
//     const lastSignInUTC = userVipProgress.lastDailySignInDate ? getStartOfTodayUTC() : null;

//     if (lastSignInUTC && lastSignInUTC.getTime() === todayUTC.getTime()) {
//       return { code: 400, message: 'Daily sign-in reward already claimed today.' };
//     }

//     // TODO: Determine actual reward based on consecutive days and VipLevel.dailySignInMultiplier
//     // For now, placeholder reward
//     const rewardAmount = new Decimal(10); // Example fixed amount
//     const rewardCurrency = 'POINTS'; // Example currency type

//     // TODO: Logic to credit user's balance/points.
//     console.log(
//       `TODO: Credit ${rewardAmount} ${rewardCurrency} to user ${userId} for daily sign-in.`
//     );

//     await tx.vipRewardClaim.create({
//       data: {
//         userId,
//         rewardType: 'DAILY_SIGN_IN',
//         vipLevelAtClaim: userVipProgress.currentVipLevelNumber,
//         claimedAmount: rewardAmount,
//         currency: rewardCurrency,
//         description: `Daily Sign-in Reward - Day X`, // TODO: Add consecutive day if tracked
//       },
//     });

//     await tx.userVipProgress.update({
//       where: { id: userVipProgress.id },
//       data: {
//         lastDailySignInDate: new Date(), // Store actual timestamp
//         // TODO: Update consecutive sign-in day counter here
//       },
//     });

//     return { code: 200, message: 'Daily sign-in reward claimed successfully!' };
//   });
//   return new Response(JSON.stringify(response), {
//     status: 200,
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
// }

// export async function fetchVipTasks(userId: string): Promise<Response> {
//   try {
//     const activeTasks = await db.vipTask.findMany({
//       where: { isActive: true },
//       orderBy: { id: 'asc' }, // Or some other order
//     });

//     const userProgressEntries = await db.userVipTaskProgress.findMany({
//       where: { userId, vipTaskId: { in: activeTasks.map((t) => t.id) } },
//     });
//     const progressMap = new Map(userProgressEntries.map((p) => [p.vipTaskId, p]));

//     const response = activeTasks.map((task, idx) => {
//       const progress = progressMap.get(task.id);
//       const currentProgress = progress?.progress.toNumber() ?? 0;
//       const target = task.targetValue?.toNumber() ?? 0;
//       const isCompleted = progress?.isCompleted ?? false;
//       // status: 0 = not started/in progress, 1 = completed but not claimed, 2 = claimed/completed and nothing to claim
//       // This status might need refinement based on if `completedAt` on UserVipTaskProgress means "reward claimed"
//       let status: 0 | 1 | 2 = 0;
//       if (isCompleted) {
//         status = 2; // Or 1 if there's a separate claim step for tasks
//       } else if (currentProgress > 0) {
//         status = 1;
//       }

//       // Construct task_terms object as required by VipTaskItem interface
//       const taskTermsObj = {
//         terms_id: task.id || '',
//         // deposit: task. ?? '',
//         bet: '', // Property does not exist on task, so set to empty string or use a valid property if available
//         // game_type: task.gameType || '',
//         // game_tag: task.gameTag || '',
//         // times: task.timesRequirement ?? '',
//         // multiplier: task.multiplierRequirement ?? '',
//         // game_win: task.winRequirement ?? '',
//       };

//       // Add required 'state' and 'award' fields for VipTaskItem
//       return {
//         index: (idx + 1).toString(),
//         task_id: task.id,
//         task_type: String(task.type),
//         task_terms: taskTermsObj,
//         task_title: task.title,
//         task_content: task.description || '',
//         status: status,
//         schedule: currentProgress,
//         schedule_max: target,
//         reward: `${task.bonusReward?.toString() || task.xpReward} ${task.currencyForBonus || 'XP'}`,
//         is_receive: isCompleted && !progress?.completedAt ? 1 : 0,
//         // Optionally, include legacy/alias fields for compatibility
//         id: task.id,
//         type: parseInt(task.type, 10) || 0,
//         title: task.title,
//         content: task.description || '',
//         // Required fields for VipTaskItem
//         state: status.toString(), // or map to the correct value if needed
//         award: `${task.bonusReward?.toString() || task.xpReward} ${task.currencyForBonus || 'XP'}`,
//       };
//     });
//     return new Response(JSON.stringify(response), {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//   } catch (error) {
//     return new Response(JSON.stringify({ error: (error as Error).message }), {
//       status: 500,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//   }
// }

// export async function fetchVipLevelUpList(userId: string): Promise<Response> {
//   if (!userId) {
//     return new Response(JSON.stringify({ error: 'User ID required' }), { status: 400 });
//   }
//   const userVipProgress = await db.userVipProgress.findUnique({
//     where: { userId },
//   });

//   if (!userVipProgress) {
//     return new Response(
//       JSON.stringify({
//         data: {
//           list: [],
//           total_receive_num: 0,
//           level: 0,
//           upgreadegift: 0,
//           upgrade_award: 0,
//         },
//       })
//     );
//   }

//   // Levels the user has achieved or surpassed
//   const achievedOrSurpassedLevels = await db.vipLevel.findMany({
//     where: { level: { lte: userVipProgress?.currentVipLevelNumber || 0 } },
//     orderBy: { level: 'asc' },
//   });

//   // Rewards already claimed by the user
//   const claimedLevelUpRewards = await db.vipRewardClaim.findMany({
//     where: {
//       userId,
//       rewardType: 'LEVEL_UP',
//     },
//     select: { vipLevelAtClaim: true },
//   });
//   const claimedLevelsSet = new Set(claimedLevelUpRewards.map((r) => r.vipLevelAtClaim));

//   const list: VipLevelUpItem[] = [];
//   let totalPendingRewardAmount = new Decimal(0);

//   for (const level of achievedOrSurpassedLevels) {
//     const isClaimed = claimedLevelsSet.has(level.level);
//     const canClaim = !isClaimed && (level.levelUpBonusAmount?.gt(0) ?? false); // Eligible if bonus exists and not claimed

//     if (canClaim) {
//       totalPendingRewardAmount = totalPendingRewardAmount.add(level.levelUpBonusAmount || 0);
//     }

//     list.push({
//       id: level.level, // Using level number as ID for client
//       level: level.level,
//       // Add other fields as needed for VipLevelUpItem
//       // is_claimed: isClaimed ? 1 : 0,
//       // can_claim: canClaim ? 1 : 0,
//       // reward: level.levelUpBonusAmount?.toNumber() ?? 0,
//       name: level.name,
//       status: 0,
//       reward_num: 0,
//     });
//   }

//   const response = {
//     list,
//     total_receive_num: totalPendingRewardAmount.toNumber(),
//     level: userVipProgress?.currentVipLevelNumber || 0,
//     upgreadegift: 0, // Set this to the correct value if available
//     upgrade_award: 0, // Set this to the correct value if available
//   };
//   return new Response(JSON.stringify(response), {
//     status: 200,
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
// }

// export async function claimSpecificLevelUpReward(
//   userId: string,
//   levelToClaim: number // This is VipLevelUpItem.id which is VipLevel.level
// ) {
//   try {
//     if (!userId || !levelToClaim) {
//       return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
//     }
//     if (!levelToClaim) {
//       return new Response(JSON.stringify({ code: 400, message: 'Level to claim is required' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }
//     const response = await db.$transaction(async (tx) => {
//       const userVipProgress = await tx.userVipProgress.findUnique({
//         where: { userId },
//         include: { user: true },
//       });

//       if (!userVipProgress || !userVipProgress.user) {
//         return { code: 404, message: 'User or VIP status not found.', data: null };
//       }

//       if (userVipProgress.currentVipLevelNumber < levelToClaim) {
//         return { code: 400, message: 'User has not reached this VIP level.', data: null };
//       }

//       const targetLevel = await tx.vipLevel.findUnique({ where: { level: levelToClaim } });
//       if (
//         !targetLevel ||
//         !targetLevel.levelUpBonusAmount ||
//         targetLevel.levelUpBonusAmount.isZero()
//       ) {
//         return {
//           code: 404,
//           message: 'No level up reward configured for this level or level not found.',
//           data: null,
//         };
//       }

//       const existingClaim = await tx.vipRewardClaim.findFirst({
//         where: { userId, rewardType: 'LEVEL_UP', vipLevelAtClaim: targetLevel.level },
//       });

//       if (existingClaim) {
//         return {
//           code: 400,
//           message: 'Reward for this level has already been claimed.',
//           data: null,
//         };
//       }

//       // TODO: Actual crediting of targetLevel.levelUpBonusAmount to user's wallet.
//       // This depends on your wallet/transaction system.
//       // Example: await creditUserWallet(tx, userId, targetLevel.levelUpBonusAmount, "USD", "VIP_LEVEL_UP_REWARD");
//       console.log(
//         `TODO: Credit ${targetLevel.levelUpBonusAmount} to user ${userId} for level ${targetLevel.level} reward.`
//       );

//       await tx.vipRewardClaim.create({
//         data: {
//           userId,
//           rewardType: 'LEVEL_UP',
//           vipLevelAtClaim: targetLevel.level,
//           claimedAmount: targetLevel.levelUpBonusAmount,
//           currency: 'USD', // TODO: Make currency dynamic if needed
//           description: `VIP Level ${targetLevel.level} Reward Claimed`,
//         },
//       });

//       // Potentially refresh userVipInfo to send back
//       const refreshedVipInfo = await calculateAndFormatVipInfoLogic(
//         tx,
//         userVipProgress.user,
//         userVipProgress as any
//       );

//       return {
//         code: 200,
//         message: 'Level up reward claimed successfully!',
//         data: {
//           // Populate according to VipLevelUpReceiveData if it's more specific
//           // For now, just returning the refreshed VIP info might be useful
//           vipInfo: refreshedVipInfo,
//           claimed_amount: targetLevel.levelUpBonusAmount.toNumber(),
//         },
//       };
//     });
//   } catch (e) {
//     return new Response(JSON.stringify({ error: (e as Error).message }), {
//       status: 500,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//   }
// }

// export async function fetchVipBetAwardList(userId: string): Promise<Response> {
//   try {
//     const userVipProgress = await db.userVipProgress.findUnique({
//       where: { userId },
//       include: { currentVipLevel: true },
//     });

//     if (!userVipProgress || !userVipProgress.currentVipLevel) {
//       return new Response(JSON.stringify({ message: 'VIP progress not found', code: 404 }), {
//         status: 404,
//       });
//     }

//     const rebateRate = userVipProgress.currentVipLevel.rebateRate || new Decimal(0);

//     // TODO: Implement logic to fetch actual bet amounts for "now" and "yesterday"
//     // This requires querying your game transaction/betting records.
//     // These are placeholders.
//     const currentCycleUnclaimedBets = new Decimal(userVipProgress.currentCycleBetExp); // Example: current cycle's accumulated bet exp
//     const yesterdayBets = new Decimal(0); // Example: sum of bets from yesterday if that's a claimable category

//     const totalClaimedRebates = await db.vipRewardClaim.aggregate({
//       _sum: { claimedAmount: true },
//       where: { userId, rewardType: { in: ['BET_REBATE', 'CASHBACK'] } }, // Adjust rewardType as needed
//     });

//     const responseData = {
//       now_cash_back: currentCycleUnclaimedBets.mul(rebateRate).toFixed(2),
//       yesterday_cash_back: yesterdayBets.mul(rebateRate).toFixed(2),
//       history_cash_back: totalClaimedRebates._sum.claimedAmount?.toFixed(2) || '0.00',
//     };
//     return new Response(JSON.stringify(responseData), {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//   } catch (e) {
//     return new Response(JSON.stringify(e), {
//       status: 500,
//       headers: {},
//     });
//   }
// }

// export async function claimBetAward(
//   userId: string,
//   type: number // Assuming 'type' distinguishes which bet award to claim. e.g. 7 for '打码奖励' (Coding Rewards)
// ) {
//   try {
//     if (!userId || !type) {
//       return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
//     }
//     // Use a more specific response type if needed.
//     const response = await db.$transaction(async (tx) => {
//       const userVipProgress = await tx.userVipProgress.findUnique({
//         where: { userId },
//         include: { currentVipLevel: true },
//       });

//       if (!userVipProgress || !userVipProgress.currentVipLevel) {
//         return { code: 404, message: 'User VIP status not found.' };
//       }
//       const currentLevel = userVipProgress.currentVipLevel;
//       const rebateRate = currentLevel.rebateRate || new Decimal(0);
//       let claimableBetAmount = new Decimal(0);
//       let rewardDescription = 'Bet Award';

//       // Type 7 from your store example for "打码奖励" (Bet Rebate)
//       if (type === 7) {
//         claimableBetAmount = userVipProgress.currentCycleBetExp.mul(rebateRate);
//         rewardDescription = 'Betting Rebate';
//         // TODO: Add checks to prevent double claiming for the same cycle of bets.
//         // This might involve checking `lastBetRewardClaimedAt` against `userVipProgress.cycleStartDate`.
//         // For simplicity, we assume this check is handled or implied by resetting currentCycleBetExp.
//       } else {
//         return { code: 400, message: 'Invalid bet award type specified.' };
//       }

//       if (claimableBetAmount.lte(0)) {
//         return { code: 400, message: 'No bet award available to claim.' };
//       }

//       // TODO: Actual crediting of claimableAmount to user's wallet/balance.
//       console.log(`TODO: Credit ${claimableBetAmount.toFixed(2)} as Bet Award to user ${userId}`);

//       await tx.vipRewardClaim.create({
//         data: {
//           userId,
//           rewardType: 'BET_REBATE', // Or make this dynamic based on 'type'
//           vipLevelAtClaim: currentLevel.level,
//           claimedAmount: claimableBetAmount,
//           currency: 'USD', // TODO: Determine currency
//           description: rewardDescription,
//         },
//       });

//       // Reset current cycle bet accumulation if this claim is for the current cycle's bets
//       if (type === 7) {
//         await tx.userVipProgress.update({
//           where: { id: userVipProgress.id },
//           data: {
//             currentCycleBetExp: new Decimal(0), // Reset for next cycle
//             lastBetRewardClaimedAt: new Date(),
//           },
//         });
//       }

//       return { code: 200, message: `${rewardDescription} claimed successfully!` };
//     });
//   } catch (e) {
//     return new Response(JSON.stringify(e), {
//       status: 500,
//       headers: {},
//     });
//   }
// }

// async function fetchPaginatedRewardHistory(
//   userId: string,
//   rewardTypes: string[],
//   pagination: VipHistoryRequest
// ): Promise<{ total: number; list: VipHistoryItem[] }> {
//   try {
//     const { page = 1, limit = 10 } = pagination;
//     const skip = (page - 1) * limit;

//     const where: Prisma.VipRewardClaimWhereInput = {
//       userId,
//       rewardType: { in: rewardTypes },
//     };
//     const totalCount = await db.vipRewardClaim.count({ where });
//     const rewardClaims = await db.vipRewardClaim.findMany({
//       where,
//       orderBy: { claimedAt: 'desc' },
//       skip,
//       take: limit,
//     });

//     const claimList = rewardClaims.map((claim) => ({
//       id: claim.id,
//       name: claim.description || claim.rewardType.replace(/_/g, ' '),
//       time: claim.claimedAt.toISOString(),
//       amount: claim.claimedAmount?.toNumber() || 0,
//       remark: `Level ${claim.vipLevelAtClaim} - ${claim.currency || ''}`,
//     }));

//     // return {
//     //   total: totalCount,
//     //   list: claimList
//     // };

//     const total = await db.vipRewardClaim.count({ where });
//     const claims = await db.vipRewardClaim.findMany({
//       where,
//       orderBy: { claimedAt: 'desc' },
//       skip,
//       take: limit,
//     });

//     const responseData = await fetchPaginatedRewardHistory(
//       userId,
//       ['BET_REBATE', 'CASHBACK'],
//       pagination
//     );
//     const paginatedData = await fetchPaginatedRewardHistory(
//       userId,
//       ['BET_REBATE', 'CASHBACK'],
//       pagination
//     );
//     return {
//       total: totalCount,
//       list: claimList,
//     };
//     // status: 200,
//     // headers: { 'Content-Type': 'application/json' }
//     // });
//   } catch (e) {
//     return new Response(JSON.stringify(e), {
//       status: 500,
//       headers: {},
//     });
//   }
// }

// export async function fetchRebateHistory(
//   userId: string,
//   pagination: VipHistoryRequest
// ): Promise<Response> {
//   try {
//     const response = await fetchPaginatedRewardHistory(
//       userId,
//       ['BET_REBATE', 'CASHBACK'],
//       pagination
//     );
//     return new Response(JSON.stringify(response));
//   } catch (e) {
//     return new Response(JSON.stringify(e), {
//       status: 500,
//       headers: {},
//     });
//   }
// }

// export async function fetchLevelRewardHistory(
//   userId: string,
//   pagination: VipHistoryRequest
// ): Promise<Response> {
//   const response = await fetchPaginatedRewardHistory(userId, ['LEVEL_UP', 'RANK_UP'], pagination);
//   return new Response(JSON.stringify(response));
// }

// export async function fetchTimesHistory(
//   userId: string,
//   pagination: VipHistoryRequest
// ): Promise<Response> {
//   const response = await fetchPaginatedRewardHistory(
//     userId,
//     ['DAILY_SIGN_IN', 'WEEKLY_BONUS', 'MONTHLY_BONUS'],
//     pagination
//   );
//   return new Response(JSON.stringify(response));
// }
// // // apps/server/src/services/vip.logic.ts
// // import { db } from '@cashflow/database';
// // import type * as VipTypes from '@cashflow/types';
// // import { VipLevelAwardData } from '@cashflow/types';
// // import type { UserWithProfile } from '@cashflow/types';
// // // Your shared types
// // import { Decimal } from '@prisma/client/runtime/library';

// // // For handling Decimal types

// // // Helper to transform Prisma VipLevel to VipLevelInterface from @cashflow/types
// // function transformVipLevelToInterface(
// //   level: any /* Prisma.VipLevelGetPayload<{ include: { benefits: true } } */,
// // ): VipTypes.VipLevel {
// //   return {
// //     id: level.id,
// //     level: level.level,
// //     name: level.name,
// //     rank_name: level.rankName || level.name,
// //     icon: level.iconUrl || '',
// //     deposit_exp_required: level.depositExpRequired.toNumber(),
// //     bet_exp_required: level.betExpRequired.toNumber(),
// //     level_up_bonus: level.levelUpBonusAmount?.toNumber(),
// //     weekly_bonus: level.weeklyBonusAmount?.toNumber(),
// //     monthly_bonus: level.monthlyBonusAmount?.toNumber(),
// //     benefits: level.additionalBenefits
// //       ? (JSON.parse(level.additionalBenefits as string) as PrismaVipBenefit[])
// //       : [],
// //     keep_rate: level.keepRate || 0, // from vip_interface
// //     // ... other fields from VipLevel that map from Prisma's VipLevel
// //     // switches
// //     cycle_award_switch: level.cycleAwardSwitch,
// //     level_award_switch: level.levelAwardSwitch,
// //     signin_award_switch: level.signInAwardSwitch,
// //     bet_award_switch: level.betAwardSwitch,
// //     withdrawal_award_switch: true, // Example, make this configurable
// //   };
// // }

// // // Helper to calculate VipInfo based on user and their progress
// // async function calculateUserVipData(
// //   prisma: typeof db,
// //   user: UserWithProfile,
// //   userVipProgress: NonNullable<UserWithProfile['vipProgress']> & {
// //     currentVipLevel: NonNullable<UserWithProfile['vipProgress']['currentVipLevel']>;
// //   },
// // ): Promise<VipTypes.VipInfo> {
// //   const currentLevelModel = userVipProgress.currentVipLevel;
// //   if (!currentLevelModel) throw new Error('Current VIP level data missing for user.');

// //   const nextLevelModel = await prisma.vipLevel.findUnique({
// //     where: { level: currentLevelModel.level + 1 },
// //   });

// //   let pointsToNextLevel = 0;
// //   let progressPercentage = 100;

// //   if (nextLevelModel) {
// //     const xpForNext = new Decimal(nextLevelModel.xpRequired);
// //     const currentTotalXp = new Decimal(userVipProgress.totalXp.toString()); // Assuming totalXp is BigInt
// //     const xpAtCurrentStart = new Decimal(currentLevelModel.xpRequired);

// //     const bracketSize = xpForNext.minus(xpAtCurrentStart);
// //     const earnedInBracket = currentTotalXp.minus(xpAtCurrentStart);

// //     pointsToNextLevel = Math.max(0, xpForNext.minus(currentTotalXp).toNumber());

// //     if (bracketSize.greaterThan(0)) {
// //       progressPercentage = Math.min(
// //         100,
// //         earnedInBracket.dividedBy(bracketSize).times(100).toNumber(),
// //       );
// //     }
// //   }

// //   return {
// //     id: userVipProgress.id,
// //     level: currentLevelModel.level,
// //     deposit_exp: userVipProgress.lifetimeDepositExp.toNumber(),
// //     bet_exp: userVipProgress.lifetimeBetExp.toNumber(),
// //     rank_bet_exp: currentLevelModel.betExpRequired.toNumber(),
// //     rank_deposit_exp: currentLevelModel.depositExpRequired.toNumber(),
// //     rank_name: currentLevelModel.rankName || currentLevelModel.name,
// //     icon: currentLevelModel.iconUrl || '',
// //     exp_switch_type: userVipProgress.expSwitchType ?? 3,
// //     now_deposit_exp: userVipProgress.currentCycleDepositExp.toFixed(2),
// //     level_deposit_exp: currentLevelModel.depositExpRequired.toFixed(2),
// //     now_bet_exp: userVipProgress.currentCycleBetExp.toFixed(2),
// //     level_bet_exp: currentLevelModel.betExpRequired.toFixed(2),
// //     telegram: userVipProgress.telegramHandle || '',
// //     is_protection: userVipProgress.isRelegationProtected,
// //     protection_deposit_exp: userVipProgress.isRelegationProtected ? 'N/A' : '0', // Placeholder
// //     protection_deposit_amount: userVipProgress.isRelegationProtected ? 'N/A' : '0', // Placeholder
// //     protection_bet_exp: userVipProgress.isRelegationProtected ? 'N/A' : '0', // Placeholder
// //     protection_bet_amount: userVipProgress.isRelegationProtected ? 'N/A' : '0', // Placeholder
// //     protection_days: currentLevelModel.protectionDays || 0,
// //     protection_switch: (currentLevelModel.protectionDays || 0) > 0 ? 1 : 0,
// //     cycle_award_switch: currentLevelModel.cycleAwardSwitch,
// //     level_award_switch: currentLevelModel.levelAwardSwitch,
// //     signin_award_switch: currentLevelModel.signInAwardSwitch,
// //     bet_award_switch: currentLevelModel.betAwardSwitch,
// //     withdrawal_award_switch: true, // Example
// //     pointsToNextLevel: pointsToNextLevel,
// //     progressPercentage: parseFloat(progressPercentage.toFixed(2)),
// //     currentLevelName: currentLevelModel.name,
// //     nextLevel: nextLevelModel?.level,
// //     nextLevelName: nextLevelModel?.name,
// //     benefits: currentLevelModel.additionalBenefits
// //       ? (JSON.parse(currentLevelModel.additionalBenefits as string) as PrismaVipBenefit[])
// //       : [],
// //   };
// // }

// // export async function fetchUserVipInfoLogic(
// //   userId: string,
// //
// // ): Promise<VipTypes.VipInfo | null> {
// //   const userWithVip = await db.user.findUnique({
// //     where: { id: userId },
// //     include: {
// //       vipProgress: {
// //         include: {
// //           currentVipLevel: true,
// //         },
// //       },
// //     },
// //   });

// //   if (!userWithVip || !userWithVip.vipProgress || !userWithVip.vipProgress.currentVipLevel) {
// //     // Handle case: User might not have VIP progress yet, or level is missing.
// //     // Optionally, create a default level 0 VIP status for the user here if that's desired.
// //     // For now, returning null signifies no comprehensive VIP info available.
// //     return null;
// //   }
// //   return calculateUserVipData(db, userWithVip, userWithVip.vipProgress as any);
// // }

// // export async function fetchAllVipLevelsLogic(
// //
// // ): Promise<VipTypes.VipLevel[]> {
// //   const levels = await db.vipLevel.findMany({
// //     orderBy: { level: 'asc' },
// //     // include: { benefits: true } // If using a separate VipSpecificBenefit model
// //   });
// //   return levels.map(transformVipLevelToInterface);
// // }

// // // ... other logic functions for claimLevelUpReward, claimCycleReward, etc.
// // // These would involve database writes within Prisma transactions.
// // // Example for claimLevelUpReward:
// // export async function claimLevelUpRewardLogic(
// //   userId: string,
// //   type: number,
// //
// // ): Promise<{ success: boolean; message: string; data?: VipLevelAwardData }> {
// //   const vipProgress = await db.userVipProgress.findUnique({
// //     where: { userId },
// //     include: { currentVipLevel: true },
// //   });

// //   if (!vipProgress || !vipProgress.currentVipLevel) {
// //     return { success: false, message: 'User VIP status not found.' };
// //   }

// //   const currentLevelModel = vipProgress.currentVipLevel;
// //   if (vipProgress.lastLevelUpRewardClaimedForLevel === currentLevelModel.level) {
// //     return { success: false, message: 'Reward already claimed for this level.' };
// //   }
// //   if (!currentLevelModel.levelUpBonusAmount || currentLevelModel.levelUpBonusAmount.isZero()) {
// //     return { success: false, message: 'No level up bonus for this level.' };
// //   }

// //   try {
// //     await db.$transaction(async (tx) => {
// //       // TODO: Actual logic to credit user's balance with currentLevelModel.levelUpBonusAmount
// //       // e.g., await tx.wallet.update(...) or create a bonus transaction

// //       await tx.vipRewardClaim.create({
// //         data: {
// //           userId: userId,
// //           rewardType: 'LEVEL_UP',
// //           vipLevelAtClaim: currentLevelModel.level,
// //           claimedAmount: currentLevelModel.levelUpBonusAmount,
// //           currency: 'USD', // Or your primary currency
// //           description: `VIP Level ${currentLevelModel.level} Up Bonus`,
// //         },
// //       });

// //       await tx.userVipProgress.update({
// //         where: { userId },
// //         data: { lastLevelUpRewardClaimedForLevel: currentLevelModel.level },
// //       });
// //     });
// //     return {
// //       success: true,
// //       message: 'Level up reward claimed!',
// //       data: {
// //         /* your VipLevelAwardData */
// //       },
// //     };
// //   } catch (error) {
// //     console.error('Error claiming level up reward:', error);
// //     return { success: false, message: 'Failed to claim reward.' };
// //   }
// // }

// // // Add other service logic functions for:
// // // - claimCycleRewardLogic
// // // - getVipSignInInfoLogic
// // // - claimDailySignInLogic
// // // - getVipTasksLogic
// // // - getVipLevelUpListLogic (rewards that are pending claim)
// // // - claimSpecificLevelUpRewardLogic
// // // - getBetAwardListLogic
// // // - claimBetAwardLogic
// // // - getRebateHistoryLogic
// // // - getLevelRewardHistoryLogic
// // // - getTimesHistoryLogic

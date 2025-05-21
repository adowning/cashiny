import { Prisma, RewardType } from '@cashflow/database';

// server/src/config/leveling.config.ts
export interface LevelBenefit {
  id: string;
  name: string;
  description: string;
  type: 'monetary' | 'item' | 'perk'; // Example typing for benefits
  value?: number | string; // e.g., amount for monetary, itemId for item
  currencyId?: string;
}

export interface CycleRewardConfig {
  type: 'daily' | 'weekly' | 'monthly';
  rewardName: string;
  description: string;
  amount?: number;
  currencyId?: string;
  items?: { itemId: string; quantity: number }[]; // If you have an Item model
}

export interface SignInReward {
  day: number; // Day of the streak
  description: string;
  amount?: number;
  currencyId?: string;
  xp?: number;
}

export interface LevelConfig {
  level: number;
  name: string;
  xpRequired: number;
  cumulativeXpToReach: number;
  cashbackPercentage: number;
  prioritySupport: boolean;
  initialSpecialBonuses?: number;
  benefits: LevelBenefit[];

  // Rewards for reaching this level (to be created as UserReward)
  levelUpRewards?: Omit<
    UserRewardCreateInput,
    'userId' | 'rewardType' | 'status' | 'vipLevelRequirement'
  >[]; // Prisma's create input type

  // Config for periodic cycle rewards available at this level
  dailyCycleReward?: CycleRewardConfig;
  weeklyCycleReward?: CycleRewardConfig;
  monthlyCycleReward?: CycleRewardConfig;
}

// Simplified example - expand this significantly
export const VIP_LEVEL_CONFIGS: Readonly<LevelConfig[]> = Object.freeze([
  {
    level: 1,
    name: 'Bronze',
    xpRequired: 100,
    cumulativeXpToReach: 0,
    cashbackPercentage: 0.01,
    prioritySupport: false,
    benefits: [],
    levelUpRewards: [{ description: 'Welcome Bonus!', amount: 10, currencyId: 'USD_FUN' }], // USD_FUN is an example virtual currency
    dailyCycleReward: {
      type: 'daily',
      rewardName: 'Daily Login Spark',
      description: 'A small daily spark.',
      amount: 1,
      currencyId: 'USD_FUN',
    },
  },
  {
    level: 2,
    name: 'Silver',
    xpRequired: 200,
    cumulativeXpToReach: 100,
    cashbackPercentage: 0.02,
    prioritySupport: true,
    benefits: [],
    levelUpRewards: [{ description: 'Silver Tier Bonus!', amount: 50, currencyId: 'USD_FUN' }],
    dailyCycleReward: {
      type: 'daily',
      rewardName: 'Daily Silver Bonus',
      description: 'A better daily bonus.',
      amount: 5,
      currencyId: 'USD_FUN',
    },
    weeklyCycleReward: {
      type: 'weekly',
      rewardName: 'Weekly Silver Chest',
      description: 'A chest of goodies.',
      items: [{ itemId: 'silver_key', quantity: 1 }],
    },
  },
  // ... more levels
]);

export const DAILY_SIGN_IN_REWARDS: Readonly<SignInReward[]> = Object.freeze([
  { day: 1, description: 'Day 1: Welcome Sparkles!', xp: 10, amount: 1, currencyId: 'USD_FUN' },
  { day: 2, description: 'Day 2: Double Sparkles!', xp: 20, amount: 2, currencyId: 'USD_FUN' },
  { day: 3, description: 'Day 3: Minor Boost!', xp: 30, amount: 5, currencyId: 'USD_FUN' },
  { day: 4, description: 'Day 4: Steady On!', xp: 20, amount: 2, currencyId: 'USD_FUN' },
  { day: 5, description: 'Day 5: Mid-week Perk!', xp: 50, amount: 10, currencyId: 'USD_FUN' },
  { day: 6, description: 'Day 6: Almost there!', xp: 20, amount: 2, currencyId: 'USD_FUN' },
  { day: 7, description: 'Day 7: Weekly Jackpot!', xp: 100, amount: 25, currencyId: 'USD_FUN' },
]);

export function getVipLevelConfiguration(level: number): Readonly<LevelConfig> | undefined {
  return VIP_LEVEL_CONFIGS.find((l) => l.level === level);
}

export function getAllVipLevelConfigurations(): Readonly<LevelConfig[]> {
  return VIP_LEVEL_CONFIGS;
}

export function getVipLevelByTotalXp(totalXp: number): Readonly<LevelConfig> {
  for (let i = VIP_LEVEL_CONFIGS.length - 1; i >= 0; i--) {
    if (totalXp >= VIP_LEVEL_CONFIGS[i].cumulativeXpToReach) {
      return VIP_LEVEL_CONFIGS[i];
    }
  }
  return (
    VIP_LEVEL_CONFIGS[0] || {
      level: 0,
      name: 'Unranked',
      xpRequired: 100,
      cumulativeXpToReach: 0,
      cashbackPercentage: 0,
      prioritySupport: false,
      benefits: [],
    }
  );
}

export function getXpForCurrentLevelBar(level: number): number {
  const config = getVipLevelConfiguration(level);
  return config ? config.xpRequired : Infinity;
}

// Add UserRewardCreateInput type if not available from Prisma (though it should be)
type PrismaUserRewardCreateInputOptional = Partial<Prisma.UserRewardCreateInput>; // Helper if needed
export interface UserRewardCreateInput extends PrismaUserRewardCreateInputOptional {
  userId: string;
  rewardType: RewardType;
  description: string;
  // ... other fields from Prisma's UserRewardCreateInput
}
// // src/config/leveling.config.ts
// // export const LEVEL_THRESHOLDS: ReadonlyArray<{
// //   level: number;
// //   xpRequired: number;
// //   title: string;
// // }> = [
// //   { level: 1, xpRequired: 0, title: "Novice" },
// //   { level: 2, xpRequired: 100, title: "Apprentice" },
// //   { level: 3, xpRequired: 250, title: "Journeyman" },
// //   { level: 4, xpRequired: 500, title: "Expert" },
// //   { level: 5, xpRequired: 1000, title: "Master" },
// //   // Add more levels as needed
// // ].sort((a, b) => a.xpRequired - b.xpRequired); // Sort ascending by XP for easier lookup
// // Define all your VIP levels here
// import { LevelConfig, UserLeveledUpPayload, UserXpGainedPayload } from '@cashflow/types';
// // src/events/app-event-emitter.ts (Example Event Emitter)
// import { EventEmitter } from 'events'; // Node.js built-in or use a library like 'eventemitter2'

// export const vipLevels: Readonly<LevelConfig[]> = Object.freeze([
//   {
//     level: 1,
//     name: 'Rookie',
//     xpRequired: 100, // To get from start of L1 to start of L2
//     cumulativeXpToReach: 0,
//     cashbackPercentage: 0.01, // 1%
//     prioritySupport: false,
//     initialSpecialBonuses: 0,
//     dailyBonusMultiplier: 1.0,
//     benefits: [
//       {
//         id: 'basic_support',
//         name: 'Basic Support',
//         description: 'Access to standard support channels.',
//       },
//     ],
//   },
//   {
//     level: 2,
//     name: 'Apprentice',
//     xpRequired: 250, // To get from start of L2 to start of L3
//     cumulativeXpToReach: 100, // Must have 100 total XP to be L2
//     cashbackPercentage: 0.015,
//     prioritySupport: false,
//     initialSpecialBonuses: 1,
//     dailyBonusMultiplier: 1.1,
//     benefits: [
//       {
//         id: 'basic_support',
//         name: 'Basic Support',
//         description: 'Access to standard support channels.',
//       },
//       {
//         id: 'small_xp_boost',
//         name: 'Small XP Boost',
//         description: '5% bonus XP on certain activities.',
//       },
//     ],
//   },
//   {
//     level: 3,
//     name: 'Adept',
//     xpRequired: 500,
//     cumulativeXpToReach: 350, // 100 (for L1) + 250 (for L2)
//     cashbackPercentage: 0.02,
//     prioritySupport: true,
//     initialSpecialBonuses: 2,
//     dailyBonusMultiplier: 1.2,
//     weeklyBonusAmount: 10, // e.g. 10 units of a currency
//     benefits: [
//       {
//         id: 'priority_support',
//         name: 'Priority Support',
//         description: 'Faster response times from support.',
//       },
//       { id: 'medium_xp_boost', name: 'Medium XP Boost', description: '10% bonus XP.' },
//       {
//         id: 'adept_avatar_badge',
//         name: 'Adept Avatar Badge',
//         description: 'A special badge for your avatar.',
//       },
//     ],
//   },
//   // ... Add up to your highest level
//   // Example: Max level might have Infinity for xpRequired if it's the cap
//   {
//     level: 50, // Max Level Example
//     name: 'Legend',
//     xpRequired: Infinity, // No next level, or a very large number if soft cap
//     cumulativeXpToReach: 1000000,
//     cashbackPercentage: 0.1, // 10%
//     prioritySupport: true,
//     initialSpecialBonuses: 10,
//     dailyBonusMultiplier: 2.5,
//     weeklyBonusAmount: 100,
//     monthlyBonusPackage: 'legend_loot_box',
//     benefits: [
//       /* ... all top-tier benefits ... */
//     ],
//   },
// ]);

// // export function calculateLevel(totalXp: number): {
// //   level: number;
// //   title: string;
// // } {
// //   let currentLevel = vipLevels[0].level;
// //   let currentName = vipLevels[0].name;
// //   for (let i = vipLevels.length - 1; i >= 0; i--) {
// //     if (totalXp >= vipLevels[i].xpRequired) {
// //       currentLevel = vipLevels[i].level;
// //       currentName = vipLevels[i].name;
// //       break;
// //     }
// //   }
// //   return { level: currentLevel, title: currentName };
// // }

// const appEventEmitter = new EventEmitter();

// export enum AppEvents {
//   USER_LEVELED_UP = 'user.leveledUp',
//   USER_XP_GAINED = 'user.xpGained',
//   // Add other application events
// }

// // You can subscribe to these events elsewhere in your application
// // e.g., in a WebSocket service to notify clients, or a notification service.
// appEventEmitter.on(AppEvents.USER_LEVELED_UP, (payload: UserLeveledUpPayload) => {

//     `EVENT: User ${payload.userId} leveled up! From ${payload.previousLevel} to ${payload.newLevel} (${payload.newLevelTitle}) with ${payload.totalXp} XP.`
//   );
//   // Here you might:
//   // - Send a WebSocket message to the user
//   // - Create an in-app Notification record
//   // - Grant level-up rewards
// });

// appEventEmitter.on(AppEvents.USER_XP_GAINED, (payload: UserXpGainedPayload) => {

//     `EVENT: User ${payload.userId} gained ${payload.pointsGained} XP from ${payload.source}. New total: ${payload.newTotalXp}. Event ID: ${payload.xpEventId}`
//   );
// });
// // server/src/config/leveling.config.ts

// export function getVipLevelConfiguration(level: number): Readonly<LevelConfig> | undefined {
//   return vipLevels.find((l) => l.level === level);
// }

// export function getVipLevelByTotalXp(totalXp: number): Readonly<LevelConfig> {
//   // Iterate downwards to find the highest level achieved
//   for (let i = vipLevels.length - 1; i >= 0; i--) {
//     if (totalXp >= vipLevels[i].cumulativeXpToReach) {
//       return vipLevels[i];
//     }
//   }
//   // Should ideally always find a level if level 1 starts at 0 cumulativeXp.
//   // Return the lowest level if something goes wrong or totalXp is negative.
//   return (
//     vipLevels[0] || {
//       level: 0, // Fallback "limbo" state
//       name: 'Unranked',
//       xpRequired: 100,
//       cumulativeXpToReach: 0,
//       cashbackPercentage: 0,
//       prioritySupport: false,
//       benefits: [],
//     }
//   );
// }

// export function getAllVipLevelConfigurations(): Readonly<LevelConfig[]> {
//   return vipLevels;
// }

// // Helper to get the XP required to complete the current level (the length of the current level's XP bar)
// export function getXpForCurrentLevelBar(level: number): number {
//   const config = getVipLevelConfiguration(level);
//   return config ? config.xpRequired : Infinity;
// }

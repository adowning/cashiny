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

import {
  VipInfo as PrismaVipInfo,
  RewardType,
  RewardStatus,
  UserReward as PrismaUserReward,
  TransactionType,
  TransactionStatus,
  db,
  // Import other Prisma models if needed, e.g., RebateTransaction, VipTask, UserVipTaskProgress
} from '@cashflow/database'
import type {
  UserVipDetails,
  //   LevelConfig as SharedLevelConfig, // Assuming you share LevelConfig structure via @cashflow/types
  PaginatedResponse, // Assuming a shared type for pagination
  // Add other shared types as needed
  //   SignInRewardConfig as  SignInRewardInfo, // Define this in @cashflow/types
  VipTaskInfo, // Define this in @cashflow/types
  RebateHistoryEntry, // Define this in @cashflow/types
  LevelUpRewardInfo, // Define this in @cashflow/types
  //   UserReward, // Define this or import from @cashflow/types
  UserRewardItem as UserReward,
} from '@cashflow/types'
import {
  DAILY_SIGN_IN_REWARDS,
  getVipLevelConfiguration,
  getAllVipLevelConfigurations as fetchAllVipLevelConfigsFromConfig,
  LevelConfig, // Local LevelConfig from leveling.config.ts
  SignInReward,
} from '../config/leveling.config' // Your VIP level definitions
import { addXpToUser } from './xp.service' // Assuming you have an XP service
import { createTransactionRecord } from './transaction.service' // Assuming a generic transaction service

const prisma = db

const DEFAULT_VIP_LEVEL = 1
const DEFAULT_CASHBACK_PERCENTAGE = 0.01
const DEFAULT_PRIORITY_SUPPORT = false

// --- Helper Functions ---
function calculateStartOfDay(date: Date = new Date()): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

function calculateStartOfWeek(date: Date = new Date()): Date {
  const start = new Date(date)
  const day = start.getDay() // Sunday = 0, Monday = 1, ...
  const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Adjust to make Monday the start
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  return start
}

function calculateStartOfMonth(date: Date = new Date()): Date {
  const start = new Date(date)
  start.setDate(1)
  start.setHours(0, 0, 0, 0)
  return start
}

// --- Core VIP Info ---

export async function fetchUserVipInfo(userId: string): Promise<UserVipDetails> {
  if (!userId) {
    throw new Error('User ID must be provided to fetch VIP information.')
  }

  let vipInfo: PrismaVipInfo | null = await prisma.vipInfo.findUnique({
    where: { userId },
  })

  if (!vipInfo) {
    const defaultLevelConfig = getVipLevelConfiguration(DEFAULT_VIP_LEVEL)
    if (!defaultLevelConfig) {
      console.error(`Default VIP level ${DEFAULT_VIP_LEVEL} configuration not found.`)
      // Return a very basic default if config is missing
      return {
        level: DEFAULT_VIP_LEVEL,
        currentLevelXp: 0,
        totalXp: 0,
        xpToNextLevel: 100,
        nextLevelXpRequired: 100,
        cashbackPercentage: DEFAULT_CASHBACK_PERCENTAGE,
        prioritySupport: DEFAULT_PRIORITY_SUPPORT,
        specialBonusesAvailable: 0,
      }
    }

    const newVipData = {
      userId,
      level: DEFAULT_VIP_LEVEL,
      currentLevelXp: 0,
      totalXp: 0,
      nextLevelXpRequired: defaultLevelConfig.xpRequired,
      cashbackPercentage: defaultLevelConfig.cashbackPercentage,
      prioritySupport: defaultLevelConfig.prioritySupport,
      specialBonusesAvailable: defaultLevelConfig.initialSpecialBonuses || 0,
    }

    try {
      vipInfo = await prisma.vipInfo.create({ data: newVipData })
      console.log(`Created default VIP info for user ${userId}`)
      // Create initial level up reward for reaching level 1
      if (defaultLevelConfig.levelUpRewards && defaultLevelConfig.levelUpRewards.length > 0) {
        for (const reward of defaultLevelConfig.levelUpRewards) {
          await prisma.userReward.create({
            data: {
              userId,
              rewardType: RewardType.LEVEL_UP,
              description: reward.description || `Level ${DEFAULT_VIP_LEVEL} Reached!`,
              amount: reward.amount,
              currencyId: reward.currencyId,
              metaData: { level: DEFAULT_VIP_LEVEL, ...((reward.metaData as object) || {}) },
              status: RewardStatus.AVAILABLE,
              vipLevelRequirement: DEFAULT_VIP_LEVEL,
            },
          })
        }
      }
    } catch (error) {
      console.error(`Failed to create default VIP info for user ${userId}:`, error)
      return {
        // Fallback if DB create fails
        level: newVipData.level,
        currentLevelXp: newVipData.currentLevelXp,
        totalXp: newVipData.totalXp,
        xpToNextLevel: newVipData.nextLevelXpRequired,
        nextLevelXpRequired: newVipData.nextLevelXpRequired,
        cashbackPercentage: newVipData.cashbackPercentage,
        prioritySupport: newVipData.prioritySupport,
        specialBonusesAvailable: newVipData.specialBonusesAvailable,
      }
    }
  }

  const currentLevelXpProgress = vipInfo.currentLevelXp
  const xpRequiredForThisLevel = vipInfo.nextLevelXpRequired
  const xpToNextLevel = Math.max(0, xpRequiredForThisLevel - currentLevelXpProgress)

  return {
    level: vipInfo.level,
    currentLevelXp: currentLevelXpProgress,
    totalXp: vipInfo.totalXp,
    xpToNextLevel: xpToNextLevel,
    nextLevelXpRequired: xpRequiredForThisLevel,
    cashbackPercentage: vipInfo.cashbackPercentage,
    prioritySupport: vipInfo.prioritySupport,
    specialBonusesAvailable: vipInfo.specialBonusesAvailable,
    lastDailyBonusClaim: vipInfo.dailyBonusClaimedAt,
    lastWeeklyBonusClaim: vipInfo.weeklyBonusClaimedAt,
    lastMonthlyBonusClaim: vipInfo.monthlyBonusClaimedAt,
  }
}

export async function fetchAllVipLevels(): Promise<Readonly<LevelConfig[]>> {
  // This directly returns the configuration from leveling.config.ts
  return fetchAllVipLevelConfigsFromConfig()
}

// --- Sign-In Rewards ---
export interface VipSignInStatus {
  currentStreak: number
  todayClaimed: boolean
  rewards: readonly SignInReward[] // From leveling.config.ts
  nextReward?: SignInReward
}

export async function getVipSignInInfo(userId: string): Promise<VipSignInStatus> {
  const today = calculateStartOfDay()
  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(today.getDate() - 1) // For checking streak continuity

  // Get last 7 days of sign-in claims for streak calculation (simplified)
  const recentSignIns = await prisma.userReward.findMany({
    where: {
      userId,
      rewardType: RewardType.DAILY_SIGN_IN,
      status: RewardStatus.CLAIMED,
      claimedAt: {
        gte: new Date(new Date().setDate(today.getDate() - DAILY_SIGN_IN_REWARDS.length)),
      }, // look back for max streak length
    },
    orderBy: { claimedAt: 'desc' },
  })

  let currentStreak = 0
  let todayClaimed = false

  if (recentSignIns.length > 0) {
    const lastClaimDate = calculateStartOfDay(recentSignIns[0].claimedAt!)
    if (lastClaimDate.getTime() === today.getTime()) {
      todayClaimed = true
      currentStreak = (recentSignIns[0].metaData as any)?.streak || 1 // Assume streak count stored in metadata
    } else if (lastClaimDate.getTime() === twoDaysAgo.getTime()) {
      // Last claim was yesterday, continue streak
      currentStreak = (recentSignIns[0].metaData as any)?.streak || 1
    } else {
      // Streak broken
      currentStreak = 0
    }
  }
  if (todayClaimed) {
    // if today is claimed, the effective streak for *next* claim is currentStreak
  } else {
    // if today not claimed, the reward for *today* is for streak + 1
    currentStreak++ // Potential streak if claimed today
  }

  // Ensure streak doesn't exceed available rewards
  currentStreak = Math.min(currentStreak, DAILY_SIGN_IN_REWARDS.length)
  if (currentStreak === 0 && !todayClaimed) currentStreak = 1 // If no history and not claimed, it's day 1

  return {
    currentStreak: todayClaimed ? currentStreak : Math.max(0, currentStreak - 1), // show actual completed streak if not claimed today
    todayClaimed,
    rewards: DAILY_SIGN_IN_REWARDS,
    nextReward: todayClaimed
      ? DAILY_SIGN_IN_REWARDS[currentStreak % DAILY_SIGN_IN_REWARDS.length]
      : DAILY_SIGN_IN_REWARDS[Math.max(0, currentStreak - 1)],
  }
}

export async function claimDailySignIn(
  userId: string
): Promise<{ message: string; reward?: SignInReward; newStreak: number }> {
  const signInStatus = await getVipSignInInfo(userId)

  if (signInStatus.todayClaimed) {
    throw new Error('Daily sign-in bonus already claimed for today.')
  }

  const streakForToday = (signInStatus.currentStreak % DAILY_SIGN_IN_REWARDS.length) + 1
  const rewardConfig = DAILY_SIGN_IN_REWARDS.find((r) => r.day === streakForToday)

  if (!rewardConfig) {
    throw new Error('No sign-in reward configuration found for the current streak.')
  }

  // Start a Prisma transaction

  return {
    message: `Successfully claimed daily sign-in bonus: ${rewardConfig.description}`,
    reward: rewardConfig,
    newStreak: streakForToday,
  }
}

// --- Cycle Rewards (Daily, Weekly, Monthly based on VIP Level) ---
// The route NETWORK_CONFIG.VIP_INFO.VIP_LEVEL_AWARD is ambiguous.
// Assuming 'type' param (daily, weekly, monthly) is passed to claimCycleReward
export async function claimCycleReward(
  userId: string,
  receiverId: string,
  cycleType: 'daily' | 'weekly' | 'monthly'
): Promise<PrismaUserReward> {
  const vipDetails = await fetchUserVipInfo(userId)
  const levelConfig = getVipLevelConfiguration(vipDetails.level)

  if (!levelConfig) {
    throw new Error(`No VIP level configuration found for level ${vipDetails.level}.`)
  }

  let rewardConfig
  let lastClaimDate: Date | null | undefined
  let nextClaimAvailableAt: Date
  let rewardRecordType: RewardType
  const vipInfoUpdateData: Partial<PrismaVipInfo> = {} // To update VipInfo last claim timestamp

  const now = new Date()

  switch (cycleType) {
    case 'daily':
      rewardConfig = levelConfig.dailyCycleReward
      lastClaimDate = vipDetails.lastDailyBonusClaim
      nextClaimAvailableAt = calculateStartOfDay(now) // Can claim once per day
      nextClaimAvailableAt.setDate(nextClaimAvailableAt.getDate() + 1) // Next claim is available tomorrow
      rewardRecordType = RewardType.DAILY_SIGN_IN // Or a specific DAILY_CYCLE_REWARD if different
      vipInfoUpdateData.dailyBonusClaimedAt = now
      break
    case 'weekly':
      rewardConfig = levelConfig.weeklyCycleReward
      lastClaimDate = vipDetails.lastWeeklyBonusClaim
      nextClaimAvailableAt = calculateStartOfWeek(now)
      nextClaimAvailableAt.setDate(nextClaimAvailableAt.getDate() + 7)
      rewardRecordType = RewardType.WEEKLY_CYCLE
      vipInfoUpdateData.weeklyBonusClaimedAt = now
      break
    case 'monthly':
      rewardConfig = levelConfig.monthlyCycleReward
      lastClaimDate = vipDetails.lastMonthlyBonusClaim
      nextClaimAvailableAt = calculateStartOfMonth(now)
      nextClaimAvailableAt.setMonth(nextClaimAvailableAt.getMonth() + 1)
      rewardRecordType = RewardType.MONTHLY_CYCLE
      vipInfoUpdateData.monthlyBonusClaimedAt = now
      break
    default:
      throw new Error('Invalid cycle reward type specified.')
  }

  if (!rewardConfig) {
    throw new Error(`No ${cycleType} reward configured for VIP level ${vipDetails.level}.`)
  }

  // Check if already claimed within the current cycle
  if (lastClaimDate) {
    const cycleStart =
      cycleType === 'daily'
        ? calculateStartOfDay()
        : cycleType === 'weekly'
          ? calculateStartOfWeek()
          : calculateStartOfMonth()
    if (lastClaimDate >= cycleStart) {
      throw new Error(`This ${cycleType} reward has already been claimed for the current period.`)
    }
  }

  // Use Prisma transaction
  const claimedReward = await prisma.$transaction(async (tx) => {
    const newReward = await tx.userReward.create({
      data: {
        userId,
        rewardType: rewardRecordType,
        description:
          rewardConfig!.description ||
          `${cycleType.charAt(0).toUpperCase() + cycleType.slice(1)} Cycle Reward`,
        status: RewardStatus.CLAIMED,
        claimedAt: now,
        amount: rewardConfig!.amount,
        currencyId: rewardConfig!.currencyId,
        metaData: { level: vipDetails.level, cycle: cycleType },
        vipLevelRequirement: vipDetails.level,
      },
    })

    // Update VipInfo with the new claim timestamp
    await tx.vipInfo.update({
      where: { userId },
      data: vipInfoUpdateData,
    })

    // Grant actual bonus/items if applicable
    if (rewardConfig!.amount && rewardConfig!.currencyId) {
      await createTransactionRecord(
        {
          userId,
          receiverId,
          type: TransactionType.BONUS_AWARD,
          status: TransactionStatus.COMPLETED,
          amountInCents: rewardConfig!.amount,
          currencyId: rewardConfig!.currencyId,
          description: `${cycleType} VIP Reward: ${rewardConfig!.description}`,
        },
        tx
      )
    }
    // TODO: Handle item rewards if you have an item system (rewardConfig.items)

    return newReward
  })

  return claimedReward
}

// --- VIP Tasks ---
// Placeholder - requires VipTask and UserVipTaskProgress models and logic
export async function fetchVipTasks(userId: string): Promise<VipTaskInfo[]> {
  const userVip = await fetchUserVipInfo(userId)
  const tasks = await prisma.vipTask.findMany({
    where: {
      isActive: true,
      requiredVipLevel: { lte: userVip.level },
    },
    include: {
      userTaskProgress: {
        where: { userId },
      },
    },
  })

  return tasks.map((task) => ({
    id: task.id,
    taskType: task.taskType,
    description: task.description,
    xpReward: task.xpReward,
    // ... other fields from your VipTaskInfo type in @cashflow/types
    targetValue: task.targetValue,
    currentProgress: task.userTaskProgress[0]?.progress || 0,
    isCompleted: task.userTaskProgress[0]?.isCompleted || false,
    isClaimed: !!task.userTaskProgress[0]?.rewardClaimedAt,
  }))
}

// --- History Endpoints ---

// This should probably be renamed or clarified if it's different from claimDailySignIn
// For now, assuming VIP_SIGNIN_REWARDS means claiming the daily sign-in.
// If it means fetching the list of available sign-in rewards, that's covered by getVipSignInInfo.
export async function claimVipSigninRewards(userId: string): Promise<any> {
  // This seems to be a duplicate of claimDailySignIn. Clarify if different.
  return claimDailySignIn(userId)
}

// Assuming RebateHistory is based on RebateTransaction model
export async function fetchRebateHistory(
  userId: string,
  pagination: { skip?: number; take?: number } = { skip: 0, take: 20 }
): Promise<PaginatedResponse<RebateHistoryEntry>> {
  const where = { userId }
  const total = await prisma.rebateTransaction.count({ where })
  const items = await prisma.rebateTransaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: pagination.skip,
    take: pagination.take,
    // include: { currency: true } // if you want to return currency details
  })
  return {
    items: items.map((item) => ({
      // Map to your @cashflow/types RebateHistoryEntry
      id: item.id,
      date: item.createdAt,
      originalTransactionId: item.transactionId,
      rebateAmount: item.rebateAmount,
      currencyId: item.currencyId,
      status: item.status,
      paidOutAt: item.paidOutAt,
    })),
    total,
    page:
      pagination.skip && pagination.take ? Math.floor(pagination.skip / pagination.take) + 1 : 1,
    limit: pagination.take,
  }
}

// "TimesHistory" is vague. Assuming it means history of claimed periodic rewards (daily, weekly, monthly).
export async function fetchTimesHistory(
  userId: string,
  pagination: { skip?: number; take?: number } = { skip: 0, take: 20 }
): Promise<PaginatedResponse<UserReward>> {
  // Adjust UserReward to your shared type
  const rewardTypes: RewardType[] = [
    RewardType.DAILY_SIGN_IN,
    RewardType.WEEKLY_CYCLE,
    RewardType.MONTHLY_CYCLE,
  ]
  const where = { userId, rewardType: { in: rewardTypes }, status: RewardStatus.CLAIMED }

  const total = await prisma.userReward.count({ where })
  const items = await prisma.userReward.findMany({
    where,
    orderBy: { claimedAt: 'desc' },
    skip: pagination.skip,
    take: pagination.take,
  })

  return {
    items: items.map((item) => ({
      // Map to your shared UserReward type from @cashflow/types
      id: item.id,
      userId: item.userId,
      rewardType: item.rewardType,
      description: item.description,
      status: item.status,
      amount: item.amount,
      currencyId: item.currencyId,
      metaData: item.metaData,
      claimedAt: item.claimedAt,
      expiresAt: item.expiresAt,
      availableFrom: item.availableFrom,
      vipLevelRequirement: item.vipLevelRequirement,
      // Map other fields as necessary
    })),
    total,
    page:
      pagination.skip && pagination.take ? Math.floor(pagination.skip / pagination.take) + 1 : 1,
    limit: pagination.take,
  }
}

// --- Level Up Rewards ---
export async function fetchVipLevelUpList(userId: string): Promise<LevelUpRewardInfo[]> {
  // Fetch rewards specifically marked as LEVEL_UP and available or already claimed by the user
  const claimedOrAvailableLevelUpRewards = await prisma.userReward.findMany({
    where: {
      userId,
      rewardType: RewardType.LEVEL_UP,
      // status: { in: [RewardStatus.AVAILABLE, RewardStatus.CLAIMED] } // Show what can be claimed or was claimed
    },
    orderBy: { vipLevelRequirement: 'asc' }, // Order by the level they are for
  })

  // Augment with configurations for future levels' potential rewards if needed,
  // or simply list what has been made available/claimed.
  // This example focuses on rewards already generated for the user.

  return claimedOrAvailableLevelUpRewards.map((r) => ({
    level: (r.metaData as any)?.level || r.vipLevelRequirement || 0,
    description: r.description,
    amount: r.amount,
    currencyId: r.currencyId,
    status: r.status,
    claimedAt: r.claimedAt,
    // ... other fields for your LevelUpRewardInfo type
  }))
}

// USER_VIP_LEVELAWARD_LIST -> fetchVipBetAwardList - This sounds like it might be for cashback/rebate on bets.
// If it's different from fetchRebateHistory, the logic needs clarification.
// For now, assuming it's distinct and refers to a list of *potential* or *accrued* bet-related awards not yet paid out.
// This is highly dependent on how you track bet rebates (e.g., a separate `BetRebateAccrual` model).
// Placeholder - needs more definition of "Bet Award" data structure
export async function fetchVipBetAwardList(): Promise<any[]> {
  console.warn(
    'fetchVipBetAwardList is a placeholder and needs specific implementation based on bet rebate tracking.'
  )
  // Example: query a table where potential rebates are accrued.
  // const accruedRebates = await prisma.betRebateAccrual.findMany({ where: { userId, status: 'ACCRUED' }});
  // return accruedRebates;
  return []
}

// USER_VIP_LEVELAWARD_RECEIVE -> fetchLevelRewardHistory
// This seems like fetching history of *claimed* level-up rewards.
export async function fetchLevelRewardHistory(
  userId: string,
  pagination: { skip?: number; take?: number } = { skip: 0, take: 20 }
): Promise<PaginatedResponse<UserReward>> {
  // Adjust UserReward to your shared type
  const where = { userId, rewardType: RewardType.LEVEL_UP, status: RewardStatus.CLAIMED }
  const total = await prisma.userReward.count({ where })
  const items = await prisma.userReward.findMany({
    where,
    orderBy: { claimedAt: 'desc' },
    skip: pagination.skip,
    take: pagination.take,
  })
  return {
    items: items.map((item) => ({
      // Map to your shared UserReward type from @cashflow/types
      id: item.id,
      userId: item.userId,
      rewardType: item.rewardType,
      description: item.description,
      status: item.status,
      amount: item.amount,
      currencyId: item.currencyId,
      metaData: item.metaData,
      claimedAt: item.claimedAt,
      expiresAt: item.expiresAt,
      availableFrom: item.availableFrom,
      vipLevelRequirement: item.vipLevelRequirement,
    })),
    total,
    page:
      pagination.skip && pagination.take ? Math.floor(pagination.skip / pagination.take) + 1 : 1,
    limit: pagination.take,
  }
}

// It's good practice to also have a function to claim a specific UserReward by its ID,
// especially for level-up rewards that might be listed as 'AVAILABLE'.
export async function claimUserRewardById(
  userId: string,
  userRewardId: string
): Promise<PrismaUserReward> {
  const rewardToClaim = await prisma.userReward.findUnique({
    where: { id: userRewardId, userId: userId },
  })

  if (!rewardToClaim) {
    throw new Error('Reward not found or does not belong to this user.')
  }
  if (rewardToClaim.status === RewardStatus.CLAIMED) {
    throw new Error('Reward has already been claimed.')
  }
  if (rewardToClaim.status !== RewardStatus.AVAILABLE) {
    throw new Error('Reward is not available to be claimed.')
  }
  if (rewardToClaim.expiresAt && rewardToClaim.expiresAt < new Date()) {
    // Optionally update status to EXPIRED
    await prisma.userReward.update({
      where: { id: userRewardId },
      data: { status: RewardStatus.EXPIRED },
    })
    throw new Error('This reward has expired.')
  }

  // Start transaction
  const claimedReward = await prisma.$transaction(async (tx) => {
    const updatedReward = await tx.userReward.update({
      where: { id: userRewardId },
      data: {
        status: RewardStatus.CLAIMED,
        claimedAt: new Date(),
      },
    })

    // Apply the reward effects (grant currency, items, XP, etc.)
    if (updatedReward.amount && updatedReward.currencyId) {
      await createTransactionRecord(
        {
          userId,
          type: TransactionType.BONUS_AWARD, // Or specific if from level up, etc.
          status: TransactionStatus.COMPLETED,
          amountInCents: updatedReward.amount,
          currencyId: updatedReward.currencyId,
          description: `Claimed reward: ${updatedReward.description}`,
          metadata: { sourceUserRewardId: updatedReward.id },
        },
        tx
      )
    }
    // Example for XP if specified in metadata for a generic reward
    const metaXP = (updatedReward.metaData as any)?.xp
    if (typeof metaXP === 'number' && metaXP > 0) {
      await addXpToUser(userId, metaXP, `CLAIMED_REWARD_${updatedReward.rewardType}`)
    }

    // TODO: Handle item rewards if you have an item system

    return updatedReward
  })

  return claimedReward
}

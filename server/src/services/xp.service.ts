import {
  db,
  User,
  XpEvent,
  VipInfo,
  Prisma,
  RewardType,
  RewardStatus,
  UserStatus,
  Role, // Import Prisma for transaction client type
} from '@cashflow/database' // Adjusted import path
import {
  getVipLevelByTotalXp,
  getVipLevelConfiguration,
  LevelConfig, // Assuming LevelConfig is exported from leveling.config.ts
} from '../config/leveling.config' // Your leveling configuration
import { appEventEmitter, AppEvents } from '../events' // Your event emitter and types
import { UserLeveledUpPayload, UserXpGainedPayload } from '@cashflow/types'
// import { createLevelUpUserRewards } from './vip.service'; // Potentially for creating level-up UserReward entries

// Define the type for the Prisma transaction client
type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

const prisma = db

/**
 * Awards XP to a user, updates their VipInfo (total XP, current level XP, level),
 * and fires events. All database operations are performed within a transaction.
 *
 * @param userId - The ID of the user to award XP to.
 * @param points - The amount of XP points to award (must be positive).
 * @param source - A string indicating the source of the XP (e.g., 'GAME_WIN', 'ACHIEVEMENT').
 * @param sourceId - Optional ID related to the source (e.g., gameId, achievementId).
 * @param meta - Optional metadata for the XP event.
 * @param existingTx - Optional existing Prisma transaction client to use.
 * @returns Promise<{ user: User; vipInfo: VipInfo; xpEvent: XpEvent; leveledUp: boolean; newLevelConfig?: LevelConfig }>
 */
export async function addXpToUser(
  userId: string,
  points: number,
  source: string,
  sourceId?: string,
  meta?: Record<string, any>
  // existingTx?: PrismaTransactionClient
): Promise<{
  user: User
  vipInfo: VipInfo
  xpEvent: XpEvent
  leveledUp: boolean
  previousLevelConfig?: LevelConfig
  newLevelConfig?: LevelConfig
}> {
  if (points <= 0) {
    throw new Error('XP points to award must be positive.')
  }

  // const db = existingTx || prisma;

  // Use a transaction to ensure atomicity
  return prisma.$transaction(async (tx) => {
    // Fetch current user and their VipInfo state
    const userWithVip = await tx.user.findUnique({
      where: { id: userId },
      include: { vipInfo: true },
    })

    if (!userWithVip) {
      throw new Error(`User with ID ${userId} not found.`)
    }

    let vipInfo = userWithVip.vipInfo
    const now = new Date()

    // If user has no VipInfo, create a default one (simplified from vip.service.ts)
    if (!vipInfo) {
      const defaultLevelConfig = getVipLevelConfiguration(1) // Assuming level 1 is the default
      if (!defaultLevelConfig) {
        throw new Error('Default VIP level configuration (level 1) not found.')
      }
      vipInfo = await tx.vipInfo.create({
        data: {
          userId,
          level: defaultLevelConfig.level,
          currentLevelXp: 0,
          totalXp: 0,
          nextLevelXpRequired: defaultLevelConfig.xpRequired, // XP bar length for this level
          cashbackPercentage: defaultLevelConfig.cashbackPercentage,
          prioritySupport: defaultLevelConfig.prioritySupport,
          specialBonusesAvailable: defaultLevelConfig.initialSpecialBonuses || 0,
          dailyBonusClaimedAt: null,
          weeklyBonusClaimedAt: null,
          monthlyBonusClaimedAt: null,
          createdAt: now,
          updatedAt: now,
        },
      })
      console.log(`Created default VipInfo for user ${userId} during XP award.`)
    }

    // 1. Create the XpEvent record
    const xpEvent = await tx.xpEvent.create({
      data: {
        userId,
        points,
        source,
        sourceId,
        meta: meta || undefined, // Prisma expects JsonValue or undefined
      },
    })

    const previousTotalXp = vipInfo.totalXp
    const newTotalXp = previousTotalXp + points
    const previousLevelConfig = getVipLevelConfiguration(vipInfo.level)
    if (!previousLevelConfig) {
      throw new Error(`Configuration for user's current level ${vipInfo.level} not found.`)
    }

    // 2. Calculate new level based on newTotalXp
    const newLevelConfig = getVipLevelByTotalXp(newTotalXp) // This function should return the full LevelConfig
    let leveledUp = false

    const vipDataToUpdate: Prisma.VipInfoUpdateInput = {
      totalXp: newTotalXp,
      updatedAt: now,
    }

    if (newLevelConfig.level > previousLevelConfig.level) {
      leveledUp = true
      vipDataToUpdate.level = newLevelConfig.level
      // Update denormalized benefits from the new level's config
      vipDataToUpdate.cashbackPercentage = newLevelConfig.cashbackPercentage
      vipDataToUpdate.prioritySupport = newLevelConfig.prioritySupport
      // Add initial special bonuses if defined for the new level
      // This assumes specialBonusesAvailable is a counter that can be incremented
      if (newLevelConfig.initialSpecialBonuses) {
        vipDataToUpdate.specialBonusesAvailable = {
          increment: newLevelConfig.initialSpecialBonuses,
        }
      }
      // XP within the new level
      vipDataToUpdate.currentLevelXp = newTotalXp - newLevelConfig.cumulativeXpToReach
      vipDataToUpdate.nextLevelXpRequired = newLevelConfig.xpRequired // XP bar for the new level

      // TODO: More sophisticated reward granting for level up
      // This might involve creating UserReward entries, similar to vip.service.ts
      // e.g., await createLevelUpUserRewards(userId, newLevelConfig.level, newLevelConfig.levelUpRewards, tx);
      if (newLevelConfig.levelUpRewards && newLevelConfig.levelUpRewards.length > 0) {
        for (const reward of newLevelConfig.levelUpRewards) {
          await tx.userReward.create({
            // Using Prisma types directly
            data: {
              userId,
              rewardType: RewardType.LEVEL_UP,
              description: reward.description || `Level ${newLevelConfig.level} Reached!`,
              amount: reward.amount,
              currencyId: reward.currencyId,
              metaData: { level: newLevelConfig.level, ...((reward.metaData as object) || {}) },
              status: RewardStatus.AVAILABLE,
              vipLevelRequirement: newLevelConfig.level,
            },
          })
        }
      }
    } else {
      // Still in the same level, just update currentLevelXp
      vipDataToUpdate.currentLevelXp = { increment: points }
    }

    // 3. Update VipInfo model
    const updatedVipInfo = await tx.vipInfo.update({
      where: { userId },
      data: vipDataToUpdate,
    })

    // 4. Fire events
    const xpGainedPayload: UserXpGainedPayload = {
      userId,
      pointsGained: points,
      source,
      newTotalXp,
      currentLevel: updatedVipInfo.level, // Send current level
      xpInLevel: updatedVipInfo.currentLevelXp, // Send XP within the current level
      xpForNextLevel: updatedVipInfo.nextLevelXpRequired, // Send XP bar length for current level
      xpEventId: xpEvent.id,
    }
    appEventEmitter.emit(AppEvents.USER_XP_GAINED, xpGainedPayload)

    if (leveledUp) {
      const levelUpPayload: UserLeveledUpPayload = {
        userId,
        previousLevel: previousLevelConfig.level,
        newLevel: newLevelConfig.level,
        newLevelTitle: newLevelConfig.name, // Assuming LevelConfig has a 'name' or 'title'
        totalXp: newTotalXp,
        // Add any specific rewards granted on level up if needed by listeners
      }
      appEventEmitter.emit(AppEvents.USER_LEVELED_UP, levelUpPayload)

      // Optional: Create an in-app notification for level up directly here if simple
      // await tx.notification.create({ data: { ... } });
    }

    // Fetch the updated user (though userWithVip is likely still valid if only VipInfo changed)
    // For consistency, return the user record as well.
    const finalUser = await tx.user.findUniqueOrThrow({ where: { id: userId } })

    return {
      user: {
        ...finalUser,
        userVipProgressId: null,
        status: UserStatus.ACTIVE,
        role: Role.USER,
      },
      vipInfo: updatedVipInfo,
      xpEvent,
      leveledUp,
      previousLevelConfig: leveledUp ? previousLevelConfig : undefined,
      newLevelConfig: leveledUp ? newLevelConfig : undefined,
    }
  })
}

/**
 * Awards XP for unlocking an achievement.
 * This function demonstrates how to use `addXpToUser` within another transaction.
 *
 * @param userId - The ID of the user.
 * @param achievementId - The ID of the achievement unlocked.
 * @param achievementName - The name of the achievement.
 * @param xpRewardAmount - The amount of XP to reward for this achievement.
 * @param existingTx - Optional existing Prisma transaction client.
 */
export async function awardXpForAchievement(
  userId: string,
  achievementId: string,
  achievementName: string,
  xpRewardAmount: number,
  existingTx?: PrismaTransactionClient
): Promise<void> {
  if (xpRewardAmount <= 0) {
    console.warn(
      `Achievement ${achievementName} (${achievementId}) has no positive XP reward. No XP awarded.`
    )
    return
  }

  const db = existingTx || prisma

  // If not part of a larger transaction, create one here.
  // If it IS part of a larger one, existingTx will be used by addXpToUser.
  const operation = async (tx: PrismaTransactionClient) => {
    // Logic to ensure achievement isn't awarded twice can be here or in an achievement service
    // For example, checking a UserAchievement table.
    // This function now focuses purely on awarding XP given the parameters.

    console.log(
      `Attempting to award ${xpRewardAmount} XP to user ${userId} for achievement: ${achievementName} (${achievementId})`
    )

    await addXpToUser(
      userId,
      xpRewardAmount,
      'ACHIEVEMENT_UNLOCKED',
      achievementId,
      { achievementName }
      // tx // Pass the transaction client
    )
    console.log(`Successfully processed XP award for achievement: ${achievementName}`)
  }

  if (existingTx) {
    await operation(existingTx)
  } else {
    await prisma.$transaction(operation)
  }
}

// Example usage (can be in a route handler or another service):
/*
async function handleUnlockAchievement(userId: string, achievementDetails: { id: string; name: string; xp: number }) {
    try {
        // If this is part of a larger operation, pass the transaction client
        // await prisma.$transaction(async (tx) => {
        //     // ... other operations ...
        //     await awardXpForAchievement(userId, achievementDetails.id, achievementDetails.name, achievementDetails.xp, tx);
        //     // ... other operations ...
        // });

        // Or as a standalone operation:
        await awardXpForAchievement(userId, achievementDetails.id, achievementDetails.name, achievementDetails.xp);
        console.log('Achievement XP awarded and processed.');
    } catch (error) {
        console.error('Failed to award achievement XP:', error);
    }
}
*/

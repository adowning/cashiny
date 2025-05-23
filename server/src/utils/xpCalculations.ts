import { Prisma } from '@cashflow/database' // For Prisma.Decimal
import type { VipInfo, VipTask, Achievement } from '@cashflow/database' // Prisma-generated types
import type { SignInReward } from '../config/leveling.config' // Assuming these are in leveling.config

// --- Constants for Base XP & Multipliers (configurable here or via env/DB config) ---

const BASE_XP_PER_DEPOSIT_UNIT = 1
const VIP_LEVEL_XP_MULTIPLIER_INCREMENT = 0.1 // 10% per VIP level for deposits

const BASE_XP_PER_WAGER_UNIT = 0.1 // Example: 0.1 XP per unit wagered
const XP_PER_WIN_UNIT_MULTIPLIER = 0.05 // Example: Additional 0.05 XP per unit won on top of wager XP

// --- Helper for VIP Multiplier ---

/**
 * Calculates a general VIP XP multiplier.
 * Assumes level 0 gets no bonus (1.0x), level 1 gets a base bonus, etc.
 * @param vipLevel The user's current VIP level.
 * @param baseMultiplierIncrement The incremental bonus per VIP level (e.g., 0.05 for 5%).
 * @returns The calculated XP multiplier as a Prisma.Decimal.
 */
function getVipXpMultiplier(
  vipLevel: number,
  baseMultiplierIncrement: number = 0.05 // Default 5% general XP boost per level
): Prisma.Decimal {
  if (vipLevel <= 0) {
    return new Prisma.Decimal(1) // No bonus for level 0 or less
  }
  // Level 1 gets 1 + (1 * increment), Level 2 gets 1 + (2 * increment)
  return new Prisma.Decimal(1).add(new Prisma.Decimal(vipLevel).mul(baseMultiplierIncrement))
}

// --- Deposit XP Calculation ---

/**
 * Calculates the XP bonus to be awarded for a deposit.
 * Base XP: Defined by BASE_XP_PER_DEPOSIT_UNIT.
 * VIP Multiplier: Incrementally applied per VIP level.
 *
 * @param depositAmount - The amount of the deposit (as a number or Prisma.Decimal).
 * @param vipInfo - The user's VipInfo object (or just Pick<VipInfo, 'level'>).
 * @returns The calculated XP points to be awarded (as an integer).
 */
export function calculateXpBonusForDeposit(
  depositAmount: number,
  vipInfo: Pick<VipInfo, 'level'> | null
): number {
  const amountAsDecimal = new Prisma.Decimal(depositAmount)

  if (amountAsDecimal.isNegative() || amountAsDecimal.isZero()) {
    console.warn(
      '[XP Calc] calculateXpBonusForDeposit: Invalid or zero deposit amount:',
      amountAsDecimal.toNumber()
    )
    return 0
  }

  const userVipLevel = vipInfo?.level ?? 0

  const baseXp = amountAsDecimal.mul(BASE_XP_PER_DEPOSIT_UNIT)

  // Specific VIP multiplier for deposits
  const depositVipMultiplier = new Prisma.Decimal(1).add(
    new Prisma.Decimal(userVipLevel).mul(VIP_LEVEL_XP_MULTIPLIER_INCREMENT)
  )

  const totalXpDecimal = baseXp.mul(depositVipMultiplier)
  const totalXpInteger = totalXpDecimal.floor().toNumber()

  console.log(
    `[XP Calc] Deposit XP: Amount=${amountAsDecimal.toNumber()}, VIP Level=${userVipLevel}, BaseXP=${baseXp.toNumber()}, Multiplier=${depositVipMultiplier.toNumber()}, TotalXP=${totalXpInteger}`
  )
  return totalXpInteger
}

// --- Game/Betting XP Calculation ---

/**
 * Calculates XP for placing a bet or playing a game round.
 * Could be based on wager amount.
 *
 * @param wagerAmount - The amount wagered.
 * @param vipInfo - The user's VipInfo object.
 * @param gameConfig - Optional: Configuration for the specific game that might have its own XP rates.
 * @returns The calculated XP points.
 */
export function calculateXpForWager(
  wagerAmount: number | Prisma.Decimal,
  vipInfo: Pick<VipInfo, 'level'> | null,
  gameConfig?: { baseXpRate?: number; vipMultiplierOverride?: number } // Example game-specific config
): number {
  const amountAsDecimal = new Prisma.Decimal(wagerAmount)
  if (amountAsDecimal.isNegative() || amountAsDecimal.isZero()) return 0

  const userVipLevel = vipInfo?.level ?? 0
  const baseXpRate = gameConfig?.baseXpRate ?? BASE_XP_PER_WAGER_UNIT
  const baseXp = amountAsDecimal.mul(baseXpRate)

  // Apply general VIP multiplier
  const vipMultiplier = gameConfig?.vipMultiplierOverride
    ? new Prisma.Decimal(gameConfig.vipMultiplierOverride)
    : getVipXpMultiplier(userVipLevel) // Using the general VIP multiplier

  const totalXpDecimal = baseXp.mul(vipMultiplier)
  return totalXpDecimal.floor().toNumber()
}

/**
 * Calculates XP for winning a bet.
 * Could be based on win amount, profit, or a fixed amount on top of wager XP.
 *
 * @param winAmount - The amount won (excluding stake, i.e., profit).
 * @param wagerAmount - The original amount wagered.
 * @param vipInfo - The user's VipInfo object.
 * @param gameConfig - Optional: Game-specific configuration.
 * @returns Additional XP points for the win.
 */
export function calculateXpForWin(
  winAmount: number | Prisma.Decimal, // Typically profit
  wagerAmount: number | Prisma.Decimal, // Original stake
  vipInfo: Pick<VipInfo, 'level'> | null,
  gameConfig?: { winXpMultiplier?: number }
): number {
  const winAsDecimal = new Prisma.Decimal(winAmount)
  if (winAsDecimal.isNegative() || winAsDecimal.isZero()) return 0

  const userVipLevel = vipInfo?.level ?? 0

  // XP based on win amount
  const winXp = winAsDecimal.mul(gameConfig?.winXpMultiplier ?? XP_PER_WIN_UNIT_MULTIPLIER)

  // Apply general VIP multiplier to the win-based XP
  const vipMultiplier = getVipXpMultiplier(userVipLevel)
  const totalXpDecimal = winXp.mul(vipMultiplier)

  return totalXpDecimal.floor().toNumber()
}

// --- Achievement XP Calculation ---

/**
 * Retrieves XP for unlocking an achievement.
 * Typically, achievements have a fixed XP reward defined in their configuration.
 *
 * @param achievement - The Achievement object (Prisma type or similar structure).
 * @param vipInfo - Optional: User's VipInfo for potential VIP bonus on achievement XP.
 * @returns XP points for the achievement.
 */
export function calculateXpForAchievement(
  achievement: Pick<Achievement, 'xpReward'>, // Assuming Achievement model has xpReward
  vipInfo: Pick<VipInfo, 'level'> | null
): number {
  if (!achievement.xpReward || achievement.xpReward <= 0) {
    return 0
  }

  const baseXp = new Prisma.Decimal(achievement.xpReward)
  const userVipLevel = vipInfo?.level ?? 0

  // Optional: Apply a (potentially smaller) VIP multiplier to achievement XP
  const vipMultiplier = getVipXpMultiplier(userVipLevel, 0.02) // Example: 2% bonus per VIP level for achievements

  const totalXpDecimal = baseXp.mul(vipMultiplier)
  return totalXpDecimal.floor().toNumber()
}

// --- VIP Task Completion XP Calculation ---

/**
 * Retrieves XP for completing a VIP task.
 * Tasks usually have a fixed XP reward defined in their configuration.
 *
 * @param vipTask - The VipTask object (Prisma type or similar).
 * @param vipInfo - Optional: User's VipInfo for potential VIP bonus on task XP.
 * @returns XP points for completing the task.
 */
export function calculateXpForVipTask(
  vipTask: Pick<VipTask, 'xpReward'>, // VipTask model from Prisma with an xpReward field (Decimal or Float)
  vipInfo: Pick<VipInfo, 'level'> | null
): number {
  if (!vipTask.xpReward || vipTask.xpReward < 0 || vipTask.xpReward == 0) {
    return 0
  }

  const baseXp = new Prisma.Decimal(vipTask.xpReward) // Assuming xpReward is Decimal
  const userVipLevel = vipInfo?.level ?? 0

  // Optional: Apply a general VIP multiplier to task XP
  const vipMultiplier = getVipXpMultiplier(userVipLevel, 0.03) // Example: 3% bonus per VIP level for tasks

  const totalXpDecimal = baseXp.mul(vipMultiplier)
  return totalXpDecimal.floor().toNumber()
}

// --- Daily Sign-In / Streaks XP Calculation ---

/**
 * Retrieves XP for a daily sign-in, potentially based on streak.
 * The SignInReward configuration should define the XP for each day.
 *
 * @param signInRewardConfig - The configuration for the specific sign-in day/streak.
 * @param vipInfo - Optional: User's VipInfo for potential VIP bonus on sign-in XP.
 * @returns XP points for the sign-in.
 */
export function calculateXpForSignIn(
  signInRewardConfig: Pick<SignInReward, 'xp'>, // From leveling.config.ts
  vipInfo: Pick<VipInfo, 'level'> | null
): number {
  if (!signInRewardConfig.xp || signInRewardConfig.xp <= 0) {
    return 0
  }

  const baseXp = new Prisma.Decimal(signInRewardConfig.xp)
  const userVipLevel = vipInfo?.level ?? 0

  // Optional: Apply a general VIP multiplier to sign-in XP
  const vipMultiplier = getVipXpMultiplier(userVipLevel, 0.01) // Example: 1% bonus per VIP level for sign-ins

  const totalXpDecimal = baseXp.mul(vipMultiplier)
  return totalXpDecimal.floor().toNumber()
}

// --- Promotional Event XP ---

/**
 * Calculates XP for a promotional event.
 * This could be a fixed amount, or based on user activity during the promo.
 *
 * @param promoConfig - Configuration for the specific promotion.
 * @param userActivityMetric - e.g., amount spent during promo, number of entries.
 * @param vipInfo - User's VipInfo.
 * @returns XP points for the promotion.
 */
export function calculateXpForPromotion(
  promoConfig: { baseXp?: number; xpMultiplier?: number; activityToXpRatio?: number },
  userActivityMetric: 0,
  vipInfo: Pick<VipInfo, 'level'> | null
): number {
  let baseXp = new Prisma.Decimal(0)

  if (promoConfig.baseXp) {
    baseXp = baseXp.add(promoConfig.baseXp)
  }

  if (promoConfig.activityToXpRatio && userActivityMetric > 0) {
    baseXp = baseXp.add(new Prisma.Decimal(userActivityMetric).mul(promoConfig.activityToXpRatio))
  }

  if (baseXp.isNegative() || baseXp.isZero()) return 0

  const userVipLevel = vipInfo?.level ?? 0
  let effectiveMultiplier = new Prisma.Decimal(promoConfig.xpMultiplier || 1)

  // Optionally, let VIP multiplier stack with promo multiplier or choose one
  const vipMultiplier = getVipXpMultiplier(userVipLevel)
  effectiveMultiplier = effectiveMultiplier.mul(vipMultiplier) // Example: stack them

  const totalXpDecimal = baseXp.mul(effectiveMultiplier)
  return totalXpDecimal.floor().toNumber()
}

// --- XP for Content Interaction (Future Potential) ---
// Example: Liking content, posting comments, sharing, etc.

/**
 * Calculates XP for user interaction with content.
 * @param interactionType - e.g., 'LIKE', 'COMMENT', 'SHARE_POST', 'VIEW_ARTICLE'
 * @param vipInfo - User's VipInfo.
 * @returns XP points for the interaction.
 */
export function calculateXpForContentInteraction(
  interactionType: string,
  vipInfo: Pick<VipInfo, 'level'> | null
): number {
  let baseXpAmount = 0
  switch (interactionType.toUpperCase()) {
    case 'LIKE_POST':
      baseXpAmount = 1
      break
    case 'CREATE_COMMENT':
      baseXpAmount = 5
      break
    case 'SHARE_CONTENT':
      baseXpAmount = 10
      break
    case 'COMPLETE_PROFILE_SECTION': // This might be better as a VIP Task
      baseXpAmount = 20
      break
    default:
      baseXpAmount = 0
  }

  if (baseXpAmount <= 0) return 0

  const userVipLevel = vipInfo?.level ?? 0
  const vipMultiplier = getVipXpMultiplier(userVipLevel) // General VIP multiplier
  const totalXpDecimal = new Prisma.Decimal(baseXpAmount).mul(vipMultiplier)

  return totalXpDecimal.floor().toNumber()
}

// --- XP for Referrals (Future Potential) ---
/**
 * Calculates XP for a successful referral.
 * @param referralTier - e.g., 1st successful referral, 5th successful referral
 * @param vipInfoOfReferrer - Referrer's VipInfo.
 * @returns XP points for the referral.
 */
export function calculateXpForReferral(
  referralTier: number, // e.g., number of successful referrals made by user so far
  vipInfoOfReferrer: Pick<VipInfo, 'level'> | null
): number {
  let baseXpAmount = 50 // Base for first referral
  if (referralTier > 1 && referralTier <= 5) {
    baseXpAmount = 75
  } else if (referralTier > 5) {
    baseXpAmount = 100
  }

  const userVipLevel = vipInfoOfReferrer?.level ?? 0
  const vipMultiplier = getVipXpMultiplier(userVipLevel)
  const totalXpDecimal = new Prisma.Decimal(baseXpAmount).mul(vipMultiplier)

  return totalXpDecimal.floor().toNumber()
}

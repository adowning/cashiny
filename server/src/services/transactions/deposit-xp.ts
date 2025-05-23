import db from '@cashflow/database'
import { User, VipInfo } from '@cashflow/types'

/**
 * Calculates the XP bonus for a deposit based on VIP level and deposit amount
 * @param depositAmount The amount deposited (must be positive)
 * @param vipInfo The user's VIP information containing level and deposit XP rates
 * @returns The calculated XP bonus amount
 */
export function calculateXpBonus(depositAmount: number, vipInfo: VipInfo): number {
  // Validate inputs
  if (typeof depositAmount !== 'number' || depositAmount <= 0) {
    console.warn('calculateXpBonus: Invalid deposit amount:', depositAmount)
    return 0
  }

  if (!vipInfo || typeof vipInfo.level !== 'number') {
    console.warn('calculateXpBonus: Invalid vipInfo:', vipInfo)
    return 0
  }

  // Calculate base XP (1 XP per dollar deposited)
  const baseXp = Math.floor(depositAmount)

  // Apply VIP level multiplier (10% per level)
  const vipMultiplier = 1 + vipInfo.level * 0.1
  const totalXp = Math.floor(baseXp * vipMultiplier)

  console.log(
    `Calculated XP bonus: ${totalXp} (VIP Level ${vipInfo.level} multiplier: ${vipMultiplier}x)`
  )
  return totalXp
}

/**
 * Updates user's XP and VIP deposit XP in a transaction
 * @param user The user to update
 * @param vipInfo The user's VIP info to update
 * @param xpBonus The XP to add
 */
export async function updateUserDepositXp(user: User, vipInfo: VipInfo, xpBonus: number) {
  if (xpBonus <= 0) return

  // Update user's total XP
  user.totalXp += xpBonus

  // Update VIP deposit XP (convert string to number if needed)
  const currentDepositExp =
    typeof vipInfo.deposit_exp === 'string' ? parseInt(vipInfo.deposit_exp) : vipInfo.deposit_exp
  vipInfo.deposit_exp = currentDepositExp + xpBonus

  console.log(`Updated user XP: Total=${user.totalXp}, VIP Deposit=${vipInfo.deposit_exp}`)
}

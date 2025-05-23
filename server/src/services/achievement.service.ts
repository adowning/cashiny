// Assuming db is your enhanced Prisma client
import type { GetAchievementItem, UserWithProfile } from '@cashflow/types'
import type { HonoRequest } from 'hono'

//
import { createErrorResponse, createSuccessResponse } from '../routes'

/**
 * Get achievement list for the user.
 * Corresponds to `dispatchAchievementList` in the Pinia store.
 */
export async function getAchievementList() {
  try {
    // Mocked data - Replace with actual Prisma queries
    const achievementData: GetAchievementItem = {
      achievement_progress: 50,
      achievement_explain: [
        { index: 1, num: 10, award: 100, state: 1, rate: 0.5 },
        { index: 2, num: 20, award: 200, state: 0, rate: 0.25 },
      ],
      award_progress: 30,
      award_explain: [{ index: 1, num: 5, award: 50, status: 1, rate: 0.6 }],
      rate: 0.4,
    }
    // TODO: Replace with actual logic to fetch user's achievement data
    // Example:
    // const userAchievements = await db.userAchievement.findMany({ where: { userId: user.id } });
    // const achievements = await db.achievement.findMany();
    // Then map this data to GetAchievementItem structure

    return createSuccessResponse(achievementData)
  } catch (e: any) {
    console.error('Error fetching achievement list:', e)
    return createErrorResponse(e.message || 'Failed to fetch achievement list', 500)
  }
}

/**
 * Get achievement configuration.
 * Corresponds to `dispatchAchievementConfig` in the Pinia store.
 * This might be a generic config or user-specific if achievements vary.
 */
export async function getAchievementConfig() {
  try {
    // Mocked data - Replace with actual Prisma queries for achievement configuration
    const achievementConfigData: GetAchievementItem = {
      // Assuming it returns the same structure for now
      achievement_progress: 0, // Or global progress if applicable
      achievement_explain: [
        { index: 1, num: 10, award: 100, state: 0, rate: 1 },
        { index: 2, num: 20, award: 200, state: 0, rate: 1 },
        { index: 3, num: 30, award: 300, state: 0, rate: 1 },
      ],
      award_progress: 0,
      award_explain: [
        { index: 1, num: 5, award: 50, status: 0, rate: 1 },
        { index: 2, num: 10, award: 100, status: 0, rate: 1 },
      ],
      rate: 1, // Default rate or global rate
    }
    // TODO: Replace with actual logic to fetch achievement configuration
    // Example:
    // const achievementDefinitions = await db.achievementDefinition.findMany();
    // Map to GetAchievementItem structure. This might require adjustments to GetAchievementItem
    // or a new type if the config structure is significantly different.

    return createSuccessResponse(achievementConfigData)
  } catch (e: any) {
    console.error('Error fetching achievement config:', e)
    return createErrorResponse(e.message || 'Failed to fetch achievement config', 500)
  }
}

/**
 * Claim a stage award for the user.
 * Corresponds to `dispatchStageAward` in the Pinia store.
 */
export async function claimStageAward(req: HonoRequest, user: Partial<UserWithProfile>) {
  try {
    const body = await req.json()
    const { awardId } = body // Assuming awardId or similar identifier is passed

    if (!user || !user.id) {
      return createErrorResponse('User not authenticated', 401)
    }
    if (!awardId) {
      return createErrorResponse('Award ID is required', 400)
    }

    // TODO: Implement logic to:
    // 1. Validate if the user is eligible for this stage award.
    // 2. Check if the award has already been claimed.
    // 3. Mark the award as claimed in the database (e.g., update UserAchievement record).
    // 4. Potentially credit the user with the award (e.g., update balance, add item).
    // Example:
    // const existingClaim = await db.userStageAwardClaim.findUnique({ where: { userId_awardId: { userId: user.id, awardId } } });
    // if (existingClaim) return createErrorResponse('Award already claimed', 400);
    //
    // const awardDefinition = await db.stageAwardDefinition.findUnique({ where: { id: awardId } });
    // if (!awardDefinition) return createErrorResponse('Invalid award ID', 404);
    //
    // // Check eligibility (e.g., user.xp >= awardDefinition.requiredXp)
    //
    // await db.userStageAwardClaim.create({ data: { userId: user.id, awardId, claimedAt: new Date() } });
    // // Add currency/items to user's profile based on awardDefinition.reward

    // For now, returning a generic success response
    return createSuccessResponse({ message: `Stage award ${awardId} claimed successfully` })
  } catch (e: any) {
    console.error('Error claiming stage award:', e)
    return createErrorResponse(e.message || 'Failed to claim stage award', 500)
  }
}

/**
 * Claim an achievement award for the user.
 * Corresponds to `dispatchAchievementAward` in the Pinia store.
 */
export async function claimAchievementAward(req: HonoRequest, user: Partial<UserWithProfile>) {
  try {
    const body = await req.json()
    const { achievementId } = body // Assuming achievementId or similar is passed

    if (!user || !user.id) {
      return createErrorResponse('User not authenticated', 401)
    }
    if (!achievementId) {
      return createErrorResponse('Achievement ID is required', 400)
    }

    // TODO: Implement logic similar to claimStageAward:
    // 1. Validate eligibility for the achievement award.
    // 2. Check if already claimed.
    // 3. Mark as claimed (e.g., update UserAchievement.status to 'CLAIMED').
    // 4. Credit user with the reward.
    // Example:
    // const userAchievement = await db.userAchievement.findUnique({ where: { userId_achievementId: { userId: user.id, achievementId } } });
    // if (!userAchievement || userAchievement.status === 'CLAIMED') {
    //   return createErrorResponse('Achievement not eligible or already claimed', 400);
    // }
    // await db.userAchievement.update({
    //   where: { id: userAchievement.id },
    //   data: { status: 'CLAIMED', claimedAt: new Date() },
    // });
    // const achievementDefinition = await db.achievementDefinition.findUnique({ where: {id: achievementId }});
    // // Add currency/items to user's profile

    return createSuccessResponse({
      message: `Achievement award ${achievementId} claimed successfully`,
    })
  } catch (e: any) {
    console.error('Error claiming achievement award:', e)
    return createErrorResponse(e.message || 'Failed to claim achievement award', 500)
  }
}

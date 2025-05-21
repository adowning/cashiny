import type { UserWithProfile } from '@cashflow/database';
import type {
  GetBonusResponse,
  GetRewardCenterList,
  GetRewardCenterListResponse,
} from '@cashflow/types';
import type { HonoRequest } from 'hono';

//
import { createErrorResponse, createSuccessResponse } from '../routes';
import { db } from './prisma.service';

/**
 * Get the reward center list for the user.
 * Corresponds to `dispatchRewardList` in the Pinia store.
 */
export async function getRewardCenterList(req: HonoRequest, user: Partial<UserWithProfile>) {
  try {
    if (!user || !user.id) {
      return createErrorResponse('User not authenticated', 401);
    }

    // Mocked data - Replace with actual Prisma queries
    const rewardCenterData: GetRewardCenterList = {
      achievement: '5/10 Achievements Completed', // Example string, could be more structured
      achievement_status: 1, // 0: none available, 1: claimable, 2: all claimed
      cash_back: '15.00 USD', // Cashback available
      week: 'Weekly Bonus Ready', // Weekly bonus status
      level_up_num: 2, // Number of level-up rewards available
    };

    // TODO: Replace with actual logic. This will likely involve multiple queries:
    // 1. Fetch user's achievement progress and claimable achievements.
    // 2. Calculate available cashback (this could be complex, based on bets, losses, VIP level, etc.).
    // 3. Check status of weekly bonuses (are they claimable? when do they reset?).
    // 4. Check for unclaimed level-up bonuses (associated with VIP levels or XP levels).
    //
    // Example for achievement part:
    // const claimableAchievements = await db.userAchievement.count({
    //   where: { userId: user.id, status: 'ELIGIBLE' } // Or whatever status means claimable
    // });
    // rewardCenterData.achievement_status = claimableAchievements > 0 ? 1 : 0;
    //
    // This data structure (GetRewardCenterList) is quite high-level, so you'll need to
    // aggregate data from various sources into these summary fields.

    return createSuccessResponse(rewardCenterData);
  } catch (e: any) {
    console.error('Error fetching reward center list:', e);
    return createErrorResponse(e.message || 'Failed to fetch reward center list', 500);
  }
}

/**
 * Receive/Claim an achievement bonus from the reward center.
 * Corresponds to `dispatchReceiveAchievementBonus` in the Pinia store.
 * This might be a generic "claim all available achievements" or specific if an ID is passed.
 * The Pinia store sends no data, suggesting it's a general claim.
 */
export async function receiveAchievementBonus(req: HonoRequest, user: Partial<UserWithProfile>) {
  try {
    if (!user || !user.id) {
      return createErrorResponse('User not authenticated', 401);
    }

    // TODO: Implement logic to:
    // 1. Find all 'ELIGIBLE' (claimable) UserAchievement records for the user.
    // 2. For each, mark as 'CLAIMED' and credit the user with the associated reward.
    //    This could involve updating user balance, adding items, etc.
    //    This should be an atomic operation if possible (Prisma transaction).
    // Example:
    // const claimableAchievements = await db.userAchievement.findMany({
    //   where: { userId: user.id, status: 'ELIGIBLE' },
    //   include: { achievementDefinition: true } // To know the reward
    // });
    //
    // if (claimableAchievements.length === 0) {
    //   return createErrorResponse('No achievement bonuses to claim', 400);
    // }
    //
    // let totalRewardAmount = 0; // Example if rewards are monetary
    // const claimedIds = [];
    //
    // for (const ua of claimableAchievements) {
    //   // Assume achievementDefinition has reward details like 'rewardAmount'
    //   totalRewardAmount += ua.achievementDefinition.rewardAmount;
    //   claimedIds.push(ua.id);
    // }
    //
    // await db.$transaction(async (tx) => {
    //   await tx.user.update({
    //     where: { id: user.id },
    //     data: { balance: { increment: totalRewardAmount } }, // Or profile balance
    //   });
    //   await tx.userAchievement.updateMany({
    //     where: { id: { in: claimedIds } },
    //     data: { status: 'CLAIMED', claimedAt: new Date() },
    //   });
    // });

    // The GetBonusResponse type is generic (data: any).
    // We should return something meaningful, e.g., number of bonuses claimed or total reward.
    const responseData = {
      claimedCount: 0, // Placeholder
      totalReward: '0 USD', // Placeholder
    };

    return createSuccessResponse(responseData, 200);
  } catch (e: any) {
    console.error('Error receiving achievement bonus:', e);
    return createErrorResponse(e.message || 'Failed to receive achievement bonus', 500);
  }
}

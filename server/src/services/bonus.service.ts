import type { UserWithProfile } from '@cashflow/database';
import type { BonusItem, GetBonusList, GetUserBonusResponse } from '@cashflow/types';
import type { HonoRequest } from 'hono';

//
import { createErrorResponse, createSuccessResponse } from '../routes';
import { db } from './prisma.service';

/**
 * Get user's bonus list.
 * Corresponds to `dispatchUserBonus` in the Pinia store.
 */
export async function getUserBonusList(req: HonoRequest, user: Partial<UserWithProfile>) {
  try {
    if (!user || !user.id) {
      return createErrorResponse('User not authenticated', 401);
    }

    // Mocked data - Replace with actual Prisma queries
    const bonusListData: GetBonusList = {
      list: [
        {
          id: 'bonus1',
          type: 1, // Example type
          status: 0, // Example status (e.g., 0: available, 1: active, 2: expired, 3: cancelled)
          now: '50.00', // Current progress or amount
          max: 100, // Max amount or target
          min: 10, // Min amount for activation
          award: 20, // Award amount
          ended_at: Math.floor(new Date().getTime() / 1000) + 86400 * 7, // Expires in 7 days
          created_at: Math.floor(new Date().getTime() / 1000) - 86400, // Created yesterday
          gain_amount: 0, // Amount gained from this bonus
          currency: user.profile?.activeCurrencyType || 'USD',
          receive: 0, // 0: not received, 1: received
          wager: 500, // Wagering requirement
          rate: 0.1, // Wagering completion rate or bonus percentage
          deposit: 25, // Associated deposit amount
          children: [], // For hierarchical bonuses if any
        },
      ],
    };

    // TODO: Replace with actual logic to fetch user's active/available bonuses
    // Example:
    // const userBonuses = await db.userBonus.findMany({
    //   where: {
    //     userId: user.id,
    //     // status: { in: ['AVAILABLE', 'ACTIVE'] } // Depending on your status enum/values
    //   },
    //   include: { bonusDefinition: true }
    // });
    // Map this data to the BonusItem structure.

    return createSuccessResponse(bonusListData);
  } catch (e: any) {
    console.error('Error fetching user bonus list:', e);
    return createErrorResponse(e.message || 'Failed to fetch user bonus list', 500);
  }
}

/**
 * Cancel a user's bonus.
 * Corresponds to `dispatchBonusCancel` in the Pinia store.
 */
export async function cancelUserBonus(req: HonoRequest, user: Partial<UserWithProfile>) {
  try {
    const body = await req.json();
    const { bonusId } = body; // Assuming bonusId (or userBonusId) is passed

    if (!user || !user.id) {
      return createErrorResponse('User not authenticated', 401);
    }
    if (!bonusId) {
      return createErrorResponse('Bonus ID is required', 400);
    }

    // TODO: Implement logic to:
    // 1. Find the specific user bonus instance.
    // 2. Check if it's cancellable (e.g., not already completed or expired).
    // 3. Update its status to 'CANCELLED' or similar in the database.
    //    Ensure this doesn't conflict with other statuses like 'EXPIRED'.
    // Example:
    // const userBonus = await db.userBonus.findUnique({ where: { id: bonusId, userId: user.id } });
    // if (!userBonus) {
    //   return createErrorResponse('Bonus not found or does not belong to user', 404);
    // }
    // if (userBonus.status === 'CANCELLED' || userBonus.status === 'COMPLETED' || userBonus.status === 'EXPIRED') {
    //   return createErrorResponse('Bonus cannot be cancelled', 400);
    // }
    // await db.userBonus.update({
    //   where: { id: bonusId },
    //   data: { status: 'CANCELLED' }, // Adjust based on your actual status values
    // });

    return createSuccessResponse({ message: `Bonus ${bonusId} cancelled successfully` });
  } catch (e: any) {
    console.error('Error cancelling user bonus:', e);
    return createErrorResponse(e.message || 'Failed to cancel bonus', 500);
  }
}

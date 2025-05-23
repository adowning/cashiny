// Your Prisma client
import type { PromoData, PromoGroupData, PromoListData } from '@cashflow/types'

//
import { createErrorResponse, createSuccessResponse } from '../routes'

/**
 * Get user activity/promo list.
 * Corresponds to `dispatchUserActivityList` in the Pinia store.
 */
export async function getUserActivityList() {
  try {
    // Mocked data - Replace with actual Prisma queries to fetch promotions/activities
    // This data should be structured according to the PromoGroupData interface.
    // You might fetch all active promos and then filter/group them.
    // Consider if activities are user-specific or general.

    const mockedPromoListData: PromoListData[] = [
      {
        id: 1,
        name: 'Welcome Bonus',
        image_path: '/img/promo/welcome.png',
        text: 'Get a 100% match on your first deposit up to $200!',
        desc: 'Detailed description of the welcome bonus, terms and conditions apply.',
        countdown: false,
        content: 'HTML or Markdown content for a detailed view of the promo.',
        click_feedback: 1, // e.g., 1 for navigate, 2 for open modal
        button_path: '/deposit', // or a specific promo page
        button_text: 'Claim Now',
      },
      {
        id: 2,
        name: 'Weekend Reload',
        image_path: '/img/promo/reload.png',
        text: '50% reload bonus every weekend!',
        desc: 'Boost your weekend play with a 50% reload bonus.',
        countdown: true, // e.g., if it expires at the end of the weekend
        content: 'Detailed content about the weekend reload.',
        click_feedback: 1,
        button_path: '/promotions/weekend-reload',
        button_text: 'Learn More',
      },
    ]

    const mockedPromoData: PromoData[] = [
      {
        group_id: 1,
        group_name: 'New Player Offers',
        list_data: [mockedPromoListData[0]],
      },
      {
        group_id: 2,
        group_name: 'Regular Promotions',
        list_data: [mockedPromoListData[1]],
      },
    ]

    const promoGroupData: PromoGroupData = {
      group_data: mockedPromoData,
    }

    // TODO: Replace with actual database logic.
    // Example (highly simplified):
    // const activePromos = await db.promotion.findMany({
    //   where: { isActive: true, /* other conditions like expiryDate */ },
    //   orderBy: { sortOrder: 'asc' },
    // });
    //
    // // Then group them if your `Promotion` model has a `groupId` and `groupName`
    // // or if you have a separate `PromotionGroup` model.
    // const groups = {};
    // for (const promo of activePromos) {
    //   if (!groups[promo.groupId]) {
    //     groups[promo.groupId] = {
    //       group_id: promo.groupId,
    //       group_name: promo.groupName, // Assuming these fields exist
    //       list_data: []
    //     };
    //   }
    //   groups[promo.groupId].list_data.push({
    //     id: promo.id,
    //     name: promo.name,
    //     image_path: promo.imagePath,
    //     text: promo.shortText,
    //     desc: promo.description,
    //     countdown: !!promo.endDate, // Example
    //     content: promo.fullContent,
    //     click_feedback: promo.clickFeedbackType,
    //     button_path: promo.buttonLink,
    //     button_text: promo.buttonText
    //   });
    // }
    // promoGroupData.group_data = Object.values(groups);

    return createSuccessResponse(promoGroupData)
  } catch (e: any) {
    console.error('Error fetching user activity list:', e)
    return createErrorResponse(e.message || 'Failed to fetch activity list', 500)
  }
}

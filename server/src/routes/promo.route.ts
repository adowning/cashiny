import { NETWORK_CONFIG } from '@cashflow/types';

import createRouter from '../create-router';
import { getUserActivityList } from '../services/promo.service';

//

const router = createRouter();

router.get(NETWORK_CONFIG.ACTIVITY.USER_ACTIVITY_LIST, async (c) => {
  // Promotions/activities might be public or user-specific.
  // If they can be viewed by non-authenticated users, 'user' can be null.
  // If they are user-specific (e.g., based on VIP level), ensure user is authenticated.
  const user = c.get('user_with_profile'); // This can be null if the route is public
  return await getUserActivityList(c.req, user);
});

export default router;

import { NETWORK_CONFIG } from '@cashflow/types';

import createRouter from '../create-router';
import {
  claimAchievementAward,
  claimStageAward,
  getAchievementConfig,
  getAchievementList,
} from '../services/achievement.service';

// Assuming NETWORK_CONFIG contains these new routes

const router = createRouter();

// Ensure these path constants exist in your NETWORK_CONFIG.ACHIEVEMENT_PAGE

router.get(NETWORK_CONFIG.ACHIEVEMENT_ROUTES.ACHIEVEMENT_LIST, async (c) => {
  const user = c.get('user_with_profile');
  if (!user) return c.json({ message: 'User not authenticated' }, 401);
  return await getAchievementList(c.req, user);
});

router.get(NETWORK_CONFIG.ACHIEVEMENT_ROUTES.ACHIEVEMENT_CONFIG, async (c) => {
  const user = c.get('user_with_profile');
  if (!user) return c.json({ message: 'User not authenticated' }, 401);
  return await getAchievementConfig(c.req, user);
});

router.post(NETWORK_CONFIG.ACHIEVEMENT_ROUTES.STAGE_AWARD, async (c) => {
  const user = c.get('user_with_profile');
  if (!user) return c.json({ message: 'User not authenticated' }, 401);
  return await claimStageAward(c.req, user);
});

router.post(NETWORK_CONFIG.ACHIEVEMENT_ROUTES.ACHIEVEMENT_AWARD, async (c) => {
  const user = c.get('user_with_profile');
  if (!user) return c.json({ message: 'User not authenticated' }, 401);
  return await claimAchievementAward(c.req, user);
});

export default router;

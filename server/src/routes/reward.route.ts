import { NETWORK_CONFIG } from '@cashflow/types'

import createRouter from '../rest.router'
import { getRewardCenterList, receiveAchievementBonus } from '../services/reward.service'

// Assuming NETWORK_CONFIG contains these new routes

const router = createRouter()

// Ensure these path constants exist in your NETWORK_CONFIG.REWARD_PAGE or similar
// The Pinia store used NETWORK.Reward, which might be different from NETWORK_CONFIG
// Adjust as per your actual constants structure. For this example, I'll assume:

router.get(NETWORK_CONFIG.REWARD_ROUTES.REWARD_LIST, async (c) => {
  const user = c.get('user_with_profile')
  if (!user) return c.json({ message: 'User not authenticated' }, 401)
  return await getRewardCenterList(c.req, user)
})

router.post(NETWORK_CONFIG.REWARD_ROUTES.RECIEVE_ACHIV_BONUS, async (c) => {
  // Corrected typo from Pinia store (RECIEVE -> RECEIVE)
  const user = c.get('user_with_profile')
  if (!user) return c.json({ message: 'User not authenticated' }, 401)
  return await receiveAchievementBonus(c.req, user)
})

export default router

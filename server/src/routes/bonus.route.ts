import { NETWORK_CONFIG } from '@cashflow/types'

import createRouter from '../rest.router'
import { cancelUserBonus, getUserBonusList } from '../services/bonus.service'

// Assuming NETWORK_CONFIG contains these new routes

const router = createRouter()

// Ensure these path constants exist in your NETWORK_CONFIG.BONUS_PAGE

router.get(NETWORK_CONFIG.BONUS_PAGE.USER_BONUS, async (c) => {
  const user = c.get('user_with_profile')
  if (!user) return c.json({ message: 'User not authenticated' }, 401)
  return await getUserBonusList(c.req, user)
})

router.post(NETWORK_CONFIG.BONUS_PAGE.BONUS_CANCEL, async (c) => {
  const user = c.get('user_with_profile')
  if (!user) return c.json({ message: 'User not authenticated' }, 401)
  return await cancelUserBonus(c.req, user)
})

export default router

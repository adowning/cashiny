import { NETWORK_CONFIG } from '@cashflow/types'

// import { OK } from 'stoker/http-status-codes';
import createRouter from '../create-router'
import {
  claimCycleReward,
  claimDailySignIn,
  fetchAllVipLevels,
  fetchLevelRewardHistory,
  fetchRebateHistory,
  fetchTimesHistory,
  fetchUserVipInfo,
  fetchVipBetAwardList,
  fetchVipLevelUpList,
  fetchVipTasks,
  getVipSignInInfo,
} from '../services/vip.service'
import { createSuccessResponse, createErrorResponse } from '.'

// import { getVipInfo, getVipLevelAward, getVipLevels } from '../services/vip.service';

const router = createRouter()
router.get(NETWORK_CONFIG.VIP_INFO.USER_VIP_INFO, async (c) => {
  console.log('here in USER_VIP_INFO')
  let result
  try {
    result = await fetchUserVipInfo(c.get('user_with_profile')!.id)
    return createSuccessResponse(result)
  } catch (e) {
    return createErrorResponse((e as Error).message, 403)
  }
})
router.get(NETWORK_CONFIG.VIP_INFO.USER_VIP_LEVEL, async () => {
  return createSuccessResponse(await fetchAllVipLevels())
})
router.get(NETWORK_CONFIG.VIP_INFO.VIP_LEVEL_AWARD, async (c) => {
  return createSuccessResponse(
    await claimCycleReward(c.get('user_with_profile')!.id, 'daily', 'daily')
  )
})
router.get(NETWORK_CONFIG.VIP_INFO.VIP_SIGNIN, async (c) => {
  return createSuccessResponse(await getVipSignInInfo(c.get('user_with_profile')!.id))
})
router.get(NETWORK_CONFIG.VIP_INFO.VIP_SIGNINAWARD_RECEIVE, async (c) => {
  return createSuccessResponse(await claimDailySignIn(c.get('user_with_profile')!.id))
})
router.get(NETWORK_CONFIG.VIP_INFO.VIP_SIGNIN_REWARDS, async (c) => {
  return createSuccessResponse(await claimDailySignIn(c.get('user_with_profile')!.id))
})
router.get(NETWORK_CONFIG.VIP_INFO.VIP_TASKS, async (c) => {
  return createSuccessResponse(await fetchVipTasks(c.get('user_with_profile')!.id))
})
router.get(NETWORK_CONFIG.VIP_INFO.VIP_REBATE_HISTORY, async (c) => {
  return createSuccessResponse(
    await fetchRebateHistory(c.get('user_with_profile')!.id, c.get('pagination'))
  )
})
router.get(NETWORK_CONFIG.VIP_INFO.VIP_TIMES_HISTORY, async (c) => {
  return createSuccessResponse(
    await fetchTimesHistory(c.get('user_with_profile')!.id, c.get('pagination'))
  )
})
router.get(NETWORK_CONFIG.VIP_INFO.VIP_LEVELUP_LIST, async (c) => {
  return createSuccessResponse(await fetchVipLevelUpList(c.get('user_with_profile')!.id))
})
router.get(NETWORK_CONFIG.VIP_INFO.USER_VIP_LEVELAWARD_LIST, async (c) => {
  return createSuccessResponse(await fetchVipBetAwardList(c.get('user_with_profile')!.id))
})
router.get(NETWORK_CONFIG.VIP_INFO.USER_VIP_LEVELAWARD_RECEIVE, async (c) => {
  return createSuccessResponse(
    await fetchLevelRewardHistory(c.get('user_with_profile')!.id, c.get('pagination'))
  )
})
// router.get(NETWORK_CONFIG.VIP_INFO.USER_VIP_BETAWARD_LIST, async (c) => {
//   return await getVipBetawardList(c.get('user_with_profile').id);
// });
// router.get(NETWORK_CONFIG.VIP_INFO.USER_VIP_BETAWARD_RECEIVE, async (c) => {
//   return await getVipBetawardReceive(c.get('user_with_profile').id);
// });
// router.get(NETWORK_CONFIG.VIP_INFO.VIP_REBATE_AWARD, async (c) => {
//   return await getVipRebateAward(c.get('user_with_profile').id);
// });
// router.get(NETWORK_CONFIG.VIP_INFO.VIP_LEVEL_AWARD_HISTORY, async (c) => {
//   return await fetchPaginatedRewardHistory(c.get('user_with_profile').id, c.get('pagination'));
// });
// router.get(NETWORK_CONFIG.VIP_INFO.VIP_LEVELUP_RECEIVE, async (c) => {
//   return await getVipLevelUpReceive(c.get('user_with_profile').id);
// });
// router.get(NETWORK_CONFIG.VIP_INFO.USER_VIP_CYCLEAWARD_LIST, async (c) => {
//   return await getVipCycleawardList(c.get('user_with_profile').id);
// });
// router.get(NETWORK_CONFIG.VIP_INFO.USER_VIP_CYCLEAWARD_RECEIVE, async (c) => {
//   return await getVipCycleawardReceive(c.get('user_with_profile').id);
// });

export default router

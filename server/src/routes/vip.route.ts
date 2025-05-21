import { NETWORK_CONFIG } from '@cashflow/types';

// import { OK } from 'stoker/http-status-codes';
import createRouter from '../create-router';
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
} from '../services/vip.service';

// import { getVipInfo, getVipLevelAward, getVipLevels } from '../services/vip.service';

const router = createRouter();
router.get(NETWORK_CONFIG.VIP_INFO.USER_VIP_INFO, async (c) => {
  return await fetchUserVipInfo(c.get('user_with_profile').id);
});
router.get(NETWORK_CONFIG.VIP_INFO.USER_VIP_LEVEL, async () => {
  return await fetchAllVipLevels();
});
router.get(NETWORK_CONFIG.VIP_INFO.VIP_LEVEL_AWARD, async (c) => {
  return await claimCycleReward(c.get('user_with_profile').id, type);
});
router.get(NETWORK_CONFIG.VIP_INFO.VIP_SIGNIN, async (c) => {
  return await getVipSignInInfo(c.get('user_with_profile').id);
});
router.get(NETWORK_CONFIG.VIP_INFO.VIP_SIGNINAWARD_RECEIVE, async (c) => {
  return await claimDailySignIn(c.get('user_with_profile').id);
});
router.get(NETWORK_CONFIG.VIP_INFO.VIP_SIGNIN_REWARDS, async (c) => {
  return await claimDailySignIn(c.get('user_with_profile').id);
});
router.get(NETWORK_CONFIG.VIP_INFO.VIP_TASKS, async (c) => {
  return await fetchVipTasks(c.get('user_with_profile').id);
});
router.get(NETWORK_CONFIG.VIP_INFO.VIP_REBATE_HISTORY, async (c) => {
  return await fetchRebateHistory(c.get('user_with_profile').id, c.get('pagination'));
});
router.get(NETWORK_CONFIG.VIP_INFO.VIP_TIMES_HISTORY, async (c) => {
  return await fetchTimesHistory(c.get('user_with_profile').id, c.get('pagination'));
});
router.get(NETWORK_CONFIG.VIP_INFO.VIP_LEVELUP_LIST, async (c) => {
  return await fetchVipLevelUpList(c.get('user_with_profile').id);
});
router.get(NETWORK_CONFIG.VIP_INFO.USER_VIP_LEVELAWARD_LIST, async (c) => {
  return await fetchVipBetAwardList(c.get('user_with_profile').id);
});
router.get(NETWORK_CONFIG.VIP_INFO.USER_VIP_LEVELAWARD_RECEIVE, async (c) => {
  return await fetchLevelRewardHistory(c.get('user_with_profile').id, c.get('pagination'));
});
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

export default router;

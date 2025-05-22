import { computed, ref } from 'vue'

// Assuming this path is correct
import useApiClient from '@/composables/useApiClient'
// Import reactive functions
import type * as Vip from '@cashflow/types'
import { defineStore } from 'pinia'

import { handleException } from './exception'

export const useVipStore = defineStore(
  'vip',
  () => {
    const { vip: vipApi } = useApiClient()
    const success = ref(false)
    const errMessage = ref('')
    const levelUpDialogVisible = ref(false)
    const vipInfo = ref<Vip.VipInfo>({} as Vip.VipInfo) // Keeping type assertion as in original
    const vipLevels = ref<Array<Vip.VipLevel>>([])
    const vipTasks = ref<Array<Vip.VipTaskItem>>([])
    const vipRebateHistory = ref<Vip.VipRebateHistoryData>({
      total: 0,
      list: [],
    })
    const vipLevelRewardHistory = ref<Vip.VipLevelRewardHistoryData>({
      total: 0,
      list: [],
    })
    const vipTimesHistory = ref<Vip.VipTimesHistoryData>({
      total: 0,
      list: [],
    })
    const vipSignIn = ref<Vip.VipSignInData>({
      award: [],
      signin_day: 0,
      is_signin: 0,
      limited_bet: 0,
      limited_deposit: 0,
      vip_level: 0,
    })
    const vipLevelUpList = ref<Vip.VipLevelUpListData>({} as Vip.VipLevelUpListData) // Keeping type assertion as in original
    const vipLevelUpReceive = ref<Vip.VipLevelUpReceiveData>({} as Vip.VipLevelUpReceiveData) // Keeping type assertion as in original
    const vipNavBarToggle = ref(localStorage.getItem('vipBar') || '') // Initialize from localStorage
    const vipCycleawardList = ref<Vip.VipCycleawardListData>({} as Vip.VipCycleawardListData) // Keeping type assertion as in original
    const vipLevelAward = ref<Vip.VipLevelAwardData>({} as Vip.VipLevelAwardData) // Keeping type assertion as in original
    const vipBetawardList = ref<Vip.vipBetawardListData>({} as Vip.vipBetawardListData) // Keeping type assertion as in original

    // Getters converted to computed properties
    const getSuccess = computed(() => success.value)
    const getErrMessage = computed(() => errMessage.value)
    const getVipInfo = computed(() => vipInfo.value)
    const getVipLevels = computed(() => vipLevels.value)
    const getVipTasks = computed(() => vipTasks.value)
    const getVipRebateHistory = computed(() => vipRebateHistory.value)
    const getVipLevelRewardHistory = computed(() => vipLevelRewardHistory.value)
    const getVipTimesHistory = computed(() => vipTimesHistory.value)
    const getVipSignIn = computed(() => vipSignIn.value)
    const getLevelUpDialogVisible = computed(() => levelUpDialogVisible.value)
    const getVipLevelUpList = computed(() => vipLevelUpList.value)
    const getVipLevelUpReceive = computed(() => vipLevelUpReceive.value)
    const getVipNavBarToggle = computed(() => vipNavBarToggle.value)
    const getVipCycleawardList = computed(() => vipCycleawardList.value)
    const getVipLevelAward = computed(() => vipLevelAward.value)
    const getVipBetawardList = computed(() => vipBetawardList.value)

    // const { t } = useI18n()

    // Actions converted to regular functions
    const setSuccess = (isSuccess: boolean) => {
      success.value = isSuccess
    }

    const setErrorMessage = (message: string) => {
      errMessage.value = message
    }

    const setVipInfo = (info: Vip.VipInfo) => {
      vipInfo.value = info
    }

    const setVipLevels = (levels: Array<Vip.VipLevel>) => {
      vipLevels.value = levels
    }

    const setVipTasks = (tasks: Array<Vip.VipTaskItem>) => {
      vipTasks.value = tasks
    }

    const setVipRebateHistory = (history: Vip.VipRebateHistoryData) => {
      vipRebateHistory.value = history
    }

    const setVipLevelRewardHistory = (history: Vip.VipLevelRewardHistoryData) => {
      vipLevelRewardHistory.value = history
    }

    const setVipTimesHistory = (history: Vip.VipTimesHistoryData) => {
      vipTimesHistory.value = history
    }

    const setVipSignIn = (signInData: Vip.VipSignInData) => {
      vipSignIn.value = signInData
    }

    const setLevelUpDialogVisible = (visible: boolean) => {
      levelUpDialogVisible.value = visible
    }

    const setVipLevelUpList = (list: Vip.VipLevelUpListData) => {
      vipLevelUpList.value = list
    }

    const setVipLevelUpReceive = (receiveData: Vip.VipLevelUpReceiveData) => {
      vipLevelUpReceive.value = receiveData
    }

    const setVipNavBarToggle = (toggle: string) => {
      vipNavBarToggle.value = toggle
      localStorage.setItem('vipBar', toggle) // Update localStorage
    }

    // Storing periodic rewards  存储周期性奖励
    const setVipCycleawardList = (list: Vip.VipCycleawardListData) => {
      vipCycleawardList.value = list
    }

    // Storage level related rewards  存储等级相关奖励
    const setVipLevelAward = (awardData: Vip.VipLevelAwardData) => {
      vipLevelAward.value = awardData
    }

    // Storage coding rebate  存储打码返利
    const setVipBetawardList = (list: Vip.vipBetawardListData) => {
      vipBetawardList.value = list
    }

    // Reward collection prompt information  奖励领取提示信息
    const alertMessage = (successMessage: Vip.SuccessMessageParams, message?: string) => {
      // If using Nuxt UI Pro, uncomment and use toast:
      // toast.add({
      //     title: successMessage.message,
      //     icon: successMessage.type == 1 ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-circle', // Example icons
      //     color: successMessage.type == 1 ? 'green' : 'red',
      //     timeout: 3000,
      // });
      // Otherwise, implement your custom notification logic here
      const text = message || successMessage.message
      console.log('Alert Message:', text, 'Type:', successMessage.type) // Placeholder
    }

    // Get VIP check-in content
    async function dispatchVipSignIn() {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        const response = await vipApi.getVipStatus<Vip.VipSignInData>('/vip/signin', 'GET')
        setSuccess(true)
        setVipSignIn(response)
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
      }
    }

    async function dispatchVipSigninawardReceive() {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        await useApiClient().request('/vip/signinaward/receive', 'POST', {})
        setSuccess(true)
        dispatchVipSignIn() // Call the action
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
      }
    }

    // Receive VIP sign-in rewards
    async function dispatchVipSignInReward() {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        await useApiClient().request('/vip/signin/rewards', 'POST', {})
        setSuccess(true)
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
      }
    }

    // user vip information api
    async function dispatchVipInfo() {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        const info = await vipApi.getVipInfo()
        setSuccess(true)
        setVipInfo(info)
      } catch (error: any) {
        console.log(error)
        setSuccess(false)
      }
    }

    // user vip level api
    async function dispatchVipLevels() {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        const levels = await useApiClient().request<Array<Vip.VipLevel>>('/vip/levels', 'GET')
        setSuccess(true)
        setVipLevels(levels)
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
      }
    }

    // user vip task api
    async function dispatchVipTasks() {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        const tasks = await useApiClient().request<Array<Vip.VipTaskItem>>('/vip/tasks', 'GET')
        setSuccess(true)
        setVipTasks(tasks)
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
      }
    }

    // receive VIP code rebate rewards
    async function dispatchVipRebateAward(data: any) {
      // Keeping 'any' type as in original
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        await useApiClient().request('/vip/rebate/award', 'POST', data)
        setSuccess(true)
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
      }
    }

    // get vip coding record
    async function dispatchVipRebateHistory(data: Vip.VipRebateHistoryRequest) {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        const history = await useApiClient().request<Vip.VipRebateHistoryData>(
          '/vip/rebate/history',
          'POST',
          data
        )
        setSuccess(true)
        setVipRebateHistory(history)
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
      }
    }

    // Obtain VIP level reward record
    async function dispatchVipLevelRewardHistory(data: Vip.VipLevelRewardHistoryRequest) {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        const history = await useApiClient().request<Vip.VipLevelRewardHistoryData>(
          '/vip/level/award/history',
          'POST',
          data
        )
        setSuccess(true)
        setVipLevelRewardHistory(history)
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
      }
    }

    // Get VIP weekly and monthly reward records
    async function dispatchVipTimesHistory(data: Vip.VipTimesHistoryRequest) {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        const history = await useApiClient().request<Vip.VipTimesHistoryData>(
          '/vip/times/history',
          'POST',
          data
        )
        setSuccess(true)
        setVipTimesHistory(history)
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
      }
    }

    // Get VIP upgrade reward information
    async function dispatchVipLevelUpList() {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        const list = await useApiClient().request<Vip.VipLevelUpListData>(
          '/vip/levelup/list',
          'GET'
        )
        setSuccess(true)
        setVipLevelUpList(list)
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
      }
    }

    // Receive VIP upgrade rewards
    async function dispatchVipLevelUpReceive() {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        const receiveData = await vipApi.getVipStatus()
        setSuccess(true)
        setVipLevelUpReceive(receiveData)
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
      }
    }

    /**
     * Get periodic rewards  获取周期性奖励
     */
    async function dispatchVipCycleawardList() {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        const list = await useApiClient().request<Vip.VipCycleawardListData>(
          '/vip/cycleaward/list',
          'GET'
        )
        setSuccess(true)
        setVipCycleawardList(list)
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
      }
    }

    /**
     * Receive periodic rewards  领取周期性奖励
     * @param data Reward type 1: Member day 2: Daily reward 3: Weekly reward 4: Monthly reward
     */
    async function dispatchVipCycleawardReceive(data: Vip.VipCycleawardReceiveRequest) {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        await useApiClient().request('/vip/cycleaward/receive', 'POST', data)
        setSuccess(true)
        alertMessage(
          {
            type: 1,
            message: '',
          },
          'reward.success_text'
        )
        dispatchVipCycleawardList() // Call the action
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
        alertMessage(
          {
            type: 0,
            message: '',
          },
          error?.message
        )
      }
    }

    /**
     * Get level-related rewards  获取等级相关奖励
     */
    async function dispatchVipLevelAward() {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        const awardData = await useApiClient().request<Vip.VipLevelAwardData>(
          '/vip/level/award',
          'GET'
        )
        setSuccess(true)
        setVipLevelAward(awardData)
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
      }
    }

    /**
     * Receive level-related rewards  领取等级相关奖励
     * @param data Reward type 5: Upgrade reward 6: Upgrade reward
     */
    async function dispatchVipLevelAwardReceive(data: Vip.VipLevelAwardReceiveRequest) {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        await useApiClient().request('/vip/levelaward/receive', 'POST', data)
        setSuccess(true)
        alertMessage(
          {
            type: 1,
            message: '',
          },
          'reward.success_text'
        )
        dispatchVipLevelAward() // Call the action
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
        alertMessage(
          {
            type: 0,
            message: '',
          },
          error?.message
        )
      }
    }

    /**
     * Get coding rebates  获取打码返利
     */
    async function dispatchVipBetawardList() {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        const list = await useApiClient().request<Vip.vipBetawardListData>(
          '/vip/betaward/list',
          'GET'
        )
        setSuccess(true)
        setVipBetawardList(list)
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
      }
    }

    /**
     * Get coding rebates  领取打码返利
     * @param data Reward type 7: Coding rewards
     * @param data 领取奖励类型 7: 打码奖励
     */
    async function dispatchVipBetawardReceive(data: Vip.VipBetawardReceiveRequest) {
      setSuccess(false)
      try {
        const { vip: vipApi } = useApiClient()
        await useApiClient().request('/vip/betaward/receive', 'POST', data)
        setSuccess(true)
        alertMessage(
          {
            type: 1,
            message: '',
          },
          'reward.success_text'
        )
        dispatchVipBetawardList() // Call the action
      } catch (error: any) {
        setErrorMessage(handleException(error?.code))
        alertMessage(
          {
            type: 0,
            message: '',
          },
          error?.message
        )
      }
    }

    // Return all state, getters, and actions
    return {
      success,
      errMessage,
      levelUpDialogVisible,
      vipInfo,
      vipLevels,
      vipTasks,
      vipRebateHistory,
      vipLevelRewardHistory,
      vipTimesHistory,
      vipSignIn,
      vipLevelUpList,
      vipLevelUpReceive,
      vipNavBarToggle,
      vipCycleawardList,
      vipLevelAward,
      vipBetawardList,

      getSuccess,
      getErrMessage,
      getVipInfo,
      getVipLevels,
      getVipTasks,
      getVipRebateHistory,
      getVipLevelRewardHistory,
      getVipTimesHistory,
      getVipSignIn,
      getLevelUpDialogVisible,
      getVipLevelUpList,
      getVipLevelUpReceive,
      getVipNavBarToggle,
      getVipCycleawardList,
      getVipLevelAward,
      getVipBetawardList,

      setSuccess,
      setErrorMessage,
      setVipInfo,
      setVipLevels,
      setVipTasks,
      setVipRebateHistory,
      setVipLevelRewardHistory,
      setVipTimesHistory,
      setVipSignIn,
      setLevelUpDialogVisible,
      setVipLevelUpList,
      setVipLevelUpReceive,
      setVipNavBarToggle,
      setVipCycleawardList,
      setVipLevelAward,
      setVipBetawardList,
      alertMessage,
      dispatchVipSignIn,
      dispatchVipSigninawardReceive,
      dispatchVipSignInReward,
      dispatchVipInfo,
      dispatchVipLevels,
      dispatchVipTasks,
      dispatchVipRebateAward,
      dispatchVipRebateHistory,
      dispatchVipLevelRewardHistory,
      dispatchVipTimesHistory,
      dispatchVipLevelUpList,
      dispatchVipLevelUpReceive,
      dispatchVipCycleawardList,
      dispatchVipCycleawardReceive,
      dispatchVipLevelAward,
      dispatchVipLevelAwardReceive,
      dispatchVipBetawardList,
      dispatchVipBetawardReceive,
    }
  },
  {
    persist: true,
  }
)

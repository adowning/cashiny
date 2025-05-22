import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
// import { over } from 'lodash-es'; // Removed lodash import as it wasn't used in the original logic

export const useAppBarStore = defineStore('appBar', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const rightBarToggle = ref(false)
  const navBarToggle = ref(true)
  const cashDialogToggle = ref(false)
  const depositDialogToggle = ref(false)
  const withdrawDialogToggle = ref(false)
  const userNavBarToggle = ref(false)
  const mainBlurEffectShow = ref(false)
  const overlayScrimShow = ref(false)
  const accountDialogShow = ref(false)
  const depositBlurEffectShow = ref(false)
  const fixPositionEnable = ref(false)
  const headerBlurEffectShow = ref(false)
  const menuBlurEffectShow = ref(false)
  const depositHeaderBlurEffectShow = ref(false)
  const depositWithdrawToggle = ref(false)
  const bonusDashboardDialogVisible = ref(false)
  const activeAccountIndex = ref(0)

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getRightBarToggle = computed(() => rightBarToggle.value)
  const getNavBarToggle = computed(() => navBarToggle.value)
  const getDepositDialogToggle = computed(() => depositDialogToggle.value)
  const getWithdrawDialogToggle = computed(() => withdrawDialogToggle.value)
  const getCashDialogToggle = computed(() => cashDialogToggle.value)
  const getUserNavBarToggle = computed(() => userNavBarToggle.value)
  const getMainBlurEffectShow = computed(() => mainBlurEffectShow.value)
  const getOverlayScrimShow = computed(() => overlayScrimShow.value)
  const getAccountDialogShow = computed(() => accountDialogShow.value)
  const getDepositBlurEffectShow = computed(() => depositBlurEffectShow.value)
  const getFixPositionEnable = computed(() => fixPositionEnable.value)
  const getHeaderBlurEffectShow = computed(() => headerBlurEffectShow.value)
  const getMenuBlurEffectShow = computed(() => menuBlurEffectShow.value)
  const getDepositHeaderBlurEffectShow = computed(() => depositHeaderBlurEffectShow.value)
  const getDepositWithdrawToggle = computed(() => depositWithdrawToggle.value)
  const getBonusDashboardDialogVisible = computed(() => bonusDashboardDialogVisible.value)
  const getActiveAccountIndex = computed(() => activeAccountIndex.value)

  // Actions converted to regular functions
  const setSuccess = (isSuccess: boolean) => {
    success.value = isSuccess
  }

  const setErrorMessage = (message: string) => {
    errMessage.value = message
  }

  const setRightBarToggle = (toggle: boolean) => {
    rightBarToggle.value = toggle
  }

  const setNavBarToggle = (toggle: boolean) => {
    navBarToggle.value = toggle
  }

  const setDepositDialogToggle = (toggle: boolean) => {
    console.log('rrrrrrrrrrrrrrrrrrrrrrrr', toggle) // Keeping original console log
    depositDialogToggle.value = toggle
  }

  const setWithdrawDialogToggle = (toggle: boolean) => {
    withdrawDialogToggle.value = toggle
  }

  const setCashDialogToggle = (toggle: boolean) => {
    cashDialogToggle.value = toggle
  }

  const setUserNavBarToggle = (toggle: boolean) => {
    userNavBarToggle.value = toggle
  }

  const setMainBlurEffectShow = (show: boolean) => {
    mainBlurEffectShow.value = show
  }

  const setOverlayScrimShow = (show: boolean) => {
    overlayScrimShow.value = show
  }

  const setAccountDialogShow = (show: boolean) => {
    accountDialogShow.value = show
  }

  const setDepositBlurEffectShow = (show: boolean) => {
    depositBlurEffectShow.value = show
  }

  const setFixPositionEnable = (enable: boolean) => {
    fixPositionEnable.value = enable
  }

  const setHeaderBlurEffectShow = (show: boolean) => {
    headerBlurEffectShow.value = show
  }

  const setMenuBlurEffectShow = (show: boolean) => {
    menuBlurEffectShow.value = show
  }

  const setDepositHeaderBlurEffectShow = (show: boolean) => {
    depositHeaderBlurEffectShow.value = show
  }

  const setDepositWithdrawToggle = (toggle: boolean) => {
    depositWithdrawToggle.value = toggle
  }

  const setBonusDashboardDialogVisible = (visible: boolean) => {
    bonusDashboardDialogVisible.value = visible
  }

  const setActiveAccountIndex = (index: number) => {
    activeAccountIndex.value = index
  }

  // Return all state, getters, and actions
  return {
    success,
    errMessage,
    rightBarToggle,
    navBarToggle,
    cashDialogToggle,
    depositDialogToggle,
    withdrawDialogToggle,
    userNavBarToggle,
    mainBlurEffectShow,
    overlayScrimShow,
    accountDialogShow,
    depositBlurEffectShow,
    fixPositionEnable,
    headerBlurEffectShow,
    menuBlurEffectShow,
    depositHeaderBlurEffectShow,
    depositWithdrawToggle,
    bonusDashboardDialogVisible,
    activeAccountIndex,

    getSuccess,
    getErrMessage,
    getRightBarToggle,
    getNavBarToggle,
    getDepositDialogToggle,
    getWithdrawDialogToggle,
    getCashDialogToggle,
    getUserNavBarToggle,
    getMainBlurEffectShow,
    getOverlayScrimShow,
    getAccountDialogShow,
    getDepositBlurEffectShow,
    getFixPositionEnable,
    getHeaderBlurEffectShow,
    getMenuBlurEffectShow,
    getDepositHeaderBlurEffectShow,
    getDepositWithdrawToggle,
    getBonusDashboardDialogVisible,
    getActiveAccountIndex,

    setSuccess,
    setErrorMessage,
    setRightBarToggle,
    setNavBarToggle,
    setDepositDialogToggle,
    setWithdrawDialogToggle,
    setCashDialogToggle,
    setUserNavBarToggle,
    setMainBlurEffectShow,
    setOverlayScrimShow,
    setAccountDialogShow,
    setDepositBlurEffectShow,
    setFixPositionEnable,
    setHeaderBlurEffectShow,
    setMenuBlurEffectShow,
    setDepositHeaderBlurEffectShow,
    setDepositWithdrawToggle,
    setBonusDashboardDialogVisible,
    setActiveAccountIndex,
  }
})

// export const appBarStore = useAppBarStore()

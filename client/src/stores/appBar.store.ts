import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions

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

  // State from refferal.store.ts
  const refferalAppBarShow = ref(true) //
  const refferalDialogVisible = ref(false) //

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

  // Getters from refferal.store.ts
  const getRefferalAppBarShow = computed(() => refferalAppBarShow.value) //
  const getRefferalDialogVisible = computed(() => refferalDialogVisible.value) //

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
    console.log('rrrrrrrrrrrrrrrrrrrrrrrr', toggle)
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

  // Actions from refferal.store.ts
  const setRefferalAppBarShow = (show: boolean) => {
    //
    refferalAppBarShow.value = show
  }

  const setRefferalDialogShow = (visible: boolean) => {
    //
    refferalDialogVisible.value = visible
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
    refferalAppBarShow, // Added from refferal.store.ts
    refferalDialogVisible, // Added from refferal.store.ts

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
    getRefferalAppBarShow, // Added from refferal.store.ts
    getRefferalDialogVisible, // Added from refferal.store.ts

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
    setRefferalAppBarShow, // Added from refferal.store.ts
    setRefferalDialogShow, // Added from refferal.store.ts
  }
})

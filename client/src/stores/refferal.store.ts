import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions

export const useRefferalStore = defineStore('refferal', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const refferalAppBarShow = ref(true)
  const refferalDialogVisible = ref(false)

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getRefferalAppBarShow = computed(() => refferalAppBarShow.value)
  const getRefferalDialogVisible = computed(() => refferalDialogVisible.value)

  // Actions converted to regular functions
  const setRefferalAppBarShow = (show: boolean) => {
    refferalAppBarShow.value = show
  }

  const setRefferalDialogShow = (visible: boolean) => {
    refferalDialogVisible.value = visible
  }

  // Return all state, getters, and actions
  return {
    success,
    errMessage,
    refferalAppBarShow,
    refferalDialogVisible,

    getSuccess,
    getErrMessage,
    getRefferalAppBarShow,
    getRefferalDialogVisible,

    setRefferalAppBarShow,
    setRefferalDialogShow,
  }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
// import { over } from 'lodash-es'; // Removed lodash import as it wasn't used in the original logic

export const useGlobalStore = defineStore('global', () => {
  const loading = ref(false)

  const startLoading = () => {
    loading.value = true
  }
  const finishLoading = () => {
    loading.value = false
  }

  const isLoading = computed(() => loading.value)

  return {
    startLoading,
    finishLoading,
    isLoading,
  }
})

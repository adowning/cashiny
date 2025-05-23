// useLoading.js
import { ref } from 'vue'

export function useLoading() {
  const activeLoaders = ref<string[]>([])
  const isLoading = computed(() => activeLoaders.value.length > 0) // Last received message

  const addLoader = (name: string) => {
    activeLoaders.value.push(name)
  }

  const removeLoader = (name: string) => {
    activeLoaders.value = activeLoaders.value.filter((myname) => myname !== name)
  }

  const withLoading = async (promise: any) => {
    console.log(promise.toString())
    addLoader(promise.toString())
    try {
      return await promise
    } finally {
      removeLoader(promise.toString())
    }
  }

  return {
    isLoading,
    addLoader,
    removeLoader,
    withLoading,
    activeLoaders,
  }
}

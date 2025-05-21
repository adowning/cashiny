import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { NETWORK_CONFIG } from '@cashflow/types'
import type * as Currency from '@cashflow/types'
import { handleException } from './exception'
import { Network } from '@/utils/Network'

export const useCurrencyStore = defineStore('useCurrencyStore', () => {
  const success = ref(false)
  const errMessage = ref('')
  const currencyList = ref<Array<Currency.GetCurrencyBalanceList>>([])

  const getCurrencyList = computed(() => currencyList.value)

  const dispatchCurrencyList = async () => {
    success.value = false
    const route: string = NETWORK_CONFIG.CURRENCY.CURRENCY_LIST
    const network: Network = Network.getInstance()

    // response call back function
    const next = (response: Currency.GetCurrencyBalanceListResponse) => {
      if (response.code == 200) {
        console.log(response.code)
        success.value = true
        currencyList.value = response.data
      } else {
        errMessage.value = handleException(response.code)
      }
    }
    await network.sendMsg(route, {}, next, 1, 4)
  }

  return {
    success,
    errMessage,
    currencyList,
    getCurrencyList,
    dispatchCurrencyList,
  }
})

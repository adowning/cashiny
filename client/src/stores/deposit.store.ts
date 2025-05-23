import { computed, ref } from 'vue'

import useApiClient from '@/composables/useApiClient'
// Assuming this path is correct
import {
  DepositHistoryResponse,
  GetPixInfo,
  InitializeDepositDto,
  OperatorData,
  Product,
} from '@cashflow/types'
import { defineStore } from 'pinia'

// Import reactive functions
import { handleException } from './exception'

export const useDepositStore = defineStore('deposit', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const depositConfig = ref<any>({
    // Keeping 'any' type as in original
    bonus: [
      {
        type: 0,
      },
    ],
  })
  const depositSubmit = ref<any>({}) // Keeping 'any' type as in original
  const pixInfo = ref<GetPixInfo>({} as GetPixInfo) // Keeping type assertion as in original
  const pixInfoToggle = ref(false)
  const shopOpen = ref(false)
  const products = ref<Omit<Product, 'operator' | 'transactions'>[]>([])
  const selectedPaymentMethod = ref<string>('')
  const selectedProduct = ref<Omit<Product, 'operator' | 'transactions'>>()
  const operatorData = ref<OperatorData>()
  const depositHistoryItem = ref<DepositHistoryResponse>({} as DepositHistoryResponse) // Keeping type assertion as in original

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getDepositCfg = computed(() => depositConfig.value)
  const getDepositSubmit = computed(() => depositSubmit.value)
  const getPixInfo = computed(() => pixInfo.value)
  const getPixInfoToggle = computed(() => pixInfoToggle.value)
  const getDepositHistoryItems = computed(() => depositHistoryItem.value.record)
  const getProducts = computed(() => products.value)
  const getOperatorData = computed(() => operatorData.value)
  const getSelectedPaymentMethod = computed(() => selectedPaymentMethod.value)
  const getSelectedProduct = computed(() => selectedProduct.value)

  // Actions converted to regular functions
  const setSuccess = (isSuccess: boolean) => {
    success.value = isSuccess
  }
  const toggleShopOpen = () => {
    shopOpen.value = !shopOpen.value
    console.log(shopOpen.value)
  }
  const setSelectedPaymentMethod = (method: string) => {
    selectedPaymentMethod.value = method
  }
  const setSelectedProduct = (product: Omit<Product, 'operator' | 'transactions'>) => {
    selectedProduct.value = product
  }
  const setErrorMessage = (message: string) => {
    errMessage.value = message
  }

  const setDepositCfg = (config: any) => {
    // Keeping 'any' type as in original
    depositConfig.value = config
  }

  const setDepositSubmit = (submit: any) => {
    // Keeping 'any' type as in original
    depositSubmit.value = submit
  }

  const setPixInfo = (info: GetPixInfo) => {
    pixInfo.value = info
  }

  const setPixInfoToggle = (toggle: boolean) => {
    pixInfoToggle.value = toggle
  }

  const setDepositHistoryItem = (item: DepositHistoryResponse) => {
    depositHistoryItem.value = item
  }

  const setProducts = (items: Product[]) => {
    const mappedProducts: Omit<Product, 'operator' | 'transactions'>[] = items.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      url: product.url,
      productType: product.productType,
      bonusCode: product.bonusCode,
      bonusTotalInCredits: product.bonusTotalInCredits,
      priceInCents: product.priceInCents,
      amountToReceiveInCredits: product.amountToReceiveInCredits,
      bestValue: product.bestValue,
      discountInCents: product.discountInCents,
      bonusSpins: product.bonusSpins,
      isPromo: product.isPromo,
      totalDiscountInCents: product.totalDiscountInCents,
      shopId: product.shopId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }))
    products.value = mappedProducts
  }
  const setOperatorData = (item: OperatorData) => {
    operatorData.value = item
  }
  const { deposit: depositApi } = useApiClient()
  const dispatchProducts = async () => {
    setSuccess(false)
    try {
      const response = await depositApi.getProducts()
      setSuccess(true)
      setProducts(response)
    } catch (error: any) {
      setErrorMessage(handleException(error.code))
    }
  }
  const dispatchCancelPending = async () => {
    setSuccess(false)
    try {
      const response = await depositApi.cancelPending()
      console.log(response)
      setSuccess(true)
      if (response > 0) await dispatchUserDepositHistory()
    } catch (error: any) {
      setErrorMessage(handleException(error.code))
    }
  }

  const dispatchOperatorData = async () => {
    setSuccess(false)
    try {
      const response = await depositApi.getOperatorData()
      console.log(response.operator.products)
      setSuccess(true)
      setOperatorData(response.operator)
    } catch (error: any) {
      setErrorMessage(handleException(error.code))
    }
  }
  // user deposit configuration
  const dispatchUserDepositCfg = async () => {
    setSuccess(false)
    try {
      const response = await depositApi.getDepositMethods()
      setSuccess(true)
      setDepositCfg(response)
    } catch (error: any) {
      setErrorMessage(handleException(error.code))
    }
  }

  // user deposit submit
  const dispatchUserDepositSubmit = async (data: InitializeDepositDto) => {
    setSuccess(false)
    try {
      const response = await depositApi.initializeDeposit(data)
      console.log(response)
      setDepositSubmit(response)
      setSuccess(true)
    } catch (error: any) {
      setErrorMessage(handleException(error.code))
    }
  }

  // user deposit history
  const dispatchUserDepositHistory = async () => {
    setSuccess(false)
    try {
      const info = await depositApi.getDepositHistory()
      setSuccess(true)
      setDepositHistoryItem(info)
    } catch (e: any) {
      console.log(e)
      setSuccess(false)
      setErrorMessage(handleException(e.code))
    }
  }

  // Return all state, getters, and actions
  return {
    shopOpen,
    toggleShopOpen,
    dispatchProducts,
    getProducts,
    dispatchOperatorData,
    getOperatorData,
    getSelectedPaymentMethod,
    setSelectedPaymentMethod,
    getSelectedProduct,
    dispatchCancelPending,
    setSelectedProduct,
    errMessage,
    depositConfig,
    depositSubmit,
    pixInfo,
    pixInfoToggle,
    depositHistoryItem,
    operatorData,
    getSuccess,
    getErrMessage,
    getDepositCfg,
    getDepositSubmit,
    getPixInfo,
    getPixInfoToggle,
    getDepositHistoryItems,

    setSuccess,
    setErrorMessage,
    setDepositCfg,
    setDepositSubmit,
    setPixInfo,
    setPixInfoToggle,
    setDepositHistoryItem,
    dispatchUserDepositCfg,
    dispatchUserDepositSubmit,
    dispatchUserDepositHistory,
  }
})

// export const depositStore = useDepositStore()

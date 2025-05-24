<script lang="ts" setup>
  import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { useAuthStore } from '@/stores/auth.store'
  import { useDepositStore } from '@/stores/deposit.store'
  import { useEventManager } from '@/composables/EventManager' // Assuming this path
  import type { DepositHistoryItem } from '@cashflow/types' // Assuming User type is available
  import PlayerAvatar from './PlayerAvatar.vue' // Explicitly import the child component

  const PENDING_DEPOSIT_TIMEOUT_MS = 3600000 // 1 hour in milliseconds

  // Router and Event Bus
  const router = useRouter()
  const eventBus = useEventManager()

  // Stores
  const authStore = useAuthStore()
  const depositStore = useDepositStore()

  // Store State & Getters
  const { currentUser, isAuthenticated } = storeToRefs(authStore)
  const { getDepositHistoryItems: depositHistoryFromStore } = storeToRefs(depositStore) // Use storeToRefs for getters too
  const { dispatchUserDepositHistory } = depositStore

  // Local Reactive State
  const localDepositItems = ref<DepositHistoryItem[]>([]) // Local mutable copy if needed for splicing
  const countdownActive = ref(false)
  const sparkle = ref(false) // This seems to be for the PlayerAvatar child
  const currentExp = ref(0) // This is for PlayerAvatar child, manage its source
  const maxExp = ref(100) // This is for PlayerAvatar child

  const remainingMinutes = ref(0)
  const remainingSecondsDisplay = ref(0)
  let countdownInterval: ReturnType<typeof setInterval> | undefined = undefined // Compatible with both Node.js and browser

  // Computed Properties
  const userBalance = computed(() => {
    // Assuming balance is on `currentUser.value.profile.balance`
    // Adjust if your User/Profile structure is different.
    // Check `currentUser.value?.profile?.balance` if profile can be undefined.
    // For now, let's assume User has a profile and balance, or use a default.
    return currentUser.value?.profile?.balance ?? '0.00'
  })

  const activePendingDeposit = computed(() => {
    return localDepositItems.value.find((item) => item.status === 'PENDING')
  })

  const formattedCountdown = computed(() => {
    if (!countdownActive.value) return ''
    return remainingMinutes.value > 0
      ? `${remainingMinutes.value}m ${remainingSecondsDisplay.value}s`
      : `0m ${remainingSecondsDisplay.value}s`
  })

  // Methods
  function openSettingsModal() {
    eventBus.emit('settingsModal', true)
  }

  function navigateToProfile() {
    router.push('/client/profile')
  }

  function startOrUpdateCountdown(deposit?: DepositHistoryItem) {
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = undefined
    }

    const pendingDeposit = deposit || activePendingDeposit.value
    if (!pendingDeposit || pendingDeposit.status !== 'PENDING') {
      countdownActive.value = false
      return
    }

    const startDate = new Date(pendingDeposit.createdAt)
    const endDate = new Date(startDate.getTime() + PENDING_DEPOSIT_TIMEOUT_MS)

    function updateTimer() {
      if (pendingDeposit === undefined) {
        countdownActive.value = false
        return
      }
      const now = new Date()
      const timeDifference = endDate.getTime() - now.getTime()
      const totalSecondsRemaining = Math.max(0, Math.floor(timeDifference / 1000))

      remainingMinutes.value = Math.floor(totalSecondsRemaining / 60)
      remainingSecondsDisplay.value = totalSecondsRemaining % 60

      if (totalSecondsRemaining <= 0) {
        clearInterval(countdownInterval)
        countdownInterval = undefined
        countdownActive.value = false
        console.log('Countdown finished for deposit ID:', pendingDeposit.id)
        // Handle expired deposit - ideally, this should be an action in the store
        // For example: depositStore.handleExpiredDeposit(pendingDeposit.id)
        // The direct splice here is a side effect that might be better managed in the store
        // after an API call confirms cancellation or expiration.
        const index = localDepositItems.value.findIndex((item) => item.id === pendingDeposit.id)
        if (index > -1) {
          // localDepositItems.value.splice(index, 1) // Or update its status
          // Instead of splicing, it's better to refetch or let the store update its state
          // and this component will react to it.
          // For now, we'll just mark it as inactive here.
        }
        // Potentially refetch deposit history or let WebSocket update handle it
        // dispatchUserDepositHistory();
      } else {
        countdownActive.value = true
      }
    }

    updateTimer() // Initial call
    if (endDate.getTime() > new Date().getTime()) {
      countdownInterval = setInterval(updateTimer, 1000)
    }
  }

  // Watchers
  watch(
    depositHistoryFromStore,
    (newItems) => {
      console.log(localDepositItems)
      if (newItems?.length > 0) {
        localDepositItems.value = [...newItems] // Keep a local reactive copy
        const pending = newItems.find((item) => item.status === 'PENDING')
        if (pending) {
          startOrUpdateCountdown(pending)
        } else {
          if (countdownInterval) clearInterval(countdownInterval)
          countdownActive.value = false
        }
      }
    },
    { deep: true, immediate: true }
  ) // Immediate to run on component mount if history is already there

  // Event Bus Handlers
  // The 'updatePurchases' event logic was commented out.
  // If needed, it should be implemented clearly. For example:
  eventBus.on('updatePurchases', (updatedPurchase: DepositHistoryItem) => {
    console.log('Received updatePurchases event:', updatedPurchase)
    // Find and update the item in localDepositItems or dispatch an action to the store
    const index = localDepositItems.value.findIndex((item) => item.id === updatedPurchase.id)
    if (index !== -1) {
      localDepositItems.value.splice(index, 1, updatedPurchase)
    } else if (updatedPurchase.status === 'PENDING') {
      localDepositItems.value.unshift(updatedPurchase) // Add new pending
    }
    // Re-evaluate countdown if necessary
    const currentPending = localDepositItems.value.find((item) => item.status === 'PENDING')
    startOrUpdateCountdown(currentPending)
  })

  // Lifecycle Hooks
  onMounted(async () => {
    if (isAuthenticated.value) {
      // Fetch only if authenticated
      await dispatchUserDepositHistory()
    }
    // Example: currentExp could be fetched or derived from currentUser or vipInfo
    // if (currentUser.value) {
    //   currentExp.value = currentUser.value.totalXp || 0;
    // }
  })

  onUnmounted(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval)
    }
    // eventBus.off('updatePurchases') // If the listener was added
  })
</script>

<template>
  <div class="flex w-full animate__animated animate__slideInDown">
    <div class="tbar flex flex-row justify-between items-center w-full px-2">
      <div class="flex flex-row items-center">
        <PlayerAvatar
          class="z-[99] w-[55px] cursor-pointer"
          :current-exp="currentExp"
          :sparkle="sparkle"
          :max-exp="maxExp"
          @click="navigateToProfile"
        />
        <div id="PlayerCredits" class="flex flex-col text-white pl-2 text-center">
          <div
            v-if="countdownActive"
            class="flex items-center text-sm font-semibold h-[20px] mb-0.5"
          >
            <img src="/images/layout/cashappicon.avif" alt="CashApp" class="w-3.5 h-3.5 mr-1.5" />
            <span class="leading-none">Ends: {{ formattedCountdown }}</span>
          </div>
          <div v-else class="h-[20px] mb-0.5" />

          <div
            class="glow-light flex items-center justify-center h-[30px] min-w-[100px] max-w-[120px] px-2 text-xl font-semibold bg-cover bg-center"
            style="background-image: url('/images/layout/money_backing.png')"
          >
            <span
              v-if="currentUser"
              class="glow color-white leading-none tracking-tight font-extrabold"
            >
              {{ userBalance }}
            </span>
          </div>
        </div>
      </div>

      <div
        class="relative w-[50px] h-[50px] cursor-pointer p-1 z-[999999]"
        @click="openSettingsModal"
      >
        <img
          src="/images/layout/settings.avif"
          alt="Settings"
          class="w-full h-full object-contain"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .tbar {
    background-size: cover;
    /* position: absolute; */ /* Removed to be part of flex flow */
    width: 100%;
    min-height: 62px; /* Use min-height for responsiveness */
    max-height: 62px;
    background-position: center;
    /* top: 0px; */ /* Handled by flex layout */
    /* left: 0px; */ /* Handled by flex layout */
    background-repeat: no-repeat;
    background-image: url('/images/layout/topback.png');
    /* Consider adding padding directly here if consistent or use Tailwind padding on child elements */
  }

  /* Removed .moveout and @keyframes moveout as it wasn't used in the template */

  /* If .glow and .glow-light are purely for text effects,
   consider Tailwind's text-shadow utilities or custom plugins.
   If they are more complex, keeping them here is fine.
*/
  .glow {
    font-size: 22px;
    color: #fff;
    text-align: center;
    letter-spacing: 1.5px;
    /* font-family: 'Hind Guntur', sans-serif; */
    /* font-weight: 800;
  font-style: normal; */
    /* animation: 'glow'; */
    text-shadow:
      1px 1px 3px #c74dff,
      0 0 2px #c74dff,
      0 0 4px #720fc4;
  }
</style>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, toRefs } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAuthStore } from '@/stores/auth.store'
  import { useVipStore } from '@/stores/vip.store'
  import { useEventManager } from '@/composables/EventManager' // Assuming this is the correct path
  // If CircleProgressBar and SparklesSprite are globally registered, no import needed.
  // Otherwise, import them here:
  // import CircleProgressBar from '@/components/CircleProgressBar.vue'
  // import SparklesSprite from '@/components/SparklesSprite.vue'

  // Props
  interface Props {
    sparkle?: boolean
  }
  const props = withDefaults(defineProps<Props>(), {
    sparkle: false,
  })

  // Stores
  const authStore = useAuthStore()
  const vipStore = useVipStore() // Use the store instance directly

  const { currentUser } = storeToRefs(authStore)
  // It's generally better to get reactive state from the store using storeToRefs or computed properties
  // to ensure reactivity is maintained.
  const vipInfo = computed(() => vipStore.getVipInfo) // Assuming getVipInfo is a getter or a reactive object

  // Constants
  const XP_LEVEL_SCALE = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000]

  // Local State
  const gainingExp = ref(false)
  const circleRef = ref<HTMLElement | null>(null) // For the glow effect, if still needed

  // Event Bus
  const eventBus = useEventManager()

  // Computed Properties
  const currentLevel = computed(() => vipInfo.value.level || 0)
  const currentBetExp = computed(() => vipInfo.value.bet_exp || 0)
  const currentRankBetExp = computed(() => vipInfo.value.rank_bet_exp || 0)
  const currentUserTotalXp = computed(() => currentUser.value?.totalXp || 0)
  const currentUsername = computed(() => currentUser.value?.username || '')
  const currentUserImage = computed(() => currentUser.value?.avatarUrl || 'avatar-10.webp') // Provide a default

  const nextXpThreshold = computed(() => {
    if (currentLevel.value >= 0 && currentLevel.value < XP_LEVEL_SCALE.length) {
      return XP_LEVEL_SCALE[currentLevel.value]
    }
    return Infinity // Or a very large number if level is out of bounds
  })

  // const xpPercentageToNextLevel = computed(() => {
  //   if (nextXpThreshold.value === 0 || nextXpThreshold.value === Infinity) return 0
  //   const expTowardsNext = currentBetExp.value % nextXpThreshold.value // XP accumulated within the current level
  //   const requiredForLevel = nextXpThreshold.value - (XP_LEVEL_SCALE[currentLevel.value - 1] || 0) // Total XP needed for this specific level
  //   if (requiredForLevel === 0) return 100 // Avoid division by zero if already at max XP for level 0 or error
  //   return Math.min((currentBetExp.value / nextXpThreshold.value) * 100, 100) // Percentage of currentBetExp towards the next threshold
  // })

  // const betRatePercentage = computed(() => {
  //   if (!currentRankBetExp.value) return 0 // Avoid division by zero
  //   const rate = (currentBetExp.value / currentRankBetExp.value) * 100
  //   return Math.min(rate, 100) // Cap at 100%
  // })

  const displayUsername = computed(() => {
    return currentUsername.value.substring(0, 8)
  })

  const usernameFontSizeClass = computed(() => {
    return (currentUsername.value?.length || 0) <= 6 ? 'text-lg' : 'text-base' // Using Tailwind classes
  })

  // Methods
  function showProfileModal() {
    eventBus.emit('profileOpen', true)
  }

  function pulseGlowEffect() {
    if (circleRef.value) {
      circleRef.value.classList.add('glow')
      setTimeout(() => {
        circleRef.value?.classList.remove('glow')
      }, 2000)
    }
  }

  // Watchers
  watch(
    () => props.sparkle,
    (isSparkling) => {
      if (isSparkling) {
        pulseGlowEffect()
      }
    }
  )

  // Event Bus Listener
  onMounted(() => {
    eventBus.on('gainingExp', () => {
      // const expNeeded = nextXpThreshold.value - currentBetExp.value
      // console.log('XP Needed for next level:', expNeeded)
      // Consider if a visual cue for gainingExp is still needed or if the progress bar updates are sufficient
      setTimeout(() => {
        gainingExp.value = true // This might trigger some UI change, e.g., an animation
        // Potentially reset gainingExp after an animation
        // setTimeout(() => gainingExp.value = false, 1000);
      }, 500)
    })
  })
</script>

<template>
  <div v-if="currentUser" class="relative w-[60px] h-[70px] ml-[15px] mt-[1px] z-[2]">
    <div class="relative w-[60px] h-[60px] z-[999]">
      <div
        ref="circleRef"
        class="player-avatar-wrapper flex items-center justify-center overflow-hidden rounded-full w-full h-full"
        :class="{ glow: sparkle }"
      >
        <div
          class="absolute inset-0 bg-cover bg-center rounded-full z-0"
          :style="{
            backgroundImage: `url('/images/avatars/${currentUserImage}')`,
          }"
        />

        <CircleProgressBar
          stroke-width="10"
          :value="currentUserTotalXp"
          :max="nextXpThreshold"
          color-unfilled="yellow"
          animation-duration="1s"
          color-filled="green"
          color-back="red"
          :start-angle="280"
          class="absolute inset-[-2px] w-[calc(100%+4px)] h-[calc(100%+4px)] z-[1]"
        />
      </div>
    </div>

    <div
      class="absolute left-[-10px] leading-3 bottom-[-0px] z-[999] min-w-[80px] px-2 py-0.5 bg-white opacity-99 rounded border border-[#6f14a3] shadow-[0px_0px_4px_#6f14a3] text-black font-extrabold text-center"
      :class="[usernameFontSizeClass]"
    >
      <span class="leading-3 font-bold Bronzier">{{ displayUsername }}</span>
    </div>

    <div
      class="absolute top-[18px] left-[-14px] w-[36px] h-[36px] z-[9999] bg-cover cursor-pointer"
      style="background-image: url('/images/avatars/level-star.avif')"
      @click="showProfileModal"
    >
      <div class="flex items-center justify-center h-full text-lg font-['bungee'] text-black">
        {{ currentLevel }}
      </div>
    </div>

    <div v-if="sparkle" class="absolute left-[-5px] top-[-4px] w-[60px] h-[30px] z-[999999]">
      <SparklesSprite />
    </div>
  </div>
</template>

<style scoped>
  /* Prefer Tailwind for styling, but keep complex animations or specific CSS here */
  .font-\[\'bungee\'\] {
    /* Example if not using arbitrary Tailwind values directly */
    font-family: 'bungee', sans-serif;
  }

  .glow {
    animation: pulse-glow 2s ease-in-out;
  }

  @keyframes pulse-glow {
    0%,
    100% {
      filter: drop-shadow(0 0 5px theme('colors.purple.400')); /* Using Tailwind theme */
    }
    50% {
      filter: drop-shadow(0 0 20px theme('colors.purple.300'));
    }
  }

  /* Removed other CSS that can be replaced by Tailwind or is no longer used
   (e.g., .progress, .circle-progress definitions, input[type=range], .img-wrap)
   If CircleProgressBar needs specific global styles, they should be defined where it's globally styled.
*/

  .player-avatar-wrapper {
    /* Base styles if needed, Tailwind classes are preferred for positioning/sizing */
  }
</style>

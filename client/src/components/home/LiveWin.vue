<script setup lang="ts">
  import { computed, onMounted, ref, watchEffect } from 'vue'
  import { useRouter } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { Swiper, SwiperSlide } from 'swiper/vue'
  import { Autoplay, Navigation, Pagination } from 'swiper/modules'
  import InlineSvg from 'vue-inline-svg'

  // Local Assets
  // import iconPublic91 from "@/assets/bigwin/icon_public_91.svg"; // Renamed for convention
  import defaultGameLogo from '@/assets/logo.png' // Renamed for clarity
  import imgWinPlaceholder1 from '@/assets/bigwin/img_win_01.png'
  import imgWinPlaceholder2 from '@/assets/bigwin/img_win_02.png'
  import imgWinPlaceholder3 from '@/assets/bigwin/img_win_03.png'

  // Stores & Composables
  import { useGameStore } from '@/stores/game.store'

  // Utils & Styles
  import vipLevelGroups from '@/utils/vipLevelGroups' // Data for VIP emblems
  import 'swiper/css'
  import 'swiper/css/pagination'
  // import type { GameBigWinData, LuckyBet, HighRoller } from '@cashflow/types' // Assuming these types

  interface AssumedGameWinItem {
    game_id: string // Used for navigation: goGame(item)
    game_icon: string // Used for display: <img :src="item.game_icon" />
    game_name?: string // Good for alt text, even if not explicitly used everywhere
    user_name: string // Used for display: <p>{{ item.user_name }}</p>
    user_vip_group: number // Used for VIP emblem: vipLevelGroups[item.user_vip_group]
    win_amount: string // Used for display: ${{ item.win_amount }}
    time?: number // Considered for generating a unique key later
    bet_id?: string | number // Was used in an earlier key: `mobile-${item.bet_id || index}`
    // This shows I was anticipating some form of unique ID.
    // Other properties like user_vip_level, bet_amount, multiplier might have been present
    // in the actual data but weren't strictly required by the template logic I was refactoring at that exact moment.
  }

  // And the overall data structure assumption would have been:
  // interface AssumedGameBigWinData {
  //   high_rollers: Array<AssumedGameWinItem>;
  //   lucky_bets: Array<AssumedGameWinItem>;
  //   // I also previously had jackpot_winners in my default structure,
  //   // which I removed once you provided the more specific GameBigWinData.
  // }
  export interface GameBigWinItem {
    game_id: string
    game_name: string
    game_icon: string
    user_name: string
    user_vip_group: number
    user_vip_level: number // New, wasn't explicitly used in my earlier refactor's template
    bet_amount: string // New
    multiplier: string // New
    win_amount: string
    time: number // New (or made explicit), good for keys
  }

  export interface GameBigWinData {
    high_rollers: Array<GameBigWinItem>
    lucky_bets: Array<GameBigWinItem>
  }
  interface LiveWinItem extends GameBigWinItem {
    // Or a common type if lucky_bets and high_rollers differ significantly
    processed_game_icon: string
    // user_vip_emblem: string; // This will be resolved directly in template from vipLevelGroups
  }
  // This is what I would have been implicitly assuming for items
  // within gameBigWinData.lucky_bets and gameBigWinData.high_rollers

  const MOBILE_BREAKPOINT = 600 // px

  // Composable Instances
  const { getClientWidth } = useDisplay() // Assuming getClientWidth is a Ref<number>
  const gameStore = useGameStore()
  const router = useRouter()

  // Store State & Actions
  const { gameBigWinItem: rawGameBigWinItem } = storeToRefs(gameStore) // Reactive access
  const { dispatchGameBigWin } = gameStore

  // Swiper Modules
  const swiperModules = [Pagination, Autoplay, Navigation]

  // Local State
  const svgIconColor = ref<string>('#7782AA') // Consider if this needs to be dynamic or can be CSS
  const liveWinBodyRef = ref<HTMLElement | null>(null) // For desktop Swiper calculations

  // Placeholder images for desktop view's random game image
  const desktopPlaceholders = [imgWinPlaceholder1, imgWinPlaceholder2, imgWinPlaceholder3]

  // --- Computed Properties ---

  const isMobileView = computed(() => getClientWidth() < MOBILE_BREAKPOINT)

  const gameBigWinData = computed<GameBigWinData>(() => {
    // Provide a default structure if rawGameBigWinItem could be null/undefined initially
    return rawGameBigWinItem.value || { lucky_bets: [], high_rollers: [], jackpot_winners: [] }
  })

  // Combined and processed list for the mobile Swiper
  const mobileLiveWinList = computed<LiveWinItem[]>(() => {
    const combinedList = [
      ...(gameBigWinData.value.lucky_bets || []),
      ...(gameBigWinData.value.high_rollers || []),
    ]
    return combinedList.map((item) => ({
      ...item,
      processed_game_icon: item.game_icon
        ? item.game_icon.replace('/images/games', 'https://images.cashflowcasino.com')
        : defaultGameLogo,
    }))
  })

  // For desktop, it seems to only use lucky_bets and a random placeholder.
  // If this is intentional, we keep it separate. Otherwise, it could also use mobileLiveWinList.
  const desktopLuckyBets = computed<LiveWinItem[]>(() => {
    return (gameBigWinData.value.lucky_bets || []).map((item) => ({
      ...item,
      processed_game_icon: item.game_icon // Placeholder, as desktop uses random image
        ? item.game_icon.replace('/images/games', 'https://images.cashflowcasino.com')
        : defaultGameLogo,
    }))
  })

  // Desktop Swiper Parameters - Calculated dynamically
  const desktopSlidesPerView = ref(6) // Default, will be updated
  const desktopSpaceBetween = ref(10) // Default

  watchEffect(() => {
    if (!isMobileView.value && liveWinBodyRef.value) {
      const containerWidth = liveWinBodyRef.value.clientWidth
      // Example logic: Assume each item is roughly 100px wide + 10px margin
      const itemApproxWidth = 110
      let count = Math.floor(containerWidth / itemApproxWidth)
      count = Math.max(1, count) // Ensure at least 1 slide

      if (count > 0) {
        desktopSlidesPerView.value = count
        // Calculate margin to fill space or maintain a fixed margin
        // This is a simplified example; Swiper's 'auto' or 'freeMode' might be better
        // if exact fitting is complex.
        const totalMarginSpace = containerWidth - count * (itemApproxWidth - 10) // 10 is placeholder for item content width
        desktopSpaceBetween.value =
          count > 1 ? Math.max(8, totalMarginSpace / (count - 1) / count) : 0
        desktopSpaceBetween.value = Math.max(
          8,
          Math.floor((containerWidth - count * 100) / (count > 1 ? count : 1))
        )
      } else {
        desktopSlidesPerView.value = 1 // Fallback for very small containers
        desktopSpaceBetween.value = 0
      }
    } else if (isMobileView.value) {
      // Reset or set mobile defaults if needed, though Swiper instances are distinct
    }
  })

  // --- Methods ---

  const svgIconTransformer = (el: SVGElement) => {
    // Simplified: query all relevant elements and set fill
    el.querySelectorAll('path, circle, rect, polygon, line, ellipse').forEach((node) => {
      node.setAttribute('fill', svgIconColor.value)
    })
    return el
  }

  const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    target.src = defaultGameLogo
    target.classList.add('object-contain') // More Tailwind-idiomatic
  }

  const navigateToGame = (item: Pick<LiveWinItem, 'game_id'>) => {
    if (item.game_id) {
      router.push(`/game/${item.game_id}`)
    }
  }

  const getRandomDesktopPlaceholder = () => {
    return desktopPlaceholders[Math.floor(Math.random() * desktopPlaceholders.length)]
  }

  // --- Lifecycle Hooks ---
  onMounted(async () => {
    // await dispatchGameBigWin()
  })
</script>

<template>
  <div
    v-if="isMobileView"
    class="m-home-live-win flex"
    style="background-size: 3% 100%; background-position-x: right"
  >
    <div class="flex" style="width: 20px"></div>

    <div
      v-if="isMobileView"
      class="flex"
      style="
        background-image: url('/images/bigwin/bigwin-right-pink.png');

        background-size: 3% 100%;

        background-position-x: right;
      "
    >
      <img src="/images/bigwin/bigwin-left-pink.png" style="height: 133px; margin-left: -20px" />

      <div class="flex w-[90vw]"></div>

      <!-- <div class="live-win-header">

<inline-svg

:src="icon_public_91"

width="16"

height="16"

:transform-source="svgIconTransform"

style="margin-top: 2px"

></inline-svg>

<p class="text-900-10 gray ml-1">Live Win</p>

</div> -->

      <div
        class="live-win-body ml-0"
        style="
          margin-left: -12px;

          /* background-image: url('/images/bigwin-right.png');

background-size: 3% 100%; */
        "
      >
        <!--
       :autoplay="{
            delay: 600,

            disableOnInteraction: false,
          }"
          -->
        <Swiper
          :modules="swiperModules"
          :slides-per-view="4.5"
          :space-between="4"
          :loop="true"
          :autoplay="{
            delay: 800,

            disableOnInteraction: false,
          }"
          class="mx-2"
          style="height: auto"
        >
          <SwiperSlide
            v-for="(item, index) in mobileLiveWinList"
            :key="index"
            :virtual-index="index"
            @click="navigateToGame(item)"
          >
            <div class="text-center">
              <img
                :src="item.processed_game_icon || '@/assets/logo.png'"
                class="live-win-img"
                @error="handleImageError"
              />

              <div class="live-win-level-text">
                <img :src="vipLevelGroups[item.user_vip_group]" width="12" />

                <p class="text-500-8 white ml-1">{{ item.user_name }}</p>
              </div>

              <div class="text-900 font-bold color-12FF76">${{ item.win_amount }}</div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </div>

  <div v-else class="m-home-live-win">
    <!-- <div class="live-win-header">

<inline-svg

:src="icon_public_91"

width="24"

height="24"

:transform-source="svgIconTransform"

></inline-svg>

<p class="text-700-22 gray ml-2">Live Win</p>

</div> -->
    <!--
<div class="live-win-body" ref="liveWinBody">

<Swiper

:modules="swiperModules"

:slidesPerView="5"

:spaceBetween="8"

:autoplay="{

delay: 600,

disableOnInteraction: false,

}"

class="mx-2"

style="height: auto"

>

<SwiperSlide

v-for="(item, index) in mobileLiveWinList"

:key="index"

:virtualIndex="index"

@click="navigateToGame(item)"

>

<div class="text-center">

<img  :src="item.processed_game_icon" class="live-win-img" />

<div class="live-win-level-text">

<img :src="vipLevelGroups[item.user_vip_group]" width="21" />

<p class="text-400-14 white ml-2">{{ item.user_name }}</p>

</div>

<div class="text-900-18 color-12FF76">${{ item.win_amount }}</div>

</div>

</SwiperSlide>

</Swiper>

</div> -->
  </div>
</template>

<style scoped>
  .color-12FF76 {
    color: #12ff76;
  }

  .m-home-live-win {
    height: 133px;

    position: relative;

    margin: 0px 0px 0px 10px;
  }

  .m-home-live-win .m-live-win-img-width {
    width: 100%;
  }

  .m-home-live-win .live-win-header {
    position: absolute;

    top: 3px;

    left: 10px;

    display: flex;

    align-items: center;
  }

  .m-home-live-win .live-win-body {
    position: absolute;

    height: 113px;

    top: 10px;

    width: 100%;

    max-height: 113px;
  }

  .m-home-live-win .live-win-img {
    width: 95%;

    aspect-ratio: 1;

    object-fit: cover;

    border-radius: 8px;
  }

  .m-home-live-win .live-win-level-text {
    display: flex;

    align-items: center;
    letter-spacing: 0.1;
    font-size: 12px;
    margin: 0px 0px;
    line-height: 1;

    justify-content: center;
  }

  .home-live-win {
    position: relative;

    margin: 28px 16px 0px 16px;

    background-image: url('@/images/bigwin/bigwin-left-pink.png');

    background-size: cover;

    border-color: pink;

    border-style: solid;

    border-width: 1px;

    border-radius: 16px;
  }

  .home-live-win .live-win-img-width {
    width: 100%;
  }

  .home-live-win .live-win-header {
    display: flex;

    align-items: center;

    width: 100%;

    height: 30px;

    padding-left: 10px;
  }

  .home-live-win .live-win-body {
    border-color: pink;

    border-style: solid;

    border-width: 1px;

    width: 100%;
  }

  .home-live-win .live-win-body .swiper-slide {
    width: 100px !important;
  }

  .home-live-win .live-win-img {
    height: 100px;

    border-radius: 8px;
  }

  .home-live-win .live-win-level-text {
    display: flex;

    align-items: center;
    width: 100%;
    margin: 0px 0px;

    justify-content: center;
  }

  .home-live-win .text-center {
    cursor: pointer;
  }
  .text-\[\#12FF76\] {
    color: #12ff76;
  }

  /* Using Tailwind primarily. Scoped styles for things Tailwind can't easily do or for complex selectors. */

  /* .home-live-win-container { */
  /* Base container styles if any */
  /* } */

  /* .live-win-body { */
  /* Common styles for swiper container area */
  /* For mobile, height is constrained by parent, for desktop it's auto based on content */
  /* } */

  /* Mobile specific styles for decorative images if needed beyond Tailwind */
  /* .mobile-live-win { */
  /* background-image and background-size are kept inline due to dynamic asset paths
     or very specific one-off styling. Consider moving to Tailwind custom properties if reusable. */
  /* } */

  /* Desktop Swiper slides - ensure they have a defined basis if slidesPerView is calculated */
  /* .desktop-live-win .swiper-slide { */
  /* You might want to set a min-width or flex-basis here if slidesPerView
     calculation leads to undesirable shrinking.
     Example: min-width: 90px;
  */
  /* } */

  /* Text color utility, if not already globally available via Tailwind */
  .text-\[\#12FF76\] {
    color: #12ff76;
  }

  /* Add any other specific styles that are hard to achieve with Tailwind alone */
</style>

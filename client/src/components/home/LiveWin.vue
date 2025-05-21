<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import icon_public_91 from '@/assets/bigwin/icon_public_91.svg';
// import img_vipemblem_1_24 from '@/assets/vip/image/img_vipemblem_1-24.png'
// import img_vipemblem_25_49 from '@/assets/vip/image/img_vipemblem_25-49.png'
// import img_vipemblem_50_74 from '@/assets/vip/image/img_vipemblem_50-74.png'
// import img_vipemblem_75_99 from '@/assets/vip/image/img_vipemblem_75-99.png'
// import img_vipemblem_100_149 from '@/assets/vip/image/img_vipemblem_100-149.png'
// import img_vipemblem_159_199 from '@/assets/vip/image/img_vipemblem_159-199.png'
// import img_vipemblem_200 from '@/assets/vip/image/img_vipemblem_200.png'
import img_win_01 from '@/assets/bigwin/img_win_01.png';
import img_win_02 from '@/assets/bigwin/img_win_02.png';
import img_win_03 from '@/assets/bigwin/img_win_03.png';
import logo from '@/assets/logo.png';
import { useGameStore } from '@/stores/game';
import vipLevelGroups from '@/utils/vipLevelGroups';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
// import Swiper core and required modules
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';
import InlineSvg from 'vue-inline-svg';
import { useRouter } from 'vue-router';

// import { storeToRefs } from 'pinia'
const { getClientWidth: width } = useDisplay();
const gameStore = useGameStore();
// Removed useI18n import
// Removed const { t } = useI18n();
// const { width } = useDisplay() // Assuming useDisplay is a valid composable
const modules = [Pagination, Autoplay, Navigation];
const { dispatchGameBigWin } = gameStore;
const router = useRouter();

const svgIconColor = ref<string>('#7782AA');
// const interval = ref<any>(null)
const liveWinBody = ref<any>(null); // Initialize ref with null
const winBodyWidth = ref<number>(0);
const winBodyMargin = ref<number>(0);

/* vip level images */
// const vipLevelImgs = ref<Array<any>>([
//   img_vipemblem_1_24,
//   img_vipemblem_25_49,
//   img_vipemblem_50_74,
//   img_vipemblem_75_99,
//   img_vipemblem_100_149,
//   img_vipemblem_159_199,
//   img_vipemblem_200,
// ])

const imgWinList = ref<Array<any>>([img_win_01, img_win_02, img_win_03]);

/* change svg icon or fill color */
const svgIconTransform = (el: any) => {
  for (let node of el.children) {
    node.setAttribute('fill', svgIconColor.value);
    for (let subNode of node.children) {
      subNode.setAttribute('fill', svgIconColor.value);
    }
  }
  return el;
};

/* live win game temp list */
const onImageError = (event: Event) => {
  // console.log(event);
  const target = event.target as HTMLImageElement;
  target.src = logo; //'../assets/logo.png'
  target.style.objectFit = 'contain';
};
const gameBigWinItem = computed(() => {
  // const { getGameBigWinItem } = storeToRefs(gameStore())
  const getGameBigWinItem = gameStore.gameBigWinItem;
  return getGameBigWinItem;
});

const mobileWidth = computed(() => {
  if (liveWinBody.value) {
    const s = liveWinBody.value?.clientWidth;
    const st: any = s / 100;
    const sti = parseInt(st);
    console.log('zhelli', (s % 100) / (sti - 1));
    // (winBodyWidth % 100) / parseInt(winBodyWidth / 100)
    if ((s % 100) / sti < 8) {
      // winBodyWidth.value = liveWinBody.value.clientWidth - (sti - 1) * 8;
      winBodyWidth.value = sti;
      winBodyMargin.value = 8 + (s % 100) / (st - 1);
      console.log(winBodyMargin.value);
    } else {
      // winBodyWidth.value = liveWinBody.value.clientWidth;
      winBodyWidth.value = sti;
      winBodyMargin.value = (s % 100) / (st - 1);
    }
  }
  return width;
});
console.log(mobileWidth.value());
const goGame = (item: any) => {
  router.push(`/game/${item.game_id}`);
};

onMounted(async () => {
  await dispatchGameBigWin();
});
console.log(gameBigWinItem.value);
const liveWinList = () => {
  let res = [...gameBigWinItem.value.lucky_bets, ...gameBigWinItem.value.high_rollers];
  // console.log(res.length)
  res.forEach((item) => {
    // console.log(item.game_icon)
    item.game_icon = item.game_icon.replace('/images/games', 'https://images.cashflowcasino.com');
    // console.log(item.game_icon)
  });
  return res;
};
</script>

<template>
  <div
    class="m-home-live-win flex"
    v-if="mobileWidth() < 600"
    style="background-size: 3% 100%; background-position-x: right"
  >
    <div class="flex" style="width: 20px"></div>

    <div
      class="flex"
      v-if="mobileWidth() < 600"
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
        <Swiper
          :modules="modules"
          :slidesPerView="5"
          :spaceBetween="8"
          :loop="true"
          :autoplay="{
            delay: 600,
            disableOnInteraction: false,
          }"
          class="mx-2"
          style="height: auto"
        >
          <SwiperSlide
            v-for="(item, index) in liveWinList()"
            :key="index"
            :virtualIndex="index"
            @click="goGame(item)"
          >
            <div class="text-center">
              <img
                :src="item.game_icon || '@/assets/logo.png'"
                class="live-win-img"
                @error="onImageError"
              />
              <div class="live-win-level-text">
                <img :src="vipLevelGroups[item.user_vip_group]" width="12" />
                <p class="text-500-8 white ml-1">{{ item.user_name }}</p>
              </div>
              <div class="text-900-10 color-12FF76">${{ item.win_amount }}</div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </div>
  <div class="m-home-live-win" v-else>
    <!-- <div class="live-win-header">
      <inline-svg
        :src="icon_public_91"
        width="24"
        height="24"
        :transform-source="svgIconTransform"
      ></inline-svg>
      <p class="text-700-22 gray ml-2">Live Win</p>
    </div> -->
    <div class="live-win-body" ref="liveWinBody">
      <Swiper
        :modules="modules"
        :slidesPerView="winBodyWidth"
        :spaceBetween="winBodyMargin"
        :autoplay="{
          delay: 600,
          disableOnInteraction: false,
        }"
        class="mx-2"
        style="height: auto"
      >
        <SwiperSlide
          v-for="(item, index) in gameBigWinItem.lucky_bets"
          :key="index"
          :virtualIndex="index"
          @click="goGame(item)"
        >
          <div class="text-center">
            <img :src="imgWinList[Math.floor(Math.random() * 3)]" class="live-win-img" />
            <div class="live-win-level-text">
              <img :src="vipLevelGroups[item.user_vip_group]" width="21" />
              <p class="text-400-14 white ml-2">{{ item.user_name }}</p>
            </div>
            <div class="text-900-18 color-12FF76">${{ item.win_amount }}</div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
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
  top: 15px;
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
  margin: 0px 6px;
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
  margin: 0px 6px;
  justify-content: center;
}
.home-live-win .text-center {
  cursor: pointer;
}
</style>

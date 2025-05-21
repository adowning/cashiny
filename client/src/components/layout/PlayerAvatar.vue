<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { useVipStore } from '@/stores/vip'
const expScale = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000]
const eventBus = useEventManager()
const props = defineProps({
  sparkle: {
    type: Boolean,
    default: false,
  },
})
  const authStore = useAuthStore();
  const { currentUser } = storeToRefs(authStore);
const {getVipInfo} = useVipStore()
const gaining_exp = ref(false)
const nextXpLevel = expScale[getVipInfo.level]
const percentFilled = ref(1)
const circle = ref()
const percentage = ref(0)
percentage.value = 10000 / getVipInfo.bet_exp
percentFilled.value = nextXpLevel - getVipInfo.bet_exp/ 100
eventBus.on('gainingExp', () => {
  const expNeeded = nextXpLevel -getVipInfo.bet_exp
  console.log(expNeeded)
  setTimeout(() => {
    gaining_exp.value = true
  }, 500)
})
// const glowFrame = ref()
async function showProfile() {
  eventBus.emit('profileOpen', true)
}
// const vipInfo = computed(() => {
//   const { getVipInfo } = storeToRefs(vipStore)
//   return getVipInfo.value
// })
// console.log(vipInfo.value.deposit_exp)
// console.log(vipInfo.value.rank_deposit_exp)
// const depositRate = computed(() => {
//   if ((vipInfo.value.deposit_exp / vipInfo.value.rank_deposit_exp) * 100 >= 100) {
//     return 100
//   } else {
//     return (vipInfo.value.deposit_exp / vipInfo.value.rank_deposit_exp) * 100
//   }
// })
// console.log((2 / 100) * 100)
const betRate = computed(() => {
  if ((getVipInfo.bet_exp / getVipInfo.rank_bet_exp) * 100 >= 100) {
    return 100
  } else {
    return (getVipInfo.bet_exp / getVipInfo.rank_bet_exp) * 100
  }
})
function pulseGlow() {
  // const circle = document.querySelector('.progress-circle');
  circle.value.classList.add('glow')
  setTimeout(() => circle.value.classList.remove('glow'), 2000) // Remove after 2 seconds
}

// Example usage:
watch(props, (newValue) => {
  if (newValue.sparkle) {
    pulseGlow
  }
})
// watch(vipPoints, (u) => {
//   console.log(u)
//   percentFilled.value = nextXpLevel - vipPoints / 100
// })
// Trigger glow on button click:
// setTimeout(pulseGlow, 1000); // Trigger glow after 1 second
// onMounted(() => {
//   // setProgress(75); // Set progress to 75%
//   percentage.value = 75
//   pulseGlow()
//   const MAX = 37

//   const cp = new CircleProgress('.progress', {
//     max: MAX,
//     value: 12,
//     animationDuration: 400,
//     textFormat: (val) => val + '°',
//   })

//   document.querySelector('#value-input').addEventListener('change', (e) => {
//     const val = e.target.value
//     cp.value = val
//     cp.el.style.setProperty('--progress-value', val / MAX)
//   })
// })
</script>

<template>
  <div
    v-if="currentUser !== undefined"
    class=""
    style="
      position: relative;
      height: 70px;
      /*max-height: 60px;
      margin-left: 20px; */
      /* width: 60px; */
      /* max-width: 60px; */
      z-index: 2;
      left: 0px;
      margin-left: 19px;
      margin-top: 3px;
      /* background-image: url('/images/avatars/avatar-19.webp'); */
      background-size: 100%;
      border-radius: 100%;
      background-position: center;
      background-repeat: no-repeat;
    "
  >
    <div
      class="flex"
      style="
        position: relative;
        width: 60px;
        height: 60px;
        z-index: 999;
        /* background-image: url('/images/avatars/avatar-1.webp'); */

        /* margin-top: 2px; */
        border-radius: 100%;
        /* margin-left: 0px; */
        /* left: 0px; */
        /* top: 2px;/ */
        position: absolute;
        /* outer cyan */
      "
    >
      <div class="flex items-center justify-center  overflow-hidden rounded-full">
        <!-- <CircularProgress
          :percent="percentage"
          :viewport="true"
          :is-shadow="true"
          :is-bg-shadow="true"
          :show-percent="true"
          :unit="'%'"
        ></CircularProgress> -->

          <div
            v-if="currentUser !== undefined"
            class="player"
            style="
              position: absolute;
              height: 100%;
              width: 100%;
              z-index: 0;
              /* left: 7px;
              top: 2px; */
        margin-left: 60px;
        /* padding-top: -3px; */
      margin-top: 0px;
              /* background-image: url('/images/avatars/avatar-8.webp'); */
              background-size: 100%;
              border-radius: 999px;
              background-position: center;
              background-repeat: no-repeat;
            "
            :style="` background-image: url('https://icos.cashflowcasino.com/images/avatars/${currentUser?.avatar}');`"
          >  <CircleProgressBar
          strokeWidth="10"
          :value="currentUser?.totalXp"
          colorUnfilled="yellow"
          animationDuration="1s"
          colorFilled="green"
          colorBack="red"
          :startAngle="280"
          :max="185"
          style="z-index: 999; padding: 0; margin-top: -2px; margin-right: 0px; margin-left: -2px; width: 110%; height: 100%"
        </CircleProgressBar>
         <!-- <VGSprite
            id="coinFrames"
            class="flex"
            image-src="/images/avatar_xp.png"
            :sprite-sheet-data="AvatarXPJson"
            style="background-repeat: no-repeat; z-index: 10; margin-top: -70px; margin-right: 20px; transform: scale(.7)"
            :speed="60"
            :delay="0"
            :offset="0"
            :autoplay="true"
          /> -->
        </div>
        <!-- <svg
          ref="circle"
          class="w-27 h-29"
          x-cloak
          aria-hidden="true"
          :class="` ${sparkle ? 'glow' : ''}`"
        >
          <circle
            class="text-gray-300"
            stroke-width="6"
            stroke="currentColor"
            fill="transparent"
            r="25"
            cx="60"
            cy="55"
          />
          <circle
            :class="sparkle ? 'text-purple-400' : 'text-blue-600'"
            :stroke-width="sparkle ? '2' : '6'"
            stroke-linecap="round"
            stroke="currentColor"
            fill="transparent"
            r="25"
            cx="60"
            cy="55"
          />
        </svg> -->
      </div>
      <!-- <img v-if="sparkle" style="
          z-index: 99999;
          position: absolute;
          top: -9px;
          left: -3px;
          height: 50px;
          width: 100px;
          transform: scaleX(1.2);
        " src=" /images/avatars/avatar-modal___xp-glow.png" alt="" /> -->
      <!-- <img v-if="sparkle" class="absolute h-[60px] w-[40px] flex" src="/images/sparkle.gif" /> -->
      <div
        class="absolute h-[19px] flex bg-white opacity-99"
        :style="`${currentUser.username?.length <= 6 ? 'font-size: large' : 'font-size: medium'}`"
        style="
          border-radius: 5px;
          left: -10px;
          background: white;
          bottom: -6px;
          z-index: 999;
          color: black;
          border-radius: 4px;
          justify-content: start;
          min-width: 80px;
          text-align: center;
          font-weight: 800;
          margin: auto;
          border: 1px solid #6f14a3; /* some kind of blue border */

          -webkit-box-shadow: 0px 0px 4px #6f14a3;
          -moz-box-shadow: 0px 0px 4px #6f14a3;
          box-shadow: 0px 0px 4px #6f14a3; /* some variation of blue for the shadow */
          -webkit-border-radius: 4px;
          -moz-border-radius: 4px;
        "
      >
        <div
          class="flex flex-col mt--1"
          style="
            z-index: 999;
            margin: auto;
            z-index: 99213;
            font-family: bungee;
            justify-content: end;
            text-align: center;
            line-height: 1;
          "
        >
          {{ currentUser?.username?.substring(0, 8) }}
        </div>
      </div>
      <div
        class=""
        style="
          height: 36px;
          width: 36px;
          position: absolute;
          background-image: url('/images/avatars/level-star.avif');
          background-size: cover;
          top: 18px;
          left: -14px;
          z-index: 10;
          z-index: 9999;
        "
        @click="showProfile()"
      >
        <!-- <img
          style="position: absolute"
          src="/images/avatars/level-star.avif"
          width="32"
          height="32"
          alt=""
        /> -->
        <div
          class="flex ml-2 mt-3 pl-3"
          style="
            padding-left: 5px;
            margin-left: 4px;
            margin-top: 5px;
            font-size: large;
            font-family: bungee;
            color: black;
            z-index: 999999999;
          "
        >
          <!-- {{ currentUser.vipRank.rankLevel }} -->
          {{ getVipInfo.level }}
        </div>
      </div>

      <div
        class="absolute left-0"
        style="
          width: 100%;
          height: 20%;
          margin: auto;
          justify-content: center;
          text-align: center;
          font-size: medium;
          font-weight: 700;
          margin: auto;
          color: black;
        "
      />
    </div>

    <div
      v-if="sparkle"
      style="position: absolute; width: 60px; height: 30px; left: -5px; top: -4px; z-index: 999999"
    >
      <SparklesSprite />
    </div>
  </div>
  <!-- </div> -->
  <!-- </div> -->
</template>

<style scoped>
.progress {
  --progress-value: 0.3243;
  --color: hsl(
    calc(240 * (1 - var(--progress-value))),
    100%,
    calc(30% + 20% * var(--progress-value))
  );
}

.circle-progress {
  width: 65px;
  height: 65px;
}

.circle-progress-value {
  stroke-width: 6px;
  stroke: var(--color);
  stroke-dasharray: 5.98 2;
  transition: stroke 0.4s;
}

.circle-progress-circle {
  stroke-width: 2px;
  stroke: #17181c;
}

.circle-progress-text {
  font-weight: bold;
  fill: var(--color);
  transform: translateX(0.2em);
  transition: fill 0.4s;
}

input[type='range'] {
  width: 210px;
  margin-top: 30px;
  margin-bottom: 20px;
  display: inline-block;
  background: none;
  cursor: pointer;
}
input[type='range']:focus {
  outline: none;
}
input[type='range']::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  background: #17181c;
  outline: none;
}
input[type='range']::-moz-range-track {
  width: 100%;
  height: 6px;
  background: #17181c;
  outline: none;
}
input[type='range']::-ms-track {
  width: 100%;
  height: 6px;
  background: #17181c;
  outline: none;
}
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  margin-top: -5px;
  background: #464953;
  transition: 0.15s;
  border: none;
  border-radius: 0;
}
input[type='range']::-moz-range-thumb {
  width: 16px;
  height: 16px;
  margin-top: -5px;
  background: #464953;
  transition: 0.15s;
  border: none;
  border-radius: 0;
}
input[type='range']::-ms-thumb {
  width: 16px;
  height: 16px;
  margin-top: -5px;
  background: #464953;
  transition: 0.15s;
  border: none;
  border-radius: 0;
}
input[type='range']:hover::-webkit-slider-thumb,
input[type='range']:focus::-webkit-slider-thumb {
  background: #75798a;
}
input[type='range']:hover::-moz-range-thumb,
input[type='range']:focus::-moz-range-thumb {
  background: #75798a;
}
input[type='range']:hover::-ms-thumb,
input[type='range']:focus::-ms-thumb {
  background: #75798a;
}

a {
  color: #75798a;
}
.progress-container {
  width: 200px;
  height: 200px;
  position: relative;
}

.progress-circle {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  /* Start from top */
}

.progress-circle circle {
  fill: none;
  stroke-width: 10;
  /* Adjust thickness */
  stroke-dasharray: 565.49;
  /* Circumference of the circle */
  stroke-dashoffset: 565.49;
  /* Initially hidden */
  transition: stroke-dashoffset 0.3s ease;
  /* Smooth fill animation */
}

.progress-circle .base {
  stroke: white;
  /* Base color */
}

.progress-circle .fill {
  stroke: red;
  /* Fill color */
}

.glow {
  animation: pulse-glow 2s ease-in-out;
}

@keyframes pulse-glow {
  0% {
    filter: drop-shadow(0 0 5px white);
  }

  25% {
    filter: drop-shadow(0 0 10px white);
  }

  50% {
    filter: drop-shadow(0 0 25px white);
  }

  75% {
    filter: drop-shadow(0 0 10px white);
  }

  100% {
    filter: drop-shadow(0 0 5px white);
  }
}

:root {
  --border: 6px;
  --border2: 5px;
  --color1: yellow;
  --color2: red;
  --from: -110deg;
  --distance: 16%;
  --distance2: 156%;
}

.img-wrap {
  position: relative;
  padding: 1px;
}

.img-wrap::after {
  content: '';
  border-radius: 999px;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  height: 60px;
  width: 60px;
  /* background: color1; */
  background: conic-gradient(
    from var(--from),
    var(--color1),
    var(--color1) var(--distance),
    transparent var(--distance)
  );
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - var(--border)),
    #fff calc(100% - var(--border) + 1px)
  );
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - var(--border)),
    #fff calc(100% - var(--border) + 1px)
  );
}

.img-wrap2 {
  position: relative;
  padding: 1px;
}

.img-wrap2::after {
  content: '';
  border-radius: 999px;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  height: 60px;
  width: 60px;
  /* background: color1; */
  background: conic-gradient(
    from var(--from),
    var(--color2),
    var(--color2) var(--distance2),
    transparent var(--distance2)
  );
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - var(--border2)),
    #fff calc(100% - var(--border2) + 1px)
  );
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - var(--border2)),
    #fff calc(100% - var(--border2) + 1px)
  );
}

img {
  border-radius: 999px;
  display: block;
  /* width: calc(100vw - 80px); */
  max-width: 60px;
  height: auto;
}
</style>

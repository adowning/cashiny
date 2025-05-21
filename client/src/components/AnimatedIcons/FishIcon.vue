<script setup lang="ts">
  import * as FishJson from "@/assets/anim/part2.json";
  import FishImg from "@/assets/anim/part2.png";
  import VSprite from "../common/VSprite.vue";
  // import { eventTypes, useEventsBus } from '@/hooks/events'
  // import { useAppStore } from '@/store/app.store'

  // import { IUser, useUserStore } from '@/store/user.store'

  // const appStore = useAppStore()
  // const { getCurrentUser } = useUserStore()
  // const filterBar = computed(() => {
  //   const { getFilterBar } = storeToRefs(useAppStore())
  //   return getFilterBar.value
  // })
  const backing = ref("standard");

  // const { setFilterBar } = useAppStore()

  // const currentUser = ref<IUser>()
  // currentUser.value = getCurrentUser()
  // const $bus = useEventsBus()
  const sprite = ref();
  function doBattles() {
    // useAppStore().setFilterBar('fish')
    // $bus.$emit(eventTypes.sort_games, 'fish')
  }
  // function changeBack(val) {
  //   backing.value = val
  // }
  // $bus.$on(eventTypes.sort_games, changeBack)
</script>

<template>
  <div
    style="margin: auto; margin-bottom: 10px"
    class="flex grow-1 flex-col justify-between"
  >
    <div
      :style="{
        backgroundImage: `url(${backing === 'fish' ? '/images/button-on.png' : '/images/button-dead.png'})`,
        backgroundSize: 'contain',
        zIndex: '13',
        width: '80px',
        height: '70px',
      }"
    >
      <VSprite
        id="Fish"
        ref="sprite"
        :spritesheet="FishImg"
        :json="FishJson"
        :fps="20"
        style="
          margin: auto;
          margin-top: -16px;
          margin-right: -5px;
          width: 80px;
          height: 60px;
          background-repeat: no-repeat;
          transform: scale(0.6) translateY(5px) translateX(-28px);
          z-index: 12;
        "
        :autoplay="true"
        @click="doBattles()"
      />
      <img
        :src="`/images/bottom/menu2-${1}.png`"
        width="50"
        height="30"
        style="margin-top: 15px; margin-left: 14px"
      />
    </div>
  </div>
</template>

<style scoped>
  .shake {
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
  }

  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
      transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
      transform: translate3d(4px, 0, 0);
    }
  }

  #spriteAnim {
    width: 399px;

    height: 200px;

    margin: 2em auto;

    background: transparent url("") 0 0 no-repeat;

    animation: spriteAnim 1s steps(12) infinite;
  }

  /* Animation keyframes */

  @keyframes spriteAnim {
    100% {
      background-position: 0 -2393px;
    }
  }
</style>

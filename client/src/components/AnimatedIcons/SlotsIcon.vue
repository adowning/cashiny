<script setup lang="ts">
  import * as SlotsJson from '@/assets/anim/part1.json'
  import SlotsImg from '@/assets/anim/part1.png'
  import VSprite from '../common/VSprite.vue'

  // import { eventTypes, useEventsBus } from '@/hooks/events'
  // import { useAppStore } from '@/store/app.store'

  // import { IUser, useUserStore } from '@/store/user.store'

  // import type { IUser } from '@/types';
  // const appStore = useAppStore()
  // const { getCurrentUser } = useUserStore()
  // const { setFilterBar } = useAppStore()
  const backing = ref('standard')
  // const currentUser = ref<IUser>()
  // const filterBar = computed(() => {
  //     const { getFilterBar } = storeToRefs(useAppStore())
  //     return getFilterBar.value
  // })

  // currentUser.value = getCurrentUser()
  // const $bus = useEventsBus()
  const sprite = ref()
  function doBattles() {
    // useAppStore().setFilterBar('slots')
    // $bus.$emit(eventTypes.sort_games, 'slots')
  }
  // function changeBack(val) {
  //   backing.value = val
  // }

  // $bus.$on(eventTypes.sort_games, changeBack)
</script>

<template>
  <div style="margin: auto; margin-bottom: 10px" class="flex grow-1 flex-col justify-between">
    <div
      :style="{
        backgroundImage: `url(${backing === 'slots' ? '/images/filterbar/button-on.png' : '/images/filterbar/button-dead.png'})`,
        backgroundSize: 'contain',
        zIndex: '13',
        width: '80px',
        height: '70px',
      }"
    >
      <VSprite
        id="Slots"
        ref="sprite"
        :spritesheet="SlotsImg"
        :json="SlotsJson"
        :fps="20"
        style="
          margin: auto;
          margin-top: -6px;
          margin-right: 5px;
          width: 80px;
          height: 60px;
          background-repeat: no-repeat;
          transform: scale(0.6) translateY(9px) translateX(-16px);
          z-index: 12;
        "
        :autoplay="true"
        @click="doBattles()"
      />
      <img
        src="/images/bottom/menu1-1.png"
        width="50"
        height="30"
        style="margin-top: 5px; margin-left: 14px"
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

    background: transparent url('') 0 0 no-repeat;

    animation: spriteAnim 1s steps(12) infinite;
  }

  /* Animation keyframes */

  @keyframes spriteAnim {
    100% {
      background-position: 0 -2393px;
    }
  }
</style>

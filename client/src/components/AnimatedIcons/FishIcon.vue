<script setup lang="ts">
  import { ref } from 'vue'
  import * as RawFishJsonData from '@/assets/anim/part2.json' //
  import FishSpritesheetUrl from '@/assets/anim/part2.png' //
  import SpriteAnimation from '../common/SpriteAnimation.vue' // Adjust path
  import type { SpriteData, AnimationFrameData } from '@cashflow/types'
  import { transformRawSpriteJsonToSpriteData } from '../common/transformSpriteData'

  const backing = ref('standard') //

  function doBattles() {
    console.log('FishIcon clicked')
    // Example: useAppStore().setFilterBar('fish')
  }

  const fishIconSpriteData: SpriteData = transformRawSpriteJsonToSpriteData(
    RawFishJsonData,
    'part2.png'
  )
  const actualFrameWidth = fishIconSpriteData.frames[0]?.sourceSize.w || 84 // Fallback to known 94
  const actualFrameHeight = fishIconSpriteData.frames[0]?.sourceSize.h || 94 // Fallback to known 94
</script>

<template>
  <div
    style="margin: auto; margin-bottom: 10px"
    class="flex grow-1 flex-col justify-between"
    @click="doBattles()"
  >
    <div
      :style="{
        backgroundImage: `url(${backing === 'fish' ? '/images/button-on.png' : backing === 'standard' ? '/images/button-on.png' : '/images/button-dead.png'})`, // Adapted from original
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: '13',
        width: '110px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }"
    >
      <SpriteAnimation
        animationName="fish-icon"
        :spritesheetUrl="FishSpritesheetUrl"
        :spriteData="fishIconSpriteData"
        :fps="20"
        :autoplay="true"
        :loop="true"
        :width="actualFrameWidth"
        :height="actualFrameHeight"
        style="transform: scale(0.6) translateY(-6px); z-index: 12"
      />
      <img
        src="/images/bottom/menu0-1.png"
        width="50"
        height="30"
        style="
          position: absolute;
          top: 22px;
          left: 22px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -20%) translateY(calc(15px / 0.6));
          z-index: 13;
          pointer-events: none;
        "
      />
    </div>
  </div>
</template>

<style scoped>
  /* Copied from AllIcon.txt, assuming it's shared or similar styling is needed */
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
</style>

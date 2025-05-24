<script setup lang="ts">
  import { ref } from 'vue'
  import * as RawAllJsonData from '@/assets/anim/part0.json'
  import AllSpritesheetUrl from '@/assets/anim/part0.png'
  import SpriteAnimation from '../common/SpriteAnimation.vue' // Path to your generic animation component
  import type { SpriteData, AnimationFrameData } from '@cashflow/types'
  import { transformRawSpriteJsonToSpriteData } from '../common/transformSpriteData'

  const backing = ref('standard') // 'standard' or other states for button background

  function doBattles() {
    // Your click logic here
    console.log('AllIcon clicked')
    // Example: useAppStore().setFilterBar('standard')
  }

  // Transform the imported raw JSON data
  const allIconSpriteData: SpriteData = transformRawSpriteJsonToSpriteData(
    RawAllJsonData,
    'part0.png'
  )
  const actualFrameWidth = allIconSpriteData.frames[0]?.sourceSize.w || 114 // Fallback to known 94
  const actualFrameHeight = allIconSpriteData.frames[0]?.sourceSize.h || 124 // Fallback to known 94
  console.log(actualFrameWidth)
</script>

<template>
  <div
    style="margin: auto; margin-bottom: 10px"
    class="flex grow-1 flex-col justify-between"
    @click="doBattles()"
  >
    <div
      :style="{
        backgroundImage: `url(${backing === 'standard' ? '/images/button-on.png' : '/images/button-dead.png'})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        zIndex: '13',
        width: '90px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }"
    >
      <SpriteAnimation
        animationName="all-icon"
        :spritesheetUrl="AllSpritesheetUrl"
        :spriteData="allIconSpriteData"
        :fps="20"
        :autoplay="true"
        :loop="true"
        :width="actualFrameWidth"
        :height="actualFrameHeight"
        style="transform: scale(0.8) translateX(-10px) translateY(-10px)"
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
  .shake {
    /* */
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
  }

  @keyframes shake {
    /* */
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

<script setup lang="ts">
  import { ref } from 'vue'
  import * as RawChatJsonData from '@/assets/anim/fireBlue.json' //
  import ChatSpritesheetUrl from '@/assets/anim/fireBlue.png' //
  import SpriteAnimation from '../common/SpriteAnimation.vue' // Adjust path
  import type { SpriteData, AnimationFrameData } from '@cashflow/types'
  import { transformRawSpriteJsonToSpriteData } from '../common/transformSpriteData'

  const backing = ref('standard')

  function doBattles() {
    console.log('ChatIcon clicked')
  }

  const chatIconSpriteData: SpriteData = transformRawSpriteJsonToSpriteData(
    RawChatJsonData,
    'fireBlue.png'
  )
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
        zIndex: '13',
        width: '80px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }"
    >
      <SpriteAnimation
        animationName="chat-icon"
        :spritesheetUrl="ChatSpritesheetUrl"
        :spriteData="chatIconSpriteData"
        :fps="20"
        :autoplay="true"
        :loop="true"
        :width="80"
        :height="60"
        style="
          /* Original VSprite transform from ChatIcon.txt (same as AllIcon) */
          transform: scale(0.6) translateY(9px) translateX(-16px);
          z-index: 12;
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

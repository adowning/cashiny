<script setup lang="ts">
import type { PropType } from 'vue'

import { computed, onMounted, ref } from 'vue'

interface FrameData {
  x: number
  y: number
  w: number
  h: number
}

export interface SpriteFrame {
  frame: FrameData
  rotated: boolean
  trimmed: boolean
  spriteSourceSize: FrameData
  sourceSize: FrameData
}

export interface SpriteSheetData {
  frames: Record<string, SpriteFrame>
}
const props = defineProps({
  spriteSheetData: {
    type: Object as PropType<any>,
    required: true
  },
  imageSrc: {
    type: String,
    required: true
  },
  speed: {
    type: Number,
    required: true
  },
  offset: {
    type: Number,
    required: true
  },
  delay: {
    type: Number,
    required: true
  },
  autoPlay: {
    type: Boolean,
    required: false,
    default: true
  },
  maxWidth: {
    type: Number,
    required: false,
    default: 0
  },
  maxHeight: {
    type: Number,
    required: false,
    default: 0
  }
})
const currentFrame = ref(0)
const frameRate = ref(props.speed) // Frames per second
const animationPlaying = ref(false)
const spriteImage = ref<HTMLImageElement | null>(null)

const frameKeys = computed(() => Object.keys(props.spriteSheetData.frames))
const currentFrameData = computed(
  () => props.spriteSheetData.frames[frameKeys.value[currentFrame.value]]
)

const spriteStyle = computed(() => {
  if (!currentFrameData.value || !spriteImage.value) {
    // console.log(spriteStyle)
    return {}
  }

  const { x, y, w, h } = currentFrameData.value.frame
  return {
    width: `${w}px`,
    height: `${h}px`,
    maxWidth: `${props.maxWidth}px`,
    maxHeight: `${props.maxHeight}px`,
    background: `url(${props.imageSrc}) -${x}px -${y}px no-repeat`,
    // transform: currentFrameData.value.rotated ? 'rotate(180deg)' : 'none', // Apply rotation if needed
    transform: currentFrameData.value.rotated ? 'rotate(-90deg)' : 'none', // Apply rotation if needed
    imageRendering: 'pixelated' // or 'crisp-edges' for sharper look.  Consider alternatives if blurry.
  }
})
function waitforme(millisec: number | undefined) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('')
    }, millisec)
  })
}

function startAnimation() {
  if (animationPlaying.value || frameKeys.value.length <= 1) {
    return
  }
  animationPlaying.value = true
  // setInterval(() => {

  // setInterval(async () => {
  const { pause, resume } = useIntervalFn(() => {
    currentFrame.value = (currentFrame.value + 1) % frameKeys.value.length
    if (currentFrame.value === 0) {
      // //console.log('frames over', props.delay)
      // if (props.delay > 0) {
      //     setTimeout(() => {}, props.delay)
      // }
      // useTimeoutFn(() => {

      stopAnimation(pause, resume)
      // }, props.delay)
      // Stop the animation after one loop. You can remove or adjust this.
    }
  }, 1000 / frameRate.value) // Calculate interval based on frame rate
  // }, props.delay)
}

function stopAnimation(pause: { (): void, (): void }, resume: { (): void, (): void }) {
  pause()
  waitforme(props.delay).then(() => {
    clearInterval(animationPlaying.value as unknown as number)
    animationPlaying.value = false
    resume()
  })
}

onMounted(async () => {
  spriteImage.value = new Image()
  spriteImage.value.src = props.imageSrc

  // Wait for image to load before starting animation
  await new Promise((resolve) => {
    spriteImage.value!.onload = resolve
    // console.log(spriteStyle.value)
    // console.log('offsetting ', props.offset)
    if (props.autoPlay) {
      setTimeout(() => startAnimation(), props.offset)
    }
    // if (!spriteStyle.value) {
    // }
  })
})
</script>

<template>
  <div ref="spriteImage" :style="`
        width: ${spriteStyle.width};
        height: ${spriteStyle.height};
        max-width: ${spriteStyle.maxWidth}px;
        max-height: ${spriteStyle.maxHeight}px;
        background: ${spriteStyle.background};
        transform: ${spriteStyle.transform}`" />
</template>

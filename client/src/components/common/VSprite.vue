<script lang="ts" setup>
  import { nextTick, onMounted, onUnmounted, ref } from 'vue'

  interface VSpriteProps {
    spritesheet: string
    json: any
    fps?: number
    autoplay?: boolean
    id: string
  }

  const props = defineProps<VSpriteProps>()

  const frames = ref<any[]>([])
  const canvas = ref<HTMLCanvasElement | null>(null)
  const length = ref<number>(0)
  const currentIndex = ref<number>(0)
  const animationFrameID = ref<number | null>(null)
  const direction = ref<number>(0)
  const sprite = ref<HTMLImageElement | null>(null)
  const ctx = ref<CanvasRenderingContext2D | null>(null)
  const height = ref<number>(0)
  const width = ref<number>(0)

  const now = ref<number>(0)
  const then = ref<number>(0)
  const fps = ref<number>(props.fps || 30)

  function init() {
    if (canvas.value) {
      ctx.value = canvas.value.getContext('2d')
    }
    play(0)
  }

  let x: number
  let y: number

  function render() {
    if (!ctx.value) return

    const index = Math.abs(currentIndex.value % length.value)
    if (frames.value[index]) {
      const frame = frames.value[index]
      ctx.value.clearRect(0, 0, width.value, height.value)

      ctx.value.drawImage(
        sprite.value as HTMLImageElement,
        frame.x,
        frame.y,
        width.value,
        height.value,
        0,
        0,
        width.value,
        height.value
      )
    }
  }

  function loop() {
    now.value = Date.now()
    const delta = now.value - then.value
    if (delta > 1000 / fps.value) {
      then.value = now.value - (delta % (1000 / fps.value))
      render()
      currentIndex.value++
    }
    animationFrameID.value = window.requestAnimationFrame(loop)
  }

  function play(from: number) {
    currentIndex.value = Number.isNaN(Number(from)) ? currentIndex.value : from
    loop()
  }

  nextTick(() => {
    sprite.value = new Image()
    sprite.value.src = props.spritesheet
    sprite.value.onload = () => {
      init()
    }
  })

  onMounted(() => {
    const frams = props.json.frames

    if (!Array.isArray(frams)) {
      for (const [key, value] of Object.entries(frams) as [
        string,
        { frame: any; rotated: boolean },
      ][]) {
        const f = value.frame
        if (f) {
          f.rotated = value.rotated
          f.filename = key
        }

        if (f.filename.toLowerCase().includes(props.id.toLowerCase())) {
          frames.value.push(f)
        }
      }
    } else {
      frams.forEach((item) => {
        if (item.filename.toLowerCase().includes(props.id.toLowerCase())) {
          const newObj = {
            filename: item.filename,
            ...item.frame,
          }
          frames.value.push(newObj)
        }
      })
    }

    frames.value.sort((a, b) => (a.filename < b.filename ? -1 : 1))
    if (frames.value.length > 0) {
      width.value = frames.value[0].w
      height.value = frames.value[0].h
    }
    length.value = frames.value.length
  })
</script>

<template>
  <div class="vue-sprite">
    <canvas :id="id" ref="canvas" :width="width" :height="height" />
  </div>
</template>

<style scoped></style>

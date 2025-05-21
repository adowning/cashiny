<template>
  <div ref="spriteElement" class="sprite-animation" :style="spriteStyle"></div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

// Adjust path if needed
import { useEventManager } from '@/composables/EventManager';
import { AnimationFrameData, SpriteData } from '@cashflow/types';
import { useRafFn } from '@vueuse/core';

//

interface Props {
  animationName: string; // Unique name for this animation instance/type
  spritesheetUrl: string;
  spriteData?: SpriteData | null; // Allow it to be loaded async
  spriteDataUrl?: string; // URL to fetch spriteData if not provided directly
  fps?: number;
  loop?: boolean;
  autoplay?: boolean;
  width?: number; // Override width from sprite data
  height?: number; // Override height from sprite data
  customClass?: string | Record<string, boolean> | (string | Record<string, boolean>)[];
}

const props = withDefaults(defineProps<Props>(), {
  fps: 24,
  loop: false,
  autoplay: false,
  spriteData: null,
  spriteDataUrl: undefined,
  width: undefined,
  height: undefined,
  customClass: '',
});

const emit = defineEmits<{
  (e: 'loaded'): void;
  (e: 'played'): void;
  (e: 'stopped'): void;
  (e: 'completed'): void; // For non-looping animations
  (e: 'frameChanged', frameIndex: number): void;
}>();

const eventManager = useEventManager();
const spriteElement = ref<HTMLDivElement | null>(null);
const localSpriteData = ref<SpriteData | null>(props.spriteData);

const currentFrameIndex = ref(0);
const isPlaying = ref(props.autoplay);
const lastFrameTime = ref(0);

const isLoadingData = ref(false);

async function fetchSpriteData() {
  if (!props.spriteDataUrl || localSpriteData.value) return;
  isLoadingData.value = true;
  try {
    const response = await fetch(props.spriteDataUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch sprite data from ${props.spriteDataUrl}`);
    }
    localSpriteData.value = await response.json();
    emit('loaded');
  } catch (error) {
    console.error(`SpriteAnimation (${props.animationName}): Error loading sprite data:`, error);
    localSpriteData.value = null; // Ensure it's reset on error
  } finally {
    isLoadingData.value = false;
  }
}

const frames = computed<AnimationFrameData[]>(() => {
  return localSpriteData.value?.frames || [];
});

const currentFrame = computed<AnimationFrameData | null>(() => {
  if (frames.value.length > 0 && currentFrameIndex.value < frames.value.length) {
    return frames.value[currentFrameIndex.value];
  }
  return null;
});

const frameInterval = computed(() => 1000 / Math.max(1, props.fps)); // Ensure fps is at least 1

const displayWidth = computed(() => {
  return props.width ?? currentFrame.value?.sourceSize.w ?? currentFrame.value?.frame.w ?? 0;
});
const displayHeight = computed(() => {
  return props.height ?? currentFrame.value?.sourceSize.h ?? currentFrame.value?.frame.h ?? 0;
});

const spriteStyle = computed(() => {
  if (!currentFrame.value || !props.spritesheetUrl) {
    return { display: 'none' }; // Hide if no data or frame
  }
  const frame = currentFrame.value.frame;
  // const sourceSize = currentFrame.value.sourceSize;
  // const spriteSourceSize = currentFrame.value.spriteSourceSize;

  // If trimmed, spriteSourceSize gives the actual content dimensions and offset within sourceSize
  // For now, assuming we use frame.w, frame.h for the visible part and displayWidth/Height for the element size.
  // A more complex handling might be needed for trimmed sprites to position them correctly within the element.

  return {
    width: `${displayWidth.value}px`,
    height: `${displayHeight.value}px`,
    backgroundImage: `url(${props.spritesheetUrl})`,
    backgroundPosition: `-${frame.x}px -${frame.y}px`,
    backgroundRepeat: 'no-repeat',
    // If sprites are scaled in the sheet (meta.scale), adjust backgroundSize or transform. For now, assume 1:1.
    // backgroundSize: localSpriteData.value?.meta?.size ? `${localSpriteData.value.meta.size.w}px ${localSpriteData.value.meta.size.h}px` : 'auto',
  };
});

const {
  pause: pauseRaf,
  resume: resumeRaf,
  isActive: isRafActive,
} = useRafFn(
  (rafArgs) => {
    if (!isPlaying.value || frames.value.length === 0) {
      lastFrameTime.value = rafArgs.timestamp; // Keep updating lastFrameTime even when paused to avoid jump on resume
      return;
    }

    const elapsed = rafArgs.timestamp - lastFrameTime.value;

    if (elapsed >= frameInterval.value) {
      lastFrameTime.value = rafArgs.timestamp - (elapsed % frameInterval.value);
      currentFrameIndex.value++;
      emit('frameChanged', currentFrameIndex.value);

      if (currentFrameIndex.value >= frames.value.length) {
        if (props.loop) {
          currentFrameIndex.value = 0;
        } else {
          currentFrameIndex.value = frames.value.length - 1; // Stay on last frame
          stop(); // Stop the animation
          emit('completed');
        }
      }
    }
  },
  { immediate: false }, // Don't start immediately, wait for play()
);

function play() {
  if (isLoadingData.value || frames.value.length === 0) {
    // If data is loading, queue play or wait. For now, just log.
    console.warn(
      `SpriteAnimation (${props.animationName}): Cannot play, data not loaded or no frames.`,
    );
    return;
  }
  if (isPlaying.value && isRafActive.value) return; // Already playing

  // Reset to first frame if not looping and already completed, or if explicitly told to restart
  if (currentFrameIndex.value >= frames.value.length - 1 && !props.loop) {
    currentFrameIndex.value = 0;
  }

  isPlaying.value = true;
  lastFrameTime.value = performance.now(); // Reset time for smooth start
  if (!isRafActive.value) {
    resumeRaf();
  }
  emit('played');
}

function stop() {
  if (!isPlaying.value && !isRafActive.value) return; // Already stopped

  isPlaying.value = false;
  if (isRafActive.value) {
    pauseRaf();
  }
  emit('stopped');
}

function reset() {
  stop();
  currentFrameIndex.value = 0;
}

// --- Event Manager Integration ---
const playEventHandler = () => play();
const stopEventHandler = () => stop();

onMounted(async () => {
  if (props.spriteDataUrl && !localSpriteData.value) {
    await fetchSpriteData();
  } else if (props.spriteData) {
    localSpriteData.value = props.spriteData;
    emit('loaded');
  }

  eventManager.on(`animation:play:${props.animationName}`, playEventHandler, props.animationName);
  eventManager.on(`animation:stop:${props.animationName}`, stopEventHandler, props.animationName);

  if (props.autoplay && frames.value.length > 0) {
    play();
  }
});

onUnmounted(() => {
  stop(); // Ensure RAF is paused
  eventManager.off(`animation:play:${props.animationName}`, playEventHandler);
  eventManager.off(`animation:stop:${props.animationName}`, stopEventHandler);
});

// Watch for external changes to props that should control playback or data
watch(
  () => props.autoplay,
  (newAutoplay) => {
    if (newAutoplay && !isPlaying.value) play();
    else if (!newAutoplay && isPlaying.value) stop();
  },
);

watch(
  () => props.spriteData,
  (newData) => {
    if (newData) {
      reset(); // Reset animation state when data changes
      localSpriteData.value = newData;
      emit('loaded');
      if (props.autoplay) play();
    }
  },
);

watch(
  () => props.spriteDataUrl,
  async (newUrl) => {
    if (newUrl) {
      reset();
      await fetchSpriteData();
      if (props.autoplay && frames.value.length > 0) play();
    } else {
      reset(); // Clear animation if URL is removed
      localSpriteData.value = null;
    }
  },
);

// Expose control methods if needed via template refs
defineExpose({ play, stop, reset, isPlaying, currentFrameIndex, displayWidth, displayHeight });
</script>

<style scoped>
.sprite-animation {
  display: inline-block;
  overflow: hidden; /* Important to clip the spritesheet */
  image-rendering: pixelated; /* Good for pixel art sprites */
  /* image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-optimize-contrast;
  -ms-interpolation-mode: nearest-neighbor; */
}
</style>

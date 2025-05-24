<template>
  <div
    ref="target"
    class="animate__animated animate__flipInY overflow-hidden"
    style="
      border-radius: 20px;
      padding: 10px;
      width: 100vw;
      height: 100vh;
      align-items: center;
      justify-content: center;
      z-index: 99999999;
      overflow: hidden;
    "
  >
    <div
      class="left-0 top-0 flex flex-col items-center justify-start overflow-y-hidden"
      style="
        width: 90vw;
        margin: auto;
        overflow: hidden;

        padding: 20px;
        height: 60vh;
        background-repeat: no-repeat;
        border-image: url('/images/common/cell-2.png') 20 20 20 20 fill / 20px 20px 20px 20px;
        padding: 20px 20px 20px 20px;
        max-width: 480px;
        z-index: 99999999;

        background-repeat: no-repeat;
        background-size: 100% 100%;
      "
    >
      <div
        class="mt-3 flex w-full flex-row items-center justify-center"
        style="
          margin: auto;
          max-width: 480px;
          margin-top: 4px;
          align-items: center;
          justify-content: center;
          margin-bottom: 0px;

          padding: 10px;
          background-color: transparent;
        "
      >
        <div class="pt-0" style="font-size: 50px">
          <AuroraText>{{ title }}</AuroraText>
        </div>
        <!-- <div class="absolute right-0 top-1 flex">
          <img
            :src="`${closePressed ? '/images/common/close.png' : '/images/common/close.png'}`"
            style="z-index: 999; width: 40px; height: 40px; right: 0px; top: 0px"
            @click="close()"
          />
        </div> -->
      </div>
      <slot />
      <!-- <img
        src="/images/shop/store-banner.png"
        style="z-index: 899; width: 85vw; height: 100px; right: 0px; top: 0px"
      /> -->
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    title: {
      type: String,
      default: '',
    },
    closePressed: {
      type: Boolean,
      default: false,
    },
  })
  onMounted(() => {
    setTimeout(() => {
      console.log('loaded')
    }, 1000)
  })
  // No specific script setup needed for this static component,
  // but the <script setup> block is standard for Vue 3 Composition API.
  // If you need props or methods later, you can add them here.
</script>

<style scoped>
  /* Import Google Fonts - Inter.
   Alternatively, you can import this in your main CSS file or index.html */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

  /* Custom styles for the glowing effect and base page setup */
  /* Styles that would normally be on html, body are applied to a wrapper or handled globally */
  .glowing-element-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    width: 100vw; /* Simulates full body height for centering */
    /* background-color: #000000; Pure black background for contrast */
    overflow: hidden; /* Prevent scrollbars if element is slightly off due to glow */
    font-family: 'Inter', sans-serif; /* Apply Inter font */
  }

  .element-bg {
    /* Very dark purple, almost black */
    background-color: #1f0137;
  }

  .glowing-element-body {
    /* Required for absolute positioning of the ::before pseudo-element and the title box */
    position: relative;
    /* Ensures the pseudo-element's rounded corners are clipped if they exceed this */
    overflow: visible; /* Changed from hidden to allow top element to protrude */
    /*
      Single, thicker, bright purple/pink glowing border.
      The glow emanates directly from this border.
  */

    box-shadow:
    /* Core of the glowing line */
      0 0 0 2px #ffff,
      /* Glow emanating from the line */ 0 0 7px 2px rgba(224, 176, 255, 0.9),
      0 0 15px 2px rgba(200, 140, 255, 0.7),
      0 0 30px 3px rgba(180, 120, 240, 0.5);
  }

  /* Pseudo-element for the tiled background image */
  .glowing-element-body::before {
    content: ''; /* Necessary for pseudo-elements to be generated */
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /*
    IMPORTANT: Replace this URL with the actual path to your uploaded image.
    Using a placeholder for now.
  */
    background-image: url('/images/common/neon-coin-sm.png'); /* Placeholder image */
    transform: rotate(-40deg); /* Rotate the entire element */
    background-repeat: repeat; /* This tiles the image */
    opacity: 0.06; /* Low opacity for the wallpaper effect */
    z-index: 0; /* Sits on top of element-bg, but below content and title box */
    border-radius: inherit; /* Inherit border-radius from parent to match the shape */
  }

  .glowing-title-box {
    /* Similar glowing border effect as the main body, but can be scaled if needed */
    box-shadow:
      0 0 0 2px #e0b0ff,
      0 0 5px 2px rgba(224, 176, 255, 0.9),
      /* Slightly tighter glow for smaller element */ 0 0 10px 2px rgba(200, 140, 255, 0.7),
      0 0 20px 3px rgba(180, 120, 240, 0.5);
    /* Ensure title box is above the pseudo-element background */
    z-index: 10;
  }
</style>

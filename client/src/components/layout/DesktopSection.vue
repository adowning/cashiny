<script setup>
  import { useAuthStore } from '@/stores/auth.store'

  const { isAuthenticated } = useAuthStore()
  // const isAuthenticated = computed(() => authenticated.loggedIn);
  const { isMobile } = useDisplay()
  console.log(isMobile.value)
</script>

<template>
  <!-- <div class="relative grow-1 flex flex-col max-w-[600px] max-h-[700px]"> -->
  <!-- <div :class="(containerMaxW, desktopMaxHeight, desktopMinHeight)">
    <slot />
  </div> -->
  <!-- <div
    class="flex h-screen items-center justify-center bg-gray-300"
    style="background-image: url(&quot;/images/skyline.jpeg&quot;)"
  > -->
  <!-- <div class="text-center bg-blue-400 rounded-lg min-h-[720px]"> -->
  <!-- Your content here -->
  <!-- <slot /> -->
  <!-- </div> -->
  <!-- </div> -->

  <div class="desktop-section">
    <div class="flex h-screen w-full items-center justify-center">
      <!-- <div class="w-screen"> -->
      <div
        class="game-area-frame-background border-1 border-white-800 relative flex w-[90%] max-w-[1500px] flex-col overflow-hidden rounded-xl shadow-2xl"
      >
        <div class="flex size-full flex-col items-center justify-center p-0 sm:p-0">
          <div
            class="relative flex size-full flex-col items-center justify-center overflow-hidden rounded-lg"
          >
            <div class="h-full grow items-center justify-center overflow-y-auto p-0 sm:p-0 md:p-0">
              <div
                class="main-slot flex h-full flex-col items-center justify-center overflow-hidden p-0"
                style="aspect-ratio: auto 480 / 720"
              >
                <div class="mt-0 size-full min-w-[580px] space-y-0 overflow-hidden">
                  <ShowToasts />
                  <TopBar v-if="isAuthenticated" />
                  <slot />
                  <FooterBar v-if="isAuthenticated" />
                  <!-- <div
                    class="h-16 bg-slate-700/40 rounded flex items-center justify-center text-slate-500 text-sm"
                  >
                    Placeholder Item 1
                  </div>
                  <div
                    class="h-16 bg-slate-700/40 rounded flex items-center justify-center text-slate-500 text-sm"
                  >
                    Placeholder Item 2
                  </div>
                  <div
                    class="h-16 bg-slate-700/40 rounded flex items-center justify-center text-slate-500 text-sm"
                  >
                    Placeholder Item 3
                  </div> -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
  /* Import a standard font for basic text elements */
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap');

  .main-slot {
    background-image: url('/images/starsbg.png');
    background-size: 120% 120%;
    background-origin: border-box;
    background-position: center;
    background-repeat: no-repeat;
  }
  .desktop-section {
    /* Background image from URL provided by user */
    background-image: url('https://www.bigfishcasino.com/_next/static/media/skyline.ca46c0a5.jpeg');
    background-size: cover; /* Cover the entire viewport */
    background-position: center; /* Center the background image */
    /* background-repeat: no-repeat;  */
    min-height: 100vh; /* Make sure the body takes at least the full viewport height */
    font-family: 'Roboto', sans-serif; /* Apply a default sans-serif font */
    /* Flexbox utilities to center the game area on the page */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: auto;
    padding: 0.2rem; /* Reduced padding slightly for larger game area */
  }

  /* Custom class for the background of the main game area's outer border/frame */
  .game-area-frame-background {
    justify-content: center;
    /* Background image for the game area itself, from URL provided by user */
    background-image: url('https://cdn.prod.infra.franchise.madness.games/cardace/decorations/getImage/scrimBackgrounds___skyline_blur_bg.png/s2x/');
    /* background-size: cover; */
    /* background-position: center;  */
    border: 1px solid rgb(107, 121, 205);
    border-radius: 30px;
    box-shadow: rgba(0, 0, 0, 0.8) 0px 0px 24px 0px;
    min-width: 1200px;
    /* max-width: 720px; */
  }
</style>

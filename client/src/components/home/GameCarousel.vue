<script setup lang="ts">
  import { onMounted, ref } from 'vue'

  import { useGameStore } from '@/stores/game.store'
  import { useRouter } from 'vue-router'

  // import FlameEffectOverlay from './FlameEffectOverlay.vue'

  interface Game {
    id: number
    title: string
    developer: string
    name: string // Optional top banner text
    temperature: 'hot' | 'cold' | 'none' // Theme determines border color
    featured?: boolean
  }

  const router = useRouter()
  const gameStore = useGameStore()
  const games = ref<Game[]>(gameStore.gameSearchList.items)

  async function loadGame(game: any) {
    const token = localStorage.getItem('access_token')
    if (!token) {
      console.error('No access token found. Cannot load game.')
      return
    }

    if (game.developer === 'netgame') {
      await router.push(`/games/netgame/?gameName=${game.name}&token=${token}`)
    } else if (game.developer === 'netent') {
      await router.push(`/games/netent/?gameName=${game.name}&token=${token}`)
    } else if (game.developer === 'nolimit') {
      await router.push(`/games/nolimit/?gameName=${game.name}&token=${token}`)
    } else if (game.developer === 'redtiger') {
      await router.push(`/games/redtiger/?gameName=${game.name}&token=${token}`)
    } else {
      console.warn(`Unsupported developer: ${game.developer}`)
    }
  }

  onMounted(() => {
    games.value = gameStore.gameSearchList.items
    // console.log('Games loaded:', games.value)
  })

  // Fallback for broken images
  const onImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    target.src = 'https://placehold.co/300x400/64748b/ffffff?text=Image+Error'
    target.style.objectFit = 'contain'
  }
  // games.filter((game: Game) => {
  //   console.log(`https://images.cashflowcasino.com/${game.developer}/${game.name.toLowerCase()}.avif`)
  // })

  const isFeatured = (game: Game) => game.featured === true
</script>

<template>
  <div
    class="carousel-container bungee align-center relative flex flex-row items-center justify-center"
  >
    <!-- <img
        src="/images/filterbar/side-arrow-prev.avif "
        class="ml-1 flex size-12"
        style="text-align: center"
        @click="scrollBack"
      /> -->

    <div class="carousel-scroll-area">
      <div class="carousel-track">
        <div
          v-for="game in games"
          :key="game.id"
          class="game-card"
          :class="{
            'theme-cold': game.temperature === 'cold',
            'theme-hot': game.temperature === 'hot',
          }"
        >
          <div class="gradient-border"></div>

          <div
            class="card-content relative flex flex-col pt-5"
            :class="{ 'feat mt-3 flex-col align-bottom': isFeatured(game) }"
            :style="{
              backgroundImage: `url(${
                !isFeatured(game) ? '/images/games/tall-field.avif' : '/images/games/featured.webp'
              })`,
            }"
            style="background-size: 100% 100%; background-repeat: no-repeat"
            @click="loadGame(game)"
          >
            <div :class="isFeatured(game) ? 'card__banner_feat' : 'card__banner'" style="">
              <img
                v-if="game.temperature === 'cold'"
                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-blue.png"
                alt=""
                class="card__banner-img"
              />
              <img
                v-else-if="game.temperature === 'hot'"
                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-gold.png"
                alt=""
                class="card__banner-img"
              />
              <img
                v-else
                src="/images/games/hand-banner-black.png"
                alt=""
                class="card__banner-img"
              />
              <div class="card__banner__text bungee pt-1" style="line-height: 1.7">
                <span :style="game.title.length > 12 ? 'font-size: .8rem; ' : 'font-size: 1rem'">
                  {{ game.title.substring(0, 16) }}
                </span>
              </div>
            </div>

            <div
              :class="isFeatured(game) ? 'card-image-container feat box' : 'card-image-container'"
              class="absolute top-0 overflow-hidden"
              style="z-index: 1"
            >
              <!-- <img
                :src="`https://images.cashflowcasino.com/${game.developer}/${game.name.toLowerCase()}.avif`"
                :alt="game.title"
                class="game-image absolute "
                style="z-index: 0; height: 70% ; width: 100%"
                @error="onImageError"
              /> -->
              <div
                style="
                  width: 92%;
                  top: 20px;
                  height: 240px;
                  max-height: 260px;
                  padding-top: 20px;
                  background-position: bottom;
                  background-size: 100% 100%;
                  background-repeat: no-repeat;
                "
                :style="`background-image: url('https://images.cashflowcasino.com/${game.developer.toLowerCase()}/${game.name.toLowerCase()}.avif');`"
                :alt="game.title"
                class="game-image absolute"
                @error="onImageError"
              />
              <!-- <SnowEffectOverlay
                class="absolute bottom-20"
                style="z-index: 2;  width: 30px; bottom: -30px; opacity: .8; height: 20%; "

                v-if="game.temperature === 'cold'"
              /> -->
              <!-- <FireEffectOverlay
                class="absolute bottom-20"
                style="z-index: 2;  width: 40px; bottom: -30px; opacity: .8; height: 30%; "
                v-if="game.temperature === 'hot'"
              />  -->
              <!-- <FlameEffectOverlay
                class="absolute bottom-20"
                style="z-index: 2;  width: 40px; bottom: -30px; opacity: .8; height: 30%; "
                v-if="game.temperature === 'hot'"
              /> -->
              <img
                v-if="game.temperature === 'cold'"
                src="/images/games/speedRTP_1.gif"
                height="40px"
                width="40px"
                style="position: absolute; bottom: 0; left: 0"
              />

              <img
                v-if="game.temperature === 'hot'"
                src="/images/games/speedRTP_5.gif"
                height="40px"
                width="40px"
                style="position: absolute; bottom: 0; left: 0"
              />

              <!-- </img> -->

              <div class="bottom-banner">
                {{ game.developer }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <img
        src="/images/filterbar/side-arrow.avif "
        class="mx-1 flex size-12"
        style="text-align: center"
        @click="scrollForward"
      /> -->
  </div>
</template>

<style scoped>
  /* Your existing styles */

  /* Ensure the image container is relatively positioned and has a z-index */
  .card-image-container {
    height: 100%;
    flex-grow: 1;
    overflow: hidden;
    position: relative; /* Already present */
    border-radius: inherit;
    top: 0;
    z-index: 1; /* Keep or adjust as needed for stacking against other elements */
  }

  /* Ensure the game image has a lower z-index than the effects */
  .game-image {
    z-index: 0; /* Set a lower z-index */
    display: block;
    width: 92%;
    height: 83%;
    margin-top: 10%;
    margin-left: 8px;
    margin-right: 5px;
    top: 0;
    border-radius: 15px;
    border-top-left-radius: 30px;
    border-top-right-radius: 30px;
    border-color: white;
    border-width: 1.5px;
    border-left-style: solid;
    border-right-style: solid;
    border-bottom-style: solid;
    border-top-style: none;
    object-fit: cover;
    transition: transform 0.3s ease;
    position: absolute; /* Ensure position is not static for z-index to work */
  }

  /* The FireEffectOverlay and SnowEffectOverlay components' root divs (.overlay) */
  /* should have a higher z-index than the image. */
  /* We apply this directly in the template using inline styles for clarity */
  /* or you could create specific classes if you prefer */

  /* Other styles remain the same */
  .box {
    height: 40vh;
    min-height: 300px;
    max-height: 450px;
    display: grid;
    place-content: center;
    color: white;
    text-shadow: 0 1px 0 #000;
    --border-angle: 0turn;
    --main-bg: conic-gradient(from var(--border-angle), #213, #112 5%, #112 60%, #213 95%);
    border: solid 2px transparent;
    border-top: 0px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0px;
    border-top-left-radius: 0;
    border-top-right-radius: 0px;
    --gradient-border: conic-gradient(
      from var(--border-angle),
      transparent 25%,
      #08f,
      #f03 99%,
      transparent
    );
    background:
      var(--main-bg) padding-box,
      var(--gradient-border) border-box,
      var(--main-bg) border-box;
    background-position: center center;
    -webkit-animation: bg-spin 2.5s linear infinite;
    animation: bg-spin 2s linear infinite;
  }

  @-webkit-keyframes bg-spin {
    to {
      --border-angle: 1turn;
    }
  }

  @keyframes bg-spin {
    to {
      --border-angle: 1turn;
    }
  }

  .box:hover {
    -webkit-animation-play-state: paused;
    animation-play-state: paused;
  }

  @property --border-angle {
    syntax: '<angle>';
    inherits: true;
    initial-value: 0turn;
  }

  .carousel-container {
    height: 40vh;
    min-height: 300px;
    max-height: 340px;
    width: 100%;
    overflow-x: auto;
    max-width: 600px;
    margin: 0 auto;
    margin-top: 30px;
    overflow-y: hidden;
    overflow-x: auto;
    position: relative;
    padding: 0 0px;
    box-sizing: border-box;
    margin-bottom: 20px;
  }

  .carousel-scroll-area {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    height: 100%;
    max-width: 600px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(to right, #a855f7, #ec4899);
      border-radius: 4px;
      border: 1px solid rgba(0, 0, 0, 0.3);
    }

    &::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(to right, #9333ea, #f472b6);
    }
  }

  .carousel-track {
    display: inline-flex;
    gap: 15px;
    padding: 0px 8px;
    height: 100%;
    box-sizing: border-box;
  }

  .game-card {
    flex-shrink: 0;
    min-width: 200px;
    max-width: 220px;
    max-height: 350px;
    width: calc(100vw - 220px);
    margin-left: 10px;
    height: 100%;
    border-radius: 15px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease-out;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  }

  .card__banner {
    width: 100%;
    position: absolute;
    top: 5%;
    left: 51%;
    transform: translateX(-51.5%) scaleY(1.1);
    background: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-gold.png') 0 0
      no-repeat;
    background-size: 100% 110%;
    z-index: 4;
  }

  .card__banner_feat {
    width: 100%;
    position: absolute;
    top: 9%;
    left: 51%;
    transform: translateX(-51.5%);
    background: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-gold.png') 0 0
      no-repeat;
    background-size: 100% auto;
    z-index: 4;
  }

  .card__banner-img {
    /* Added class for banner images */
    display: block;
    width: 100%;
    height: auto;
  }

  .card__banner__text {
    width: 90%;
    position: absolute;
    flex-wrap: nowrap;
    top: -2px;
    font-weight: 800;
    left: 50%;
    padding-left: 7px;
    padding-right: 7px;
    transform: translate(-51%, 10%);
    z-index: 5;
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.7);
  }

  .gradient-border {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 4px;
    z-index: 1;
    background-clip: content-box, border-box;
    background-origin: border-box;
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  .theme-cold .gradient-border {
    background-image: linear-gradient(135deg, #a855f7, #ec4899);
  }

  .theme-hot .gradient-border {
    background-image: linear-gradient(135deg, #f97316, #eab308);
  }

  .card-content {
    z-index: 2;
    width: 100%;
    height: 100%;
    max-height: 350px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: inherit;
    top: 0;
  }

  .card-content.feat {
    z-index: 2;
    width: 100%;
    height: 95%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: inherit;
    top: 0;
  }

  .card-image-container.feat {
    margin-top: 25px;
  }
  .card-image-container.feat.span {
    margin-left: 5px;
    margin-right: 5px;
  }

  .bottom-banner {
    position: absolute;
    left: 0;
    width: 100%;
    background-color: transparent;
    color: white;
    text-align: center;
    font-size: 0.9rem;
    font-weight: bold;
    padding: 8px 8px;
    text-transform: uppercase;
    z-index: 3; /* Ensure banner is above image (z-index: 2) but below highest z-index if any */
    box-sizing: border-box;
    bottom: 0;
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
  }

  /* Responsive Adjustments */
  @media (max-width: 768px) {
    .game-card {
      min-width: 150px;
    }

    .top-banner {
      font-size: 0.7rem;
    }

    .bottom-banner {
      font-size: 0.8rem;
      padding: 6px;
    }
  }

  @media (max-width: 480px) {
    .game-card {
      min-width: 130px;
    }

    .carousel-track {
      gap: 10px;
    }

    .carousel-container {
      padding: 0 5px;
    }
  }
</style>

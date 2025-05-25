<template>
  <div style="width: 100vw; height: 100vh"><RtgGameLoader :options="gameLaunchOptions" /></div>
</template>

<script setup lang="ts">
  import RtgGameLoader from '@/components/games/RtgGameLoader.vue' // Adjust path if needed
  import { reactive } from 'vue'

  // Define the type for the mode explicitly if you want to be able to change it
  type GameMode = 'real' | 'demo'
  interface RtgGameLaunchOptions {
    gameId: string
    lang?: string
    currency?: string
    mode?: 'real' | 'demo'
    rgsApiBase?: string
    gameCdnBase?: string
    operator?: string
    provider?: string
    depositUrl?: string
    lobbyUrl?: string
  }

  // Correctly typed gameOptions
  const gameLaunchOptions = reactive<RtgGameLaunchOptions>({
    gameId: '777Strike', // Or dynamically set this
    lang: 'en',
    currency: 'USD',
    mode: 'real',
    rgsApiBase: '/api/games/rtg/platform', // Example: This should point to YOUR server
    operator: 'yourOperatorName', // As configured in your RTG setup
    provider: 'kronos', // Or whatever RTG uses for your setup
    lobbyUrl: '/lobby',
    depositUrl: '/account/deposit',
  })

  // Or, if you always want it to be 'real' or 'demo' directly:
  // const gameOptions = reactive({
  //   gameId: "777Strike",
  //   lang: "en",
  //   currency: "USD",
  //   mode: 'real', // This literal is directly assignable
  //   // ...
  // });
</script>

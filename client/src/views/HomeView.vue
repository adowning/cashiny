<script setup lang="ts">
  // import Vip from '@/components/vip/index.vue';
  import { useGameStore } from '@/stores/game.store'

  const { isMobile } = useDisplay()
  const eventBus = useEventManager()
  const settingsModal = ref(false)
  const gamelist = ref()
  const gameStore = useGameStore()
  const { gameSearchList } = storeToRefs(gameStore)

  // console.log(isMobile.value);
  eventBus.on('settingsModal', (val) => {
    console.log('x')
    settingsModal.value = val
  })
</script>
<template>
  <BackGround />
  <LiveWin />
  <GameCarousel
    v-if="gameSearchList !== undefined && gameSearchList?.items.length > 0"
    :style="`${isMobile ? 'margin-top: 0px' : 'margin-top: 20px'}`"
  />
  <FilterBar />
  <AdCarousel />
  <SettingsView :has-cancel="false" :model-value="settingsModal" />
  <!-- <Vip /> -->
</template>
<style scoped></style>

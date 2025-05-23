<script setup lang="ts">
  const { isMobile } = useDisplay()
  const eventBus = useEventManager()
  const settingsModal = ref(false)
  const gameStore = useGameStore()
  const { gameSearchList } = storeToRefs(gameStore)

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

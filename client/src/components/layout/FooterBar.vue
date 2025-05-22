<script setup lang="ts">
  import LeaderJson from '@/assets/anim/leadernew.json'
  import Part3Json from '@/assets/anim/part3.json'
  import { useAppBarStore } from '@/stores/appBar.store'
  import { useDepositStore } from '@/stores/deposit.store'
  import { ref } from 'vue'
  import VaultJson from '@/assets/anim/vault.json'

  import { useEventManager } from '@/composables/EventManager'
  const eventBus = useEventManager()

  const target = ref()

  const authStore = useAuthStore()
  // --- State & Getters from Stores (using storeToRefs for reactivity) ---
  const {
    // isAuthenticated,
    currentUser,
    // initialAuthCheckComplete,
    // error: authError, // Renamed for clarity if used directly in template logic for isAppLoading
  } = storeToRefs(authStore)

  const depositStore = useDepositStore()
  const appBarStore = useAppBarStore()
  const pressed = ref(false)
  const { isMobile } = useDisplay()
  const leaderBoardOpen = ref(false)
  const rightDrawer = ref(false)
  const bonusDrawer = ref(false)
  const wheelPageOpen = ref(false)
  function toggleChat() {
    rightDrawer.value = !rightDrawer.value
    appBarStore.setRightBarToggle(rightDrawer.value)
  }
  function toggleBonusDrawer() {
    bonusDrawer.value = !bonusDrawer.value
    appBarStore.setBonusDashboardDialogVisible(bonusDrawer.value)
  }
  function _toggleShopOpen() {
    console.log('asdf')
    depositStore.toggleShopOpen()
  }
  function changeLeaderBoardOpen() {
    console.log(leaderBoardOpen)
    leaderBoardOpen.value = true
    eventBus.emit('leaderBoardOpen', leaderBoardOpen.value)
  }
  function changeWheelPageOpen() {
    pressed.value = !pressed.value
    leaderBoardOpen.value = true
    eventBus.emit('wheelPageOpen', wheelPageOpen.value)
  }
</script>

<template>
  <div ref="target" class="bbar animate__animated animate__slideInUp flex" style="width: 100%">
    <!-- <BaseLevel> -->
    <div
      class="flex flex-row justify-start gap-12 px-6"
      style="
        width: 100%;
        z-index: 888;
        background-image: url('/images/bottom/slice.avif');
        background-size: contain;
      "
    >
      <div
        class="items-end justify-start"
        style="display: flex; flex-wrap: nowrap; grid-gap: 0px; padding: 2px"
      >
        <div class="wn-btn-item" @click="changeWheelPageOpen">
          <WheelIcon
            :pressed="pressed"
            :current-user="currentUser"
            style="z-index: 999; margin-bottom: 35px; margin-left: -32px"
          />
        </div>
        <div class="flex w-9" />

        <div class="wn-btn-item" @click="changeLeaderBoardOpen()">
          <VGSprite
            id="leader"
            class="flex"
            image-src="/images/bottom/leadernew.png"
            :sprite-sheet-data="LeaderJson"
            style="background-repeat: no-repeat; z-index: 10; margin-top: -58px; margin-right: 5px"
            :speed="30"
            :delay="3500"
            :offset="12000"
            :autoplay="true"
          />
          <span class="glow rounded-lg px-1" style="font-size: 16px; line-height: 1.3"
            >Battles</span
          >
        </div>
        <div class="flex w-5" />
        <div class="wn-btn-item mr-3 pt-22" style="margin-top: 19px" @click="_toggleShopOpen">
          <VGSprite
            id="vaultIcon"
            class="flex"
            image-src="/images/bottom/vault.png"
            :sprite-sheet-data="VaultJson"
            style="
              background-repeat: no-repeat;
              z-index: 10;
              margin-top: -200px;
              padding-top: 30px;
              margin-right: -27px;
              transform: scale(0.6) translateY(55px);
            "
            :speed="60"
            :delay="6000"
            :offset="5000"
            :autoplay="true"
          />
          <span
            class="glow align-center justify-center rounded-lg px-1"
            style="font-size: 16px; line-height: 1.3"
            >Deposit</span
          >
        </div>
      </div>

      <!-- <div
        v-if="showFab"
        class="w-full relative items-end justify-end"
        style="
          width: 80px;
          height: 80px;
          max-width: 80px;
          max-height: 80px;
          background-color: green;
        "
        @click="toggleBonusDrawer()"
      > -->
      <div
        style="
          position: absolute;
          right: 0px;
          bottom: 11px;
          background-repeat: no-repeat;
          padding: 0px;
          background-size: cover;
          min-height: 90px;
          height: 90px;
          z-index: 99999;
          width: 90px;
          /* margin-left: 50px; */
          background-image: url('/images/bottom/bottombarback-center3.avif');
        "
      />
      <VGSprite
        id="part3Icon"
        class="flex"
        image-src="/images/bottom/part3_blue.png"
        :sprite-sheet-data="Part3Json"
        style="
          position: absolute;
          background-repeat: no-repeat;
          z-index: 10;
          /* margin-top: -100px; */
          right: 0px;
          bottom: 17px;
          margin-top: -6px;
          margin-right: 3.5px;
          /* transform: translateY(55px); */
        "
        :speed="30"
        :delay="0"
        :offset="0"
        :autoplay="true"
      />
      <!-- </div> -->
    </div>
    <!-- </BaseLevel> -->
  </div>
</template>

<style scoped>
  .bbar {
    background-size: cover;
    position: relative;
    height: 5%;
    background-position: center;
    bottom: 5%;
    left: 0px;
    background-repeat: no-repeat;
  }

  .wn-btn-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    flex-basis: 100%;
    transition: all 0.3s;
    box-sizing: border-box;
  }

  @media (min-width: 576px) {
    .wn-btn-container {
      cursor: pointer;
    }
  }

  .wn-btn-item {
    width: 62px;
    max-width: 62px;
    min-width: 62px;
    color: white;
    height: 70%;
    max-height: 70px;
    display: flex;
    flex-direction: column;
    justify-content: end;
    align-items: end;
    position: relative;
  }
</style>

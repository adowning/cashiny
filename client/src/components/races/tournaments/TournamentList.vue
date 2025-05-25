<template>
  <div class="p-4 md:p-6 lg:p-8 bg-gray-900 min-h-screen">
    <header class="mb-8 text-center">
      <h1 class="text-4xl font-bold text-white">Tournaments</h1>
      <p class="text-gray-400 mt-2">Browse active and upcoming tournaments.</p>
    </header>

    <div v-if="tournamentStore.isLoadingList" class="text-center text-gray-400 py-10">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-lg">Loading Tournaments...</p>
    </div>

    <div
      v-else-if="tournamentsToDisplay.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <TournamentCard
        v-for="tournament in tournamentsToDisplay"
        :key="tournament.id"
        :tournament="tournament"
      />
    </div>

    <div v-else class="text-center text-gray-500 py-10">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-16 w-16 mx-auto mb-4 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21.254 12.004L21.254 12.004M17.88 15.378l-.001-.001M17.88 8.622l-.001.001M6.12 15.378l.001-.001M6.12 8.622l.001.001M12.004 3.746l.001-.001M12.004 20.254l.001.001"
          opacity="0.4"
        />
      </svg>
      <p class="text-xl">No tournaments found.</p>
      <p class="text-gray-400">Check back later or try different filters.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, onActivated, onDeactivated } from 'vue'
  import { useTournamentStore } from '@/stores/tournament.store'
  import TournamentCard from '@/components/races/tournaments/TournamentCard.vue' // Adjust path if needed
  import { TournamentStatus, type TournamentCore } from '@cashflow/types'

  const tournamentStore = useTournamentStore()

  // For now, we'll focus on active tournaments. Tabs can be added later.
  // const activeTab = ref<'active' | 'upcoming'>('active'); // Example for tabbed interface

  const tournamentsToDisplay = computed((): TournamentCore[] => {
    // if (activeTab.value === 'active') {
    return tournamentStore.activeTournaments
    // } else if (activeTab.value === 'upcoming') {
    //   return tournamentStore.upcomingTournaments;
    // }
    // return [];
  })

  // function setActiveTab(tab: 'active' | 'upcoming') {
  //   activeTab.value = tab;
  //   fetchDataForCurrentTab();
  // }

  function fetchDataForCurrentTab() {
    // if (activeTab.value === 'active') {
    tournamentStore.fetchTournaments({ status: TournamentStatus.ACTIVE, activeNow: true })
    // } else if (activeTab.value === 'upcoming') {
    //   tournamentStore.fetchTournaments({ status: TournamentStatus.UPCOMING });
    // }
  }

  onMounted(() => {
    fetchDataForCurrentTab()
    tournamentStore.subscribeToGeneralTournamentAnnouncements() // Subscribe to new tournament notifications
  })

  // If using KeepAlive with Vue Router, these hooks can be useful
  onActivated(() => {
    // Re-fetch or check for updates if component was kept alive and is reactivated
    fetchDataForCurrentTab()
    tournamentStore.subscribeToGeneralTournamentAnnouncements()
  })

  onDeactivated(() => {
    // Clean up subscriptions if the component is deactivated (but kept alive)
    // This depends on whether you want updates in the background or only when view is active
    // For a global store managing data, explicit unsubscription here might not always be needed
    // if the store itself handles global event listeners.
    // tournamentStore.unsubscribeFromGeneralTournamentAnnouncements();
  })

  // If you are not using KeepAlive, onUnmounted is more relevant for cleanup
  // onUnmounted(() => {
  //   tournamentStore.unsubscribeFromGeneralTournamentAnnouncements();
  // });
</script>

<style scoped>
  /* Scoped styles for TournamentList if needed */
</style>

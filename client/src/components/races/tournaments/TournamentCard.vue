<template>
  <div
    class="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-5 hover:shadow-blue-500/30 transition-shadow duration-300 flex flex-col justify-between"
  >
    <div>
      <div class="flex justify-between items-start mb-3">
        <h3 class="text-xl font-bold text-white truncate" :title="tournament.name">
          {{ tournament.name }}
        </h3>
        <span
          :class="statusClasses"
          class="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap"
        >
          {{ formattedStatus }}
        </span>
      </div>

      <p
        v-if="tournament.description"
        class="text-gray-400 text-sm mb-3 h-10 overflow-hidden text-ellipsis"
      >
        {{ tournament.description }}
      </p>
      <div v-else class="text-gray-500 text-sm mb-3 h-10 italic">No description available.</div>

      <div class="space-y-2 text-sm mb-4">
        <div class="flex items-center text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Starts: {{ formattedStartTime }}</span>
        </div>
        <div v-if="tournament.endTime" class="flex items-center text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Ends: {{ formattedEndTime }}</span>
        </div>
        <div v-else-if="tournament.targetScore" class="flex items-center text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Target Score: {{ tournament.targetScore?.toLocaleString() }}</span>
        </div>

        <div v-if="tournament.prizeFund" class="flex items-center text-yellow-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>Prize Pool: {{ tournament.prizeFund?.toLocaleString() }}</span>
        </div>
        <div
          v-if="tournament.participantCount !== undefined"
          class="flex items-center text-gray-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>Participants: {{ tournament.participantCount }}</span>
        </div>
      </div>
    </div>

    <div class="mt-auto pt-4 border-t border-gray-700 flex space-x-2">
      <button
        @click="handleViewDetails"
        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm"
      >
        View Details
      </button>
      <button
        v-if="canJoin"
        @click="handleJoinTournament"
        :disabled="isJoining"
        class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isJoining ? 'Joining...' : 'Join Tournament' }}
      </button>
      <p v-else-if="isJoined" class="flex-1 text-center text-green-400 py-2 text-sm font-semibold">
        Joined
      </p>
      <p
        v-else-if="!isUpcomingOrActive"
        class="flex-1 text-center text-gray-500 py-2 text-sm font-semibold"
      >
        Not Joinable
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, type PropType } from 'vue'
  import { useRouter } from 'vue-router'
  import type { TournamentCore } from '@cashflow/types'
  import { TournamentStatus } from '@cashflow/types' // Assuming TournamentStatus enum is exported
  import { useTournamentStore } from '@/stores/tournament.store'
  import { useAuthStore } from '@/stores/auth.store' // To check if user is part of it

  const props = defineProps({
    tournament: {
      type: Object as PropType<TournamentCore>,
      required: true,
    },
  })

  const router = useRouter()
  const tournamentStore = useTournamentStore()
  const authStore = useAuthStore()

  const isJoining = computed(
    () => tournamentStore.isJoining //&& tournamentStore.joinTournament === props.tournament.id
  ) // Assuming store tracks joining ID

  const formattedStartTime = computed(() => {
    return new Date(props.tournament.startTime).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  })

  const formattedEndTime = computed(() => {
    if (!props.tournament.endTime) return 'N/A (Score Target)'
    return new Date(props.tournament.endTime).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  })

  const formattedStatus = computed(() => {
    switch (props.tournament.status) {
      case TournamentStatus.ACTIVE:
        return 'Active'
      case TournamentStatus.PENDING:
        return 'Upcoming'
      case TournamentStatus.COMPLETED:
        return 'Ended'
      case TournamentStatus.CANCELLED:
        return 'Cancelled'
      default:
        return props.tournament.status
    }
  })

  const statusClasses = computed(() => {
    switch (props.tournament.status) {
      case TournamentStatus.ACTIVE:
        return 'bg-green-500 text-green-900'
      case TournamentStatus.PENDING:
        return 'bg-yellow-400 text-yellow-900'
      case TournamentStatus.COMPLETED:
        return 'bg-gray-500 text-gray-100'
      case TournamentStatus.CANCELLED:
        return 'bg-red-500 text-red-100'
      default:
        return 'bg-gray-600 text-gray-200'
    }
  })

  const isUpcomingOrActive = computed(() => {
    return (
      props.tournament.status === TournamentStatus.PENDING ||
      props.tournament.status === TournamentStatus.ACTIVE
    )
  })

  // A more robust check would involve checking if the user ID is in the tournament's participant list.
  // This requires more data on the TournamentCore or a separate check.
  // For now, we assume `userTournamentIds` in the store holds IDs of tournaments the user has joined.
  const isJoined = computed(() => {
    return tournamentStore.userTournamentIds.includes(props.tournament.id)
  })

  const canJoin = computed(() => {
    return isUpcomingOrActive.value && !isJoined.value && authStore.isAuthenticated // Must be authenticated
  })

  const handleViewDetails = () => {
    router.push({ name: 'TournamentDetails', params: { id: props.tournament.id } })
    // Ensure you have a route named 'TournamentDetails' that accepts an 'id' param
  }

  const handleJoinTournament = async () => {
    // if (!props.tournament.id) return
    // // To provide feedback for specific card being joined:
    // if (tournamentStore.isJoining && tournamentStore.joiningTournament !== props.tournament.id) {
    //   // Already joining another tournament, prevent concurrent joins from UI on this card
    //   return
    // }
    // tournamentStore.setJoiningTournamentId(props.tournament.id) // Action to set which one is being joined
    // await tournamentStore.joinTournament(props.tournament.id)
    // tournamentStore.clearJoiningTournamentId() // Action to clear
  }
</script>

<style scoped>
  /* Add any component-specific styles here if needed, though Tailwind aims to minimize this. */
  .h-10 {
    height: 2.5rem; /* 40px */
  }
  /* For text-ellipsis, ensure parent has overflow-hidden and a defined width/height */
</style>

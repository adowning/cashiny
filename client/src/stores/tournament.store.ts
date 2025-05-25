import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue' // Added watch for wsStatus
import {
  type TournamentCore,
  type TournamentDetailed,
  type TournamentParticipantInfo,
  type ListTournamentsRequestQuery,
  type GetTournamentLeaderboardRequestQuery,
  type JoinTournamentResponse,
  type TournamentCreatedPayload,
  type TournamentStartedPayload,
  type TournamentEndedPayload,
  type TournamentParticipantJoinedPayload,
  type TournamentLeaderboardUpdatedPayload,
  TournamentStatus,
} from '@cashflow/types'
// import { TournamentStatus } from '@cashflow/types' // Ensure this enum is correctly exported and imported

import useApiClient from '@/composables/useApiClient'
import { useAppWebSocket } from '@/composables/useAppWebsocket' //
import { useEventManager, type IEventManagerService } from '@/composables/EventManager' //
import { useNotificationStore } from '@/stores/notification.store' //

// Zod schemas for client-to-server messages
import {
  SubscribeToTournamentTopic,
  UnsubscribeFromTournamentTopic,
  SubscribeToGeneralTournaments,
  UnsubscribeFromGeneralTournaments,
} from '@/../../server/src/sockets/schema' // Adjust path as needed, or move to @cashflow/types

// WebSocket event types from server (ensure these match server's outgoing message.type)
const WS_EVENT_TYPES = {
  TOURNAMENT_CREATED: 'TOURNAMENT_CREATED_WS',
  TOURNAMENT_STARTED: 'TOURNAMENT_STARTED_WS',
  TOURNAMENT_ENDED: 'TOURNAMENT_ENDED_WS',
  TOURNAMENT_PARTICIPANT_JOINED: 'TOURNAMENT_PARTICIPANT_JOINED_WS',
  TOURNAMENT_LEADERBOARD_UPDATED: 'TOURNAMENT_LEADERBOARD_UPDATE_WS',
}

// Define a basic type for WebSocket message metadata if not already in @cashflow/types
type WebSocketMeta = { timestamp: number; clientId?: string; [key: string]: any }

export const useTournamentStore = defineStore('tournament', () => {
  const apiClient = useApiClient()
  const { status: wsStatus, sendTypedMessage, close: closeWebSocket } = useAppWebSocket() // Assuming sendTypedMessage is now exposed
  const eventManager: IEventManagerService = useEventManager()
  const notificationStore = useNotificationStore()

  // --- State ---
  const tournaments = ref<Record<string, TournamentCore>>({})
  const activeTournamentIds = ref<string[]>([])
  const upcomingTournamentIds = ref<string[]>([])
  const userTournamentIds = ref<string[]>([])
  const currentTournamentDetails = ref<TournamentDetailed | null>(null)
  const currentTournamentLeaderboard = ref<TournamentParticipantInfo[]>([])
  const isLoadingList = ref<boolean>(false)
  const isLoadingDetails = ref<boolean>(false)
  const isJoining = ref<boolean>(false)
  const isLoadingLeaderboard = ref<boolean>(false)

  // --- Getters ---
  const getTournamentById = computed(
    () =>
      (id: string): TournamentCore | null =>
        tournaments.value[id] || null
  )
  const activeTournaments = computed(
    (): TournamentCore[] =>
      activeTournamentIds.value
        .map((id) => tournaments.value[id])
        .filter(Boolean) as TournamentCore[]
  )
  const upcomingTournaments = computed(
    (): TournamentCore[] =>
      upcomingTournamentIds.value
        .map((id) => tournaments.value[id])
        .filter(Boolean) as TournamentCore[]
  )
  const userJoinedTournaments = computed(
    (): TournamentCore[] =>
      userTournamentIds.value.map((id) => tournaments.value[id]).filter(Boolean) as TournamentCore[]
  )

  // --- Actions ---
  async function fetchTournaments(query: ListTournamentsRequestQuery = {}): Promise<void> {
    isLoadingList.value = true
    try {
      const responseData = await apiClient.tournaments?.list(query)
      if (responseData == undefined)
        return notificationStore.addNotification('error', 'Failed to fetch tournaments.')
      responseData.forEach((tournament) => {
        tournaments.value[tournament.id] = tournament
      })
      if (query.activeNow || query.status === TournamentStatus.ACTIVE) {
        activeTournamentIds.value = responseData.map((t) => t.id)
      } else if (query.status === TournamentStatus.PENDING) {
        upcomingTournamentIds.value = responseData.map((t) => t.id)
      }
    } catch (error: any) {
      console.error('Failed to fetch tournaments:', error)
      notificationStore.addNotification(
        'error',
        error.data?.message || error.message || 'Failed to fetch tournaments.'
      )
    } finally {
      isLoadingList.value = false
    }
  }

  async function fetchTournamentDetails(tournamentId: string): Promise<void> {
    isLoadingDetails.value = true
    if (currentTournamentDetails.value?.id !== tournamentId) {
      currentTournamentDetails.value = null
      currentTournamentLeaderboard.value = []
    }
    try {
      const tournament: TournamentDetailed = await apiClient.tournaments?.getDetails(tournamentId)
      currentTournamentDetails.value = tournament
      if (tournament.participants) {
        currentTournamentLeaderboard.value = tournament.participants
      } else {
        await fetchTournamentLeaderboard(tournamentId)
      }
      subscribeToTournamentUpdates(tournamentId, 'updates')
      subscribeToTournamentUpdates(tournamentId, 'leaderboard')
    } catch (error: any) {
      console.error(`Failed to fetch tournament details for ${tournamentId}:`, error)
      notificationStore.addNotification(
        'error',
        error.data?.message ||
          error.message ||
          `Failed to fetch details for tournament ${tournamentId}.`
      )
      currentTournamentDetails.value = null
    } finally {
      isLoadingDetails.value = false
    }
  }

  async function fetchTournamentLeaderboard(
    tournamentId: string,
    query?: GetTournamentLeaderboardRequestQuery
  ): Promise<void> {
    isLoadingLeaderboard.value = true
    try {
      const leaderboard: TournamentParticipantInfo[] = await apiClient.tournaments.getLeaderboard(
        tournamentId,
        query
      )
      currentTournamentLeaderboard.value = leaderboard
    } catch (error: any) {
      console.error(`Failed to fetch leaderboard for ${tournamentId}:`, error)
      notificationStore.addNotification(
        'error',
        error.data?.message || error.message || `Failed to fetch leaderboard for ${tournamentId}.`
      )
    } finally {
      isLoadingLeaderboard.value = false
    }
  }

  async function joinTournament(tournamentId: string): Promise<boolean> {
    isJoining.value = true
    try {
      await apiClient.tournaments.join(tournamentId) // Assuming response is successful if no error
      if (!userTournamentIds.value.includes(tournamentId)) {
        userTournamentIds.value.push(tournamentId)
      }
      if (tournaments.value[tournamentId]?.participantCount !== undefined) {
        tournaments.value[tournamentId].participantCount!++
      }
      notificationStore.addNotification(
        'info',
        `Successfully joined tournament: ${tournaments.value[tournamentId]?.name || tournamentId}!`
      )
      return true
    } catch (error: any) {
      console.error(`Failed to join tournament ${tournamentId}:`, error)
      notificationStore.addNotification(
        'error',
        error.data?.message || error.message || `Failed to join tournament ${tournamentId}.`
      )
      return false
    } finally {
      isJoining.value = false
    }
  }

  // --- WebSocket Message Senders ---
  function sendSubscriptionMessage(
    schema:
      | typeof SubscribeToTournamentTopic
      | typeof UnsubscribeFromTournamentTopic
      | typeof SubscribeToGeneralTournaments
      | typeof UnsubscribeFromGeneralTournaments,
    payload?: any // Explicitly any for cases like SubscribeToGeneralTournaments where payload is undefined
  ): void {
    if (wsStatus.value !== 'OPEN') {
      notificationStore.addNotification(
        'warning',
        'WebSocket not connected. Cannot send subscription message.'
      )
      return
    }
    // @ts-ignore because payload can be undefined for some schemas, and sendTypedMessage handles it.
    const success = sendTypedMessage(schema, payload)
    if (success) {
      // notificationStore.addNotification("info",`Subscription message sent: ${schema.shape.type.value}`);
    } else {
      // sendTypedMessage should internally show an error via notificationStore
    }
  }

  function subscribeToTournamentUpdates(
    tournamentId: string,
    topicType: 'updates' | 'leaderboard'
  ): void {
    sendSubscriptionMessage(SubscribeToTournamentTopic, { tournamentId, topicType })
  }

  function unsubscribeFromTournamentUpdates(
    tournamentId: string,
    topicType: 'updates' | 'leaderboard'
  ): void {
    sendSubscriptionMessage(UnsubscribeFromTournamentTopic, { tournamentId, topicType })
  }

  function subscribeToGeneralTournamentAnnouncements(): void {
    sendSubscriptionMessage(SubscribeToGeneralTournaments)
  }

  function unsubscribeFromGeneralTournamentAnnouncements(): void {
    sendSubscriptionMessage(UnsubscribeFromGeneralTournaments)
  }

  // --- WebSocket Event Handlers (called by EventManager listeners) ---
  function handleTournamentCreated(payload: TournamentCreatedPayload, meta?: WebSocketMeta): void {
    console.log('WS Event: Tournament Created', payload, meta)
    notificationStore.addNotification('info', `New tournament available: ${payload.name}!`)
    fetchTournaments({ status: TournamentStatus.PENDING })
  }

  function handleTournamentStarted(payload: TournamentStartedPayload, meta?: WebSocketMeta): void {
    console.log('WS Event: Tournament Started', payload, meta)
    notificationStore.addNotification('info', `Tournament "${payload.name}" has started!`)
    const tournament = tournaments.value[payload.tournamentId]
    if (tournament) {
      tournament.status = TournamentStatus.ACTIVE
      const upcomingIndex = upcomingTournamentIds.value.indexOf(payload.tournamentId)
      if (upcomingIndex > -1) upcomingTournamentIds.value.splice(upcomingIndex, 1)
      if (!activeTournamentIds.value.includes(payload.tournamentId)) {
        activeTournamentIds.value.push(payload.tournamentId)
      }
    }
    if (currentTournamentDetails.value?.id === payload.tournamentId) {
      currentTournamentDetails.value.status = TournamentStatus.ACTIVE
      currentTournamentDetails.value.endTime =
        payload.endTime || currentTournamentDetails.value.endTime
    }
  }

  function handleTournamentEnded(payload: TournamentEndedPayload, meta?: WebSocketMeta): void {
    console.log('WS Event: Tournament Ended', payload, meta)
    notificationStore.addNotification('info', `Tournament "${payload.name}" has ended.`)
    const tournament = tournaments.value[payload.tournamentId]
    if (tournament) {
      tournament.status = TournamentStatus.COMPLETED
      const activeIndex = activeTournamentIds.value.indexOf(payload.tournamentId)
      if (activeIndex > -1) activeTournamentIds.value.splice(activeIndex, 1)
    }
    if (currentTournamentDetails.value?.id === payload.tournamentId) {
      currentTournamentDetails.value.status = TournamentStatus.COMPLETED
      if (currentTournamentDetails.value.id) {
        // Refetch details to get final state/winners
        fetchTournamentDetails(currentTournamentDetails.value.id)
      }
    }
  }

  function handleParticipantJoined(
    payload: TournamentParticipantJoinedPayload,
    meta?: WebSocketMeta
  ): void {
    console.log('WS Event: Participant Joined', payload, meta)
    // notificationStore.addNotification("info",`${payload.username} joined tournament: ${tournaments.value[payload.tournamentId]?.name || payload.tournamentId}`);
    const tournament = tournaments.value[payload.tournamentId]
    if (tournament?.participantCount !== undefined) tournament.participantCount++
    if (currentTournamentDetails.value?.id === payload.tournamentId) {
      if (currentTournamentDetails.value.participantCount !== undefined) {
        currentTournamentDetails.value.participantCount++
      }
    }
  }

  function handleLeaderboardUpdate(
    payload: TournamentLeaderboardUpdatedPayload,
    meta?: WebSocketMeta
  ): void {
    console.log('WS Event: Leaderboard Update', payload, meta)
    if (currentTournamentDetails.value?.id === payload.tournamentId) {
      currentTournamentLeaderboard.value = payload.leaderboard
      // notificationStore.addNotification("info",`Leaderboard updated for ${currentTournamentDetails.value.name}.`);
    }
  }

  // --- Setup Event Listeners using EventManager ---
  const eventManagerTarget = {
    id: 'tournamentStoreListener-' + Math.random().toString(36).substring(7),
  }

  eventManager.on(
    WS_EVENT_TYPES.TOURNAMENT_CREATED,
    handleTournamentCreated as (...args: any[]) => void,
    eventManagerTarget
  )
  eventManager.on(
    WS_EVENT_TYPES.TOURNAMENT_STARTED,
    handleTournamentStarted as (...args: any[]) => void,
    eventManagerTarget
  )
  eventManager.on(
    WS_EVENT_TYPES.TOURNAMENT_ENDED,
    handleTournamentEnded as (...args: any[]) => void,
    eventManagerTarget
  )
  eventManager.on(
    WS_EVENT_TYPES.TOURNAMENT_PARTICIPANT_JOINED,
    handleParticipantJoined as (...args: any[]) => void,
    eventManagerTarget
  )
  eventManager.on(
    WS_EVENT_TYPES.TOURNAMENT_LEADERBOARD_UPDATED,
    handleLeaderboardUpdate as (...args: any[]) => void,
    eventManagerTarget
  )

  const stopStore = (): void => {
    console.log('Tournament store cleaning up WebSocket event listeners...')
    eventManager.off(WS_EVENT_TYPES.TOURNAMENT_CREATED, eventManagerTarget)
    eventManager.off(WS_EVENT_TYPES.TOURNAMENT_STARTED, eventManagerTarget)
    eventManager.off(WS_EVENT_TYPES.TOURNAMENT_ENDED, eventManagerTarget)
    eventManager.off(WS_EVENT_TYPES.TOURNAMENT_PARTICIPANT_JOINED, eventManagerTarget)
    eventManager.off(WS_EVENT_TYPES.TOURNAMENT_LEADERBOARD_UPDATED, eventManagerTarget)

    if (currentTournamentDetails.value) {
      unsubscribeFromTournamentUpdates(currentTournamentDetails.value.id, 'updates')
      unsubscribeFromTournamentUpdates(currentTournamentDetails.value.id, 'leaderboard')
    }
    // unsubscribeFromGeneralTournamentAnnouncements(); // If it was subscribed by default
  }

  // Watch for WebSocket disconnection to potentially clean up listeners
  watch(wsStatus, (newStatus: string) => {
    if (newStatus === 'CLOSED') {
      console.log('WebSocket closed, cleaning up tournament store listeners (if any were missed).')
      // Note: This might be redundant if EventManager or components handle their own listener cleanup upon WS closure.
      // stopStore(); // Be cautious with this, as it might re-run if ws tries to reconnect and store re-inits.
    } else if (newStatus === 'OPEN') {
      // Optionally re-subscribe to general announcements if that's a desired behavior
      // subscribeToGeneralTournamentAnnouncements();
      // If viewing a tournament, re-subscribe to its updates
      if (currentTournamentDetails.value?.id) {
        subscribeToTournamentUpdates(currentTournamentDetails.value.id, 'updates')
        subscribeToTournamentUpdates(currentTournamentDetails.value.id, 'leaderboard')
      }
    }
  })

  return {
    // State
    tournaments,
    activeTournamentIds,
    upcomingTournamentIds,
    userTournamentIds,
    currentTournamentDetails,
    currentTournamentLeaderboard,
    isLoadingList,
    isLoadingDetails,
    isJoining,
    isLoadingLeaderboard,

    // Getters
    getTournamentById,
    activeTournaments,
    upcomingTournaments,
    userJoinedTournaments,

    // Actions
    fetchTournaments,
    fetchTournamentDetails,
    fetchTournamentLeaderboard,
    joinTournament,

    // WebSocket Senders
    subscribeToTournamentUpdates,
    unsubscribeFromTournamentUpdates,
    subscribeToGeneralTournamentAnnouncements,
    unsubscribeFromGeneralTournamentAnnouncements,

    stopStore,
  }
})

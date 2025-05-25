// (e.g., in server.ts or a module initialized by it)

import { typedAppEventEmitter, AppEvents } from '../../events'
import { Server } from 'bun' // Bun server type

// import { DatabaseUpdate } from '@/sockets/schema' // Using an existing schema for structure example
import { validateAndPublish } from '@/utils/ws.utils' //
import { TournamentLeaderboardUpdateEvent } from '@/sockets/schema'

// Then in your server.ts where `app` (Hono) and `server` (Bun) are created:
// const server = Bun.serve({
//   fetch: app.fetch,
//   websocket: wsRouter.websocket, // Assuming wsRouter is your WebSocketRouter instance
//   // ... other server options
// });
// setupTournamentWebSocketListeners(server);
// Don't forget to call initTournamentScheduler() from the service at server startup:
// tournamentService.initTournamentScheduler();
import * as tournamentService from '../tournament.service'
import {
  TournamentStartedPayload,
  TournamentEndedPayload,
  TournamentParticipantJoinedPayload,
  TournamentLeaderboardUpdatedPayload, // Keep this one too
  TournamentCreatedPayload, // For new tournament announcements
} from '@cashflow/types'
import {
  TournamentStartedEvent,
  TournamentEndedEvent,
  TournamentParticipantJoinedEvent,
  TournamentNotificationEvent, // Assuming you created this
  // Import the Zod schema for leaderboard updates if you made one, e.g., TournamentLeaderboardUpdateEvent
  // For now, using a generic structure for leaderboard to match previous example.
} from '@/sockets/schema' //
// import { db } from '@cashflow/database' // For fetching additional data if needed

// Helper to construct a WebSocket message structure if not using validateAndPublish strictly
function formatWebSocketMessage<T>(type: string, payload: T) {
  return JSON.stringify({
    type,
    meta: {
      timestamp: new Date().toISOString(),
      // clientId is usually set by the ws instance, not needed for server.publish to a topic
    },
    payload,
  })
}

export function setupTournamentWebSocketListeners(server: Server) {
  console.log('Setting up tournament WebSocket event listeners...')

  typedAppEventEmitter.on(
    AppEvents.TOURNAMENT_LEADERBOARD_UPDATED,
    (payload: TournamentLeaderboardUpdatedPayload) => {
      const topic = `tournament:${payload.tournamentId}:leaderboard`
      // The validateAndPublish function from ws.utils.ts seems to be a good fit here
      // You might need to adapt it or use server.publish directly if the schema doesn't match
      // For example, if DatabaseUpdate is too specific:
      // server.publish(topic, JSON.stringify({ type: "TOURNAMENT_LEADERBOARD_UPDATE", data: payload }));

      // Using validateAndPublish pattern (requires matching schema in '@/sockets/schema.ts')
      // You'd define a 'TournamentLeaderboardUpdateEvent' schema similar to 'DatabaseUpdate'
      validateAndPublish(
        server,
        topic, // Target specific tournament listeners
        TournamentLeaderboardUpdateEvent, // You'd use your specific Zod schema for this event
        'TOURNAMENT_LEADERBOARD_UPDATE', // The 'type' field for the WS message
        payload, // The actual data
        {} // Optional meta
      )
      console.log(
        `Published leaderboard update for tournament ${payload.tournamentId} to topic ${topic}`
      )
    }
  )

  // Listener for TOURNAMENT_CREATED (to announce new tournaments)
  typedAppEventEmitter.on(AppEvents.TOURNAMENT_CREATED, (payload: TournamentCreatedPayload) => {
    const topic = `tournaments:general` // A general topic for all users interested in new tournaments
    const message = `New tournament available: ${payload.name}! Starts at ${new Date(payload.startTime).toLocaleString()}`
    console.log(`Publishing to ${topic}: ${message}`)

    // Using validateAndPublish (preferred if schema matches)
    // Ensure TournamentNotificationEvent schema is suitable or create a specific one
    validateAndPublish(
      server,
      topic,
      TournamentNotificationEvent,
      TournamentNotificationEvent.shape.type.value, // e.g., 'TOURNAMENT_NOTIFICATION_WS'
      {
        tournamentId: payload.tournamentId,
        title: 'New Tournament!',
        message: `"${payload.name}" is starting soon!`,
        details: { startTime: payload.startTime },
      },
      {}
    )
  })

  // Listener for TOURNAMENT_STARTED
  typedAppEventEmitter.on(AppEvents.TOURNAMENT_STARTED, (payload: TournamentStartedPayload) => {
    const topic = `tournament:${payload.tournamentId}:updates` // Topic for this specific tournament
    const message = `Tournament "${payload.name}" has started! Good luck!`
    console.log(`Publishing to ${topic}: ${message}`)

    validateAndPublish(
      server,
      topic,
      TournamentStartedEvent, // Use the Zod schema for this event type
      TournamentStartedEvent.shape.type.value, // e.g., 'TOURNAMENT_STARTED_WS'
      payload, // The payload should match TournamentStartedPayload
      {} // Optional meta
    )

    // Also publish a general notification
    validateAndPublish(
      server,
      `tournaments:general`,
      TournamentNotificationEvent,
      TournamentNotificationEvent.shape.type.value,
      {
        tournamentId: payload.tournamentId,
        title: 'Tournament Started!',
        message: `"${payload.name}" is now live!`,
      },
      {}
    )
  })

  // Listener for TOURNAMENT_ENDED
  typedAppEventEmitter.on(AppEvents.TOURNAMENT_ENDED, async (payload: TournamentEndedPayload) => {
    const topic = `tournament:${payload.tournamentId}:updates`
    const message = `Tournament "${payload.name}" has ended. Results are in!`
    console.log(`Publishing to ${topic}: ${message}`)

    // You might want to fetch final top players for the payload if not already included
    // For example:
    // const finalLeaderboard = await db.tournamentParticipant.findMany({
    //   where: { tournamentId: payload.tournamentId },
    //   orderBy: { rank: 'asc' },
    //   take: 3,
    //   include: { user: {select: { username: true }} }
    // });
    // const enhancedPayload = { ...payload, finalResults: finalLeaderboard };

    validateAndPublish(
      server,
      topic,
      TournamentEndedEvent, // Use the Zod schema
      TournamentEndedEvent.shape.type.value, // e.g., 'TOURNAMENT_ENDED_WS'
      payload, // or enhancedPayload
      {}
    )

    validateAndPublish(
      server,
      `tournaments:general`,
      TournamentNotificationEvent,
      TournamentNotificationEvent.shape.type.value,
      {
        tournamentId: payload.tournamentId,
        title: 'Tournament Ended',
        message: `"${payload.name}" has finished. Check out the results!`,
      },
      {}
    )
  })

  // Listener for TOURNAMENT_PARTICIPANT_JOINED
  typedAppEventEmitter.on(
    AppEvents.TOURNAMENT_PARTICIPANT_JOINED,
    async (payload: TournamentParticipantJoinedPayload) => {
      const tournamentSpecificTopic = `tournament:${payload.tournamentId}:updates`
      const generalTournamentTopic = `tournaments:general` // For broader notification of activity
      const userSpecificTopic = `user:${payload.userId}:notifications` // For direct confirmation to the user

      const message = `${payload.username} joined tournament ${payload.tournamentId}.`
      console.log(`Publishing participant joined: ${message}`)

      // Notify subscribers of this specific tournament
      validateAndPublish(
        server,
        tournamentSpecificTopic,
        TournamentParticipantJoinedEvent, // Use the Zod schema
        TournamentParticipantJoinedEvent.shape.type.value, // e.g., 'TOURNAMENT_PARTICIPANT_JOINED_WS'
        payload,
        {}
      )

      // Send a confirmation to the user who joined (optional, if they aren't subscribed to the tournament topic yet)
      // This might require a different message schema or be handled by client logic upon receiving the above.
      // For example, a generic notification:
      validateAndPublish(
        server,
        userSpecificTopic,
        TournamentNotificationEvent,
        'TOURNAMENT_NOTIFICATION',
        payload,
        {
          message: `You've successfully joined tournament #${payload.tournamentId}!`,
        }
      )

      // Optionally, update a general "activity" feed for tournaments if desired
      const tournament = await tournamentService.getTournamentById(payload.tournamentId)
      server.publish(
        generalTournamentTopic,
        formatWebSocketMessage('TOURNAMENT_ACTIVITY_UPDATE', {
          tournamentId: payload.tournamentId,
          message: `${payload.username} has joined the tournament!`,
          participantCount: tournament?.status ?? 0,
        })
      )
    }
  )

  // Keep the leaderboard update listener
  typedAppEventEmitter.on(
    AppEvents.TOURNAMENT_LEADERBOARD_UPDATED,
    (payload: TournamentLeaderboardUpdatedPayload) => {
      const topic = `tournament:${payload.tournamentId}:leaderboard`
      console.log(
        `Publishing leaderboard update for tournament ${payload.tournamentId} to topic ${topic}`
      )
      // Assuming you have a TournamentLeaderboardUpdateEvent Zod schema in sockets/schema.ts
      // If not, you might need to define one or use a generic publish like:
      server.publish(topic, formatWebSocketMessage('TOURNAMENT_LEADERBOARD_UPDATE_WS', payload))
      // Or, if using validateAndPublish with a schema (e.g., TournamentLeaderboardUpdateSocketEvent)
      // validateAndPublish(server, topic, TournamentLeaderboardUpdateSocketEvent, TournamentLeaderboardUpdateSocketEvent.shape.type.value, payload, {});
    }
  )

  console.log('Tournament WebSocket event listeners setup complete.')
}

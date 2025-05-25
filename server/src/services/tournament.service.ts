import { db, Prisma, Tournament, TournamentStatus } from '@cashflow/database'
import { UserWithProfile } from '@cashflow/types' // Assuming this type includes role
import { typedAppEventEmitter, AppEvents } from '@/events' // Adjusted path based on repomix
import {
  TournamentCreatedPayload,
  TournamentEndedPayload,
  TournamentLeaderboardUpdatedPayload,
  TournamentParticipantType,
  TournamentParticipantJoinedPayload,
  TournamentStartedPayload,
} from '@cashflow/types' // Assuming these event payloads would be defined in your types package

// --- Helper Types (consider moving to packages/types/src/interface/tournament.ts) ---
export interface CreateTournamentInput {
  name: string
  description?: string
  startTime: Date
  endTime?: Date
  targetScore?: number
  // For simplicity, adding eligible games and rewards might be separate operations or more complex DTOs
  eligibleGames?: Array<{ gameId: string; pointMultiplier?: number }>
  rewards?: Array<{ rank: number; description: string /* other reward fields */ }>
}

export interface UpdateTournamentInput {
  name?: string
  description?: string
  startTime?: Date
  endTime?: Date
  targetScore?: number
  status?: TournamentStatus
  eligibleGames?: Array<{ gameId: string; pointMultiplier?: number }>
  rewards?: Array<{ rank: number; description: string /* other reward fields */ }>
}

export interface AddEligibleGameInput {
  gameId: string
  pointMultiplier?: number
}

export interface AddTournamentRewardInput {
  rank: number
  description: string
  // currencyId?: string;
  // amount?: number;
}

// --- Service Functions ---

/**
 * Creates a new tournament.
 */
export async function createTournament(
  adminUser: UserWithProfile,
  input: CreateTournamentInput
): Promise<Tournament> {
  if (adminUser.role !== 'ADMIN') {
    // Assuming UserWithProfile has a role property
    throw new Error('Unauthorized: Only admins can create tournaments.')
  }

  const tournament = await db.tournament.create({
    data: {
      name: input.name,
      description: input.description,
      startTime: input.startTime,
      endTime: input.endTime,
      targetScore: input.targetScore,
      status: TournamentStatus.PENDING,
      eligibleGames: input.eligibleGames
        ? {
            create: input.eligibleGames.map((g) => ({
              gameId: g.gameId,
              pointMultiplier: g.pointMultiplier ?? 1.0,
            })),
          }
        : undefined,
      rewards: input.rewards
        ? {
            create: input.rewards.map((r) => ({
              rank: r.rank,
              description: r.description,
              // ... other reward fields
            })),
          }
        : undefined,
    },
    include: { eligibleGames: { include: { game: true } }, rewards: true },
  })

  typedAppEventEmitter.emit(AppEvents.TOURNAMENT_CREATED, {
    tournamentId: tournament.id,
    name: tournament.name,
    startTime: tournament.startTime.toISOString(),
  } as TournamentCreatedPayload) // Define this payload type

  return tournament
}

/**
 * Updates an existing tournament.
 */
export async function updateTournament(
  adminUser: UserWithProfile,
  tournamentId: string,
  input: UpdateTournamentInput
): Promise<Tournament> {
  if (adminUser.role !== 'ADMIN') {
    throw new Error('Unauthorized: Only admins can update tournaments.')
  }

  const existingTournament = await db.tournament.findUnique({ where: { id: tournamentId } })
  if (!existingTournament) {
    throw new Error('Tournament not found.')
  }
  // Add more checks if needed, e.g., cannot update PENDING/ACTIVE tournaments in certain ways

  const updatedTournament = await db.tournament.update({
    where: { id: tournamentId },
    data: {
      name: input.name,
      description: input.description,
      startTime: input.startTime,
      endTime: input.endTime,
      targetScore: input.targetScore,
      status: input.status,
      // Handling updates for eligibleGames and rewards can be complex.
      // Simplest is to clear and recreate, or handle diffs.
      // For now, not directly updatable here, suggest separate functions.
    },
    include: { eligibleGames: { include: { game: true } }, rewards: true },
  })
  // Consider emitting a TOURNAMENT_UPDATED event
  return updatedTournament
}

/**
 * Lists tournaments based on filters.
 */
export async function listTournaments(filters: {
  status?: TournamentStatus
  gameId?: string
  activeNow?: boolean
}): Promise<Tournament[]> {
  const where: Prisma.TournamentWhereInput = {}
  if (filters.status) {
    where.status = filters.status
  }
  if (filters.gameId) {
    where.eligibleGames = { some: { gameId: filters.gameId } }
  }
  if (filters.activeNow) {
    const now = new Date()
    where.status = TournamentStatus.ACTIVE
    where.startTime = { lte: now }
    where.OR = [{ endTime: { gte: now } }, { endTime: null }] // Handles tournaments without an end time
  }

  return db.tournament.findMany({
    where,
    include: {
      eligibleGames: { include: { game: true } },
      _count: { select: { participants: true } }, // Get participant count
    },
    orderBy: { startTime: 'asc' },
  })
}

/**
 * Gets details of a specific tournament.
 */
export async function getTournamentDetails(tournamentId: string): Promise<Tournament | null> {
  return db.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      eligibleGames: { include: { game: true } },
      participants: {
        orderBy: { score: 'desc' },
        take: 100, // For initial leaderboard preview
        include: {
          user: { select: { id: true, avatarUrl: true, username: true, profile: true } },
        },
      },
      rewards: { orderBy: { rank: 'asc' } },
      //   createdBy: { select: { id: true, username: true } },
    },
  })
}

/**
 * Allows a user to join an active tournament.
 */
export async function joinTournament(
  userId: string,
  tournamentId: string
): Promise<TournamentParticipantType> {
  const tournament = await db.tournament.findUnique({
    where: { id: tournamentId },
    select: { status: true, startTime: true, endTime: true },
  })

  if (!tournament) {
    throw new Error('Tournament not found.')
  }
  if (
    tournament.status !== TournamentStatus.ACTIVE &&
    tournament.status !== TournamentStatus.PENDING
  ) {
    throw new Error('Tournament is not open for joining.')
  }
  const now = new Date()
  if (tournament.startTime > now && tournament.status === TournamentStatus.PENDING) {
    // Allow joining PENDING tournaments before they start
  } else if (tournament.status !== TournamentStatus.ACTIVE) {
    throw new Error('Tournament is not active for joining.')
  }

  if (tournament.endTime && tournament.endTime <= now) {
    throw new Error('Tournament has already ended.')
  }

  const existingParticipant = await db.tournamentParticipant.findUnique({
    where: { tournamentId_userId: { tournamentId, userId } },
    include: { user: true },
  })

  if (existingParticipant) {
    return existingParticipant as TournamentParticipantType // User already joined
  }

  const participant = await db.tournamentParticipant.create({
    data: {
      tournamentId,
      userId,
      score: 0,
    },
    include: { user: { select: { id: true, username: true } } },
  })

  typedAppEventEmitter.emit(AppEvents.TOURNAMENT_PARTICIPANT_JOINED, {
    tournamentId,
    userId,
    username: participant.user.username,
  } as TournamentParticipantJoinedPayload) // Define this payload type

  // Potentially update leaderboard
  await publishLeaderboardUpdate(tournamentId)

  return participant as TournamentParticipantType
}

/**
 * Records points for a user in active tournaments for a specific game.
 */
export async function recordTournamentPoints(
  userId: string,
  gameId: string, // The actual game ID from your Game model
  pointsEarnedInGame: number,
  gameSessionId?: string
): Promise<void> {
  const now = new Date()
  const activeParticipations = await db.tournamentParticipant.findMany({
    where: {
      userId,
      tournament: {
        status: TournamentStatus.ACTIVE,
        startTime: { lte: now },
        OR: [{ endTime: { gte: now } }, { endTime: null }],
        eligibleGames: { some: { gameId } },
      },
    },
    include: {
      tournament: {
        include: { eligibleGames: { where: { gameId } } },
      },
    },
  })

  if (activeParticipations.length === 0) {
    return // No active tournament participation for this game
  }

  for (const participation of activeParticipations) {
    const tournamentGame = participation.tournament.eligibleGames.find((eg) => eg.gameId === gameId)
    if (!tournamentGame) continue

    const pointsForTournament = Math.floor(
      pointsEarnedInGame * (tournamentGame.pointMultiplier || 1.0)
    )

    if (pointsForTournament <= 0) continue

    await db.$transaction(async (tx) => {
      const updatedParticipant = await tx.tournamentParticipant.update({
        where: { id: participation.id },
        data: {
          score: { increment: pointsForTournament },
        },
      })

      await tx.tournamentGamePlay.create({
        data: {
          tournamentParticipantId: participation.id,
          gameId: gameId,
          pointsEarned: pointsForTournament,
          playedAt: now,
          gameSessionId: gameSessionId,
        },
      })
      // Check if target score is met
      if (
        participation.tournament.targetScore &&
        updatedParticipant.score >= participation.tournament.targetScore
      ) {
        // End tournament if a participant reaches target score
        // Need to handle potential race conditions if multiple players hit target simultaneously
        const currentTournament = await tx.tournament.findUnique({
          where: { id: participation.tournamentId },
        })
        if (currentTournament && currentTournament.status === TournamentStatus.ACTIVE) {
          await processTournamentEnd(participation.tournamentId, tx) // Pass transaction client
        }
      }
    })
    await publishLeaderboardUpdate(participation.tournamentId)
  }
}

/**
 * Gets the leaderboard for a tournament.
 */
export async function getTournamentLeaderboard(
  tournamentId: string,
  limit: number = 100
): Promise<TournamentParticipantType[]> {
  return db.tournamentParticipant.findMany({
    where: { tournamentId },
    orderBy: [{ score: 'desc' }, { joinedAt: 'asc' }],
    take: limit,
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  }) as unknown as TournamentParticipantType[]
}

/**
 * Publishes leaderboard updates via WebSocket.
 */
async function publishLeaderboardUpdate(tournamentId: string) {
  const leaderboard = await getTournamentLeaderboard(tournamentId, 20) // Publish top N
  typedAppEventEmitter.emit(AppEvents.TOURNAMENT_LEADERBOARD_UPDATED, {
    tournamentId,
    leaderboard: leaderboard.map((p) => ({
      userId: p.userId,
      username: p.user.username || 'Player',
      score: p.score,
      rank: p.rank, // Rank might need to be calculated here or stored
      avatarUrl: p.user?.avatarUrl,
    })),
  } as TournamentLeaderboardUpdatedPayload) // Define this payload type
}

/**
 * Processes the start of a tournament (e.g., by a scheduler).
 */
export async function processTournamentStart(
  tournamentId: string,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const prismaClient = tx || db
  const tournament = await prismaClient.tournament.findUnique({ where: { id: tournamentId } })

  if (!tournament || tournament.status !== TournamentStatus.PENDING) {
    console.warn(`Tournament ${tournamentId} not found or not in PENDING state.`)
    return
  }

  const now = new Date()
  if (tournament.startTime > now) {
    console.warn(`Tournament ${tournamentId} start time is in the future.`)
    return
  }

  await prismaClient.tournament.update({
    where: { id: tournamentId },
    data: { status: TournamentStatus.ACTIVE },
  })

  typedAppEventEmitter.emit(AppEvents.TOURNAMENT_STARTED, {
    tournamentId,
    name: tournament.name,
    endTime: tournament.endTime?.toISOString(),
  } as TournamentStartedPayload) // Define this payload type

  console.log(`Tournament ${tournamentId} started.`)
}

/**
 * Processes the end of a tournament (e.g., by scheduler or target score met).
 * This can be called from recordTournamentPoints if a target score is met.
 */
export async function processTournamentEnd(
  tournamentId: string,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const prismaClient = tx || db // Use provided transaction or default db client

  const tournament = await prismaClient.tournament.findUnique({
    where: { id: tournamentId },
    include: { rewards: { orderBy: { rank: 'asc' } } },
  })

  if (!tournament || tournament.status !== TournamentStatus.ACTIVE) {
    console.warn(`Tournament ${tournamentId} not found or not in ACTIVE state for ending.`)
    return
  }
  // Add check for endTime if it exists
  const now = new Date()
  if (tournament.endTime && tournament.endTime > now && !tournament.targetScore) {
    // Don't end early if time-based and not met by score
    console.warn(
      `Tournament ${tournamentId} end time is in the future and target score not necessarily met.`
    )
    return
  }

  await prismaClient.tournament.update({
    where: { id: tournamentId },
    data: { status: TournamentStatus.COMPLETED },
  })

  // Determine winners and assign ranks (simplified ranking)
  const participants = await prismaClient.tournamentParticipant.findMany({
    where: { tournamentId },
    orderBy: [{ score: 'desc' }, { joinedAt: 'asc' }],
  })

  const rankedParticipants = participants.map((p, index) => ({ ...p, rank: index + 1 }))

  for (const participant of rankedParticipants) {
    await prismaClient.tournamentParticipant.update({
      where: { id: participant.id },
      data: { rank: participant.rank },
    })
  }

  // Distribute rewards (basic placeholder)
  for (const reward of tournament.rewards) {
    const winnerForRank = rankedParticipants.find((p) => p.rank === reward.rank)
    if (winnerForRank) {
      await prismaClient.tournamentReward.update({
        where: { id: reward.id },
        data: {
          winnerId: winnerForRank.userId,
          // Potentially create a UserReward record here or emit an event for another service to handle actual item/currency transfer
        },
      })
      // Example: Create a UserReward
      // await prismaClient.userReward.create({
      //   data: {
      //     userId: winnerForRank.userId,
      //     type: 'TOURNAMENT_PRIZE', // Define appropriate RewardType
      //     description: `Tournament '${tournament.name}' - Rank ${reward.rank}: ${reward.description}`,
      //     status: 'PENDING_CLAIM', // Or 'AWARDED'
      //     // related entities like currencyId, amount, itemId based on reward.description parsing
      //   }
      // });
    }
  }

  typedAppEventEmitter.emit(AppEvents.TOURNAMENT_ENDED, {
    tournamentId,
    name: tournament.name,
    // results: rankedParticipants.map(p => ({ userId: p.userId, username: p.user.username, score: p.score, rank: p.rank })),
  } as TournamentEndedPayload) // Define this payload type

  console.log(`Tournament ${tournamentId} ended and processed.`)
}

/**
 * Schedules jobs to start and end tournaments.
 * This should be called once at server startup.
 */
export function initTournamentScheduler() {
  // Check every minute for tournaments to start or end
  setInterval(async () => {
    const now = new Date()
    try {
      const pendingTournaments = await db.tournament.findMany({
        where: { status: TournamentStatus.PENDING, startTime: { lte: now } },
      })
      for (const t of pendingTournaments) {
        await processTournamentStart(t.id)
      }

      const activeTournamentsToEnd = await db.tournament.findMany({
        where: {
          status: TournamentStatus.ACTIVE,
          endTime: { lte: now }, // Only end time-based tournaments automatically if targetScore not met
          targetScore: null, // Or explicitly check if targetScore is NOT met by anyone
        },
      })
      for (const t of activeTournamentsToEnd) {
        // Additional check: if targetScore exists, ensure no one has met it yet.
        // This check might be complex or better handled by the score recording logic itself.
        // For simplicity here, we only auto-end time-based ones without a target score,
        // or those whose target score hasn't triggered an end.
        await processTournamentEnd(t.id)
      }
    } catch (error) {
      console.error('Error in tournament scheduler:', error)
    }
  }, 60 * 1000) // Every 60 seconds

  console.log('Tournament scheduler initialized.')
}
export async function getTournamentById(tournamentId: string) {
  const existingTournament = await db.tournament.findUnique({ where: { id: tournamentId } })
  return existingTournament
}

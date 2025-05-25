import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import createRouter from '../rest.router' //
import * as tournamentService from '../services/tournament.service'
import { createSuccessResponse, createErrorResponse } from '.' //
import { TournamentStatus } from '@cashflow/database'
import { NETWORK_CONFIG } from '@cashflow/types' // Assuming NETWORK_CONFIG is exported from @cashflow/types

// --- Zod Schemas for Validation (defined directly in the route file) ---
const CreateTournamentSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  targetScore: z.number().int().positive().optional(),
  eligibleGames: z
    .array(
      z.object({
        gameId: z.string().cuid(),
        pointMultiplier: z.number().min(0.1).max(10).optional(),
      })
    )
    .optional(),
  rewards: z
    .array(
      z.object({
        rank: z.number().int().positive(),
        description: z.string().min(1).max(200),
      })
    )
    .optional(),
})

const UpdateTournamentSchema = CreateTournamentSchema.partial().extend({
  status: z.nativeEnum(TournamentStatus).optional(),
})

const TournamentIdParamsSchema = z.object({
  id: z.string().cuid(),
})

const ListTournamentsQuerySchema = z.object({
  status: z.nativeEnum(TournamentStatus).optional(),
  gameId: z.string().cuid().optional(),
  activeNow: z
    .string()
    .transform((val) => val === 'true' || val === '1')
    .optional(),
})

// --- Public Tournament Routes ---
const publicTournamentRoute = createRouter()

publicTournamentRoute.get(
  NETWORK_CONFIG.TOURNAMENTS.LIST,
  zValidator('query', ListTournamentsQuerySchema),
  async (c) => {
    try {
      const query = c.req.valid('query')
      const tournaments = await tournamentService.listTournaments({
        status: query.status,
        gameId: query.gameId,
        activeNow: query.activeNow,
      })
      return createSuccessResponse(tournaments)
    } catch (e: any) {
      console.error('[Tournament Route] Error listing tournaments:', e.message)
      return createErrorResponse(e, 500)
    }
  }
)

publicTournamentRoute.get(
  NETWORK_CONFIG.TOURNAMENTS.DETAILS,
  zValidator('param', TournamentIdParamsSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param')
      const tournament = await tournamentService.getTournamentDetails(id)
      if (!tournament) {
        return createErrorResponse({ message: 'Tournament not found' }, 404)
      }
      return createSuccessResponse(tournament)
    } catch (e: any) {
      console.error(`[Tournament Route] Error fetching tournament ${c.req.param('id')}:`, e.message)
      return createErrorResponse(e, 500)
    }
  }
)

publicTournamentRoute.get(
  NETWORK_CONFIG.TOURNAMENTS.LEADERBOARD,
  zValidator('param', TournamentIdParamsSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param')
      const limitQuery = c.req.query('limit')
      const limit = limitQuery ? parseInt(limitQuery, 10) : 100
      const leaderboard = await tournamentService.getTournamentLeaderboard(id, limit)
      return createSuccessResponse(leaderboard)
    } catch (e: any) {
      console.error(
        `[Tournament Route] Error fetching leaderboard for tournament ${c.req.param('id')}:`,
        e.message
      )
      return createErrorResponse(e, 500)
    }
  }
)

// --- Authenticated Tournament Routes ---
// This router instance can be merged or used separately with the isAuthenticated middleware applied at a higher level if needed.
// For direct application like in auth.route.ts example:
publicTournamentRoute.post(
  NETWORK_CONFIG.TOURNAMENTS.JOIN,
  zValidator('param', TournamentIdParamsSchema),
  async (c) => {
    try {
      const { id: tournamentId } = c.req.valid('param')
      const user = c.var.user_with_profile
      if (!user) {
        // Middleware should handle this, but as a safeguard:
        return createErrorResponse({ message: 'Authentication required.' }, 401)
      }
      const participant = await tournamentService.joinTournament(user.id, tournamentId)
      return createSuccessResponse(participant)
    } catch (e: any) {
      console.error(
        `[Tournament Route] Error joining tournament ${c.req.param('id')} for user ${c.var.user_with_profile?.id}:`,
        e.message
      )
      if (e.message.includes('not found')) return createErrorResponse(e, 404)
      if (
        e.message.includes('not open') ||
        e.message.includes('already ended') ||
        e.message.includes('already joined')
      )
        return createErrorResponse(e, 400)
      return createErrorResponse(e, 500)
    }
  }
)

// --- Admin Tournament Routes ---
const adminTournamentRoute = createRouter()

adminTournamentRoute.post(
  NETWORK_CONFIG.ADMIN_TOURNAMENTS.CREATE,
  zValidator('json', CreateTournamentSchema),
  async (c) => {
    try {
      const user = c.var.user_with_profile
      if (!user || user.role !== 'ADMIN') {
        return createErrorResponse({ message: 'Forbidden: Admin access required.' }, 403)
      }
      const input = c.req.valid('json')
      const tournament = await tournamentService.createTournament(user, {
        ...input,
        startTime: new Date(input.startTime), // Convert string to Date for service
        endTime: input.endTime ? new Date(input.endTime) : undefined,
      })
      return createSuccessResponse(tournament, 201)
    } catch (e: any) {
      console.error('[Admin Tournament Route] Error creating tournament:', e.message)
      if (e.message.includes('Unauthorized')) return createErrorResponse(e, 403)
      return createErrorResponse(e, 500)
    }
  }
)

adminTournamentRoute.put(
  NETWORK_CONFIG.ADMIN_TOURNAMENTS.UPDATE,
  zValidator('param', TournamentIdParamsSchema),
  zValidator('json', UpdateTournamentSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param')
      const user = c.var.user_with_profile
      if (!user || user.role !== 'ADMIN') {
        return createErrorResponse({ message: 'Forbidden: Admin access required.' }, 403)
      }
      const input = c.req.valid('json')
      const tournament = await tournamentService.updateTournament(user, id, {
        ...input,
        startTime: input.startTime ? new Date(input.startTime) : undefined,
        endTime: input.endTime ? new Date(input.endTime) : undefined,
      })
      return createSuccessResponse(tournament)
    } catch (e: any) {
      console.error(
        `[Admin Tournament Route] Error updating tournament ${c.req.param('id')}:`,
        e.message
      )
      if (e.message.includes('Unauthorized')) return createErrorResponse(e, 403)
      if (e.message.includes('not found')) return createErrorResponse(e, 404)
      return createErrorResponse(e, 500)
    }
  }
)

adminTournamentRoute.post(
  NETWORK_CONFIG.ADMIN_TOURNAMENTS.START,
  zValidator('param', TournamentIdParamsSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param')
      const user = c.var.user_with_profile
      if (!user || user.role !== 'ADMIN') {
        return createErrorResponse({ message: 'Forbidden: Admin access required.' }, 403)
      }
      await tournamentService.processTournamentStart(id)
      return createSuccessResponse({ message: 'Tournament started successfully.' })
    } catch (e: any) {
      console.error(
        `[Admin Tournament Route] Error starting tournament ${c.req.param('id')}:`,
        e.message
      )
      return createErrorResponse(e, 500)
    }
  }
)

adminTournamentRoute.post(
  NETWORK_CONFIG.ADMIN_TOURNAMENTS.END,
  zValidator('param', TournamentIdParamsSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param')
      const user = c.var.user_with_profile
      if (!user || user.role !== 'ADMIN') {
        return createErrorResponse({ message: 'Forbidden: Admin access required.' }, 403)
      }
      await tournamentService.processTournamentEnd(id)
      return createSuccessResponse({ message: 'Tournament ended and processed successfully.' })
    } catch (e: any) {
      console.error(
        `[Admin Tournament Route] Error ending tournament ${c.req.param('id')}:`,
        e.message
      )
      return createErrorResponse(e, 500)
    }
  }
)

// You will need to export these routers and mount them in your main routes file (e.g., src/routes/index.ts)
// For example:
// app.route('/tournaments', publicTournamentRoute);
// app.route('/admin/tournaments', adminTournamentRoute); // Or use the same base path with admin checks

export { publicTournamentRoute, adminTournamentRoute }
// Or, if you prefer a single default export as in auth.route.ts:
// const mainTournamentRouter = createRouter();
// mainTournamentRouter.route('/', publicTournamentRoute);
// mainTournamentRouter.route('/admin', adminTournamentRoute); // This would prefix admin routes with /admin
// export default mainTournamentRouter;
// For consistency with the provided auth.route.ts, let's assume you'll export them and mount them appropriately.

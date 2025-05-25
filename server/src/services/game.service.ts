// server/src/services/game.service.ts
import { Context } from 'hono'
import {
  db,
  Prisma,
  User as PrismaUser, // Renamed to avoid conflict with UserWithProfile
  TransactionType,
  TransactionStatus,
  Game as PlatformGame,
  VipInfo as PrismaVipInfo, // To get full VipInfo type for user object
} from '@cashflow/database'
import {
  UserWithProfile,
  RTGSettingsRequestDto,
  RTGSettingsResponseDto,
  RTGSpinRequestDto,
  RtgSpinResult,
  ProviderSettingsResponseData,
  ProviderSpinResponseData,
  GamePlatformSpinResultDetails, // This will be the return type of handlePlatformGameRound
} from '@cashflow/types'

import * as transactionService from './transaction.service'
import * as xpService from './xp.service'
import * as tournamentService from './tournament.service'
import { typedAppEventEmitter, AppEvents } from '../events'
import { HonoEnv } from '@/create-app' // For Hono context typing
import { HeadersInit } from 'bun'

// --- Game Provider Configurations ---
interface GameProviderConfig {
  rgsBaseUrl: string
  apiKey?: string
  settingsPath: (providerGameId: string) => string
  spinPath: (providerGameId: string) => string
  providerUserIdPrefix?: string
  // Add any other provider-specific fields, e.g., specific headers required
  extraHeaders?: Record<string, string>
}

const PROVIDER_CONFIGS: Record<string, GameProviderConfig> = {
  RTG: {
    rgsBaseUrl: process.env.RTG_RGS_BASE_URL || 'https://rgs.rtg.example.com/api', // EXAMPLE - REPLACE
    apiKey: process.env.RTG_API_KEY,
    settingsPath: (providerGameId) => `/client/${providerGameId}/settings`, // EXAMPLE - From RTG Docs
    spinPath: (providerGameId) => `/client/${providerGameId}/spin`, // EXAMPLE - From RTG Docs
    providerUserIdPrefix: 'rtg_', // If RTG requires user IDs to be prefixed
    // Example: RTG might require a specific Atmosphere token if not the platform token
    // extraHeaders: { 'Atmosphere-User-Token': 'value_from_settings_or_session' }
  },
  // Add other providers like "PRAGMATIC", "NETENT" here
}

// --- Helper Functions ---
function toCents(amountFloat: number | string): number {
  if (typeof amountFloat === 'string') {
    amountFloat = parseFloat(amountFloat)
  }
  if (isNaN(amountFloat)) {
    console.error('[toCents] Invalid amount received:', amountFloat)
    throw new Error('Invalid amount for toCents conversion')
  }
  return Math.round(amountFloat * 100)
}

function fromCentsToFloat(amountInCents: number): number {
  return amountInCents / 100
}

async function proxyRequestToRgs<TRequest, TResponse>(
  providerName: string,
  rgsUrlPath: string,
  method: 'GET' | 'POST' | 'PUT' = 'POST',
  requestBody?: TRequest,
  platformUserToken?: string,
  user?: UserWithProfile // Assuming UserWithProfile is correctly typed
): Promise<TResponse> {
  const config = PROVIDER_CONFIGS[providerName.toUpperCase()]
  if (!config) {
    console.error(`[ProxyRGS] Configuration for game provider "${providerName}" not found.`)
    throw new Error(`Game provider "${providerName}" not configured.`)
  }

  const url = `${config.rgsBaseUrl}${rgsUrlPath}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(config.apiKey && { 'X-Api-Key': config.apiKey }),
    ...(platformUserToken && { 'X-Platform-Session-Token': platformUserToken }),
    ...config.extraHeaders,
  }

  console.log(
    `[${providerName} Proxy] Request to RGS: ${method} ${url}`,
    process.env.NODE_ENV === 'development' ? requestBody : { redacted: true }
  )

  const response = await fetch(url, {
    method,
    headers,
    body: requestBody ? JSON.stringify(requestBody) : undefined,
  })

  const responseText = await response.text() // Read text first for better error logging

  if (!response.ok) {
    console.error(
      `[${providerName} Proxy] RGS Error ${response.status} for ${method} ${url}: ${responseText}`
    )
    // Attempt to parse as JSON to get structured error from provider
    try {
      const errorJson: { message?: string; [key: string]: any } = JSON.parse(responseText) // Type the parsed JSON
      throw new Error(
        `RGS Error for ${providerName} (${response.status}): ${errorJson.message || responseText}`
      )
    } catch (parseError: unknown) {
      // Catch the JSON.parse error specifically
      // If JSON.parse fails, or if 'e' was not a structured error, throw with original text
      console.warn(
        `[ProxyRGS] Failed to parse RGS error response as JSON. Error: ${parseError instanceof Error ? parseError.message : String(parseError)}`
      )
      throw new Error(
        `RGS Error for ${providerName} (${response.status}): ${responseText || response.statusText}`
      )
    }
  }

  try {
    const responseData = JSON.parse(responseText)
    console.log(
      `[${providerName} Proxy] Response from RGS for ${method} ${url}:`,
      process.env.NODE_ENV === 'development'
        ? responseData
        : { success: true, dataLength: responseText.length }
    )
    return responseData as TResponse
  } catch (jsonParseError: unknown) {
    // Type the catch parameter
    const errorMessage =
      jsonParseError instanceof Error ? jsonParseError.message : String(jsonParseError)
    console.error(
      `[${providerName} Proxy] RGS response JSON parse error for ${method} ${url}: ${responseText}. Error: ${errorMessage}`
    )
    throw new Error(
      `RGS response was not valid JSON for ${providerName} ${rgsUrlPath}. Details: ${errorMessage}`
    )
  }
}

// --- Core Platform Game Round Handler ---
interface HandlePlatformGameRoundParams {
  userId: string
  platformGameId: string
  providerName: string
  providerGameId: string
  providerRoundId?: string
  providerSessionId: string // Session ID from the provider
  wagerAmountCents: number // Bet amount in cents (from platform's perspective)
  winAmountCents: number // Net win amount in cents (calculated from provider response)
  currencyId: string
  rgsRawResponse: object // The raw spin response from the provider
  // User object with VipInfo pre-loaded for XP calculation
  user: PrismaUser & {
    profile: Prisma.ProfileGetPayload<{}> | null // Ensure profile is available for currency/language
    vipInfo: PrismaVipInfo | null
  }
  // Optional: if you track provider's display balance for reconciliation/offset
  initialProviderBalanceCents?: number
  currentProviderBalanceCents?: number
}

async function handlePlatformGameRound(
  params: HandlePlatformGameRoundParams,
  tx: Prisma.TransactionClient
): Promise<GamePlatformSpinResultDetails> {
  const {
    userId,
    platformGameId,
    providerName,
    providerGameId,
    providerRoundId,
    providerSessionId,
    wagerAmountCents,
    winAmountCents,
    currencyId,
    rgsRawResponse,
    user,
  } = params

  // 1. Get Wallet (should exist, created by auth or first deposit)
  const wallet = await transactionService.getOrCreateWallet(userId, currencyId, tx)
  const balanceBeforeBet = wallet.balance

  // 2. Create BET Transaction & Update Wallet
  const betTransaction = await transactionService.createTransactionRecord(
    {
      userId,
      type: TransactionType.BET,
      status: TransactionStatus.COMPLETED,
      amountInCents: -wagerAmountCents,
      currencyId,
      description: `Bet on ${providerName} game ${providerGameId}, round ${providerRoundId || 'N/A'}`,
      provider: providerName,
      providerTxId: providerRoundId || `bet-${platformGameId}-${Date.now()}`,
      gameId: platformGameId,
      balanceBeforeInCents: balanceBeforeBet,
    },
    tx
  )
  let currentWalletState = await transactionService.updateWalletBalance(
    wallet.id,
    -wagerAmountCents,
    'balance',
    tx
  )
  await tx.transaction.update({
    where: { id: betTransaction.id },
    data: { balanceAfterInCents: currentWalletState.balance },
  })

  // 3. Create WIN Transaction & Update Wallet (if win > 0)
  let winTransactionData: Prisma.TransactionGetPayload<{}> | undefined
  if (winAmountCents > 0) {
    winTransactionData = await transactionService.createTransactionRecord(
      {
        userId,
        type: TransactionType.WIN,
        status: TransactionStatus.COMPLETED,
        amountInCents: winAmountCents,
        currencyId,
        description: `Win on ${providerName} game ${providerGameId}, round ${providerRoundId || 'N/A'}`,
        provider: providerName,
        providerTxId: providerRoundId
          ? `win-${providerRoundId}`
          : `win-${platformGameId}-${Date.now()}`,
        relatedTransactionId: betTransaction.id,
        gameId: platformGameId,
        balanceBeforeInCents: currentWalletState.balance,
      },
      tx
    )
    currentWalletState = await transactionService.updateWalletBalance(
      wallet.id,
      winAmountCents,
      'balance',
      tx
    )
    await tx.transaction.update({
      where: { id: winTransactionData.id },
      data: { balanceAfterInCents: currentWalletState.balance },
    })
  }

  // 4. Find or Create/Update GameSession
  // Using providerSessionId as a key part for finding the session related to the game provider's context
  let gameSession = await tx.gameSession.findFirst({
    where: { userId, gameId: platformGameId, providerSessionId, provider: providerName },
  })

  const sessionData = {
    totalWagered: { increment: wagerAmountCents },
    totalWon: { increment: winAmountCents },
    currentBalanceCents: currentWalletState.balance, // Reflect platform's wallet
    lastActivityAt: new Date(),
  }

  if (gameSession) {
    gameSession = await tx.gameSession.update({
      where: { id: gameSession.id },
      data: { ...sessionData, status: 'ACTIVE' }, // Ensure it's marked active
    })
  } else {
    console.warn(
      `[PlatformRound] GameSession not found for providerSessionId ${providerSessionId}. Creating new one.`
    )
    gameSession = await tx.gameSession.create({
      data: {
        userId,
        gameId: platformGameId,
        provider: providerName,
        providerGameId,
        providerSessionId,
        currencyId,
        initialBalanceCents: balanceBeforeBet, // Platform balance when session effectively started for this game round
        currentBalanceCents: currentWalletState.balance,
        totalWagered: wagerAmountCents,
        totalWon: winAmountCents,
        status: 'ACTIVE',
        startTime: new Date(),
        lastActivityAt: new Date(),
      },
    })
  }

  // 5. Record GameSpin
  const gameSpinRecord = await tx.gameSpin.create({
    data: {
      gameSessionId: gameSession.id,
      providerRoundId: providerRoundId || `spin-${Date.now()}`,
      wagerAmount: wagerAmountCents,
      winAmount: winAmountCents,
      currencyId,
      spinDetailsJson: rgsRawResponse as Prisma.JsonObject,
      timestamp: new Date(), // Or use timestamp from RGS if available and reliable
      balanceBefore: balanceBeforeBet,
      balanceAfter: currentWalletState.balance,
    },
  })

  // 6. Update Aggregate Game/User Stats
  await tx.game.update({
    where: { id: platformGameId },
    data: {
      totalWagered: { increment: new Prisma.Decimal(fromCentsToFloat(wagerAmountCents)) },
      totalWins: { increment: new Prisma.Decimal(fromCentsToFloat(winAmountCents)) },
      totalSpins: { increment: 1 },
    },
  })
  await tx.user.update({
    where: { id: userId },
    data: {
      totalWagered: { increment: new Prisma.Decimal(fromCentsToFloat(wagerAmountCents)) },
      totalWon: { increment: new Prisma.Decimal(fromCentsToFloat(winAmountCents)) },
      totalSpins: { increment: 1 },
      lastGameActivityAt: new Date(),
    },
  })

  // 7. Award XP
  let xpAwardedThisSpin = 0
  if (user.vipInfo) {
    // User object passed in should have vipInfo pre-loaded
    xpAwardedThisSpin = xpService.calculateXpForWager(
      new Prisma.Decimal(fromCentsToFloat(wagerAmountCents)),
      user.vipInfo
    )
    if (xpAwardedThisSpin > 0) {
      await xpService.addXpToUser(
        userId,
        xpAwardedThisSpin,
        `GAME_WAGER_${providerName.toUpperCase()}`,
        gameSpinRecord.id,
        tx
      )
    }
  } else {
    console.warn(`[PlatformRound] VipInfo not available for user ${userId}, skipping XP for wager.`)
  }

  // 8. Update Tournaments
  let tournamentPointsAwardedThisSpin = 0
  const pointsForTournament = Math.floor(wagerAmountCents / 100) // Example: 1 point per $1 (100 cents) wagered
  if (pointsForTournament > 0) {
    await tournamentService.recordTournamentPoints(
      userId,
      platformGameId,
      pointsForTournament,
      gameSession.id,
      tx
    )
    tournamentPointsAwardedThisSpin = pointsForTournament
  }

  return {
    betTransaction,
    winTransaction: winTransactionData,
    finalPlatformWallet: currentWalletState,
    updatedGameSession: gameSession, // Return the updated or created session
    gameSpinRecord,
    xpAwardedThisSpin,
    tournamentPointsAwardedThisSpin,
  }
}

// --- RTG Provider Specific Handlers ---
export async function rtgSettings(
  c: Context<HonoEnv>, // Use HonoEnv from create-app.ts
  // User object is now sourced from c.var directly in the route handler
  // and passed to services if needed.
  // session: Session, // Also from c.var
  platformGameId: string
): Promise<Response> {
  const user = c.var.user_with_profile
  const session = c.var.session

  if (!user || !session) {
    return c.json(
      { success: false, error: 'UNAUTHENTICATED', message: 'User session not found.' },
      401
    )
  }

  console.log(`[RTG Settings] User: ${user.id}, Platform Game ID: ${platformGameId}`)
  const providerName = 'RTG'
  const rtgProviderConfig = PROVIDER_CONFIGS[providerName]
  if (!rtgProviderConfig) {
    console.error(`[RTG Settings] RTG provider configuration missing.`)
    return c.json(
      {
        success: false,
        error: 'PROVIDER_CONFIG_ERROR',
        message: 'RTG provider configuration missing.',
      },
      500
    )
  }

  const platformGame = await db.game.findUnique({ where: { id: platformGameId } })
  if (!platformGame || !platformGame.providerGameId) {
    return c.json(
      {
        success: false,
        error: 'GAME_NOT_FOUND',
        message: 'Platform game not found or providerGameId missing.',
      },
      404
    )
  }
  const rtgGameId = platformGame.providerGameId

  const userCurrencyId = user.profile?.activeCurrencyType || 'USD'

  // This is an EXAMPLE payload. Refer to RTG documentation for actual required fields.
  const rgsSettingsPayload: RTGSettingsRequestDto = {
    gameId: rtgGameId,
    token: session.token, // Platform session token, RTG may use this to map to their session
    userId: `${rtgProviderConfig.providerUserIdPrefix || ''}${user.id}`,
    currency: userCurrencyId,
    language: user.profile?.language || 'en',
    mode: 'real', // This could be dynamic based on user choice / game availability
    // Additional RTG specific fields might be needed here, e.g., operatorToken, clientType, etc.
  }

  try {
    const rgsResponse: ProviderSettingsResponseData = await proxyRequestToRgs<
      RTGSettingsRequestDto,
      ProviderSettingsResponseData
    >(
      providerName,
      rtgProviderConfig.settingsPath(rtgGameId),
      'POST', // This might be GET for some providers
      rgsSettingsPayload,
      session.token,
      user
    )

    // Create/Update GameSession
    await db.$transaction(async (tx) => {
      // Close other active sessions for this game/user/provider to avoid duplicates
      await tx.gameSession.updateMany({
        where: {
          userId: user.id,
          gameId: platformGame.id,
          provider: providerName,
          status: 'ACTIVE',
          NOT: { providerSessionId: rgsResponse.user.sessionId },
        },
        data: { status: 'CLOSED', endTime: new Date() },
      })

      const existingSession = await tx.gameSession.findFirst({
        where: { providerSessionId: rgsResponse.user.sessionId, provider: providerName },
      })

      const platformWallet = await transactionService.getOrCreateWallet(user.id, userCurrencyId, tx)
      const initialProviderBalanceCents = toCents(rgsResponse.user.balance.cash) // For reference or display offset

      if (existingSession) {
        await tx.gameSession.update({
          where: { id: existingSession.id },
          data: {
            userId: user.id, // Ensure user association is correct
            gameId: platformGame.id, // Ensure game association
            currencyId: userCurrencyId,
            initialBalanceCents, // Update if settings call can change it
            currentBalanceCents: platformWallet.balance, // Reflect current platform balance
            lastActivityAt: new Date(),
            status: 'ACTIVE', // Ensure it's active
          },
        })
      } else {
        await tx.gameSession.create({
          data: {
            userId: user.id,
            gameId: platformGame.id,
            provider: providerName,
            providerGameId: rtgGameId,
            providerSessionId: rgsResponse.user.sessionId,
            currencyId: userCurrencyId,
            initialBalanceCents,
            currentBalanceCents: platformWallet.balance, // Platform balance, not provider's
            status: 'ACTIVE',
            startTime: new Date(),
            lastActivityAt: new Date(),
          },
        })
      }
    })

    // Transform RGS response for the iframe client
    const clientResponse: RTGSettingsResponseDto = {
      success: true,
      result: rgsResponse,
    }
    return c.json(clientResponse)
  } catch (error: unknown) {
    const typedError = error instanceof Error ? error : new Error(String(error))
    console.error(
      `[RTG Settings] Error for game ${rtgGameId}, user ${user.id}: ${typedError.message}`,
      typedError.stack
    )
    return c.json({ success: false, error: 'RGS_ERROR', message: typedError.message }, 500)
  }
}

export async function rtgSpin(c: Context<HonoEnv>, platformGameId: string): Promise<Response> {
  const user = c.var.user_with_profile // Includes Profile and VipInfo based on middleware
  const session = c.var.session

  if (!user || !session || !user.profile || user.vipInfo === undefined) {
    // vipInfo can be null, so check for undefined
    return c.json(
      {
        success: false,
        error: 'UNAUTHENTICATED',
        message: 'User session or full profile not found.',
      },
      401
    )
  }

  const providerName = 'RTG'
  const rtgProviderConfig = PROVIDER_CONFIGS[providerName]
  if (!rtgProviderConfig) return c.json({ error: 'RTG provider configuration missing.' }, 500)

  const platformGame = await db.game.findUnique({ where: { id: platformGameId } })
  if (!platformGame || !platformGame.providerGameId) {
    return c.json({ error: 'Platform game not found or providerGameId missing.' }, 404)
  }
  const rtgGameId = platformGame.providerGameId

  let clientSpinRequest: RTGSpinRequestDto
  try {
    clientSpinRequest = await c.req.json<RTGSpinRequestDto>()
  } catch (jsonError: unknown) {
    return c.json({ error: 'INVALID_REQUEST_BODY', message: 'Malformed JSON request.' }, 400)
  }

  const activeGameSession = await db.gameSession.findFirst({
    where: {
      userId: user.id,
      gameId: platformGame.id,
      provider: providerName,
      providerSessionId: clientSpinRequest.sessionId,
      status: 'ACTIVE',
    },
  })

  if (!activeGameSession || !activeGameSession.currencyId) {
    return c.json(
      {
        error: 'NO_ACTIVE_VALID_SESSION',
        message: 'Active game session not found or currency missing.',
      },
      400
    )
  }
  const currencyId = activeGameSession.currencyId
  const wagerAmountCents = toCents(clientSpinRequest.stake)

  try {
    const wallet = await transactionService.getOrCreateWallet(user.id, currencyId)
    if (wallet.balance < wagerAmountCents) {
      const rtgErrorResponse: RtgSpinResult = {
        success: false,
        error: { code: 'INSUFFICIENT_FUNDS', message: 'Not enough balance.' } as any, // Cast if RTG error DTO is different
        result: {
          /* Construct minimal valid RtgSpinResult.result for error if needed by client */
        } as any,
      }
      return c.json(rtgErrorResponse, 400) // Or a status code RTG client expects for this
    }

    // Construct RGS spin payload - highly RTG specific
    const rgsSpinPayload = {
      token: clientSpinRequest.token || activeGameSession.providerSessionId, // RTG often uses its own session token/ID
      userId: `${rtgProviderConfig.providerUserIdPrefix || ''}${user.id}`,
      gameId: rtgGameId,
      roundId: clientSpinRequest.roundId,
      transactionId: clientSpinRequest.transactionId,
      stake: clientSpinRequest.stake, // String value as per RTG types
      currency: currencyId,
      actions: clientSpinRequest.actions,
      // ... other parameters required by RTG's spin API
    }

    const rgsSpinResponse: ProviderSpinResponseData = await proxyRequestToRgs<
      any,
      ProviderSpinResponseData
    >(
      providerName,
      rtgProviderConfig.spinPath(rtgGameId),
      'POST',
      rgsSpinPayload,
      session.token,
      user
    )

    const actualWinAmountCents = toCents(rgsSpinResponse.game.win.total)

    const platformUpdates = await db.$transaction(async (tx) => {
      return handlePlatformGameRound(
        {
          userId: user.id,
          platformGameId: platformGame.id,
          providerName,
          providerGameId: rtgGameId,
          providerRoundId: rgsSpinResponse.transactions.roundId.toString(),
          providerSessionId: clientSpinRequest.sessionId,
          wagerAmountCents,
          winAmountCents: actualWinAmountCents,
          currencyId,
          rgsRawResponse: rgsSpinResponse,
          user: user as UserWithProfile & { vipInfo: PrismaVipInfo | null }, // Ensure vipInfo is passed correctly
          // currentProviderBalanceCents: toCents(rgsSpinResponse.user.balance.cash), // If tracking for delta/offset
        },
        tx
      )
    })

    // Emit Platform Events
    typedAppEventEmitter.emit(AppEvents.USER_BALANCE_UPDATED, {
      userId: user.id,
      newBalance: platformUpdates.finalPlatformWallet.balance,
      currencyId,
      changeAmount: actualWinAmountCents - wagerAmountCents,
      transactionType: actualWinAmountCents > 0 ? TransactionType.WIN : TransactionType.BET,
    })
    typedAppEventEmitter.emit(AppEvents.GAME_SPIN_COMPLETED, {
      userId: user.id,
      gameId: platformGame.id,
      provider: providerName,
      providerGameId: rtgGameId,
      wagerAmount: wagerAmountCents,
      winAmount: actualWinAmountCents,
      currencyId,
      xpGained: platformUpdates.xpAwardedThisSpin,
      timestamp: new Date().toISOString(),
    })

    const clientResponse: RtgSpinResult = { success: true, result: rgsSpinResponse }
    return c.json(clientResponse)
  } catch (error: unknown) {
    const typedError = error instanceof Error ? error : new Error(String(error))
    console.error(
      `[RTG Spin] Error for game ${rtgGameId}, user ${user.id}: ${typedError.message}`,
      typedError.stack
    )
    // Construct an error response compatible with RTG client
    const rtgErrorResponse: RtgSpinResult = {
      success: false,
      error: { code: 'RGS_PROCESSING_ERROR', message: typedError.message } as any,
      result: {
        /* Minimal valid structure if required by client on error */
      } as any,
    }
    return c.json(rtgErrorResponse, 500)
  }
}

// Keep other non-provider-specific game service functions if they exist
// e.g., getGameDetailsFromPlatformDB, listPlatformGames, etc.
export async function getGameList(c: Context<HonoEnv>): Promise<Response> {
  // ... (implementation as provided previously, fetching from your DB)
  // Ensure this doesn't use implicit any
  const { provider, category, search, skip, take } = c.req.query()
  const skipNum: number = skip ? parseInt(skip) : 0
  const takeNum: number = take ? parseInt(take) : 50

  const where: Prisma.GameWhereInput = {}
  if (provider) where.providerName = provider
  if (category) where.categories = { some: { name: category } }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
    ]
  }
  where.isActive = true // Typically only show active games

  try {
    const games: PlatformGame[] = await db.game.findMany({
      where,
      skip: skipNum,
      take: takeNum,
      orderBy: { popularity: 'desc' },
      include: { categories: true, gameProvider: true }, // Assuming relation to GameProvider
    })
    const totalGames: number = await db.game.count({ where })

    const responseData: PaginatedResponse<PlatformGame> = {
      // Use PaginatedResponse type
      data: games,
      pagination: {
        total: totalGames,
        skip: skipNum,
        take: takeNum,
        pages: Math.ceil(totalGames / takeNum),
      },
    }
    return c.json(responseData)
  } catch (error: unknown) {
    const typedError = error instanceof Error ? error : new Error(String(error))
    console.error('[GetGameList] Error:', typedError.message, typedError.stack)
    return c.json({ error: 'Failed to fetch games', message: typedError.message }, 500)
  }
}

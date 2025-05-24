// Helper function to calculate RTP
function calculateRTP(win: number, bet: number): number {
  return bet > 0 ? (win / bet) * 100 : 0
}

import {
  GameBigWinData,
  GameBigWinItem,
  GameCategory,
  GameEnterBody,
  GameEnterResponse,
  GameHistoryItem,
  GameHistoryResponse,
  GameSearchResponse,
  GameUserBody,
  GetGameBigWinResponse,
  GetGameCategoriesResponse,
  GetGameEnterResponse,
  GetGameFavoriteListResponse,
  GetGameHistoryResponse,
  GetGameSearchResponse,
  Search,
  UserWithProfile,
} from '@cashflow/types'

interface RawGameSpinBody {
  game_id: string
  bet_amount: number
  win_amount: number
  currency: string
  round_id?: string
  transaction_id?: string
  [key: string]: unknown
}
import { faker } from '@faker-js/faker'
import {
  PrismaClient,
  Prisma,
  User,
  Wallet,
  Transaction,
  TransactionStatus,
  XpEvent,
  Notification,
  db,
  GameSession,
  TransactionType,
  Currency,
  UserReward,
  RewardType,
  NotificationType,
} from '@cashflow/database'
import { Session } from 'better-auth'
import { Context, HonoRequest } from 'hono'
import { buildJson, buildJsonForSpin } from './buildjson'

// class NoLimitRouter {
//   private server!: Server; // Use definite assignment assertion `!`

//     constructor(/* No server instance here initially */) {
//     console.log('[WebSocketRouter] Initialized.');
//     // Initialization without server instance
//   }

//   public setServer(server: Server): void {
//     if (!server) {
//       throw new Error('[WebSocketRouter] Invalid Server instance provided.');
//     }
//     if (isServerSet) {
//       console.warn('[WebSocketRouter] Server instance is already set.');
//       return;
//     }
//     server = server;
//     isServerSet = true;
//     console.log('[WebSocketRouter] Server instance has been set.');
//   }

// /**
//    * Registers a handler for the WebSocket 'open' event.
//    */
//   public onOpen(handler: any): this {
//     openHandlers.push(handler);
//     return this;
//   }

//   /**
//    * Registers a handler for the WebSocket 'close' event.
//    */
//   public onClose(handler: any): this {
//     closeHandlers.push(handler);
//     return this;
//   }
//  public upgrade(options: UpgradeRequestOptions<T>) {
//     // Ensure server instance is passed correctly during the actual upgrade process
//     const { server, request, data, headers } = options;
//     if (!server) {
//       console.error('[WS Upgrade] Failed: Server instance missing in upgrade options.');
//       return new Response('WebSocket upgrade configuration error', {
//         status: 500,
//       });
//     }
//     const clientId = randomUUIDv7();

//     if (!data?.userId) {
//       console.warn('[WS Upgrade] Denied: userId is missing in upgrade data.');
//       return new Response('Unauthorized: userId required.', { status: 401 });
//     }

//     const wsData: WsData & T = { ...(data as T), clientId };

//     const upgraded = server.upgrade(request, {
//       data: wsData,
//       headers: { 'X-Client-ID': clientId, ...headers },
//     });

//     if (!upgraded) {
//       console.error('[WS Upgrade] Failed. Server did not upgrade request.');
//       return new Response('WebSocket upgrade failed', { status: 500 });
//     }
//     // console.log(`[WS Upgrade] Successful for user ${wsData.userId}, client ${clientId}`);
//     return undefined; // Bun handles the 101 response
//   }
// }

// const wsRouter = new NoLimitRouter<AppWsData>(); // CORRECT

// Helper function to get a random number within a range
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export async function getGameList() {
  const games = await db.game.findMany({
    where: { isActive: true },
  })

  // const list: Game = {
  //   id: "",
  //   name: "",
  //   title: "",
  //   temperature: null,
  //   developer: null,
  //   vipLevel: null,
  //   isActive: null,
  //   device: null,
  //   featured: null,
  //   gamebank: null,
  //   bet: null,
  //   denomination: null,
  //   categoryTemp: null,
  //   originalId: null,
  //   bids: null,
  //   statIn: null,
  //   statOut: null,
  //   currentRtp: null,
  //   rtpStatIn: null,
  //   rtpStatOut: null,
  //   standardRtp: null,
  //   popularity: null,
  //   chanceFirepot1: null,
  //   chanceFirepot2: null,
  //   chanceFirepot3: null,
  //   fireCount1: null,
  //   fireCount2: null,
  //   fireCount3: null,
  //   linesPercentConfigSpin: null,
  //   linesPercentConfigSpinBonus: null,
  //   linesPercentConfigBonus: null,
  //   linesPercentConfigBonusBonus: null,
  //   rezerv: null,
  //   cask: null,
  //   advanced: null,
  //   scaleMode: "",
  //   slotViewState: "",
  //   view: null,
  //   categoryId: null,
  //   operatorId: null,
  //   developerId: null,
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  //   jackpotGroupId: null,
  //   active: false,
  //   password: null,
  //   operator: null
  // };

  const response = {
    code: 200,
    list: games,
    total: games.length,
  }

  return new Response(JSON.stringify(response))
}
// async function getRtpForPlayerToday(
//   currentUser: User,
//   winAmount: number,
//   betAmount: number
// ): Promise<[string, number, number]> {
//   // TODO: Implement getSpinsForPlayerToday or move to class
//   const aggregateDataForPlayerToday = await db.gameSpin.aggregate({
//     where: {
//       user: { id: currentUser.activeProfileId },
//       createdAt: {
//         gte: new Date(new Date().setHours(0, 0, 0, 0))
//       }
//     },
//     _sum: {
//       grossWinAmount: true,
//       wagerAmount: true
//     }
//   });
//     currentUser.activeProfileId as string
//   );
//   const playerWinTotalToday = (aggregateDataForPlayerToday._sum?.grossWinAmount || 0) + winA
//   // //console.log(aggregateDataForPlayerToday._sum);
//   function calculateRTP(win: number, bet: number): number {
//     return bet > 0 ? (win / bet) * 100 : 0;
//   }
//   let playerRTPToday = calculateRTP(playerWinTotalToday, playerBetTotalToday).toString();
//   if (isNaN(Number(playerRTPToday))) {
//     playerRTPToday = '0';
//   }

//   return [playerRTPToday, playerWinTotalToday, playerBetTotalToday];
// }
async function getRtpForGameSession(
  gameSession: GameSession,
  winAmount: number,
  betAmount: number
): Promise<[string, number, number]> {
  const aggregateDataForGameSession = await db.gameSpin.aggregate({
    where: { gameSession: { id: gameSession.id } },
    _sum: {
      grossWinAmount: true,
      wagerAmount: true,
    },
  })
  const sessionTotalWinAmount = (aggregateDataForGameSession._sum?.grossWinAmount || 0) + winAmount
  const sessionTotalBetAmount = (aggregateDataForGameSession._sum?.wagerAmount || 0) + betAmount

  let gameSessionRTP = calculateRTP(sessionTotalWinAmount, sessionTotalBetAmount).toString()
  if (isNaN(Number(gameSessionRTP))) {
    gameSessionRTP = '0'
  } else {
    gameSessionRTP = parseInt(gameSessionRTP).toString()
  }

  return [gameSessionRTP, sessionTotalWinAmount, sessionTotalBetAmount]
}
/**
 * Handles fetching game categories.
 * @param req HonoRequest
 * @returns Response
 */
export async function getGameGameCategory(req: HonoRequest): Promise<Response> {
  try {
    // Extract query parameters if needed (e.g., type=developers)
    const url = new URL(req.url)
    const type = url.searchParams.get('type')

    const categories: GameCategory[] = []

    if (type === 'developers') {
      // Fetch operators (acting as developers in this context based on schema)
      // const operators = await db.operator.findMany({
      //   where: { isActive: true },
      //   select: {
      //     id: true,
      //     name: true,
      //     slug: true,
      //     logo: true,
      //   },
      // });
      // categories = operators.map((operator) => ({
      //   image: operator.logo || '',
      //   pictures: operator.logo || '', // Using logo for pictures as well
      //   game_count: 0, // We don't have game count per operator easily here
      //   name: operator.name,
      //   slug: operator.slug,
      //   games: [], // Games are not included in this category list
      //   page_no: 1, // Assuming a single page for developers
      // }))
    } else {
      // Fetch distinct game banks or categories from the Game model
      // This is a simplified approach; a dedicated GameCategory model would be better
      // const distinctGameBanks = await db.game.findMany({
      //   select: { gamebank: true },
      //   distinct: ['gamebank'],
      //   where: { active: true },
      // });
      // const banks = distinctGameBanks.map((game) => ({
      //   image: '', // No specific image for these categories
      //   pictures: '',
      //   game_count: 0, // Need to implement logic to count games per bank
      //   name: '', //game.gamebank || 'Unknown',
      //   slug: '', //game.gamebank || 'unknown',
      //   games: [], // Games are not included in this category list
      //   page_no: 1, // Assuming a single page
      // }));
    }

    const response: GetGameCategoriesResponse = {
      code: 200,
      data: categories,
      messsage: 'Game categories retrieved successfully',
    }

    return new Response(JSON.stringify(response))
  } catch (error) {
    console.error('Error fetching game categories:', error)
    return new Response(JSON.stringify({ message: `Internal server error: ${error}`, code: 500 }), {
      status: 500,
    })
  }
}

/**
 * Handles searching for games.
 * @param req HonoRequest
 * @returns Response
 */
export async function getGameSearch(
  req: HonoRequest
): Promise<GameSearchResponse | { message: string; code: number }> {
  try {
    const url = new URL(req.url)
    const searchTerm = url.searchParams.get('q') || '' // Get search term from query params
    const limit = parseInt(url.searchParams.get('limit') || '20', 10)
    const offset = parseInt(url.searchParams.get('offset') || '0', 10)
    // Search for games by name or title
    // const gamesessions = await db.gameSession.findMany();

    const games = await db.game.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { title: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        title: true,
        // Assuming 'image' field exists or can be derived
        // For now, using a placeholder
        // image: true,
        provider: true, // Using developer as developer for now
        // denomination: true, // Assuming is_demo can be derived from denomination or a specific field
      },
      take: limit,
      skip: offset,
    })
    const totalGames = await db.game.count({
      where: {
        isActive: true,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { title: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
    })

    const searchResults: Search[] = games.map((game) => ({
      id: game.id, // Using game.id as the ID
      name: game.name,
      title: game.title,
      image: `/images/${game.provider}/${game.name}.webp`, // Placeholder for image
      developer: game.provider || 'Unknown', // Using developer as developer
      is_demo: false, //game.denomination === 0, // Assuming 0 denomination means demo
    }))

    searchResults.forEach((game) => {
      const _developer = game.name.substring(
        game.name.toLocaleLowerCase().length,
        game.name.toLowerCase().length - 3
      )
      let developer
      if (_developer?.toLowerCase().includes('ng')) developer = 'netgame'
      if (_developer?.toLowerCase().includes('net')) developer = 'netent'
      if (_developer?.toLowerCase().includes('rtg')) developer = 'redtiger'
      if (_developer?.toLowerCase().includes('nlc')) developer = 'nolimit'
      if (_developer?.toLowerCase().includes('bfg')) developer = 'bigfish'
      game.developer = developer as string
    })
    const responseData: GameSearchResponse = {
      items: searchResults,
      total: totalGames,
    }

    return responseData
  } catch (error) {
    console.error('Error searching games:', error)
    return { message: `Internal server error: ${error}`, code: 500 }
  }
}

/**
 * Handles entering a game.
 * @param req HonoRequest
 * @returns Response
 */
export async function getGameEnter(
  req: HonoRequest,
  user: Partial<UserWithProfile>,
  session: Session
): Promise<Response> {
  try {
    const body: GameEnterBody = await req.json()
    const gameId = Array.isArray(body.id) ? body.id[0] : body.id // Handle single ID or array
    const isDemo = body.demo || false

    // Fetch game details
    const game = await db.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        name: true,
        operatorId: true,
        // Add other fields needed for game entry if available in schema
      },
    })

    if (!game) {
      return new Response(JSON.stringify({ message: 'Game not found', code: 404 }), {
        status: 404,
      })
    }

    // Here you would typically interact with a game developer's API
    // to get the actual game entry URL and parameters.
    // This is a placeholder implementation.

    const gameEnterData: GameEnterResponse = {
      method: 'GET', // Or POST, depending on the developer
      parames: '', // Parameters for the game launch
      developer: game.operatorId || 'unknown', // Using operatorId as developer identifier
      reserve: faker.string.uuid(), // Placeholder for a session token or similar
      weburl: `https://example.com/launchgame?gameId=${game.id}&demo=${isDemo}&userId=${user.id}`, // Placeholder URL
    }

    const gameSession = await db.gameSession.create({
      data: {
        sessionId: session.id,
        userId: user.id ?? '',
        gameId: game.id,
        startTime: new Date(),
        // endTime: gameSessionEndTime,
        totalWagered: 0, // Will be updated by spins (in cents)
        totalWon: 0, // Will be updated by spins (in cents)
        // currencyId will be determined by the first spin or a default
      },
    })
    const response: GetGameEnterResponse = {
      code: 200,
      data: gameEnterData,
      gameSession,
      message: 'Game entry data retrieved successfully',
    }
    return new Response(JSON.stringify(response))
  } catch (error) {
    console.error('Error entering game:', error)
    return new Response(JSON.stringify({ message: `Internal server error: ${error}`, code: 500 }), {
      status: 500,
    })
  }
}
/**
 * Handles all slot machine spins

 */
export async function registerGameRound(
  req: HonoRequest,
  user: Partial<UserWithProfile>,
  session: Session
): Promise<Response> {
  try {
    const body: RawGameSpinBody = await req.json()
    const gameId = body.game_id

    // Fetch game details
    const game = await db.game.findUnique({
      where: { id: gameId },
      select: {
        id: true,
        name: true,
        operatorId: true,
        // Add other fields needed for game entry if available in schema
      },
    })

    if (!game) {
      return new Response(JSON.stringify({ message: 'Game not found', code: 404 }), {
        status: 404,
      })
    }

    const gameSession = await db.gameSession.findFirst({
      where: {
        sessionId: session.id,
        userId: user.id ?? '',
        gameId: game.id,
      },
    })

    if (!gameSession) {
      return new Response(JSON.stringify({ message: 'Game session not found', code: 404 }), {
        status: 404,
      })
    }

    const { bet_amount, win_amount } = body
    const betAmount = toCents(bet_amount.toString())
    const winAmount = toCents(win_amount.toString())

    const [gameSessionRTP, sessionTotalWinAmount, sessionTotalBetAmount] =
      await getRtpForGameSession(gameSession, winAmount, betAmount)

    const gameSpin = await db.gameSpin.create({
      data: {
        gameSessionId: gameSession.id,
        createdAt: new Date(),
        wagerAmount: betAmount,
        grossWinAmount: winAmount,
        // metadata: {
        //   netWinAmount: winAmount - betAmount,
        // },
        // currencyId: gameSession.currencyId, // TODO - determine this
        // balanceBefore: user.profile.balance, // TODO
        // balanceAfter: user.profile.balance + winAmount - betAmount, // TODO
        // externalId: body.round_id, // TODO
        // externalRoundId: body.round_id, // TODO
        // externalGameId: game.id, // TODO
        sessionId: session.id,
        timeStamp: Date(),
      },
    })

    await db.gameSession.update({
      where: { id: gameSession.id },
      data: {
        totalWagered: sessionTotalBetAmount,
        totalWon: sessionTotalWinAmount,
      },
    })

    const response = {
      code: 200,
      message: 'Game round registered successfully',
      data: {
        gameSpin,
        gameSessionRTP,
      },
    }
    return new Response(JSON.stringify(response))
  } catch (error) {
    console.error('Error registering game round:', error)
    return new Response(JSON.stringify({ message: `Internal server error: ${error}`, code: 500 }), {
      status: 500,
    })
  }
}
/**
 * Handles fetching user's games (potentially based on category or filters).
 * @param req HonoRequest
 * @returns Response
 */
export async function getGameUserGame(req: HonoRequest): Promise<Response> {
  try {
    const body: GameUserBody = await req.json()
    // const categorySlug = body.game_categories_slug
    const page = body.page || 1
    const limit = body.limit || 20
    const offset = (page - 1) * limit

    // Fetch games based on category slug (assuming category slug maps to gamebank or operator slug)
    // This logic might need refinement based on how categories are structured
    const games = await db.game.findMany({
      where: {
        isActive: true,
        // OR: [{ operator: { : categorySlug } }],
      },
      select: {
        id: true,
        name: true,
        // image: true, // Placeholder
        provider: true, // Using developer as developer
        // denomination: true, // Assuming is_demo can be derived
      },
      take: limit,
      skip: offset,
    })

    const totalGames = await db.game.count({
      where: {
        isActive: true,
        // OR: [{ gamebank: categorySlug }, { operator: { slug: categorySlug } }],
      },
    })

    const userGames: Search[] = games.map((game: any) => ({
      id: game.id, // Using game.id as the ID
      name: game.name,
      image: '', // Placeholder for image
      developer: game.developer || 'Unknown', // Using developer as developer
      is_demo: game.denomination === 0, // Assuming 0 denomination means demo
    }))

    const responseData: GameSearchResponse = {
      items: userGames as Array<Search>,
      total: totalGames,
    }

    const response: GetGameSearchResponse = {
      code: 200,
      data: responseData,
      message: 'User games retrieved successfully',
    }

    return new Response(JSON.stringify(response))
  } catch (error) {
    console.error('Error fetching user games:', error)
    return new Response(JSON.stringify({ message: `Internal server error: ${error}`, code: 500 }), {
      status: 500,
    })
  }
}

/**
 * Handles favoriting/unfavoriting a game.
 * @param req HonoRequest
 * @returns Response
 */
export async function getGameFavoriteGame(
  req: HonoRequest,
  user: Partial<UserWithProfile>
): Promise<Response> {
  try {
    const body = await req.json()
    const gameId = body.gameId // Assuming gameId is provided in the body
    const isFavorite = body.isFavorite // Assuming isFavorite (boolean) is provided

    // You would typically have a many-to-many relationship between User and Game
    // for favorites, or a dedicated UserFavoriteGame model.
    // Since that's not explicitly in the provided schema, this is a placeholder.
    // You might need to adjust this based on your actual favorite game implementation.

    // Placeholder logic: Just acknowledge the request
    console.log(`User ${user.id} is trying to set game ${gameId} as favorite: ${isFavorite}`)

    // Assuming a simple success response is sufficient based on store action
    const response = {
      code: 200,
      message: 'Favorite game status updated',
    }

    return new Response(JSON.stringify(response))
  } catch (error) {
    console.error('Error updating favorite game status:', error)
    return new Response(JSON.stringify({ message: `Internal server error: ${error}`, code: 500 }), {
      status: 500,
    })
  }
}

/**
 * Handles fetching a user's favorite game list.
 * @param req HonoRequest
 * @returns Response
 */
export async function getGameFavoriteGameList(): Promise<Response> {
  try {
    // Fetch the user's favorite games.
    // This requires a mechanism to store user favorites, which is not explicit
    // in the provided schema. Assuming a relationship or a separate model exists.
    // Placeholder: Returning an empty list or some dummy data

    const favoriteGameIds: (number | string)[] = [] // Placeholder for favorite game IDs
    // Example: Fetching favorite game IDs if a relation existed:
    // const userWithFavorites = await db.user.findUnique({
    //   where: { id: user.id },
    //   include: { favoriteGames: { select: { gameId: true } } },
    // });
    // if (userWithFavorites?.favoriteGames) {
    //   favoriteGameIds = userWithFavorites.favoriteGames.map(fav => fav.gameId);
    // }

    const response: GetGameFavoriteListResponse = {
      code: 200,
      data: favoriteGameIds,
      message: 'Favorite game list retrieved successfully',
    }

    return new Response(JSON.stringify(response))
  } catch (error) {
    console.error('Error fetching favorite game list:', error)
    return new Response(JSON.stringify({ message: `Internal server error: ${error}`, code: 500 }), {
      status: 500,
    })
  }
}

/**
 * Handles fetching game history for a user.
 * @param req HonoRequest
 * @returns Response
 */
export async function getGameHistory(
  req: HonoRequest,
  user: Partial<UserWithProfile>
): Promise<Response> {
  try {
    const body = await req.json()
    const page = body.page || 1
    const limit = body.limit || 20
    const offset = (page - 1) * limit

    // Fetch game sessions for the user's active profile
    const gameSessions = await db.gameSession.findMany({
      where: { userId: user?.id },
      include: {
        game: {
          select: { name: true }, // Include game name from operatorgame
        },
      },
      orderBy: { createdAt: 'desc' }, // Order by most recent
      take: limit,
      skip: offset,
    })

    const totalGameSessions = await db.gameSession.count({
      where: { userId: user?.id },
    })

    const gameHistoryRecords: GameHistoryItem[] = gameSessions.map((session: any) => ({
      name: session.game?.name || 'Unknown Game', // Use game name
      created_at: session.startTime.getTime(), // Convert Date to timestamp
      amount: session.betAmount?.toString() || '0', // Bet amount
      multiplier:
        session.winAmount && session.betAmount
          ? (session.winAmount / session.betAmount).toFixed(2)
          : '0', // Calculate multiplier
      bet_id: session.id, // Using game session ID as bet ID
      status: session.endTime ? 'Completed' : 'In Progress', // Simple status
      profit: session.winAmount || 0 - (session.betAmount || 0), // Calculate profit
    }))

    const responseData: GameHistoryResponse = {
      total_pages: Math.ceil(totalGameSessions / limit),
      record: gameHistoryRecords,
    }

    const response: GetGameHistoryResponse = {
      code: 200,
      data: responseData,
      message: 'Game history retrieved successfully',
    }

    return new Response(JSON.stringify(response))
  } catch (error) {
    console.error('Error fetching game history:', error)
    return new Response(JSON.stringify({ message: `Internal server error: ${error}`, code: 500 }), {
      status: 500,
    })
  }
}

/**
 * Handles fetching big win data (high rollers and lucky bets).
 * @param req HonoRequest
 * @returns Response
 */
export async function getGameBigWin(): Promise<Response> {
  try {
    const allSpins = await db.gameSpin.findMany({
      where: {
        grossWinAmount: { gt: 100 },
      },
      include: {
        gameSession: true,
      },
      orderBy: { grossWinAmount: 'desc' },
      take: 100,
    })

    // Function to ensure user diversity
    const ensureUserDiversity = (spins: any[], maxLength: number): GameBigWinItem[] => {
      const selectedUsers = new Set<string>()
      const diverseSpins: GameBigWinItem[] = []
      for (const spin of spins) {
        if (
          spin.gameSession &&
          !selectedUsers.has(spin.gameSession.userId) &&
          diverseSpins.length < maxLength
        ) {
          selectedUsers.add(spin.gameSession.userId)
          diverseSpins.push(spin)
        }
      }
      return diverseSpins
    }

    // Prepare high rollers
    const highRollersSpins = [...allSpins].sort((a, b) => b.grossWinAmount - a.grossWinAmount)
    const diverseHighRollers = ensureUserDiversity(highRollersSpins, 20)

    // Prepare lucky bets
    const luckyBetsSpins = [...allSpins].sort(
      (a, b) => b.grossWinAmount - b.wagerAmount - (a.grossWinAmount - a.wagerAmount)
    )
    const diverseLuckyBets = ensureUserDiversity(luckyBetsSpins, 20)

    const highRollersItems: GameBigWinItem[] = (
      await Promise.all(
        diverseHighRollers.map(async (spin: any) => {
          if (spin.gameSession) {
            const gameId = spin.gameSession.gameId
            const userId = spin.gameSession.userId
            const game = await db.game.findUnique({ where: { id: gameId } })
            const user = await db.user.findUnique({ where: { id: userId } })
            if (user !== null && game != null) {
              const _developer = game.name.substring(
                game.name.toLocaleLowerCase().length,
                game.name.toLowerCase().length - 3
              )
              let developer
              if (_developer?.toLowerCase().includes('ng')) developer = 'netgame'
              if (_developer?.toLowerCase().includes('net')) developer = 'netent'
              if (_developer?.toLowerCase().includes('rtg')) developer = 'redtiger'
              if (_developer?.toLowerCase().includes('nlc')) developer = 'nolimit'
              if (_developer?.toLowerCase().includes('bfg')) developer = 'bigfish'
              let username = user.username
              if (username && username.length > 8) username = username.substring(0, 8) + '..'

              return {
                game_id: game?.id,
                game_name: game?.name || 'Unknown Game',
                game_icon: `/images/games/${developer}/${game?.name.toLowerCase()}.avif`,
                user_name: username || 'Anonymous',
                user_vip_group: 0,
                user_vip_level: 0,
                bet_amount: spin?.wagerAmount?.toString() || '0',
                multiplier:
                  spin.winAmount && spin.wagerAmount
                    ? (spin.winAmount / spin.wagerAmount).toFixed(2)
                    : '0',
                win_amount: (spin.grossWinAmount / 100).toString() || '0',
                time: spin.timeStamp.getTime(),
              }
            }
          }
          return undefined
        })
      )
    ).filter(Boolean) as GameBigWinItem[]

    const luckyBetsItems: GameBigWinItem[] = (
      await Promise.all(
        diverseLuckyBets.map(async (spin: any) => {
          if (spin.gameSession) {
            const gameId = spin.gameSession.gameId
            const userId = spin.gameSession.userId
            const game = await db.game.findUnique({ where: { id: gameId } })
            const user = await db.user.findUnique({ where: { id: userId } })
            if (user !== null && game != null) {
              const _developer = game.name.substring(
                game.name.toLocaleLowerCase().length,
                game.name.toLowerCase().length - 3
              )
              let developer
              if (_developer?.toLowerCase().includes('ng')) developer = 'netgame'
              if (_developer?.toLowerCase().includes('net')) developer = 'netent'
              if (_developer?.toLowerCase().includes('rtg')) developer = 'redtiger'
              if (_developer?.toLowerCase().includes('nlc')) developer = 'nolimit'
              if (_developer?.toLowerCase().includes('bfg')) developer = 'bigfish'
              let username = user.username
              if (username && username.length > 8) username = username.substring(0, 8) + '..'

              return {
                game_id: game?.id,
                game_name: game?.name || 'Unknown Game',
                game_icon: `/images/games/${developer}/${game?.name.toLowerCase()}.avif`,
                user_name: username || 'Anonymous',
                user_vip_group: 0,
                user_vip_level: 0,
                bet_amount: spin?.wagerAmount?.toString() || '0',
                multiplier:
                  spin.winAmount && spin.wagerAmount
                    ? (spin.winAmount / spin.wagerAmount).toFixed(2)
                    : '0',
                win_amount: (spin.grossWinAmount / 100).toString() || '0',
                time: spin.timeStamp.getTime(),
              }
            }
          }
          return undefined
        })
      )
    ).filter(Boolean) as GameBigWinItem[]

    const responseData: GameBigWinData = {
      high_rollers: highRollersItems,
      lucky_bets: luckyBetsItems,
    }

    const response: GetGameBigWinResponse = {
      code: 200,
      data: responseData,
      message: 'Big win data retrieved successfully',
    }

    return new Response(JSON.stringify(response))
  } catch (error) {
    console.error('Error fetching big win data:', error)
    return new Response(JSON.stringify({ message: `Internal server error: ${error}`, code: 500 }), {
      status: 500,
    })
  }

  // async function createGameSessionRtg(
  //   currentUser: any,
  //   spinData: any,
  //   gameName: string
  // ): Promise<any> {
  //   await removeGameSession(currentUser.profileId!);
  //   // //console.log(currentUser);
  //   const data = await prisma.gameSession.create({
  //     data: {
  //       id: spinData.result.user.userId.toString(),
  //       profileId: currentUser.profileId!,
  //       currentBetLevel: 0, //spinData.stake * 100,
  //       gameName,
  //       token: spinData.result.user.token,
  //       isActive: true,
  //       playerStartingBalance: currentUser.profile!.balance,
  //       playerEndingBalance: currentUser.profile!.balance,
  //       sessionId: currentUser.currentSessionId!,
  //       SpinData: [],
  //       updatedAt: new Date(),
  //       user: {
  //         connect: {
  //           id: currentUser.id,
  //         },
  //       },
  //       game: {
  //         connect: {
  //           name: gameName,
  //         },
  //       },
  //     },
  //   });
  // //console.log(data);
  // activeGameSessions.set(data.profileId, data);
  //console.log("gameSession created ", data.id);
  // return activeGameSessions.get(data.profileId)!;
}
function formatCentsAmount(value: number | string): number {
  const amount = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(amount)) {
    throw new Error('Invalid input: not a number')
  }
  return Math.round(amount * 100)
}
// function getGameSession(profileId: string): GameSession | undefined {
//   const arr = Array.from(activeGameSessions);
//   let gs: GameSession | undefined = undefined;
//   arr.forEach((gameSession) => {
//     if (gameSession[0] == profileId) {
//       gs = gameSession[1];
//     }
//   });
//   return gs;
// }

export async function rtgSettings(
  c: Context,
  user: UserWithProfile
  // session: Session
): Promise<Response> {
  const dataFromClient = await c.req.json()
  console.log('dataFromClient ', dataFromClient)
  const gameName = 'WantedWildzExtreme'
  const sessId = Math.random() * 100000
  const init = {
    body: JSON.stringify({
      token: dataFromClient.token,
      sessionId: '0' as string,
      playMode: 'demo',
      gameId: gameName.replace('RTG', ''),
      userData: {
        userId: sessId,
        affiliate: '',
        lang: 'en',
        channel: 'I',
        userType: 'U',
        fingerprint: dataFromClient.userData.fingerprint, //"c474d2e1-a19e-4a40-8d32-58b02b0c1034",
        hash: '',
      },
      custom: { siteId: '', extras: '' },
    }),
    method: 'POST',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  }

  const r = await fetch(
    `https://proxy.andrews.workers.dev/proxy/gserver-rtg.redtiger.com/rtg/platform/game/settings`,
    init
  )
  const gameSettingsFromDeveloper: any = await r.json()
  // if (currentUser === null) throw new Error('Account not found');
  // return r;
  const currentUser = user
  console.log('gameSettingsFromDeveloper ', gameSettingsFromDeveloper)
  // await createGameSessionRtg(user, gameSettingsFromDeveloper, gameName);
  // return gameSettingsFromDeveloper;
  return new Response(
    buildJson(
      gameSettingsFromDeveloper,
      currentUser.profile!.balance,
      currentUser.profile!.balance,
      0
    )
  )
  // return new Response(
  //   JSON.stringify({ message: 'RTG settings retrieved successfully', code: 200 })
  // );
}
export async function rtgSpin(c: Context, user: UserWithProfile, session: Session): Promise<any> {
  const currentUser = user
  const dataFromClient = await c.req.json()
  console.log(dataFromClient)
  if (currentUser.profile === undefined)
    return JSON.stringify({
      success: false,
      error: {
        msg: 'Insufficient Funds!',
        details: {
          info: [{ isReal: true }],
        },
        code: 775,
      },
    })
  const originalBalance = currentUser.profile!.balance
  //console.log("orignalbalance ", originalBalance);
  //console.log("stake ", dataFromClient.stake);

  if (originalBalance < dataFromClient.stake)
    return JSON.stringify({
      success: false,
      error: {
        msg: 'Insufficient Funds!',
        details: {
          info: [{ isReal: true }],
        },
        code: 775,
      },
    })

  // let gameSession = getGameSession(
  //   currentUser.profileId as string,
  // )
  // if (gameSession == undefined) {
  //   //console.log("oh shit");
  //   return
  // }
  //console.log(dataFromClient);
  try {
    //       token:
    //         '0ce6f9affc8d4ad36862938a29748e2e68c15f47ee0a449075e478b6a21d421be7abd1c31d530982182dbf0e05b518e9645149e446a5d5ec7a13dc029ccd56e0',
    //       sessionId: '0',
    //       playMode: 'demo',
    //       gameId: gameName,
    //       userData: {
    //           userId: 2502924,
    //           affiliate: '',
    //           lang: 'en',
    //           channel: 'I',
    //           userType: 'U',
    //           fingerprint: 'c474d2e1-a19e-4a40-8d32-58b02b0c1034',
    //         hash: '',
    // 2e7a8f8a-44e8-4dbc-8b58-702ef317553a
    //         // fingerprint: '5d21efc1-bd63-4bc0-8cae-a61849fe221f2',
    //       },
    //       custom: { siteId: '', extras: '' },
    // dataFromClient.fingerprint = ''
    // dataFromClient.userData.fingerprint = ''
    // dataFromClient.token = ''
    const init = {
      body: JSON.stringify(dataFromClient),
      method: 'POST',
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    }
    //console.log(init);
    //fbc9636c3aecd55e2cffdf50f5a105082d94c05e6dd48fa3406c668d671f8be2723bfab4ef699580eed0577dab3b6b278dc4d1f96671575ac8b9828b5e036de6
    //fbc9636c3aecd55e2cffdf50f5a105082d94c05e6dd48fa3406c668d671f8be2723bfab4ef699580eed0577dab3b6b278dc4d1f96671575ac8b9828b5e036de6\
    const response = await fetch(
      // "https://gserver-rtg.redtiger.com/rtg/platform/game/spin",
      'https://proxy.andrews.workers.dev/proxy/gserver-rtg.redtiger.com/rtg/platform/game/spin',
      init
    )
    let gameSession = await db.gameSession.findFirst({
      where: { profileId: currentUser.profile.id, isActive: true },
    })
    //console.log(response);
    const previousSpins = await db.gameSpin.findMany({
      where: { gameSessionId: gameSession!.id },
    })
    const gameResultFromDeveloper: any = await response.json()
    const spinNumber = previousSpins.length + 1

    if (!gameResultFromDeveloper.success) {
      if (gameResultFromDeveloper.error.code === 5)
        gameResultFromDeveloper.error.details.info = { isReal: false }
      return JSON.stringify(gameResultFromDeveloper)
    }

    if (gameSession === null) {
      gameSession = await db.gameSession.create({
        data: {
          profileId: currentUser.profile.id,
          isActive: true,
          user: { connect: { id: currentUser.id } },
          game: { connect: { id: dataFromClient.gameId } }, // Make sure dataFromClient.gameId is available and correct
        },
      })
    }
    await db.gameSpin.create({
      data: {
        gameSessionId: gameSession.id,
        spinNumber,
        spinData: JSON.stringify(gameResultFromDeveloper),
        sessionId: session.id,
        timeStamp: new Date(),
      },
    }) //getActiveSession(currentUser.id)

    // const previousSpins = await db.gameSpin.findMany({
    //   where: { gameSessionId: gameSession.id },
    // });
    // const hasState = gameResultFromDeveloper.result.game.hasState;
    const winAmount = formatCentsAmount(gameResultFromDeveloper.result.game.win.total)
    const betAmount = formatCentsAmount(dataFromClient.stake) // Example bet amount
    const spinId = gameResultFromDeveloper.result.transactions.roundId
    // const [playerRTPToday, playerWinTotalToday, playerBetTotalToday] = await getRtpForPlayerToday(
    //   currentUser,
    //   winAmount,
    //   betAmount
    // );
    const [gameSessionRTP] = await getRtpForGameSession(gameSession, winAmount, betAmount)
    const spinData = {
      id: spinId.toString(),
      gameSessionId: gameSession.id,
      // sessionNetPosition: formatCentsAmount(gameResultFromDeveloper.result.user.sessionNetPosition),
      sessionId: session.id as string,
      // profileId: currentUser.profile!.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      gameId: gameSession.gameId,
      // gameBalance,
      // playerBalanceAtStart: playerStartingBalance,
      // playerBalance: currentUser.profile!.balance + balanceChange,
      wagerAmount: betAmount,
      grossWinAmount: winAmount || 0,
      // playerWinTotalToday: playerWinTotalToday,
      // playerBetTotalToday: playerBetTotalToday,
      // sessionTotalWinAmount: sessionTotalWinAmount,
      // sessionTotalBetAmount: sessionTotalBetAmount,
      spinNumber,
      gameSessionRTP: parseFloat(gameSessionRTP),
      // playerRTPToday,
      // temperature: null,
      // developer: null,
      timeStamp: new Date(),
    }
    await db.gameSpin.create({
      data: spinData,
    })
    // updatePlayerAndShop(currentUser, winAmount, betAmount);
    return new Response(
      buildJsonForSpin(
        gameResultFromDeveloper,
        currentUser.profile!.balance,
        dataFromClient.stake,
        originalBalance,
        currentUser.profile!.balance
        // user.profile.vipInfo.bet_exp as number
      )
    )
  } catch (e) {
    //console.log("390");
    //console.log(e);
    return JSON.stringify(e)
  }
}
/**
 * Handles fetching data for a user's spin page.
 * This is a placeholder and needs implementation based on actual "spin page" logic.
 * @param req HonoRequest
 * @returns Response
 */
export async function getGameSpinPage(): Promise<Response> {
  try {
    // Placeholder logic for spin page data
    const spinPageData = {
      // Add data relevant to a spin page, e.g., spin count, rewards, etc.
      spinCount: getRandomInt(0, 10),
      lastSpinTime: faker.date.recent().getTime(),
      availableRewards: ['Bonus Cash', 'Free Spins', 'XP Boost'],
    }

    const response = {
      code: 200,
      data: spinPageData,
      message: 'Spin page data retrieved successfully',
    }

    return new Response(JSON.stringify(response))
  } catch (error) {
    console.error('Error fetching spin page data:', error)
    return new Response(JSON.stringify({ message: `Internal server error: ${error}`, code: 500 }), {
      status: 500,
    })
  }
}

/**
 * Handles a user performing a spin action.
 * This is a placeholder and needs implementation based on actual "spin" logic.
 * @param req HonoRequest
 * @returns Response
 */
export async function getGameSpin(): Promise<Response> {
  try {
    // Placeholder logic for performing a spin
    // Deduct spin cost from user balance/spin count, determine reward, update user record, etc.

    const spinResult = {
      // Add data representing the result of the spin, e.g., win amount, reward type, etc.
      winAmount: faker.datatype.boolean(0.3) ? getRandomInt(100, 1000) : 0, // 30% chance of winning
      rewardType: faker.datatype.boolean(0.5) ? 'Bonus Cash' : 'Nothing',
      message: 'You spun the wheel!',
    }

    const response = {
      code: 200,
      data: spinResult,
      message: 'Spin action completed',
    }

    return new Response(JSON.stringify(response))
  } catch (error) {
    console.error('Error performing spin action:', error)
    return new Response(JSON.stringify({ message: `Internal server error: ${error}`, code: 500 }), {
      status: 500,
    })
  }
}

// --- Mocked imports from leveling.config.ts ---
// In a real setup, you'd import these directly.
interface LevelConfig {
  level: number
  name: string
  xpRequired: number // XP for this specific level bar
  cumulativeXpToReach: number // Total XP needed to attain this level
  cashbackPercentage: number
  prioritySupport: boolean
  benefits: any[] // Define more strictly if needed
  levelUpRewards?: Array<
    Omit<
      Prisma.UserRewardCreateInput,
      'userId' | 'rewardType' | 'status' | 'vipLevelRequirement' | 'user' | 'currency'
    > & { currencyId?: string; amount?: number | Prisma.Decimal }
  >
}

const VIP_LEVEL_CONFIGS: Readonly<LevelConfig[]> = Object.freeze([
  {
    level: 1,
    name: 'Bronze',
    xpRequired: 100,
    cumulativeXpToReach: 0,
    cashbackPercentage: 0.01,
    prioritySupport: false,
    benefits: [],
    levelUpRewards: [{ description: 'Welcome Bonus!', amount: 1000, currencyId: 'USD_FUN' }],
  }, // 1000 cents = 10 USD_FUN
  {
    level: 2,
    name: 'Silver',
    xpRequired: 150,
    cumulativeXpToReach: 100,
    cashbackPercentage: 0.02,
    prioritySupport: true,
    benefits: [],
    levelUpRewards: [{ description: 'Silver Tier Bonus!', amount: 5000, currencyId: 'USD_FUN' }],
  },
])

function getVipLevelByTotalXp(totalXp: number): Readonly<LevelConfig> {
  for (let i = VIP_LEVEL_CONFIGS.length - 1; i >= 0; i--) {
    if (totalXp >= VIP_LEVEL_CONFIGS[i].cumulativeXpToReach) {
      return VIP_LEVEL_CONFIGS[i]
    }
  }
  return (
    VIP_LEVEL_CONFIGS[0] || {
      level: 0,
      name: 'Unranked',
      xpRequired: 100,
      cumulativeXpToReach: 0,
      cashbackPercentage: 0,
      prioritySupport: false,
      benefits: [],
    }
  )
}
// --- End of Mocked imports ---

// --- 0. Core Type Definitions (from game provider) ---
type MonetaryAmountProvider = string // e.g., "100.00" from provider
type UserIdProvider = number | string
type SessionIdProvider = string
type TokenProvider = string
type IsoDateTimeStringProvider = string

// --- 1. TypeScript Interfaces for Game Provider Data (largely unchanged) ---
interface ProviderCurrency {
  code: string
  symbol: string
}

interface ProviderUserInitialBalance {
  cash: MonetaryAmountProvider
  freeBets: MonetaryAmountProvider
  bonus: MonetaryAmountProvider
}

interface ProviderSettingsUserResult {
  balance: ProviderUserInitialBalance
  userId: UserIdProvider
  country?: string
  currency: ProviderCurrency
  token: TokenProvider
  sessionId: SessionIdProvider
  canGamble?: boolean
}

interface ProviderSettingsGameResult {
  version?: string
  gameType?: string
}

interface ProviderSettingsResponseData {
  user: ProviderSettingsUserResult
  game: ProviderSettingsGameResult
  launcher?: { version?: string }
}

export interface SettingsResponse {
  success: boolean
  result: ProviderSettingsResponseData
}

interface ProviderBalanceTransaction {
  atStart: MonetaryAmountProvider
  afterBet: MonetaryAmountProvider
  atEnd: MonetaryAmountProvider
}

interface ProviderUserTransactionalBalance {
  cash: ProviderBalanceTransaction
}

interface ProviderSpinTransactionDetails {
  roundId: number | string
}

interface ProviderSpinUserResult {
  balance: ProviderUserTransactionalBalance
  userId: UserIdProvider
  sessionId: SessionIdProvider
  token: TokenProvider
  serverTime: IsoDateTimeStringProvider
}

interface ProviderSpinWinDetails {
  total: MonetaryAmountProvider
}

interface ProviderSpinGameResult {
  win: ProviderSpinWinDetails
  stake: MonetaryAmountProvider
}

interface ProviderSpinResponseData {
  transactions: ProviderSpinTransactionDetails
  user: ProviderSpinUserResult
  game: ProviderSpinGameResult
}

export interface SpinResponse {
  success: boolean
  result: ProviderSpinResponseData
}

// --- Helper function for currency conversion ---
/**
 * Converts a string monetary amount from the provider to cents (integer).
 * @param amountStr Amount as string (e.g., "10.50")
 * @param precision Number of decimal places for the currency (e.g., 2 for USD)
 * @returns Amount in cents as an integer.
 */
function toCents(amountStr: MonetaryAmountProvider, precision: number = 2): number {
  const num = parseFloat(amountStr)
  if (isNaN(num)) {
    console.warn(`Invalid monetary amount string received: ${amountStr}`)
    return 0
  }
  return Math.round(num * Math.pow(10, precision))
}

/**
 * Converts an amount in cents (integer) to a float representation for the main unit.
 * @param amountInCents Amount in cents
 * @param precision Number of decimal places
 * @returns Amount as float (e.g., 1050 cents with precision 2 becomes 10.50)
 */
function fromCentsToFloat(amountInCents: number, precision: number = 2): number {
  return amountInCents / Math.pow(10, precision)
}

// --- 2. Mock Prisma Client & Data ---
const mockUserDb: { [providerUserId: string]: User & { wallets: Wallet[] } } = {}
const mockWalletDb: { [walletId: string]: Wallet } = {}
const mockTransactionDb: Transaction[] = []
const mockXpEventDb: XpEvent[] = []
const mockNotificationDb: Notification[] = []
const mockCurrencyDb: { [code: string]: Currency } = {
  GBP: {
    id: 'cl_gbp',
    name: 'British Pound',
    symbol: '£',
    type: 'FIAT',
    precision: 2,
    isActive: true,
    isDefault: false,
    contractAddress: null,
    blockchain: null,
    withdrawalFeeFixed: null,
    withdrawalFeePercent: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  USD_FUN: {
    id: 'cl_usd_fun',
    name: 'Fun Bucks',
    symbol: 'FB',
    type: 'VIRTUAL',
    precision: 2,
    isActive: true,
    isDefault: true,
    contractAddress: null,
    blockchain: null,
    withdrawalFeeFixed: null,
    withdrawalFeePercent: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
}
const mockUserRewardDb: UserReward[] = []

const prisma = {
  user: {
    findUnique: async (args: {
      where: { providerUserId?: string; id?: string }
      include?: any
    }): Promise<(User & { wallets?: Wallet[] }) | null> => {
      const user = args.where.providerUserId
        ? mockUserDb[args.where.providerUserId]
        : Object.values(mockUserDb).find((u) => u.id === args.where.id)
      if (user && args.include?.wallets) {
        // Simulate including wallets
        return { ...user, wallets: Object.values(mockWalletDb).filter((w) => w.userId === user.id) }
      }
      return user || null
    },
    create: async (args: {
      data: Prisma.UserCreateInput & { providerUserId: string }
    }): Promise<User & { wallets: Wallet[] }> => {
      const id = `user_${Date.now()}`
      const newUser: User & { wallets: Wallet[] } = {
        id,
        email: args.data.email || `${id}@example.com`,
        name: args.data.name || `User ${id}`,
        totalXp: args.data.totalXp || 0,
        currentLevel: args.data.currentLevel || 1,
        // Add other required User fields from your schema with defaults
        username: args.data.username,
        emailVerified: args.data.emailVerified,
        displayUsername: args.data.displayUsername,
        phone: args.data.phone,
        cashtag: args.data.cashtag,
        phoneVerified: args.data.phoneVerified,
        isVerified: args.data.isVerified || false,
        passwordHash: args.data.passwordHash,
        role: args.data.role || 'USER',
        status: args.data.status || 'ACTIVE',
        referralCode: args.data.referralCode,
        commissionRate: args.data.commissionRate,
        twoFactorEnabled: args.data.twoFactorEnabled,
        isOnline: args.data.isOnline,
        twoFactorSecret: args.data.twoFactorSecret,
        image: args.data.image,
        twoFactorRecoveryCodes: args.data.twoFactorRecoveryCodes || [],
        lastLogin: args.data.lastLogin,
        lastIp: args.data.lastIp,
        activeWalletId: args.data.activeWalletId,
        referrerId: args.data.referrerId,
        firstName: args.data.firstName,
        lastName: args.data.lastName,
        avatarUrl: args.data.avatarUrl,
        dob: args.data.dob,
        gender: args.data.gender,
        preferredCurrencyId: args.data.preferredCurrencyId,
        timezone: args.data.timezone || 'UTC',
        locale: args.data.locale || 'en-US',
        mfaEnabled: args.data.mfaEnabled || false,
        mfaSecret: args.data.mfaSecret,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args.data, // Spread the rest of the data
        wallets: [], // Initialize with empty wallets for the mock
      }
      mockUserDb[newUser.providerUserId!] = newUser
      console.log(`[Prisma Mock] Created user:`, newUser)
      return newUser
    },
    update: async (args: {
      where: { id: string }
      data: Prisma.UserUpdateInput
    }): Promise<User> => {
      const userRef = Object.values(mockUserDb).find((u) => u.id === args.where.id)
      if (userRef) {
        const updatedPlayer = { ...userRef, ...args.data, updatedAt: new Date() } as User
        mockUserDb[userRef.providerUserId!] = updatedPlayer
        console.log(`[Prisma Mock] Updated user:`, updatedPlayer)
        return updatedPlayer
      }
      throw new Error('User not found for update')
    },
  },
  wallet: {
    findFirst: async (args: {
      where: { userId: string; currencyId: string }
    }): Promise<Wallet | null> => {
      return (
        Object.values(mockWalletDb).find(
          (w) => w.userId === args.where.userId && w.currencyId === args.where.currencyId
        ) || null
      )
    },
    create: async (args: { data: Prisma.WalletCreateInput }): Promise<Wallet> => {
      const id = `wallet_${Date.now()}`
      const newWallet: Wallet = {
        id,
        balance: args.data.balance || 0, // Prisma schema has Float
        bonusBalance: args.data.bonusBalance || 0,
        lockedBalance: args.data.lockedBalance || 0,
        isActive: args.data.isActive !== undefined ? args.data.isActive : true,
        address: args.data.address,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: args.data.user.connect!.id!,
        currencyId: args.data.currency.connect!.id!,
      }
      mockWalletDb[id] = newWallet
      // Link to user in mockUserDb
      const user = Object.values(mockUserDb).find((u) => u.id === newWallet.userId)
      if (user) {
        if (!user.wallets) user.wallets = []
        user.wallets.push(newWallet)
      }
      console.log(`[Prisma Mock] Created wallet:`, newWallet)
      return newWallet
    },
    update: async (args: {
      where: { id: string }
      data: Prisma.WalletUpdateInput
    }): Promise<Wallet> => {
      if (mockWalletDb[args.where.id]) {
        // Deep copy for partial updates of balance
        const currentBalance = mockWalletDb[args.where.id].balance
        const balanceUpdate = args.data.balance as Prisma.FloatFilter // Or Prisma.WalletUpdatebalanceInput

        let newBalance = currentBalance
        if (typeof args.data.balance === 'number') {
          newBalance = args.data.balance
        } else if (balanceUpdate && typeof balanceUpdate.increment === 'number') {
          newBalance = (currentBalance as number) + balanceUpdate.increment
        } else if (balanceUpdate && typeof balanceUpdate.decrement === 'number') {
          newBalance = (currentBalance as number) - balanceUpdate.decrement
        }

        mockWalletDb[args.where.id] = {
          ...mockWalletDb[args.where.id],
          ...args.data,
          balance: newBalance,
          updatedAt: new Date(),
        }
        console.log(`[Prisma Mock] Updated wallet:`, mockWalletDb[args.where.id])
        return mockWalletDb[args.where.id]
      }
      throw new Error('Wallet not found for update')
    },
  },
  transaction: {
    create: async (args: { data: Prisma.TransactionCreateInput }): Promise<Transaction> => {
      const id = `txn_${Date.now()}`
      const newTransaction: Transaction = {
        id,
        processedAt: args.data.processedAt,
        originatorUserId: args.data.originator.connect!.id!,
        receiverUserId: args.data.receiver?.connect?.id || null,
        walletId: args.data.wallet?.connect?.id || null,
        type: args.data.type,
        status: args.data.status || TransactionStatus.COMPLETED,
        amount: args.data.amount, // Stored in cents
        netAmount: args.data.netAmount,
        feeAmount: args.data.feeAmount,
        currencyId: args.data.currency.connect!.id!,
        balanceBefore: args.data.balanceBefore,
        balanceAfter: args.data.balanceAfter,
        bonusBalanceBefore: args.data.bonusBalanceBefore,
        bonusBalanceAfter: args.data.bonusBalanceAfter,
        bonusAmount: args.data.bonusAmount,
        wageringRequirement: args.data.wageringRequirement,
        wageringProgress: args.data.wageringProgress,
        description: args.data.description,
        provider: args.data.provider,
        providerTxId: args.data.providerTxId,
        relatedGameId: args.data.relatedGameId,
        relatedRoundId: args.data.relatedRoundId,
        metadata: args.data.metadata || Prisma.JsonNull,
        productId: args.data.product?.connect?.id || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockTransactionDb.push(newTransaction)
      console.log(`[Prisma Mock] Created transaction:`, newTransaction)
      return newTransaction
    },
  },
  xpEvent: {
    create: async (args: { data: Prisma.XpEventCreateInput }): Promise<XpEvent> => {
      const id = `xp_${Date.now()}`
      const newXpEvent: XpEvent = {
        id,
        points: args.data.points,
        source: args.data.source,
        sourceId: args.data.sourceId,
        meta: args.data.meta || Prisma.JsonNull,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: args.data.user.connect!.id!,
      }
      mockXpEventDb.push(newXpEvent)
      console.log(`[Prisma Mock] Created XP event:`, newXpEvent)
      return newXpEvent
    },
  },
  notification: {
    create: async (args: { data: Prisma.NotificationCreateInput }): Promise<Notification> => {
      const id = `notif_${Date.now()}`
      // Correctly handle sender and originator relations based on your schema
      // Assuming 'sender' is the originator of the notification (e.g., system or another user)
      // And 'userId' in Notification model is the recipient.
      // The Prisma schema provided has `sender @relation("Sender", fields: [userId], ...)`
      // and `originator @relation("Originator", fields: [userId], ...)`. This seems like userId is used for both.
      // For a system notification, sender/originator might be a specific system user or null.
      // Let's assume args.data.originator.connect.id is the recipient for this context.
      const recipientUserId = args.data.originator.connect!.id!

      const newNotification: Notification = {
        id,
        userId: recipientUserId, // This is the recipient
        type: args.data.type,
        title: args.data.title,
        message: args.data.message,
        isRead: args.data.isRead || false,
        readAt: args.data.readAt,
        actionUrl: args.data.actionUrl,
        imageUrl: args.data.imageUrl,
        metadata: args.data.metadata || Prisma.JsonNull,
        createdAt: new Date(),
        updatedAt: new Date(),
        // senderId and originatorId would be based on how you model system/user sent notifications
        // For this example, if originator is the recipient, sender might be a system user ID or a specific field.
        // The relations in your schema are:
        // sender User @relation("Sender", fields: [userId], references: [id]...
        // originator User @relation("Originator", fields: [userId], references: [id]...
        // This implies the `userId` field on Notification links to both sender and originator, which is unusual.
        // Typically, Notification would have `recipientId`, `senderId`.
        // Given the schema, I'll assume `userId` on Notification is the recipient.
        // The `sender` and `originator` relations in Prisma.NotificationCreateInput would point to User records.
        // For a LEVEL_UP, the system is the sender/originator.
      }
      mockNotificationDb.push(newNotification)
      console.log(`[Prisma Mock] Created notification:`, newNotification)
      return newNotification
    },
  },
  currency: {
    findUnique: async (args: {
      where: { id?: string; name?: string }
    }): Promise<Currency | null> => {
      if (args.where.id) return mockCurrencyDb[args.where.id] || null
      if (args.where.name)
        return Object.values(mockCurrencyDb).find((c) => c.name === args.where.name) || null
      return null
    },
    findFirst: async (args: { where: { code: string } }): Promise<Currency | null> => {
      return Object.values(mockCurrencyDb).find((c) => c.id === args.where.id) || null
    },
  },
  userReward: {
    create: async (args: { data: Prisma.UserRewardCreateInput }): Promise<UserReward> => {
      const id = `reward_${Date.now()}`
      const newUserReward: UserReward = {
        id,
        userId: args.data.user.connect!.id!,
        rewardType: args.data.rewardType,
        description: args.data.description,
        status: args.data.status || 'AVAILABLE',
        amount: args.data.amount !== undefined ? Number(args.data.amount) : null, // Ensure amount is number or null
        currencyId: args.data.currencyId || null,
        metaData: args.data.metaData || Prisma.JsonNull,
        claimedAt: args.data.claimedAt,
        expiresAt: args.data.expiresAt,
        availableFrom: args.data.availableFrom || new Date(),
        vipLevelRequirement: args.data.vipLevelRequirement,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockUserRewardDb.push(newUserReward)
      console.log(`[Prisma Mock] Created UserReward:`, newUserReward)
      return newUserReward
    },
  },
  $transaction: async (callback: (prismaClient: any) => Promise<any>) => {
    console.log('[Prisma Mock] Starting transaction')
    try {
      const result = await callback(prisma) // Pass the same mock prisma
      console.log('[Prisma Mock] Committing transaction')
      return result
    } catch (error) {
      console.error('[Prisma Mock] Rolling back transaction due to error:', error)
      throw error
    }
  },
} as unknown as PrismaClient

// --- 3. XP and Leveling System Constants (from game_aggregator_logic) ---
const XP_PER_CURRENCY_UNIT_WAGERED = 1 // 1 XP per unit of currency (smallest unit, e.g., cent) wagered
const XP_PER_CURRENCY_UNIT_WON = 0.5 // 0.5 XP per unit of currency won

// --- 4. Game Integration Service (Refactored) ---
export class GameIntegrationService {
  private prisma: PrismaClient
  private readonly XP_SYSTEM_USER_ID = 'system_xp_user' // For notifications originating from the XP system

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient
  }

  private async findOrCreateCurrency(
    currencyCode: string,
    currencySymbol: string
  ): Promise<Currency> {
    let currency = await this.prisma.currency.findFirst({ where: { code: currencyCode } })
    if (!currency) {
      console.warn(`Currency ${currencyCode} not found, creating with default precision 2.`)
      currency = await this.prisma.currency.create({
        data: {
          code: currencyCode,
          symbol: currencySymbol,
          name: `${currencyCode} (Auto-created)`,
          type: currencyCode === 'USD_FUN' ? 'VIRTUAL' : 'FIAT', // Basic assumption
          precision: 2,
          isActive: true,
        },
      })
      mockCurrencyDb[currencyCode] = currency // Add to mock if using mock
    }
    return currency
  }

  async handleGameSettings(
    gameId: string,
    settingsResponse: SettingsResponse
  ): Promise<{ user: User; wallet: Wallet; message: string }> {
    if (!settingsResponse.success || !settingsResponse.result || !settingsResponse.result.user) {
      throw new Error('Invalid settings response from provider.')
    }

    const providerUser = settingsResponse.result.user
    const providerUserIdStr = String(providerUser.userId)
    const providerCurrencyInfo = providerUser.currency

    const platformCurrency = await this.findOrCreateCurrency(
      providerCurrencyInfo.code,
      providerCurrencyInfo.symbol
    )

    let user = await this.prisma.user.findUnique({
      where: { providerUserId: providerUserIdStr }, // Assuming providerUserId is a unique field on User model
      include: { wallets: { where: { currencyId: platformCurrency.id } } },
    })

    let message = ''
    let wallet: Wallet | undefined | null

    const initialBalanceInCents = toCents(providerUser.balance.cash, platformCurrency.precision)

    if (!user) {
      const initialLevelConfig = getVipLevelByTotalXp(0)
      user = await this.prisma.user.create({
        data: {
          // providerUserId: providerUserIdStr, // Add this field to your User model or use Account model
          name: `Player_${providerUserIdStr}`, // Or generate a unique username
          email: `${providerUserIdStr}@temporary.host`, // Placeholder, ensure uniqueness
          totalXp: 0,
          currentLevel: initialLevelConfig.level,
          status: 'ACTIVE',
          role: 'USER',
          // ... other required User fields
          // For mock:
          providerUserId: providerUserIdStr, // Add this to mock User create
        } as any, // Cast to any for mock providerUserId
      })
      message = `New user registered from game ${gameId}.`
      console.log(
        `New user ${user.id} (provider: ${providerUserIdStr}) created for game ${gameId}.`
      )

      wallet = await this.prisma.wallet.create({
        data: {
          user: { connect: { id: user.id } },
          currency: { connect: { id: platformCurrency.id } },
          balance: fromCentsToFloat(initialBalanceInCents, platformCurrency.precision), // Wallet.balance is Float
          isActive: true,
        },
      })
      console.log(
        `Created wallet ${wallet.id} for user ${user.id} with currency ${platformCurrency.code}.`
      )
    } else {
      message = `User ${user.id} activity updated for game ${gameId}.`
      wallet =
        (user as User & { wallets: Wallet[] }).wallets?.length > 0
          ? (user as User & { wallets: Wallet[] }).wallets[0]
          : null

      if (!wallet) {
        wallet = await this.prisma.wallet.create({
          data: {
            user: { connect: { id: user.id } },
            currency: { connect: { id: platformCurrency.id } },
            balance: fromCentsToFloat(initialBalanceInCents, platformCurrency.precision),
            isActive: true,
          },
        })
        console.log(
          `Created missing wallet ${wallet.id} for existing user ${user.id} with currency ${platformCurrency.code}.`
        )
      } else {
        // Optionally sync balance on settings call if needed, though spins usually handle this.
        // For now, we assume settings just establishes the user and wallet.
      }
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastActivityAt: new Date() },
      })
    }
    if (!wallet) throw new Error('Wallet could not be established for the user.')

    return { user, wallet, message }
  }

  async handleGameSpinResult(
    gameId: string, // Platform's internal game ID
    gameProviderName: string, // e.g., "BassBossProvider" for Transaction.provider
    spinResponse: SpinResponse
  ): Promise<{
    user: User
    betTransaction: Transaction
    winTransaction: Transaction | null
    message: string
    leveledUp: boolean
    rewardsGranted: UserReward[]
  }> {
    if (!spinResponse.success || !spinResponse.result) {
      throw new Error('Invalid spin response from provider.')
    }

    const {
      user: providerUserSpin,
      game: gameResult,
      transactions: providerTransactions,
    } = spinResponse.result
    const providerUserIdStr = String(providerUserSpin.userId)

    // Assuming currency from spin response is the one to use.
    // In a real system, you might get currency from an active game session.
    // For now, we'll rely on the settings call to have established the primary currency,
    // or we fetch it based on a common currency code if the provider sends it with each spin.
    // Let's assume the provider's spin response implies a currency, or we use user's preferred.
    // For this example, let's find the user's primary/first wallet or a default.
    // A robust solution would involve the game session's currency.

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { providerUserId: providerUserIdStr }, // Assuming providerUserId is unique on User
        include: { wallets: true, vipInfo: true }, // Include wallets and VipInfo
      })

      if (!user) {
        throw new Error(
          `User with provider ID ${providerUserIdStr} not found. Settings must be called first.`
        )
      }

      // Determine currency and wallet
      // For simplicity, let's assume the first active wallet or a default one.
      // A more robust system would use currency from game session or provider's spin response.
      // Let's find a GBP wallet as per settings example, or a default virtual currency.
      let activeWallet = user.wallets.find(
        (w) =>
          w.currencyId === mockCurrencyDb['GBP']?.id ||
          w.currencyId === mockCurrencyDb['USD_FUN']?.id
      )
      if (!activeWallet && user.wallets.length > 0) {
        activeWallet = user.wallets[0] // Fallback to first wallet
      }
      if (!activeWallet) {
        throw new Error(`No active wallet found for user ${user.id}.`)
      }
      const currency = await tx.currency.findUnique({ where: { id: activeWallet.currencyId } })
      if (!currency) {
        throw new Error(
          `Currency with ID ${activeWallet.currencyId} not found for wallet ${activeWallet.id}.`
        )
      }
      const currencyPrecision = currency.precision

      const stakeInCents = toCents(gameResult.stake, currencyPrecision)
      const winInCents = toCents(gameResult.win.total, currencyPrecision)

      const walletBalanceBeforeNumeric = Number(activeWallet.balance) // Prisma Wallet.balance is Float

      // 1. Create BET Transaction
      const balanceAfterBet =
        walletBalanceBeforeNumeric - fromCentsToFloat(stakeInCents, currencyPrecision)
      const betTransaction = await tx.transaction.create({
        data: {
          originator: { connect: { id: user.id } },
          wallet: { connect: { id: activeWallet.id } },
          type: TransactionType.BET_PLACE,
          status: TransactionStatus.COMPLETED,
          amount: stakeInCents, // Amount in cents
          currency: { connect: { id: currency.id } },
          balanceBefore: Math.round(walletBalanceBeforeNumeric * Math.pow(10, currencyPrecision)), // Store balance in cents
          balanceAfter: Math.round(balanceAfterBet * Math.pow(10, currencyPrecision)),
          provider: gameProviderName,
          relatedGameId: gameId,
          relatedRoundId: String(providerTransactions.roundId),
          processedAt: new Date(providerUserSpin.serverTime),
          description: `Bet placed for game ${gameId}, round ${providerTransactions.roundId}`,
        },
      })

      // Update wallet balance after bet
      await tx.wallet.update({
        where: { id: activeWallet.id },
        data: { balance: balanceAfterBet },
      })
      activeWallet.balance = new Prisma.Decimal(balanceAfterBet) // Update in-memory mock

      // 2. Create WIN Transaction (if applicable)
      let winTransaction: Transaction | null = null
      let balanceAfterWin = balanceAfterBet

      if (winInCents > 0) {
        balanceAfterWin = balanceAfterBet + fromCentsToFloat(winInCents, currencyPrecision)
        winTransaction = await tx.transaction.create({
          data: {
            originator: { connect: { id: user.id } },
            wallet: { connect: { id: activeWallet.id } },
            type: TransactionType.BET_WIN,
            status: TransactionStatus.COMPLETED,
            amount: winInCents, // Amount in cents
            currency: { connect: { id: currency.id } },
            balanceBefore: Math.round(balanceAfterBet * Math.pow(10, currencyPrecision)),
            balanceAfter: Math.round(balanceAfterWin * Math.pow(10, currencyPrecision)),
            provider: gameProviderName,
            relatedGameId: gameId,
            relatedRoundId: String(providerTransactions.roundId),
            processedAt: new Date(providerUserSpin.serverTime),
            description: `Win received for game ${gameId}, round ${providerTransactions.roundId}`,
          },
        })
        // Update wallet balance after win
        await tx.wallet.update({
          where: { id: activeWallet.id },
          data: { balance: balanceAfterWin },
        })
        activeWallet.balance = new Prisma.Decimal(balanceAfterWin) // Update in-memory mock
      }

      // 3. Calculate XP Gained
      const xpFromWager = Math.floor(
        (stakeInCents * XP_PER_CURRENCY_UNIT_WAGERED) / Math.pow(10, currencyPrecision)
      ) // XP based on main unit
      const xpFromWin = Math.floor(
        (winInCents * XP_PER_CURRENCY_UNIT_WON) / Math.pow(10, currencyPrecision)
      )
      const totalXpGainedThisSpin = xpFromWager + xpFromWin

      const playerXpBefore = user.totalXp
      const updatedTotalXp = playerXpBefore + totalXpGainedThisSpin

      await tx.xpEvent.create({
        data: {
          user: { connect: { id: user.id } },
          points: totalXpGainedThisSpin,
          source: 'GAME_SPIN',
          sourceId: String(providerTransactions.roundId),
          meta: { gameId, stakeInCents, winInCents },
        },
      })

      // 4. Handle Leveling Up
      let leveledUp = false
      const rewardsGranted: UserReward[] = []
      const playerLevelBefore = user.currentLevel
      const newLevelConfig = getVipLevelByTotalXp(updatedTotalXp)
      let finalUserLevel = playerLevelBefore

      if (newLevelConfig.level > playerLevelBefore) {
        leveledUp = true
        finalUserLevel = newLevelConfig.level
        console.log(`User ${user.id} leveled up from ${playerLevelBefore} to ${finalUserLevel}!`)

        // Grant level up rewards
        const levelConfigForNewLevel = VIP_LEVEL_CONFIGS.find((l) => l.level === finalUserLevel)
        if (levelConfigForNewLevel?.levelUpRewards) {
          for (const rewardConfig of levelConfigForNewLevel.levelUpRewards) {
            const rewardCurrencyId = rewardConfig.currencyId || currency.id // Default to game currency
            const rewardAmount = Number(rewardConfig.amount) || 0 // Ensure it's a number

            // Create UserReward record
            const userReward = await tx.userReward.create({
              data: {
                user: { connect: { id: user.id } },
                rewardType: RewardType.LEVEL_UP,
                description: rewardConfig.description || `Level ${finalUserLevel} Reached!`,
                status: 'AVAILABLE', // Or 'CLAIMED' if auto-claimed
                amount: rewardAmount, // Assuming amount is in cents if monetary
                currencyId: rewardCurrencyId,
                metaData: {
                  level: finalUserLevel,
                  ...((rewardConfig.metaData as Prisma.JsonObject) || {}),
                },
                availableFrom: new Date(),
              },
            })
            rewardsGranted.push(userReward)

            // If monetary and auto-claimed, update wallet
            if (rewardConfig.amount && rewardConfig.currencyId) {
              const rewardWallet = user.wallets.find(
                (w) => w.currencyId === rewardConfig.currencyId
              )
              const rewardCurrency = await tx.currency.findUnique({
                where: { id: rewardConfig.currencyId },
              })
              if (rewardWallet && rewardCurrency) {
                const currentRewardWalletBalance = Number(rewardWallet.balance)
                const rewardAmountFloat = fromCentsToFloat(rewardAmount, rewardCurrency.precision)
                await tx.wallet.update({
                  where: { id: rewardWallet.id },
                  data: { balance: currentRewardWalletBalance + rewardAmountFloat },
                })
                // Log a transaction for this reward
                await tx.transaction.create({
                  data: {
                    originator: { connect: { id: user.id } }, // Or a system user ID
                    receiver: { connect: { id: user.id } },
                    wallet: { connect: { id: rewardWallet.id } },
                    type: TransactionType.BONUS_AWARD, // Or a specific REWARD_LEVEL_UP type
                    status: TransactionStatus.COMPLETED,
                    amount: rewardAmount, // In cents
                    currency: { connect: { id: rewardCurrency.id } },
                    description: `Level up reward: ${rewardConfig.description}`,
                    balanceBefore: Math.round(
                      currentRewardWalletBalance * Math.pow(10, rewardCurrency.precision)
                    ),
                    balanceAfter: Math.round(
                      (currentRewardWalletBalance + rewardAmountFloat) *
                        Math.pow(10, rewardCurrency.precision)
                    ),
                    processedAt: new Date(),
                  },
                })
                console.log(
                  `Awarded ${rewardAmountFloat} ${rewardCurrency.code} to wallet ${rewardWallet.id} for level up.`
                )
              }
            }
          }
        }

        // Create Notification for level up
        await tx.notification.create({
          data: {
            // userId: user.id, // Recipient
            originator: { connect: { id: user.id } }, // Recipient
            // sender: { connect: { id: this.XP_SYSTEM_USER_ID } }, // System as sender - requires system user
            type: NotificationType.LEVEL_UP,
            title: 'Level Up!',
            message: `Congratulations! You've reached Level ${finalUserLevel}. Check out your new rewards!`,
            actionUrl: '/profile/rewards', // Example URL
          },
        })
      }

      // 5. Update User Record (XP and Level)
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          totalXp: updatedTotalXp,
          currentLevel: finalUserLevel,
          lastActivityAt: new Date(providerUserSpin.serverTime),
        },
        include: { wallets: true, vipInfo: true }, // Re-fetch updated user with relations
      })

      let message = `Spin processed for user ${updatedUser.id}. Stake: ${gameResult.stake}, Win: ${gameResult.win.total}. XP Gained: ${totalXpGainedThisSpin}.`
      if (leveledUp) {
        message += ` Player leveled up to ${finalUserLevel}!`
        if (rewardsGranted.length > 0) {
          message += ` Rewards granted: ${rewardsGranted.map((r) => r.description).join(', ')}.`
        }
      }

      return {
        user: updatedUser,
        betTransaction,
        winTransaction,
        message,
        leveledUp,
        rewardsGranted,
      }
    })
  }
}

// --- 5. Example Usage (Illustrative) ---
async function runRefactoredExample() {
  console.log('--- Initializing Refactored Game Integration Service ---')
  const gameService = new GameIntegrationService(prisma)

  const gameId_BassBossPlatform = 'game_bassboss_001' // Your platform's ID for the game
  const gameProviderName_BassBoss = 'RedTiger' // Example provider name

  // --- Example: Game Settings Flow ---
  const settingsResponseData_BassBoss: SettingsResponse = {
    success: true,
    result: {
      user: {
        balance: { cash: '100.00', freeBets: '0.00', bonus: '0.00' },
        userId: 7427503, // Provider's user ID
        currency: { code: 'GBP', symbol: '£' }, // Provider sends currency
        token: 'provider_token_settings_xyz',
        sessionId: 'provider_session_abc',
      },
      game: { version: '4.0.1', gameType: 'slot' },
    },
  }

  let platformUser: User
  let userWallet: Wallet

  try {
    console.log(`\n--- Handling Settings for ${gameId_BassBossPlatform} ---`)
    const settingsResult = await gameService.handleGameSettings(
      gameId_BassBossPlatform,
      settingsResponseData_BassBoss
    )
    platformUser = settingsResult.user
    userWallet = settingsResult.wallet
    console.log(settingsResult.message)
    console.log('Platform User Data:', platformUser)
    console.log('User Wallet:', userWallet)
  } catch (error) {
    console.error('Error handling settings:', error)
    return // Stop if settings fail
  }

  // --- Example: Spin Win Flow ---
  const spinWinResponseData_BassBoss: SpinResponse = {
    success: true,
    result: {
      transactions: { roundId: 'round_win_001' },
      user: {
        balance: { cash: { atStart: '100.00', afterBet: '98.00', atEnd: '112.00' } }, // Cash after this specific spin result
        userId: 7427503,
        sessionId: 'provider_session_abc',
        token: 'provider_token_spin_123',
        serverTime: new Date().toISOString(),
      },
      game: {
        win: { total: '14.00' }, // Total win from this spin is 14.00 GBP
        stake: '2.00', // Stake was 2.00 GBP
      },
    },
  }

  try {
    console.log(`\n--- Handling WIN Spin for ${gameId_BassBossPlatform} ---`)
    const spinWinResult = await gameService.handleGameSpinResult(
      gameId_BassBossPlatform,
      gameProviderName_BassBoss,
      spinWinResponseData_BassBoss
    )
    console.log(spinWinResult.message)
    console.log('Updated User Data:', spinWinResult.user)
    console.log('Bet Transaction:', spinWinResult.betTransaction)
    if (spinWinResult.winTransaction) {
      console.log('Win Transaction:', spinWinResult.winTransaction)
    }
    if (spinWinResult.leveledUp) {
      console.log('Rewards Granted:', spinWinResult.rewardsGranted)
    }
    platformUser = spinWinResult.user // Update user state for next spin
  } catch (error) {
    console.error('Error handling win spin:', error)
  }

  // --- Example: Spin Lose Flow (to test leveling further) ---
  const spinLoseResponseData_BassBoss: SpinResponse = {
    success: true,
    result: {
      transactions: { roundId: 'round_lose_002' },
      user: {
        balance: {
          cash: {
            atStart: `${Number(platformUser.wallets.find((w) => w.currencyId === userWallet.currencyId)?.balance || 0).toFixed(2)}`,
            afterBet: `${(Number(platformUser.wallets.find((w) => w.currencyId === userWallet.currencyId)?.balance || 0) - 5).toFixed(2)}`,
            atEnd: `${(Number(platformUser.wallets.find((w) => w.currencyId === userWallet.currencyId)?.balance || 0) - 5).toFixed(2)}`,
          },
        },
        userId: 7427503,
        sessionId: 'provider_session_abc',
        token: 'provider_token_spin_456',
        serverTime: new Date().toISOString(),
      },
      game: {
        win: { total: '0.00' },
        stake: '5.00', // Higher stake for more XP
      },
    },
  }
  try {
    console.log(`\n--- Handling LOSE Spin (high stake) for ${gameId_BassBossPlatform} ---`)
    const spinLoseResult = await gameService.handleGameSpinResult(
      gameId_BassBossPlatform,
      gameProviderName_BassBoss,
      spinLoseResponseData_BassBoss
    )
    console.log(spinLoseResult.message)
    console.log('Updated User Data:', spinLoseResult.user)
    console.log('Bet Transaction:', spinLoseResult.betTransaction)
    if (spinLoseResult.leveledUp) {
      console.log('Rewards Granted on lose spin (due to XP):', spinLoseResult.rewardsGranted)
    }
  } catch (error) {
    console.error('Error handling lose spin:', error)
  }

  console.log('\n--- Final Mock DB States ---')
  console.log('Users:', JSON.stringify(mockUserDb, null, 2))
  console.log('Wallets:', JSON.stringify(mockWalletDb, null, 2))
  console.log('Transactions:', JSON.stringify(mockTransactionDb, null, 2))
  console.log('XPEvents:', JSON.stringify(mockXpEventDb, null, 2))
  console.log('Notifications:', JSON.stringify(mockNotificationDb, null, 2))
  console.log('UserRewards:', JSON.stringify(mockUserRewardDb, null, 2))
}

// Run the example if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runRefactoredExample().catch(console.error)
}

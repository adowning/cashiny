// import { db } from ""; // Assuming Prisma client path
// Helper function to get a random element from an array
// const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
import { auth } from '@/auth'
import { WebSocketRouter } from '@/routes/socket.router'
import { AppWsData } from '@/server'
import { db, Game, GameSession, GameSpin } from '@cashflow/database'
import type { Prisma } from '@prisma/client'
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
  PaginatedResponse,
  RawGameSpinBody,
  Search,
  UserWithProfile,
} from '@cashflow/types'
import { faker } from '@faker-js/faker'
import { Session } from 'better-auth'
import { Server } from 'bun'
import { Context, HonoRequest } from 'hono'
import { uuid } from 'short-uuid'
import { connection } from 'websocket'
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
//   const playerWinTotalToday = (aggregateDataForPlayerToday._sum?.grossWinAmount || 0) + winAmount;
//   const playerBetTotalToday = (aggregateDataForPlayerToday._sum?.wagerAmount || 0) + betAmount;

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
    gameSessionRTP = parseInt(gameSessionRTP)
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
      // // This is a simplified approach; a dedicated GameCategory model would be better
      // const distinctGameBanks = await db.game.findMany({
      //   select: { gamebank: true },
      //   distinct: ['gamebank'],
      //   where: { active: true },
      // });
      // const banks = distinctGameBanks.map((game) => ({
      //   image: '', // No specific image for these categories
      //   pictures: '',
      //   game_count: 0, // Need to implement logic to count games per bank
      //   name: game.gamebank || 'Unknown',
      //   slug: game.gamebank || 'unknown',
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

    const response: GetGameSearchResponse = {
      code: 200,
      data: responseData,
      message: 'Game search results retrieved successfully',
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
        userId: user.id,
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
  user: Partial<User>,
  session: Session
): Promise<Response> {
  try {
    const body: RawGameSpinBody = await req.json()
    const gameId = body.game_id // Array.isArray(body.id) ? body.id[0] : body.id; // Handle single ID or array
    // const isDemo = body.demo || false;

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
      weburl: `https://example.com/launchgame?gameId=${game.id}&userId=${user.id}`, // Placeholder URL
    }

    const gameSession = await db.gameSession.create({
      data: {
        sessionId: session.id,
        userId: user.id,
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
 * Handles fetching user's games (potentially based on category or filters).
 * @param req HonoRequest
 * @returns Response
 */
export async function getGameUserGame(req: HonoRequest): Promise<Response> {
  try {
    const body: GameUserBody = await req.json()
    const categorySlug = body.game_categories_slug
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
      where: { Profile: user.profile?.id! },
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
        grossWinAmount: { gt: 0 },
      },
      include: {
        gameSession: true,
      },
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
      (a, b) => b.grossWinAmount - b.betAmount - (a.grossWinAmount - a.betAmount)
    )
    const diverseLuckyBets = ensureUserDiversity(luckyBetsSpins, 20)

    const highRollersItems: GameBigWinItem[] = await Promise.all(
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
              bet_amount: spin?.betAmount?.toString() || '0',
              multiplier:
                spin.winAmount && spin.betAmount
                  ? (spin.winAmount / spin.betAmount).toFixed(2)
                  : '0',
              win_amount: (spin.grossWinAmount / 100).toString() || '0',
              time: spin.timeStamp.getTime(),
            }
          }
        }
      })
    )

    const luckyBetsItems: GameBigWinItem[] = await Promise.all(
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
              bet_amount: spin?.betAmount?.toString() || '0',
              multiplier:
                spin.winAmount && spin.betAmount
                  ? (spin.winAmount / spin.betAmount).toFixed(2)
                  : '0',
              win_amount: (spin.grossWinAmount / 100).toString() || '0',
              time: spin.timeStamp.getTime(),
            }
          }
        }
      })
    )

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
      where: { profileId: currentUser.profile.id, isActive: true, user: user, game: game },
    })
    //console.log(response);
    const previousSpins = await db.gameSpin.findMany({
      where: { gameSessionId: gameSession.id },
    })
    let gameResultFromDeveloper: any = await response.json()
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
    const spin = await db.gameSpin.create({
      data: {
        gameSessionId: gameSession.id,
        spinNumber,
        result: gameResultFromDeveloper,
      },
    }) //getActiveSession(currentUser.id)

    // const previousSpins = await db.gameSpin.findMany({
    //   where: { gameSessionId: gameSession.id },
    // });
    // const hasState = gameResultFromDeveloper.result.game.hasState;
    let winAmount = formatCentsAmount(gameResultFromDeveloper.result.game.win.total)
    let betAmount = formatCentsAmount(dataFromClient.stake) // Example bet amount
    const balanceChange = winAmount - betAmount
    const spinId = gameResultFromDeveloper.result.transactions.roundId
    const gameBalance = formatCentsAmount(gameResultFromDeveloper.result.user.balance.cash.atEnd)
    const playerStartingBalance = gameSession.startingBalance
    const [playerRTPToday, playerWinTotalToday, playerBetTotalToday] = await getRtpForPlayerToday(
      currentUser,
      winAmount,
      betAmount
    )
    const [gameSessionRTP, sessionTotalWinAmount, sessionTotalBetAmount] =
      await getRtpForGameSession(gameSession, winAmount, betAmount)
    const spinData: GameSpin = {
      id: spinId.toString(),
      gameSessionId: gameSession.id,
      sessionNetPosition: formatCentsAmount(gameResultFromDeveloper.result.user.sessionNetPosition),
      userSessionId: session.id as string,
      profileId: currentUser.profile!.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      gameId: gameSession.gameId,
      gameBalance,
      playerBalanceAtStart: playerStartingBalance,
      playerBalance: currentUser.profile!.balance + balanceChange,
      betAmount,
      winAmount: winAmount || 0,
      playerWinTotalToday: playerWinTotalToday,
      playerBetTotalToday: playerBetTotalToday,
      sessionTotalWinAmount: sessionTotalWinAmount,
      sessionTotalBetAmount: sessionTotalBetAmount,
      spinNumber,
      gameSessionRTP: parseFloat(gameSessionRTP),
      playerRTPToday,
      temperature: null,
      developer: null,
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

// class SocketConnection {
//   target: HostPortPair
//   socket?: WebSocket

//   constructor(target: HostPortPair) {
//     target = target
//   }

//   async start() {
//     return new Promise<WebSocket>((res, rej) => {
//       const sock = net.connect({
//         host: target.host,
//         port: target.port,
//       })
//       sock.on('connect', () => {
//         socket = sock
//         res(sock)
//       })
//       sock.on('timeout', () => rej(new Error('TIMEOUT')))
//     })
//   }

//   async close() {
//     const { socket } = this
//     if (!socket) throw new Error('NOCONNECTION')
//     return new Promise<void>((res) => {
//       socket.end(() => {
//         socket = undefined
//         res()
//       })
//     })
//   }
// }

// export class HostPortPair {
//   host!: string
//   port!: number

//   constructor(s: string)
//   constructor(host: string, port: number)
//   constructor(...params) {
//     if (params.length === 1 && typeof params[0] === 'string') {
//       host = params[0].split(':')[0]
//       port = parseInt(params[0].split(':')[1])
//     } else if (
//       params.length === 2 &&
//       typeof params[0] === 'string' &&
//       typeof params[1] === 'number'
//     ) {
//       host = params[0]
//       port = params[1]
//     }
//   }

//   static fromBody(body: any) {
//     return new HostPortPair(body.host, body.port)
//   }

//   public toString() {
//     return host + ':' + port
//   }
// }
// export const sendJSON = (conn: connection, log: Logger, body: any) => {
//   const logOutput = { ...body }
//   if (log.level !== 'trace' && logOutput.data) logOutput.data = '==TRUNCATED=='
//   log[log.level === 'trace' ? 'trace' : 'debug']('⬆ %o', logOutput)
//   conn.sendUTF(JSON.stringify(body))
// }

// export const logResponse = (log: Logger, body: any) => {
//   const logOutput = { ...body }
//   if (log.level !== 'trace' && logOutput.data) logOutput.data = '==TRUNCATED=='
//   log[log.level === 'trace' ? 'trace' : 'debug']('⬇ %o', logOutput)
// }
// export async function proxyWebsocket(req: Request, wsRouter: WebSocketRouter<AppWsData>, server: Server): Promise<Response> {
//     if (req.headers.get('upgrade') !== 'websocket') {
//     return new Response('Expected websocket', {status: 400} )
//   }else{
//       const url = new URL(req.url);
//            let sessionId: string | null = null;
//            console.log(url.searchParams.get('token'));
//            // const authHeader = req.headers.get('Authorization');
//            sessionId = url.searchParams.get('token');
//            // if (authHeader?.startsWith('Bearer ')) sessionId = authHeader.substring(7);
//            if (!sessionId) {
//              console.warn('[WS Upgrade] Denied: No session ID found.');
//              return new Response('Unauthorized: Authentication required.', {
//                status: 401,
//              });
//            }
//           req.headers.set('Authorization', sessionId as string);
//            try {
//              const session = await auth.api.getSession({
//                headers: req.headers,
//              });
//              const user = session!.user;
//              if (!session || !user || !user.id) {
//                console.warn(`[WS Upgrade] Denied: Invalid session ID.`);
//                return new Response('Unauthorized: Invalid session.', {
//                  status: 401,
//                });
//              }
//                   const upgradeResponse = wsRouter.upgrade({
//                         server,
//                         request: req,
//                         data: { userId: user.id },
//                       });
//                       if (upgradeResponse instanceof Response) return upgradeResponse;
//                       return new Response(null, { status: 101 });
//            } catch (error: any) {
//              if (error?.message === 'AUTH_INVALID_SESSION_ID') {
//                console.warn(`[WS Upgrade] Denied: Invalid session ID (validation error)`);
//                return new Response('Unauthorized: Invalid session.', {
//                  status: 401,
//                });
//              }
//              console.error('[WS Upgrade] Error:', error);
//              return new Response('Internal Server Error during upgrade.', {
//                status: 500,
//              });
//            }
//          }
//   }
//   try {
//     // Placeholder logic for performing a spin
//     // Deduct spin cost from user balance/spin count, determine reward, update user record, etc.
//     const body = await c.req.json()
//     const pair = HostPortPair.fromBody(body)
//             const socketConnection = new SocketConnection(pair)
//             const id = uuid()
//             const { passphrase } = conn
//     sendJSON(conn, log, {
//               command: 'START',
//               status: 'CONNECTING',
//               connection: id,
//             })
//             socketConnection
//               .start()
//               .then((socket: net.Socket) => {
//                 let remoteIP = req.socket.remoteAddress
//                 if (req.httpRequest.headers['x-forwarded-for'])
//                   remoteIP = req.httpRequest.headers[
//                     'x-forwarded-for'
//                   ] as string
//                 else if (req.httpRequest.headers['x-remote-ip'])
//                   remoteIP = req.httpRequest.headers['x-remote-ip'] as string

//                 log.info(
//                   'Established connection %s <===> server <===> %s',
//                   remoteIP,
//                   pair.toString()
//                 )
//                 sendJSON(conn, log, { status: 'ESTABLISHED', connection: id })

//                 socket.on('data', (data) => {
//                   sendJSON(conn, log, {
//                     connection: id,
//                     data: data.toString('base64'),
//                   })
//                 })

//                 socket.on('close', (hadError) => {
//                   delete sockets[conn.id][id]
//                   sendJSON(conn, log, {
//                     connection: id,
//                     status: 'CLOSED',
//                     hadError,
//                   })
//                   conn.close()
//                 })

//                 sockets[conn.id][id] = socketConnection
//               })
//               .catch((e) => {
//                 log.error('Connect failed: %o', e)
//                 sendJSON(conn, log, {
//                   status: 'FAILED',
//                   error: e.reason,
//                   connection: id,
//                 })
//               })
//             }

//           catch(e){

//           }

//           // else if (body.type == 'TRAFFIC') {
//             if (!sockets[conn.id]) {
//               sendJSON(conn, log, { command: body.type, error: 'AUTHFAIL' })
//             }
//             if (!body.id) {
//               sendJSON(conn, log, {
//                 command: 'TRAFFIC',
//                 connection: body.id,
//                 error: 'NOID',
//               })
//               return
//             } else if (!sockets[conn.id][body.id]) {
//               sendJSON(conn, log, {
//                 command: 'TRAFFIC',
//                 connection: body.id,
//                 error: 'INVALIDID',
//               })
//               return
//             }

//             const { socket } = sockets[conn.id][body.id]
//             if (!socket) {
//               sendJSON(conn, log, {
//                 command: 'TRAFFIC',
//                 connection: body.id,
//                 error: 'CLOSED',
//               })
//               return
//             }

//             socket.write(Buffer.from(body.data, 'base64'), (err) => {
//               if (err) {
//                 sendJSON(conn, log, {
//                   connection: body.id,
//                   command: 'TRAFFIC',
//                   error: err,
//                 })
//               } else {
//                 sendJSON(conn, log, { connection: body.id, command: 'TRAFFIC' })
//               }
//             })
//           } else {
//             sendJSON(conn, log, {
//               command: body.type || 'UNKNOWN',
//               error: 'NOTIMPLEMENTED',
//             })
//           }
//         }

//   //   const response = {
//   //     code: 200,
//   //     data: spinResult,
//   //     message: 'Spin action completed',
//   //   };

//   //   return new Response(JSON.stringify(response));
//   // } catch (error) {
//   //   console.error('Error performing spin action:', error);
//   //   return new Response(JSON.stringify({ message: `Internal server error: ${error}`, code: 500 }), {
//   //     status: 500,
//   //   });
//   // }
// }

// // export async function gameRoutes(req: HonoRequest, route: string, params: string) {
// //   try {
// //     const user = await getUserFromHeader(req);
// //     if (route === NETWORK_CONFIG.WEB_SOCKET.SOCKET_CONNECT) return false;

// //     if (!user || !user.profile) {
// //       return new Response(
// //         JSON.stringify({
// //           code: 401,
// //           message: "Unauthorized",
// //           data: { total_pages: 0, record: [] },
// //         }),
// //         { status: 401 }
// //       );
// //     }
// //     switch (route) {
// //       case NETWORK_CONFIG.GAME_INFO.GAME_LIST:
// //         return await getGameList(req);
// //       case NETWORK_CONFIG.GAME_INFO.GAME_CATEGORY:
// //         return await getGameGameCategory(req);
// //       case NETWORK_CONFIG.GAME_INFO.GAME_SEARCH:
// //         return await getGameSearch(req);
// //       case NETWORK_CONFIG.GAME_INFO.GAME_ENTER:
// //         return await getGameEnter(req, Partial<User>);
// //       case NETWORK_CONFIG.GAME_INFO.USER_GAME:
// //         return await getGameUserGame(req);
// //       case NETWORK_CONFIG.GAME_INFO.FAVORITE_GAME:
// //         return await getGameFavoriteGame(req, Partial<User>);
// //       case NETWORK_CONFIG.GAME_INFO.FAVORITE_GAME_LIST:
// //         return await getGameFavoriteGameList(req);
// //       case NETWORK_CONFIG.GAME_INFO.GAME_HISTORY:
// //         return await getGameHistory(req, Partial<User>);
// //       case NETWORK_CONFIG.GAME_INFO.GAME_BIGWIN:
// //         return await getGameBigWin(req);
// //       case NETWORK_CONFIG.GAME_INFO.SPIN:
// //         return await getGameSpin(req);
// //       case NETWORK_CONFIG.GAME_INFO.SPINPAGE:
// //         return await getGameSpinPage(req);
// //       default:
// //         return false;
// //     }
// //   } catch (error) {
// //     console.error("Error in gameRoutes:", error);
// //     return new Response(JSON.stringify({ message: `Internal server error: ${error}`, code: 500 }), {
// //       status: 500,
// //     });
// //   }
// // }

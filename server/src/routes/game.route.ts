import { NETWORK_CONFIG, UserWithProfile } from '@cashflow/types'

import { createErrorResponse, createSuccessResponse } from '.'
import createRouter from '../create-router'
import {
  getGameBigWin,
  getGameEnter,
  getGameFavoriteGame,
  getGameFavoriteGameList,
  getGameGameCategory,
  getGameHistory,
  getGameList,
  getGameSearch,
  getGameSpin,
  getGameSpinPage,
  getGameUserGame,
  rtgSettings,
  rtgSpin,
} from '../services/game.service'
import { handleGameCommand } from '@/services/php.service'

const router = createRouter()
router.get(NETWORK_CONFIG.GAME_INFO.GAME_LIST, async () => {
  return await getGameList()
})
router.get(NETWORK_CONFIG.GAME_INFO.GAME_CATEGORY, async (c) => {
  return await getGameGameCategory(c.req)
})
router.get(NETWORK_CONFIG.GAME_INFO.GAME_SEARCH, async (c) => {
  try {
    const gameList = await getGameSearch(c.req)
    return createSuccessResponse(gameList)
  } catch (e: unknown) {
    if (e instanceof Error) {
      return createErrorResponse(e.message, 500)
    } else {
      return createErrorResponse('An unexpected error occurred', 500)
    }
  }
})
router.get(NETWORK_CONFIG.GAME_INFO.GAME_ENTER, async (c) => {
  return await getGameEnter(c.req, c.get('user')!, c.get('session')!)
})
router.get(NETWORK_CONFIG.GAME_INFO.USER_GAME, async (c) => {
  return await getGameUserGame(c.req)
})
router.get(NETWORK_CONFIG.GAME_INFO.FAVORITE_GAME, async (c) => {
  return await getGameFavoriteGame(c.req, c.get('user')!)
})
router.get(NETWORK_CONFIG.GAME_INFO.FAVORITE_GAME_LIST, async () => {
  return await getGameFavoriteGameList()
})
router.get(NETWORK_CONFIG.GAME_INFO.GAME_HISTORY, async (c) => {
  return await getGameHistory(c.req, c.get('user')!)
})
router.get(NETWORK_CONFIG.GAME_INFO.GAME_BIGWIN, async () => {
  return await getGameBigWin()

  // try {
  //   return createSuccessResponse(await getGameBigWin());
  // } catch (e: unknown) {
  //  if (e instanceof Error) {
  //   return createErrorResponse(e.message, 500);
  //  } else {
  //   return createErrorResponse('An unexpected error occurred', 500);
  //  }
  // }
})
router.get(NETWORK_CONFIG.GAME_INFO.SPIN, async () => {
  return await getGameSpin()
})
router.get(NETWORK_CONFIG.GAME_INFO.SPINPAGE, async () => {
  return await getGameSpinPage()
})
router.get(NETWORK_CONFIG.GAME_INFO.RTG_SETTINGS, async (c) => {
  return await rtgSettings(c, c.get('user')! as UserWithProfile)
})
router.get(NETWORK_CONFIG.GAME_INFO.RTG_SPIN, async (c) => {
  return await rtgSpin(c, c.get('user')! as UserWithProfile, c.get('session')!)
})
router.get('/php', async (c) => {
  const phpResponse = await handleGameCommand(c.req, new Response())
  return new Response(JSON.stringify(phpResponse))
})
export default router

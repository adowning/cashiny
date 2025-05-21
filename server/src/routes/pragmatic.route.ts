import { NETWORK_CONFIG } from '@cashflow/types';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Context } from 'hono';
import {
  gameRun,
  gameDemo,
  gameList,
  gameMaintenance,
  gamesWithPattern,
  changeGameStatus,
} from '@/services/pragmatic.service';
import createRouter from '../create-router';

export const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export const RegisterSchema = z.object({
  username: z.string(),
  password: z.string(),
});
const router = createRouter();

router.post(
  NETWORK_CONFIG.PRAGMATIC.GAME_RUN,
  zValidator('json', LoginSchema),
  async (c: Context) => {
    return await gameRun(c);
  }
);
router.post(NETWORK_CONFIG.PRAGMATIC.GAME_DEMO, async (c: Context) => {
  const user = c.get('user_with_profile');
  return await gameDemo(user, c.req);
});
router.post(
  NETWORK_CONFIG.PRAGMATIC.GAME_LIST,
  zValidator('json', RegisterSchema),
  async (c: Context) => {
    return await gameList();
  }
);
router.post(NETWORK_CONFIG.PRAGMATIC.GAME_MAINTENANCE, async (c: Context) => {
  return await gameMaintenance(c);
});
router.post(NETWORK_CONFIG.PRAGMATIC.GAME_WITH_PATTERN, async (c: Context) => {
  return await gamesWithPattern(c);
});
router.post(NETWORK_CONFIG.PRAGMATIC.GAME_STATUS, async (c: Context) => {
  return await changeGameStatus(c);
});

export default router;
// function findOrCreateUserByGoogleProfile(
//   req: HonoRequest<string, unknown>
// ): any {
//   throw new Error("Function not implemented.");
// }

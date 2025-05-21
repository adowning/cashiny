import { NETWORK_CONFIG } from '@cashflow/types';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

import createRouter from '../create-router';
import {
  findOrCreateUserByGoogleProfile,
  login,
  logout, // google,
  // findOrCreateUserByGoogleProfile,
  me,
  register,
} from '../services/auth.service';

// import { HonoRequest } from "hono";
// import { GetMe, LoginSchema, RegisterSchema } from './schema'
export const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export const RegisterSchema = z.object({
  username: z.string(),
  password: z.string(),
});
// export const RegisterSchema = {}
const router = createRouter();
router.post(NETWORK_CONFIG.LOGIN.LOGIN, zValidator('json', LoginSchema), async (c) => {
  return await login(c.req);
});
router.post(NETWORK_CONFIG.LOGIN.LOGOUT, async () => {
  return await logout();
});
router.post(NETWORK_CONFIG.LOGIN.REGISTER, zValidator('json', RegisterSchema), async (c) => {
  return await register(c.req);
});
router.get(NETWORK_CONFIG.LOGIN.ME, async (c) => {
  return await me(c.req);
});
router.get(NETWORK_CONFIG.LOGIN.GOOGLE, async (c) => {
  return c.json(findOrCreateUserByGoogleProfile(c.req));
});

export default router;
// function findOrCreateUserByGoogleProfile(
//   req: HonoRequest<string, unknown>
// ): any {
//   throw new Error("Function not implemented.");
// }

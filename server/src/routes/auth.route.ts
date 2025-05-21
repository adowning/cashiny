import { NETWORK_CONFIG } from '@cashflow/types'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import createRouter from '../create-router'
import {
  findOrCreateUserByGoogleProfile,
  getSession,
  login,
  logout,
  register,
} from '../services/auth.service'
import { createErrorResponse, createSuccessResponse } from '.'

// import { HonoRequest } from "hono";
// import { GetMe, LoginSchema, RegisterSchema } from './schema'
export const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
})
export const RegisterSchema = z.object({
  username: z.string(),
  password: z.string(),
})
// export const RegisterSchema = {}
const router = createRouter()
router.post(NETWORK_CONFIG.LOGIN.LOGIN, async (c) => {
  console.log('here in authroues')
  let result
  try {
    result = await login(c.req)
    return createSuccessResponse(result)
  } catch (e: any) {
    return createErrorResponse(e.message, 403)
  }
})
router.post(NETWORK_CONFIG.LOGIN.GOOGLE, async (c) => {
  console.log('here in authroues')
  let result
  try {
    result = await findOrCreateUserByGoogleProfile(c.req)

    return createSuccessResponse(result)
  } catch (e: any) {
    return createErrorResponse(e.message, 403)
  }
})
router.post(NETWORK_CONFIG.LOGIN.LOGOUT, async () => {
  return await logout()
})
router.post(NETWORK_CONFIG.LOGIN.REGISTER, zValidator('json', RegisterSchema), async (c) => {
  return await register(c.req)
})
router.get(NETWORK_CONFIG.LOGIN.GET_SESSION, async (c) => {
  return await getSession(c.req)
})

export default router
// function findOrCreateUserByGoogleProfile(
//   req: HonoRequest<string, unknown>
// ): any {
//   throw new Error("Function not implemented.");
// }

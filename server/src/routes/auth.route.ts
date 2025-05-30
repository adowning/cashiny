import { NETWORK_CONFIG } from '@cashflow/types'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import createRouter from '../rest.router'
import {
  findOrCreateUserByGoogleProfile,
  getSession,
  login,
  logout,
  register,
} from '../services/auth.service'
import { createErrorResponse, createSuccessResponse } from '.'
import { auth } from '@/auth'

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
    console.log(result)
    return createSuccessResponse(result)
  } catch (e) {
    if (e instanceof Error) {
      return createErrorResponse(e, 403)
    }
    return createErrorResponse('An unknown error occurred', 403)
  }
})
router.post(NETWORK_CONFIG.LOGIN.GOOGLE, async (c) => {
  console.log('here in authroues')
  let result
  try {
    result = await findOrCreateUserByGoogleProfile(c.req)

    return createSuccessResponse(result)
  } catch (e: unknown) {
    if (e) {
      return createErrorResponse(e, 403)
    }
    return createErrorResponse('An unknown error occurred', 403)
  }
})
router.post(NETWORK_CONFIG.LOGIN.LOGOUT, async () => {
  return await logout()
})
router.post(NETWORK_CONFIG.LOGIN.REGISTER, zValidator('json', RegisterSchema), async (c) => {
  let result
  try {
    result = await register(c.req)
    console.log(result)
    return createSuccessResponse(result)
  } catch (e) {
    return createErrorResponse(e, 403)
  }
})
router.get(NETWORK_CONFIG.LOGIN.GET_SESSION, async (c) => {
  console.log('here in authroues')
  let result
  try {
    result = await getSession(c.req)

    return createSuccessResponse(result)
  } catch (e) {
    return createErrorResponse(e, 403)
  }
})
router.post(NETWORK_CONFIG.LOGIN.REFRESH_TOKEN, async (c) => {
  try {
    // Your auth library (better-auth) should provide a method to refresh the session.
    // This often involves reading a refresh token from cookies or the request.
    const requestBody = await c.req.json() // Or c.req.parseBody() depending on Hono version

    const result = await auth.api.refreshToken(requestBody)
    if (!result || !result.accessToken || !result.refreshToken) {
      return createErrorResponse('Token refresh failed: Invalid session', 401)
    }
    const user = c.get('user')
    // The new access token might be set in a cookie automatically by better-auth,
    // or you might need to send it in the response body.
    return createSuccessResponse({
      // token: result.session.accessToken, // If your client expects the token in the body
      user: user, // Send updated user info if necessary
      message: 'Session refreshed successfully',
    })
  } catch (e) {
    // Log the error for debugging
    console.error('Refresh token error:', e)
    return createErrorResponse(e || 'Token refresh failed', 401)
  }
})
export default router
// function findOrCreateUserByGoogleProfile(
//   req: HonoRequest<string, unknown>
// ): any {
//   throw new Error("Function not implemented.");
// }

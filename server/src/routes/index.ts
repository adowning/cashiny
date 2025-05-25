import { BASE_PATH } from '@/constans'
import { HonoEnv } from '@/create-app'
import type { OpenAPIHono } from '@hono/zod-openapi'

import createRouter from '../rest.router'
import achievementRoute from './achievement.route'
import authRoute from './auth.route'
import bonusRoute from './bonus.route'
import depositRoute from './deposit.route'
import gameRoute from './game.route'
import healthRoute from './health.route'
import operatorRoute from './operator.route'
import pragmaticRoute from './pragmatic.route'
import promoRoute from './promo.route'
import rewardRoute from './reward.route'
import userRoute from './user.route'
import vipRoute from './vip.route'
import { publicTournamentRoute } from './tournament.route'
import { adminTournamentRoute } from './tournament.route'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
// import { GenericApiResponse } from '@cashflow/types'

export default [
  healthRoute,
  userRoute,
  depositRoute,
  vipRoute,
  gameRoute,
  authRoute,
  pragmaticRoute,
  operatorRoute,
  rewardRoute,
  bonusRoute,
  achievementRoute,
  promoRoute,
  publicTournamentRoute,
  adminTournamentRoute,
]

export function registerRoutes(app: OpenAPIHono<HonoEnv>) {
  // return [app.route("/", healthRoute), app.route("/", userRoute)];
  console.log('registerRoutes')
  // app.use(
  // '*',

  // async (c: HonoContext, next) => {
  //   const session = await auth.api.getSession({
  //     headers: c.req.raw.headers,
  //   });

  //   if (!session) {
  //     c.set('user', null);
  //     c.set('session', null);
  //     return next();
  //   }
  //   c.set('user', session.user as BetterAuthUser);
  //   c.set('session', session.session);
  //   return next();
  // }
  // );
  // app.use(isAuthenticated);
  app.route('/', authRoute)
  app.route(BASE_PATH, userRoute)
  app.route(BASE_PATH, depositRoute)
  app.route(BASE_PATH, vipRoute)
  app.route(BASE_PATH, gameRoute)
  app.route(BASE_PATH, healthRoute)
  app.route(BASE_PATH, pragmaticRoute)
  app.route(BASE_PATH, operatorRoute)
  app.route(BASE_PATH, achievementRoute)
  app.route(BASE_PATH, rewardRoute)
  app.route(BASE_PATH, bonusRoute)
  app.route(BASE_PATH, promoRoute)
  app.route(BASE_PATH, publicTournamentRoute)
  app.route(BASE_PATH, adminTournamentRoute)
  // app.use('/*', cors()).use('/*', logger())

  return app
}

// stand alone router type used for api client
const r = createRouter()
export const router = registerRoutes(r)
router
  .use(
    '/*',
    cors({
      origin: 'http://localhost:3000',
      allowHeaders: [
        'X-Custom-Header',
        'Authorization',
        'Content-Type',
        'Upgrade-Insecure-Requests',
      ],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      // exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
      // maxAge: 600,
      credentials: true,
    })
  )
  .use(async (c, next) => {
    c.res.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000') // Or '*' for any origin
    c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE') // Add allowed methods
    c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization') // Add allowed headers
    next()
  })

  .use('/*', logger())
  .use(async (c) => {
    if (c.req.method === 'OPTIONS') {
      return c.text('ok', 200, {
        'Access-Control-Allow-Origin':
          "['http://localhost:3000','http://localhost:5173', 'https://cashflow.dev']",
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '600',
        'Access-Control-Allow-Credentials': 'true',
      })
    }
  })
// console.log(router.routes)
export type router = typeof router

export type AppType = typeof router
// // --- End Prisma Client Initialization ---

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export function createSuccessResponse(data: unknown, status: number = 200) {
  if (status === 204) {
    return new Response(null, { status })
  }
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS })
}

export function createErrorResponse(error: any | null, code: number): Response {
  // return {
  //   error,
  //   data,
  //   code,
  // }
  return new Response(JSON.stringify(error), {
    status: code,
    headers: JSON_HEADERS,
  })
}

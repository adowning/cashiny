import { OpenAPIHono } from '@hono/zod-openapi'
import { Session } from 'better-auth'
// process.env.ALLOWED_ORIGINS || '*';
import { Server } from 'bun'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import notFound from './middlewares/not-found'
import onError from './middlewares/on-error'
import { registerRoutes, router } from './routes'
import { User as BetterAuthUser } from 'better-auth'
import { UserWithProfile } from '@cashflow/types'
import isAuthenticated from './middlewares/is-authenticated'
import { auth } from './auth'
import { Context } from 'hono'

export type HonoEnv = {
  Bindings: {
    serverInstance?: Server // Make serverInstance known to Hono's Env
  }
  Variables: {
    skipAuthMiddleWare: boolean
    session: Session | null
    user_with_profile: UserWithProfile | null
    user: BetterAuthUser | null
    serverInstance?: Server // Make serverInstance known for c.set/c.get
    gameSymbol: string | null
    mgckey: string | null
    pagination: {
      skip: number
      take: number
    }
  }
}
const allowedOrigins = "['http://localhost:3000','http://localhost:5173', 'https://cashflow.dev']" // process.env.ALLOWED_ORIGINS || '*';

export default function createApp() {
  const app = new OpenAPIHono<HonoEnv>()

  app.use(logger())
  app.use(
    cors({
      origin: (origin) => {
        if (!origin) return allowedOrigins
        if (allowedOrigins.includes(origin)) {
          return origin
        }
        return null
      },
      credentials: true,
    })
  )

  app.use(async (c, next) => {
    if (c.req.method === 'OPTIONS') {
      c.header('Access-Control-Allow-Origin', allowedOrigins)
      c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      c.header('Access-Control-Max-Age', '600')
      c.header('Access-Control-Allow-Credentials', 'true')
      return c.text('ok')
    }
    await next()
  })
  app.use('/*', async (c: Context, next) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    if (!session) {
      c.set('user', null)
      c.set('session', null)
      return next()
    }
    c.set('user_with_profile')
    c.set('session', session.session)
    return next()
  })
  registerRoutes(app)
  app.use(isAuthenticated)
  app.use(notFound)
  app.onError(onError)
  return app
}
//       //   '/auth': handleAuth,
//       // }

//       if (c.req.path.includes('/game/settings')) {
//         const result = await rtgSettings(c, c.get('user_with_profile') as UserWithProfile)
//         if (result instanceof Response) return result
//         return c.json(result)
//       }
//       if (c.req.path.includes('/game/spin')) {
//         const result = await rtgSpin(
//           c,
//           c.get('user_with_profile') as UserWithProfile,
//           c.get('session')!
//         )
//         if (result instanceof Response) return result
//         return c.json(result)
//       }
//       // async function handleAuth(c: Context) {
//       //   c.set('skipAuthMiddleWare', true)
//       //   return await next()
//       // }
//       // if (c.req.path.startsWith('/auth/session')) {
//       //   const result = await getSession(c.req)
//       //   if (result instanceof Response) return result
//       //   return c.json(result)
//       // }
//       // if (c.req.path.startsWith('/auth/login')) {
//       //   const result = await login(c.req)
//       //   if (result instanceof Response) return result
//       //   return c.json(result)
//       // }
//       // if (c.req.path.startsWith('/auth/register')) {
//       //   const result = await register(c.req)
//       //   if (result instanceof Response) return result
//       //   return c.json(result)
//       // }
//       // if (c.req.path.startsWith('/auth/logout')) {
//       //   const result = await logout()
//       //   if (result instanceof Response) return result
//       //   return c.json(result)
//       // }
//       // if (c.req.path.startsWith('/auth/google')) {
//       //   const result = await google(c, c.req)
//       //   if (result instanceof Response) return result
//       //   return c.json(result)
//       // }
//       // if (c.req.path.startsWith("/api/user/deposithistory"))
//       // if (c.req.path.startsWith(BASE_PATH)) {
//       console.log('in create app')
//       return await next()
//       // }

//       // return serveStatic({ path: './public' })(c, next)
//     })
//     // .basePath(BASE_PATH);
//     // router
//     //   // .use(
//     //   //   "/*",
//     //   //   createHonoHandler({
//     //   //     getPrisma: async (ctx) => {
//     //   //       return enhance(prisma, { user: await getCurrentUser(ctx) });
//     //   //     },
//     //   //   })
//     //   // )
//     //   .use(
//     //     '*',
//     //     logger(),

//     //     async (c: HonoContext, next) => {
//     //       const session = await auth.api.getSession({
//     //         headers: c.req.raw.headers,
//     //       })

//     //       if (!session) {
//     //         c.set('user', null)
//     //         c.set('session', null)

//     //         return next()
//     //       }
//     //       c.set('user', session.user as BetterAuthUser)
//     //       c.set('session', session.session)
//     //       return next()
//     //     }
//     //   )
//     .use(isAuthenticated)
//     .notFound(notFound)
//     .onError(onError) as OpenAPIHono
//   return router
// }

// import { serve } from "@hono/node-server";
// import app from "./server";
// const port = parseInt(process.env.PORT) || 3000;

// serve({
//   fetch: app.fetch,
//   port,
// });
//
import { UserWithProfile } from '@cashflow/database';
import { User } from '@cashflow/types';
import { OpenAPIHono } from '@hono/zod-openapi';
import { Session } from 'better-auth';
// process.env.ALLOWED_ORIGINS || '*';
import type { User as BetterAuthUser } from 'better-auth';
import { Server } from 'bun';
import type { Context as HonoContext } from 'hono';
import { serveStatic } from 'hono/bun';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// import isAuthenticated from '../middlewares/is-authenticated';
// import notFound from '../middlewares/not-found';
// import onError from '../middlewares/on-error';
import { auth } from './auth';
import { BASE_PATH } from './constans';
// import createRouter from './create-router';
import notFound from './middlewares/not-found';
import onError from './middlewares/on-error';
// import createRouter from './create-router';
import { router } from './routes';
import { google, login, logout, me, register } from './services/auth.service';
import { allowedNodeEnvironmentFlags } from 'process';
import { rtgSettings, rtgSpin } from './services/game.service';

// import type { AppApi } from './types';

// async function getCurrentUser(ctx: Context) {
//   const cookies = ctx.req.header('cookie');

//   if (!cookies) return new Response(JSON.stringify({ message: 'Unauthorized' }));

//   const supabase = createServerClient('https://pykjixfuargqkjkgxsyc.supabase.co', supabaseAnonKey, {
//     cookies: {
//       async getAll() {
//         return cookies.split(';').map((cookie) => {
//           const [name, ...valueParts] = cookie.trim().split('=');
//           return { name, value: valueParts.join('=') };
//         });
//       },
//       setAll(cookiesToSet) {
//         // try {
//         //   cookiesToSet.forEach(({ name, value, options }) =>
//         //     cookieStore.set(name, value, options)
//         //   )
//         // } catch {
//         //   // The `setAll` method was called from a Server Component.
//         //   // This can be ignored if you have middleware refreshing
//         //   // user sessions.
//         // }
//       },
//     },
//   });
//   const { data: user } = await supabase.auth.getUser();
//   return user.user as unknown as User;
//   // const uid = user.user?.id;

//   // TODO: if you need to access fields other than just "id" in access policies,
//   // you can do a database query here to fetch the full user record
//   // const contextUser = uid ? { id: uid } : undefined;
//   // return enhance(prisma, { user: contextUser });
// }

export type HonoEnv = {
  Bindings: {
    serverInstance?: Server; // Make serverInstance known to Hono's Env
  };
  Variables: {
    user: Partial<User> | null;
    user_with_profile: Partial<UserWithProfile> | null;

    session: Session | null;
    serverInstance?: Server; // Make serverInstance known for c.set/c.get
    gameSymbol: string | null;
    mgckey: string | null;
    pagination: {
      skip: number;
      take: number;
    };
  };
};
const allowedOrigins = "['http://localhost:3000','http://localhost:5173', 'https://cashflow.dev']"; // process.env.ALLOWED_ORIGINS || '*';

export default function createApp() {
  // const app = new OpenAPIHono<HonoEnv>(); // Use OpenAPIHono
  //   const app = new OpenAPIHono<HonoEnv>({
  //   strict: true,
  // });

  // const router = router
  // app.use('*', serveStatic({ root: './public' }));
  // registerRoutes(
  //   app
  // )
  router
    .use('/*', cors())
    .use('*', logger())

    .use(async (c, next) => {
      // if (c.req.path.startsWith('/public')) return serveStatic({ path: '../public' })(c, next);
      if (c.req.method === 'OPTIONS') {
        return c.text('ok', 200, {
          'Access-Control-Allow-Origin':
            "['http://localhost:3000','http://localhost:5173', 'https://cashflow.dev']",
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '600',
          'Access-Control-Allow-Credentials': 'true',
        });
      }
      if (c.req.path.includes('/game/settings')) {
        const result = await rtgSettings(c, c.get('user_with_profile'));
        if (result instanceof Response) return result;
        return c.json(result);
      }
      if (c.req.path.includes('/game/spin')) {
        const result = await rtgSpin(c, c.get('user_with_profile'), c.get('session')!);
        if (result instanceof Response) return result;
        return c.json(result);
      }
      if (c.req.path.startsWith('/auth/session')) {
        const result = await me(c.req);
        if (result instanceof Response) return result;
        return c.json(result);
      }
      if (c.req.path.startsWith('/auth/login')) {
        const result = await login(c.req);
        if (result instanceof Response) return result;
        return c.json(result);
      }
      if (c.req.path.startsWith('/auth/register')) {
        const result = await register(c.req);
        if (result instanceof Response) return result;
        return c.json(result);
      }
      if (c.req.path.startsWith('/auth/logout')) {
        const result = await logout();
        if (result instanceof Response) return result;
        return c.json(result);
      }
      if (c.req.path.startsWith('/auth/google')) {
        const result = await google(c, c.req);
        if (result instanceof Response) return result;
        return c.json(result);
      }
      // if (c.req.path.startsWith("/api/user/deposithistory"))
      if (c.req.path.startsWith(BASE_PATH)) {
        return await next();
      }

      return serveStatic({ path: './public' })(c, next);
    });
  // .basePath(BASE_PATH);
  router
    // .use(
    //   "/*",
    //   createHonoHandler({
    //     getPrisma: async (ctx) => {
    //       return enhance(prisma, { user: await getCurrentUser(ctx) });
    //     },
    //   })
    // )
    .use(
      '*',
      logger(),

      async (c: HonoContext, next) => {
        const session = await auth.api.getSession({
          headers: c.req.raw.headers,
        });

        if (!session) {
          c.set('user', null);
          c.set('session', null);

          return next();
        }
        c.set('user', session.user as BetterAuthUser);
        c.set('session', session.session);
        return next();
      }
    )
    .notFound(notFound)
    .onError(onError) as OpenAPIHono;
  return router;
}

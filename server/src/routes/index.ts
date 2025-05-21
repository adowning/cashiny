import { auth } from '@/auth';
import { BASE_PATH } from '@/constans';
import { HonoEnv } from '@/create-app';
import type { OpenAPIHono } from '@hono/zod-openapi';
import type { User as BetterAuthUser } from 'better-auth';
import type { Context as HonoContext } from 'hono';

import createRouter from '../create-router';
import isAuthenticated from '../middlewares/is-authenticated';
import achievementRoute from './achievement.route';
import authRoute from './auth.route';
import bonusRoute from './bonus.route';
import currencyRoute from './currency.route';
import depositRoute from './deposit.route';
import gameRoute from './game.route';
import healthRoute from './health.route';
import operatorRoute from './operator.route';
import pragmaticRoute from './pragmatic.route';
import promoRoute from './promo.route';
import rewardRoute from './reward.route';
import userRoute from './user.route';
import vipRoute from './vip.route';

export default [
  healthRoute,
  userRoute,
  depositRoute,
  currencyRoute,
  vipRoute,
  gameRoute,
  authRoute,
  pragmaticRoute,
  operatorRoute,
  rewardRoute,
  bonusRoute,
  achievementRoute,
  promoRoute,
];

export function registerRoutes(app: OpenAPIHono<HonoEnv>) {
  // return [app.route("/", healthRoute), app.route("/", userRoute)];
  console.log('registerRoutes');
  app.use(
    '*',

    async (c: HonoContext, next) => {
      // console.log("here");
      // console.log(c.req.path);
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });

      if (!session) {
        c.set('user', null);
        c.set('session', null);
        // console.log("no session");
        return next();
      }
      c.set('user', session.user as BetterAuthUser);
      c.set('session', session.session);
      console.log('hai 2 u ', c.req.path);
      return next();
    },
  );
  app.use(isAuthenticated);
  app.route(BASE_PATH, authRoute);
  app.route(BASE_PATH, userRoute);
  app.route(BASE_PATH, depositRoute);
  app.route(BASE_PATH, currencyRoute);
  app.route(BASE_PATH, vipRoute);
  app.route(BASE_PATH, gameRoute);
  app.route(BASE_PATH, healthRoute);
  app.route(BASE_PATH, pragmaticRoute);
  console.log(operatorRoute);
  app.route(BASE_PATH, operatorRoute);
  app.route(BASE_PATH, achievementRoute);
  app.route(BASE_PATH, rewardRoute);
  app.route(BASE_PATH, bonusRoute);
  app.route(BASE_PATH, promoRoute);
  return app;
}

// stand alone router type used for api client
export const router = registerRoutes(createRouter());
export type router = typeof router;

export type AppType = typeof router;
// // --- End Prisma Client Initialization ---

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export function createSuccessResponse(data: any, status: number = 200) {
  if (status === 204) {
    return new Response(null, { status });
  }
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

export function createErrorResponse(message: string, status: number, errors?: any) {
  return new Response(JSON.stringify({ message, ...(errors && { errors }) }), {
    status,
    headers: JSON_HEADERS,
  });
}

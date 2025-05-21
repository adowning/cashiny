// export default function createRouter() {
//   return new Hono<AppEnv>({
//     strict: true,
//   })
// }
import { OpenAPIHono } from '@hono/zod-openapi'
// import { Hono } from 'hono';
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import { HonoEnv } from './create-app'

export default function createRouter(): OpenAPIHono<HonoEnv> {
  const app = new OpenAPIHono<HonoEnv>({
    strict: true,
  })
  // app.use('/*', cors()).use('/*', logger())
  return app
}
